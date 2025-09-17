import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Database, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const DataExport = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exportType, setExportType] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const exportOptions = [
    { value: 'full', label: 'Tutti i dati', icon: Database, description: 'Profilo, esperienze, commenti, reazioni' },
    { value: 'experiences', label: 'Solo esperienze', icon: FileText, description: 'Le tue esperienze pubblicate' },
    { value: 'comments', label: 'Solo commenti', icon: MessageSquare, description: 'I tuoi commenti e risposte' }
  ];

  const requestExport = async () => {
    if (!user || !exportType) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('export_requests')
        .insert({
          user_id: user.id,
          export_type: exportType
        });

      if (error) throw error;

      toast({
        title: "Richiesta inviata",
        description: "La tua richiesta di esportazione è stata inviata. Riceverai una notifica quando sarà pronta."
      });
      
      setExportType('');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio della richiesta di esportazione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToJSON = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Get user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: experiences } = await supabase
        .from('experiences')
        .select('*')
        .eq('user_id', user.id);

      const { data: comments } = await supabase
        .from('comments')
        .select('*')
        .eq('user_id', user.id);

      const { data: likes } = await supabase
        .from('likes')
        .select('*')
        .eq('user_id', user.id);

      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        profile,
        experiences,
        comments,
        likes,
        bookmarks,
        exported_at: new Date().toISOString()
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeshare-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export completato",
        description: "I tuoi dati sono stati scaricati in formato JSON"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'esportazione dei dati",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Esporta i tuoi dati
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Scarica una copia dei tuoi dati in conformità al GDPR. Puoi scegliere quali dati esportare.
          </p>
          
          <div className="space-y-3">
            {exportOptions.map((option) => {
              const Icon = option.icon;
              return (
                <div
                  key={option.value}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    exportType === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => setExportType(option.value)}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <h4 className="font-medium">{option.label}</h4>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={requestExport}
            disabled={loading || !exportType}
            className="flex-1"
          >
            {loading ? 'Elaborando...' : 'Richiedi esportazione'}
          </Button>
          <Button
            variant="outline"
            onClick={exportToJSON}
            disabled={loading}
            className="flex-1"
          >
            Export immediato (JSON)
          </Button>
        </div>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Informazioni sull'esportazione</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• L'export immediato include tutti i tuoi dati in formato JSON</li>
            <li>• Le richieste di esportazione vengono elaborate entro 48 ore</li>
            <li>• Riceverai una notifica quando l'export sarà pronto</li>
            <li>• I file di export sono disponibili per 7 giorni</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};