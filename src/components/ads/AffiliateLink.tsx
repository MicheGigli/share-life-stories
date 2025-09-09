import { useState } from 'react';
import { ExternalLink, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AffiliateLinkProps {
  url: string;
  title: string;
  price?: string;
  originalPrice?: string;
  description?: string;
  image?: string;
  affiliate: 'amazon' | 'generic';
  className?: string;
}

export const AffiliateLink = ({ 
  url, 
  title, 
  price, 
  originalPrice, 
  description, 
  image,
  affiliate,
  className 
}: AffiliateLinkProps) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    // Build affiliate URL with tracking
    let affiliateUrl = url;
    if (affiliate === 'amazon' && !url.includes('tag=')) {
      const separator = url.includes('?') ? '&' : '?';
      affiliateUrl = `${url}${separator}tag=${import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'lifeshare-21'}`;
    }

    // Track affiliate click
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        affiliate_partner: affiliate,
        product_title: title,
        product_price: price,
        affiliate_url: affiliateUrl
      });
    }
    
    // Open in new tab
    window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const getAffiliateBadge = () => {
    switch (affiliate) {
      case 'amazon':
        return <Badge className="bg-amazon text-white">Amazon</Badge>;
      default:
        return <Badge variant="secondary">Partner</Badge>;
    }
  };

  return (
    <div className={`border rounded-lg p-4 bg-card hover:shadow-lg transition-all duration-300 ${className}`}>
      <div className="flex items-start space-x-4">
        {image && !imageError && (
          <div className="flex-shrink-0">
            <img
              src={image}
              alt={title}
              className="w-20 h-20 object-cover rounded-md"
              onError={() => setImageError(true)}
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm line-clamp-2 flex-1">{title}</h4>
            {getAffiliateBadge()}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {price && (
                <span className="font-bold text-primary">{price}</span>
              )}
              {originalPrice && originalPrice !== price && (
                <span className="text-xs text-muted-foreground line-through">
                  {originalPrice}
                </span>
              )}
            </div>
            
            <Button
              size="sm"
              variant="outline"
              onClick={handleClick}
              className="flex items-center space-x-1"
            >
              <ShoppingCart className="h-3 w-3" />
              <span className="text-xs">Acquista</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t">
        <p className="text-xs text-muted-foreground">
          💡 Link affiliato - LifeShare riceve una commissione per gli acquisti
        </p>
      </div>
    </div>
  );
};