import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Report {
  id: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reporter_nickname: string;
  experience_id: string | null;
  comment_id: string | null;
  content_preview: string;
}

export const ReportsManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          reason,
          status,
          created_at,
          experience_id,
          comment_id,
          profiles!reports_reporter_id_fkey(nickname)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch content previews
      const reportsWithContent = await Promise.all(
        (data || []).map(async (report) => {
          let content_preview = '';
          
          if (report.experience_id) {
            const { data: exp } = await supabase
              .from('experiences')
              .select('title, content')
              .eq('id', report.experience_id)
              .single();
            content_preview = exp ? `${exp.title}: ${exp.content.substring(0, 100)}...` : 'Contenuto non disponibile';
          } else if (report.comment_id) {
            const { data: comment } = await supabase
              .from('comments')
              .select('content')
              .eq('id', report.comment_id)
              .single();
            content_preview = comment ? comment.content.substring(0, 100) + '...' : 'Commento non disponibile';
          }

          return {
            id: report.id,
            reason: report.reason,
            status: report.status as 'pending' | 'approved' | 'rejected',
            created_at: report.created_at,
            experience_id: report.experience_id,
            comment_id: report.comment_id,
            reporter_nickname: (report.profiles as any)?.nickname || 'Anonimo',
            content_preview
          };
        })
      );

      setReports(reportsWithContent);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare le segnalazioni",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Segnalazione aggiornata",
        description: `La segnalazione è stata ${newStatus === 'approved' ? 'approvata' : 'rifiutata'}`
      });

      fetchReports();
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare la segnalazione",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(r => r.status === activeTab);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive"; label: string }> = {
      pending: { variant: "default", label: "In attesa" },
      approved: { variant: "secondary", label: "Approvata" },
      rejected: { variant: "destructive", label: "Rifiutata" }
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Gestione Segnalazioni
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              In Attesa ({reports.filter(r => r.status === 'pending').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approvate ({reports.filter(r => r.status === 'approved').length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rifiutate ({reports.filter(r => r.status === 'rejected').length})
            </TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4 mt-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">Motivo: {report.reason}</p>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <p className="text-sm text-muted-foreground">
                        Segnalato da <span className="font-medium">{report.reporter_nickname}</span>
                        {' • '}
                        {new Date(report.created_at).toLocaleDateString('it-IT')}
                      </p>

                      <div className="bg-muted p-3 rounded text-sm">
                        <p className="font-medium mb-1">Contenuto segnalato:</p>
                        <p className="text-muted-foreground">{report.content_preview}</p>
                      </div>
                    </div>
                  </div>

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(report.id, 'approved')}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approva
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusChange(report.id, 'rejected')}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rifiuta
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {filteredReports.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nessuna segnalazione {status === 'pending' ? 'in attesa' : status === 'approved' ? 'approvata' : 'rifiutata'}
                </p>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
