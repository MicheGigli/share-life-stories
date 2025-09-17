import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAffiliateLinks } from '@/hooks/useAffiliateLinks';
import { ExternalLink, ShoppingCart } from 'lucide-react';

interface AffiliateProductsProps {
  experienceId: string;
}

export const AffiliateProducts = ({ experienceId }: AffiliateProductsProps) => {
  const { links, loading, trackAffiliateClick } = useAffiliateLinks(experienceId);

  const handleAffiliateClick = (linkId: string, url: string) => {
    trackAffiliateClick(linkId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Prodotti Consigliati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (links.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Prodotti Consigliati
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {link.image_url && (
                <img
                  src={link.image_url}
                  alt={link.product_name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              
              <div className="flex-1">
                <h4 className="font-medium text-sm">{link.product_name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {link.platform}
                  </Badge>
                  {link.price && (
                    <span className="text-sm font-semibold text-green-600">
                      €{link.price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={() => handleAffiliateClick(link.id, link.affiliate_url)}
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Vedi
              </Button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            I link affiliati supportano la piattaforma senza costi aggiuntivi per te
          </p>
        </div>
      </CardContent>
    </Card>
  );
};