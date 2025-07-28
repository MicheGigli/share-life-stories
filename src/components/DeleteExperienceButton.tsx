import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DeleteExperienceButtonProps {
  experienceId: string;
  onDeleted?: () => void;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const DeleteExperienceButton = ({ 
  experienceId, 
  onDeleted, 
  variant = 'destructive',
  size = 'sm'
}: DeleteExperienceButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', experienceId);

      if (error) {
        if (error.message.includes('policy')) {
          toast({
            title: "Impossibile eliminare",
            description: "Non puoi eliminare questa esperienza perché ha commenti di altri utenti",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Errore",
            description: "Impossibile eliminare l'esperienza",
            variant: "destructive",
          });
        }
        return;
      }

      toast({
        title: "Esperienza eliminata",
        description: "L'esperienza è stata eliminata con successo",
      });

      if (onDeleted) {
        onDeleted();
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          <Trash2 className="h-4 w-4" />
          {size !== 'icon' && ' Elimina'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
          <AlertDialogDescription>
            Sei sicuro di voler eliminare questa esperienza? Questa azione non può essere annullata.
            Se ci sono commenti di altri utenti, l'eliminazione non sarà possibile.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading}>
            {loading ? 'Eliminazione...' : 'Elimina'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};