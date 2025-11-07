import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Eye, Trash2, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  nickname: string;
  image_url: string | null;
  is_published: boolean;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  experience_id: string;
  nickname: string;
  experience_title: string;
}

export const ContentModeration = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [showUnpublished, setShowUnpublished] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ id: string; type: 'experience' | 'comment' } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
    fetchComments();
  }, []);

  const fetchExperiences = async () => {
    try {
      // Fetch experiences
      const { data: experiencesData, error: expError } = await supabase
        .from('experiences')
        .select('id, title, content, category, created_at, user_id, likes_count, comments_count, image_url, is_published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (expError) throw expError;

      if (!experiencesData || experiencesData.length === 0) {
        setExperiences([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(experiencesData.map(exp => exp.user_id))];

      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of user_id to nickname
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.nickname]) || []);

      // Combine data
      const formattedData = experiencesData.map(exp => ({
        ...exp,
        nickname: profilesMap.get(exp.user_id) || 'Utente'
      }));

      setExperiences(formattedData);
    } catch (error) {
      console.error('Error fetching experiences:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le esperienze",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      // Fetch comments
      const { data: commentsData, error: commError } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, experience_id')
        .order('created_at', { ascending: false })
        .limit(50);

      if (commError) throw commError;

      if (!commentsData || commentsData.length === 0) {
        setComments([]);
        return;
      }

      // Get unique user IDs and experience IDs
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      const experienceIds = [...new Set(commentsData.map(c => c.experience_id))];

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Fetch experiences
      const { data: experiencesData, error: experiencesError } = await supabase
        .from('experiences')
        .select('id, title')
        .in('id', experienceIds);

      if (experiencesError) throw experiencesError;

      // Create maps
      const profilesMap = new Map(profilesData?.map(p => [p.user_id, p.nickname]) || []);
      const experiencesMap = new Map(experiencesData?.map(e => [e.id, e.title]) || []);

      // Combine data
      const formattedData = commentsData.map(comment => ({
        ...comment,
        nickname: profilesMap.get(comment.user_id) || 'Utente',
        experience_title: experiencesMap.get(comment.experience_id) || 'Esperienza'
      }));

      setComments(formattedData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i commenti",
        variant: "destructive"
      });
    } finally {
      setLoadingComments(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      const table = deleteDialog.type === 'experience' ? 'experiences' : 'comments';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', deleteDialog.id);

      if (error) throw error;

      toast({
        title: `${deleteDialog.type === 'experience' ? 'Esperienza' : 'Commento'} eliminato`,
        description: `${deleteDialog.type === 'experience' ? "L'esperienza è stata rimossa" : "Il commento è stato rimosso"} con successo`
      });

      if (deleteDialog.type === 'experience') {
        setExperiences(experiences.filter(exp => exp.id !== deleteDialog.id));
      } else {
        setComments(comments.filter(comment => comment.id !== deleteDialog.id));
      }
      
      setDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting content:', error);
      toast({
        title: "Errore",
        description: `Impossibile eliminare ${deleteDialog.type === 'experience' ? "l'esperienza" : "il commento"}`,
        variant: "destructive"
      });
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categories: Record<string, string> = {
      'mutui': 'Mutui',
      'vacanze': 'Vacanze',
      'auto': 'Veicoli',
      'amazon': 'Prodotti'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Moderazione Contenuti</CardTitle>
              <p className="text-sm text-muted-foreground">
                Gestisci tutti i contenuti pubblicati sulla piattaforma
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Mostra non pubblicate</label>
              <input
                type="checkbox"
                checked={showUnpublished}
                onChange={(e) => setShowUnpublished(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="experiences" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="experiences">
                Esperienze ({experiences.length})
              </TabsTrigger>
              <TabsTrigger value="comments">
                <MessageSquare className="h-4 w-4 mr-2" />
                Commenti ({comments.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="experiences" className="space-y-4 mt-4">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {experiences
                    .filter(exp => showUnpublished || exp.is_published)
                    .map((exp) => (
              <div
                key={exp.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <Badge variant="outline">
                        {getCategoryDisplayName(exp.category)}
                      </Badge>
                      {!exp.is_published && (
                        <Badge variant="destructive" className="text-xs">
                          Non pubblicata
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {exp.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>di {exp.nickname}</span>
                      <span>•</span>
                      <span>{new Date(exp.created_at).toLocaleDateString('it-IT')}</span>
                      <span>•</span>
                      <span>❤️ {exp.likes_count}</span>
                      <span>💬 {exp.comments_count}</span>
                    </div>
                  </div>

                  {exp.image_url && (
                    <img
                      src={exp.image_url}
                      alt={exp.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/experience/${exp.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizza
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialog({ id: exp.id, type: 'experience' })}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </div>
              </div>
            ))}

                  {experiences.filter(exp => showUnpublished || exp.is_published).length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {showUnpublished ? 'Nessuna esperienza da moderare' : 'Nessuna esperienza pubblicata da moderare'}
                    </p>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="comments" className="space-y-4 mt-4">
              {loadingComments ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">{comment.nickname}</span>
                              <span>•</span>
                              <span>{format(new Date(comment.created_at), 'dd MMM yyyy HH:mm', { locale: it })}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              su: <span className="font-medium text-foreground">{comment.experience_title}</span>
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-sm bg-muted/50 p-3 rounded">
                          {comment.content}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/experience/${comment.experience_id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizza esperienza
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteDialog({ id: comment.id, type: 'comment' })}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Elimina
                        </Button>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      Nessun commento da moderare
                    </p>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare {deleteDialog?.type === 'experience' ? 'questa esperienza' : 'questo commento'}? 
              Questa azione non può essere annullata e rimuoverà permanentemente il contenuto dalla piattaforma.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Elimina definitivamente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
