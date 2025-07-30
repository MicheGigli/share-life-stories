import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    nickname: string;
  };
}

interface CommentsListProps {
  experienceId: string;
  refreshTrigger: number;
}

export const CommentsList = ({ experienceId, refreshTrigger }: CommentsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [experienceId, refreshTrigger]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('experience_id', experienceId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get nicknames for each comment user
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('user_id', comment.user_id)
            .single();
          
          return {
            ...comment,
            profiles: { nickname: profile?.nickname || 'Utente' }
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user?.id);

      if (error) throw error;

      await fetchComments();
      
      toast({
        title: "Commento eliminato",
        description: "Il commento è stato eliminato con successo.",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'eliminare il commento.",
        variant: "destructive",
      });
    }
  };

  const renderCommentContent = (content: string) => {
    // Replace @username mentions with styled spans
    return content.replace(/@(\w+)/g, '<span class="text-primary font-semibold">@$1</span>');
  };

  if (loading) {
    return <div className="text-center py-4">Caricamento commenti...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessun commento ancora. Sii il primo a commentare!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="border rounded-lg p-4 bg-muted/30">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {comment.profiles?.nickname || 'Utente'}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: it,
                })}
              </span>
            </div>
            
            {user && user.id === comment.user_id && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="text-destructive hover:text-destructive/90"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{ 
              __html: renderCommentContent(comment.content) 
            }}
          />
        </div>
      ))}
    </div>
  );
};