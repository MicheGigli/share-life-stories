import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Linkedin, MessageCircle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAnalytics } from '@/hooks/useAnalytics';

interface SocialShareProps {
  experienceId: string;
  title: string;
  description: string;
}

export const SocialShare = ({ experienceId, title, description }: SocialShareProps) => {
  const { toast } = useToast();
  const { trackShare } = useAnalytics();
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  const shareUrl = `${baseUrl}/experience/${experienceId}`;
  const shareText = `${title} - ${description.substring(0, 100)}...`;

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'hover:bg-blue-400 hover:text-white'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-700 hover:text-white'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
      color: 'hover:bg-green-600 hover:text-white'
    }
  ];

  const handleSocialShare = (platform: string, url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    trackShare(experienceId, platform.toLowerCase());
    toast({
      title: "Condivisione",
      description: `Esperienza condivisa su ${platform}`
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      trackShare(experienceId, 'clipboard');
      toast({
        title: "Link copiato",
        description: "Il link è stato copiato negli appunti"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile copiare il link",
        variant: "destructive"
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: shareUrl
        });
        trackShare(experienceId, 'native');
      } catch (error) {
        // User cancelled sharing
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          Condividi questa esperienza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Social Platform Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.name}
                  variant="outline"
                  onClick={() => handleSocialShare(platform.name, platform.url)}
                  className={`flex items-center gap-2 transition-colors ${platform.color}`}
                >
                  <Icon className="h-4 w-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>

          {/* Copy Link */}
          <div className="pt-3 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex-1"
                disabled={copied}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copiato!' : 'Copia Link'}
              </Button>
              
              {navigator.share && (
                <Button
                  variant="outline"
                  onClick={nativeShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Condividi
                </Button>
              )}
            </div>
          </div>

          {/* Share URL Display */}
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Link da condividere:</p>
            <p className="text-sm font-mono break-all">{shareUrl}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};