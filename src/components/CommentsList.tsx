import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Reply, ChevronDown, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { CommentWithMentions } from './CommentWithMentions';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: {
    nickname: string;
  };
  level?: number;
  replies?: Comment[];
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (experienceId) {
      fetchComments();
    }
  }, [experienceId, refreshTrigger]);

  const fetchComments = async () => {
    if (!experienceId) return;
    
    try {
      setLoading(true);
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

          const { data: points } = await supabase
            .from('user_points')
            .select('current_level')
            .eq('user_id', comment.user_id)
            .single();
          
          return {
            ...comment,
            profiles: { nickname: profile?.nickname || 'Utente' },
            level: points?.current_level || 1
          };
        })
      );

      // Organize comments into tree structure
      const commentsMap = new Map();
      const rootComments: Comment[] = [];

      // First pass: create map of all comments
      commentsWithProfiles.forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into tree structure
      commentsWithProfiles.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(commentsMap.get(comment.id));
          }
        } else {
          rootComments.push(commentsMap.get(comment.id));
        }
      });

      setComments(rootComments);
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

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const handleReplyClick = (commentId: string) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const handleCommentAdded = () => {
    fetchComments();
    setReplyingTo(null);
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-6 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="border rounded-lg p-4 bg-muted/30 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {comment.profiles?.nickname || 'Utente'}
              </span>
              {comment.level && <LevelIndicator level={comment.level} size="sm" showLabel={false} />}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: it,
              })}
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {!isReply && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReplyClick(comment.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Reply className="h-4 w-4" />
              </Button>
            )}
            
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
        </div>
        
        <div 
          className="text-sm mb-2"
          dangerouslySetInnerHTML={{ 
            __html: renderCommentContent(comment.content) 
          }}
        />

        {/* Reply form */}
        {replyingTo === comment.id && (
          <div className="mt-3 pt-3 border-t">
            <CommentWithMentions
              experienceId={experienceId}
              parentId={comment.id}
              onCommentAdded={handleCommentAdded}
              placeholder={`Rispondi a ${comment.profiles?.nickname || 'questo utente'}...`}
            />
          </div>
        )}

        {/* Replies section */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleReplies(comment.id)}
              className="text-muted-foreground hover:text-foreground p-0 h-auto"
            >
              {expandedReplies.has(comment.id) ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1" />
              )}
              {comment.replies.length} {comment.replies.length === 1 ? 'risposta' : 'risposte'}
            </Button>
            
            {expandedReplies.has(comment.id) && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

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
      {comments.map((comment) => renderComment(comment))}
    </div>
  );
};