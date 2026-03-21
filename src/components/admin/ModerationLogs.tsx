// @ts-nocheck
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { InfiniteScroll } from '@/components/ui/infinite-scroll';

interface ModerationLog {
  id: string;
  user_id: string;
  content_type: string;
  content: string;
  is_appropriate: boolean;
  reason: string | null;
  created_at: string;
}

export const ModerationLogs = () => {
  const [logs, setLogs] = useState<ModerationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (pageNum: number = 0) => {
    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('moderation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setLogs(prev => pageNum === 0 ? (data || []) : [...prev, ...(data || [])]);
      setHasMore(data ? data.length === ITEMS_PER_PAGE : false);
    } catch (error) {
      console.error('Error fetching moderation logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLogs(nextPage);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Log Moderazione AI</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Moderazione AI</CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 && !loading ? (
          <p className="text-muted-foreground text-center py-8">
            Nessun log di moderazione disponibile
          </p>
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
          >
            <div className="space-y-4">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {log.is_appropriate ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <Badge variant={log.is_appropriate ? "secondary" : "destructive"}>
                        {log.is_appropriate ? "Approvato" : "Rifiutato"}
                      </Badge>
                      <Badge variant="outline">{log.content_type}</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(new Date(log.created_at), 'dd MMM yyyy HH:mm', { locale: it })}
                    </div>
                  </div>

                  <p className="text-sm line-clamp-2">{log.content}</p>

                  {!log.is_appropriate && log.reason && (
                    <div className="bg-destructive/10 p-2 rounded text-sm">
                      <span className="font-semibold">Motivo: </span>
                      {log.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </InfiniteScroll>
        )}
      </CardContent>
    </Card>
  );
};
