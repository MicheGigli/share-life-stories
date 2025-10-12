import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Eye, Trash2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

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
}

export const ContentModeration = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select(`
          id,
          title,
          content,
          category,
          created_at,
          user_id,
          likes_count,
          comments_count,
          image_url,
          profiles!inner(nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedData = data?.map(exp => ({
        ...exp,
        nickname: (exp.profiles as any).nickname
      })) || [];

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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Esperienza eliminata",
        description: "L'esperienza è stata rimossa con successo"
      });

      setExperiences(experiences.filter(exp => exp.id !== id));
      setDeleteDialog(null);
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare l'esperienza",
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
          <CardTitle>Moderazione Contenuti</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestisci le esperienze pubblicate sulla piattaforma
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {experiences.map((exp) => (
              <div
                key={exp.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <Badge variant="outline">
                        {getCategoryDisplayName(exp.category)}
                      </Badge>
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
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteDialog(exp.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                    Elimina
                  </Button>
                </div>
              </div>
            ))}

            {experiences.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nessuna esperienza da moderare
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => !open && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questa esperienza? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-red-500 hover:bg-red-600"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
