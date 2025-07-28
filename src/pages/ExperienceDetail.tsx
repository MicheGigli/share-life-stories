import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, MessageCircle, Share2, User, ArrowLeft } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  profiles: {
    nickname: string;
    avatar_url: string | null;
  };
}

const ExperienceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [experience, setExperience] = useState<Experience | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (id) {
      fetchExperience();
      fetchComments();
      if (user) {
        checkIfLiked();
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
        profiles:user_id (nickname, avatar_url)
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
    setLoading(false);
  };

  const fetchComments = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        likes_count,
        profiles:user_id (nickname, avatar_url)
      `)
      .eq('experience_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      return;
    }

    setComments(data || []);
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

  const addComment = async () => {
    if (!user || !id) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per commentare",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('comments')
      .insert({
        experience_id: id,
        user_id: user.id,
        content: newComment.trim()
      });

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il commento",
        variant: "destructive",
      });
      return;
    }

    setNewComment('');
    fetchComments();
    fetchExperience();
    toast({
      title: "Commento aggiunto",
      description: "Il tuo commento è stato pubblicato",
    });
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
                  <AvatarImage src={experience.profiles?.avatar_url || ''} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{experience.profiles?.nickname}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(experience.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
              </div>
              <Badge className={getCategoryColor(experience.category)}>
                {experience.category}
              </Badge>
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
          <h2 className="text-xl font-bold">Commenti ({comments.length})</h2>

          {/* Form nuovo commento */}
          {user ? (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Scrivi un commento..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button onClick={addComment} disabled={!newComment.trim()}>
                    Pubblica commento
                  </Button>
                </div>
              </CardContent>
            </Card>
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
          {comments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  Nessun commento ancora. Sii il primo a commentare!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.profiles?.avatar_url || ''} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-sm">
                            {comment.profiles?.nickname}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString('it-IT')}
                          </p>
                        </div>
                        <p className="text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ExperienceDetail;