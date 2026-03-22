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
import { InfiniteScroll } from '@/components/ui/infinite-scroll';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  profiles: { nickname: string };
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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (experienceId) {
      setPage(0);
      setComments([]);
      fetchComments(0);
    }
  }, [experienceId, refreshTrigger]);

  const fetchComments = async (pageNum: number = 0) => {
    if (!experienceId) return;
    try {
      setLoading(true);
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      // Query 1: root comments paginati
      const { data: rootComments, error } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, parent_id')
        .eq('experience_id', experienceId)
        .is('parent_id', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      if (!rootComments?.length) {
        if (pageNum === 0) setComments([]);
        setHasMore(false);
        return;
      }

      // Query 2: tutte le replies dei root comments in un colpo solo
      const rootIds = rootComments.map(c => c.id);
      const { data: allReplies } = await supabase
        .from('comments')
        .select('id, content, created_at, user_id, parent_id')
        .in('parent_id', rootIds)
        .order('created_at', { ascending: true });

      // Raccoglie tutti gli user_id unici (root + replies)
      const allRows = [...rootComments, ...(allReplies ?? [])];
      const userIds = [...new Set(allRows.map(c => c.user_id))];

      // Query 3: profili in batch
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);

      // Query 4: livelli in batch
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('user_id, current_level')
        .in('user_id', userIds);

      // Lookup maps O(1)
      const profileMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) ?? []);
      const levelMap = new Map(pointsData?.map(p => [p.user_id, p.current_level]) ?? []);

      // Raggruppa replies per parent
      const repliesByParent = new Map<string, Comment[]>();
      for (const reply of allReplies ?? []) {
        const enriched: Comment = {
          ...reply,
          profiles: { nickname: profileMap.get(reply.user_id) ?? 'Utente' },
          level: levelMap.get(reply.user_id) ?? 1,
        };
        if (!repliesByParent.has(reply.parent_id!)) repliesByParent.set(reply.parent_id!, []);
        repliesByParent.get(reply.parent_id!)!.push(enriched);
      }

      // Assembla commenti finali
      const enriched: Comment[] = rootComments.map(c => ({
        ...c,
        profiles: { nickname: profileMap.get(c.user_id) ?? 'Utente' },
        level: levelMap.get(c.user_id) ?? 1,
        replies: repliesByParent.get(c.id) ?? [],
      }));

      setComments(prev => pageNum === 0 ? enriched : [...prev, ...enriched]);
      setHasMore(rootComments.length === ITEMS_PER_PAGE);
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
      toast({ title: "Commento eliminato", description: "Il commento è stato eliminato con successo." });
    } catch (error) {
      toast({ title: "Errore", description: "Si è verificato un errore nell'eliminare il commento.", variant: "destructive" });
    }
  };

  const renderCommentContent = (content: string) =>
    content.replace(/@(\w+)/g, '<span class="text-primary font-semibold">@$1</span>');

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const s = new Set(prev);
      s.has(commentId) ? s.delete(commentId) : s.add(commentId);
      return s;
    });
  };

  const handleCommentAdded = () => {
    setPage(0);
    setComments([]);
    fetchComments(0);
    setReplyingTo(null);
  };

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchComments(next);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={isReply ? 'ml-6 pl-4 border-l-2 border-muted' : ''}>
      <div className="border rounded-lg p-4 bg-muted/30 animate-fade-in">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.location.href = `/profile/${comment.user_id}`}
            >
              <span className="font-semibold">{comment.profiles?.nickname || 'Utente'}</span>
              {comment.level && <LevelIndicator level={comment.level} size="sm" showLabel={false} />}
            </div>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {!isReply && user && (
              <Button variant="ghost" size="sm" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-muted-foreground hover:text-foreground">
                <Reply className="h-4 w-4" />
              </Button>
            )}
            {user && user.id === comment.user_id && (
              <Button variant="ghost" size="sm" onClick={() => handleDeleteComment(comment.id)} className="text-destructive hover:text-destructive/90">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm mb-2" dangerouslySetInnerHTML={{ __html: renderCommentContent(comment.content) }} />

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

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => toggleReplies(comment.id)} className="text-muted-foreground hover:text-foreground p-0 h-auto">
              {expandedReplies.has(comment.id) ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              {comment.replies.length} {comment.replies.length === 1 ? 'risposta' : 'risposte'}
            </Button>
            {expandedReplies.has(comment.id) && (
              <div className="mt-2 space-y-2 animate-fade-in">
                {comment.replies.map(r => renderComment(r, true))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="text-center py-4">Caricamento commenti...</div>;

  if (comments.length === 0) return (
    <div className="text-center py-8 text-muted-foreground">
      Nessun commento ancora. Sii il primo a commentare!
    </div>
  );

  return (
    <InfiniteScroll hasMore={hasMore} loading={loading} onLoadMore={loadMore}>
      <div className="space-y-4">
        {comments.map(c => renderComment(c))}
      </div>
    </InfiniteScroll>
  );
};
