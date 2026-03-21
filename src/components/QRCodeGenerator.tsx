// @ts-nocheck
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QRCodeGeneratorProps {
  experienceId: string;
  title: string;
}

export const QRCodeGenerator = ({ experienceId, title }: QRCodeGeneratorProps) => {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchQRCode();
  }, [experienceId]);

  const fetchQRCode = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('qr_code_url')
        .eq('experience_id', experienceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setQrCodeUrl(data.qr_code_url);
      }
    } catch (error) {
      console.error('Error fetching QR code:', error);
    }
  };

  const generateQRCode = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('generate_qr_code', { experience_id: experienceId });

      if (error) throw error;

      setQrCodeUrl(data);
      toast({
        title: "QR Code generato",
        description: "Il QR Code è stato generato con successo"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella generazione del QR Code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;

    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download completato",
        description: "Il QR Code è stato scaricato"
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel download del QR Code",
        variant: "destructive"
      });
    }
  };

  const shareQRCode = async () => {
    if (!qrCodeUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code - ${title}`,
          text: `Scansiona questo QR Code per leggere: ${title}`,
          url: qrCodeUrl
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(qrCodeUrl);
      toast({
        title: "Link copiato",
        description: "Il link del QR Code è stato copiato negli appunti"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Condivisione Rapida
        </CardTitle>
      </CardHeader>
      <CardContent>
        {qrCodeUrl ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCodeUrl}
                alt="QR Code per condividere l'esperienza"
                className="border rounded-lg bg-white p-2"
                style={{ maxWidth: '200px', maxHeight: '200px' }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQRCode}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Scarica
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={shareQRCode}
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              Scansiona il QR Code per accedere rapidamente a questa esperienza
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Genera un QR Code per condividere facilmente questa esperienza
            </p>
            <Button
              onClick={generateQRCode}
              disabled={loading}
            >
              {loading ? 'Generando...' : 'Genera QR Code'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};