import { useState } from 'react';
import { Button } from './ui/button';
import { MentionInput } from './MentionInput';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './ui/use-toast';

interface CommentWithMentionsProps {
  experienceId: string;
  onCommentAdded: () => void;
}

export const CommentWithMentions = ({ experienceId, onCommentAdded }: CommentWithMentionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          experience_id: experienceId,
          user_id: user.id,
          content: comment.trim()
        });

      if (error) throw error;

      setComment('');
      onCommentAdded();
      
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato con successo.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiungere il commento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <MentionInput
          value={comment}
          onChange={setComment}
          placeholder="Scrivi un commento... (usa @ per menzionare un utente)"
          className="min-h-[80px] resize-none"
        />
        
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? 'Pubblicando...' : 'Pubblica commento'}
        </Button>
      </form>
    </div>
  );
};