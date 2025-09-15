import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExperienceCard } from './ExperienceCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { Sparkles, Users, TrendingUp, RefreshCw } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  tags: string[];
  image_url?: string;
  user_id: string;
  profiles: { nickname: string } | null;
}

export const PersonalizedFeed = () => {
  const { user } = useAuth();
  const { following } = useFollow();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedType, setFeedType] = useState<'personalized' | 'following' | 'trending'>('personalized');

  useEffect(() => {
    if (user) {
      fetchPersonalizedFeed();
    }
  }, [user, feedType, following]);

  const fetchPersonalizedFeed = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('experiences')
        .select(`
          id,
          title,
          content,
          category,
          likes_count,
          comments_count,
          created_at,
          tags,
          image_url,
          user_id,
          profiles!experiences_user_id_fkey(nickname)
        `)
        .eq('is_published', true);

      switch (feedType) {
        case 'following':
          if (following.size > 0) {
            query = query.in('user_id', Array.from(following));
          } else {
            // If not following anyone, show empty state
            setExperiences([]);
            setLoading(false);
            return;
          }
          break;
          
        case 'trending':
          query = query.order('likes_count', { ascending: false });
          break;
          
        case 'personalized':
        default:
          // Get user's interactions to personalize feed
          const { data: interactions } = await supabase
            .from('likes')
            .select('experience_id')
            .eq('user_id', user.id)
            .limit(20);

          const { data: comments } = await supabase
            .from('comments')
            .select('experience_id')
            .eq('user_id', user.id)
            .limit(20);

          // Get categories from liked/commented experiences
          const likedExperienceIds = interactions?.map(i => i.experience_id) || [];
          const commentedExperienceIds = comments?.map(c => c.experience_id) || [];
          const allInteractionIds = [...new Set([...likedExperienceIds, ...commentedExperienceIds])];
          
          let preferredCategories: string[] = [];
          if (allInteractionIds.length > 0) {
            const { data: interactionExperiences } = await supabase
              .from('experiences')
              .select('category')
              .in('id', allInteractionIds);
            
            preferredCategories = [...new Set(interactionExperiences?.map(e => e.category) || [])];
          }

          // Boost content from followed users and preferred categories
          if (preferredCategories.length > 0) {
            query = query.or(`category.in.(${preferredCategories.join(',')}),user_id.in.(${Array.from(following).join(',')})`);
          } else if (following.size > 0) {
            query = query.in('user_id', Array.from(following));
          }
          break;
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform data to ensure proper typing
      const transformedData = (data || []).map(item => ({
        ...item,
        profiles: item.profiles ? { nickname: (item.profiles as any).nickname || 'Utente' } : null
      }));

      setExperiences(transformedData);
    } catch (error) {
      console.error('Error fetching personalized feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getFeedIcon = () => {
    switch (feedType) {
      case 'following': return <Users className="h-4 w-4" />;
      case 'trending': return <TrendingUp className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getFeedTitle = () => {
    switch (feedType) {
      case 'following': return 'Dai tuoi seguiti';
      case 'trending': return 'Esperienze di tendenza';
      default: return 'Feed personalizzato';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getFeedIcon()}
            {getFeedTitle()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPersonalizedFeed}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Badge
            variant={feedType === 'personalized' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFeedType('personalized')}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Per te
          </Badge>
          <Badge
            variant={feedType === 'following' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFeedType('following')}
          >
            <Users className="h-3 w-3 mr-1" />
            Seguiti ({following.size})
          </Badge>
          <Badge
            variant={feedType === 'trending' ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setFeedType('trending')}
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              {feedType === 'following' 
                ? 'Nessuna esperienza dai tuoi seguiti. Inizia a seguire alcuni utenti!'
                : 'Nessuna esperienza trovata. Inizia a interagire per personalizzare il tuo feed!'
              }
            </div>
            {feedType === 'following' && (
              <Button
                variant="outline"
                onClick={() => setFeedType('personalized')}
              >
                Passa al feed personalizzato
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                id={experience.id}
                title={experience.title}
                author={experience.profiles?.nickname || 'Utente'}
                content={experience.content}
                category={experience.category}
                likes={experience.likes_count}
                comments={experience.comments_count}
                date={formatDate(experience.created_at)}
                tags={experience.tags}
                imageUrl={experience.image_url}
                userId={experience.user_id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};