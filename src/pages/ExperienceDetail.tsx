import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share2, User, ArrowLeft } from 'lucide-react';
import { ImageGallery } from '@/components/ImageGallery';
import { DeleteExperienceButton } from '@/components/DeleteExperienceButton';
import { EditExperienceButton } from '@/components/EditExperienceButton';
import { CommentsList } from '@/components/CommentsList';
import { CommentWithMentions } from '@/components/CommentWithMentions';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  image_url?: string | null;
}


interface Profile {
  nickname: string;
}

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<Profile | null>(null);
  const [canDelete, setCanDelete] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (id) {
      fetchExperience();
      if (user) {
        checkIfLiked();
        checkCanDelete();
      }
    }
  }, [id, user]);

  const fetchExperience = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('experiences')
      .select(`
        id,
        title,
        content,
        category,
        tags,
        likes_count,
        comments_count,
        created_at,
        user_id,
        image_url
      `)
      .eq('id', id)
      .eq('is_published', true)
      .single();

    if (error) {
      console.error('Error fetching experience:', error);
      setLoading(false);
      return;
    }

    setExperience(data);
    
    // Fetch author profile
    if (data.user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname')
        .eq('user_id', data.user_id)
        .single();
      
      if (profile) {
        setAuthorProfile(profile);
      }
    }
    
    setLoading(false);
  };


  const checkIfLiked = async () => {
    if (!user || !id) return;

    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('experience_id', id)
      .single();

    setIsLiked(!!data);
  };

  const checkCanDelete = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase.rpc('can_delete_experience', {
        experience_id: id,
        user_id: user.id
      });

      if (error) {
        console.error('Error checking delete permission:', error);
        return;
      }

      setCanDelete(data || false);
    } catch (error) {
      console.error('Error checking delete permission:', error);
    }
  };

  const toggleLike = async () => {
    if (!user || !id) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per mettere like",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      // Remove like
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('experience_id', id);

      if (!error) {
        setIsLiked(false);
        fetchExperience();
      }
    } else {
      // Add like
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          experience_id: id
        });

      if (!error) {
        setIsLiked(true);
        fetchExperience();
      }
    }
  };

  const handleCommentAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    fetchExperience(); // Aggiorna il contatore commenti
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'mutui': return 'bg-mutui text-white';
      case 'vacanze': return 'bg-vacanze text-white';
      case 'auto': return 'bg-auto text-white';
      case 'amazon': return 'bg-amazon text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Caricamento...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Esperienza non trovata</h1>
          <Button asChild className="mt-4">
            <Link to="/">Torna alla home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla home
          </Link>
        </Button>

        {/* Esperienza principale */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{authorProfile?.nickname || 'Utente'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(experience.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getCategoryColor(experience.category)}>
                  {experience.category}
                </Badge>
                  {user && user.id === experience.user_id && (
                    <div className="flex gap-2">
                      <EditExperienceButton experienceId={experience.id} />
                      <DeleteExperienceButton 
                        experienceId={experience.id} 
                        disabled={!canDelete}
                        title={!canDelete ? "Non puoi eliminare questa esperienza perché ci sono commenti di altri utenti" : undefined}
                      />
                    </div>
                  )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <h1 className="text-2xl font-bold mb-4">{experience.title}</h1>
            
            <div className="prose prose-neutral dark:prose-invert max-w-none mb-6">
              {experience.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
            
            {/* Tags */}
            {experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {experience.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Gallery immagini */}
            {experience.image_url && (
              <ImageGallery 
                images={[experience.image_url]} 
                title="Immagini dell'esperienza" 
              />
            )}
            
            {/* Azioni */}
            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLike}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {experience.likes_count}
                </Button>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {experience.comments_count} commenti
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sezione commenti */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Commenti</h2>

          {/* Form nuovo commento */}
          {user ? (
            <CommentWithMentions 
              experienceId={id!} 
              onCommentAdded={handleCommentAdded}
            />
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Accedi per lasciare un commento
                </p>
                <Button asChild>
                  <Link to="/auth">Accedi</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Lista commenti */}
          <CommentsList 
            experienceId={id!} 
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperienceDetail;