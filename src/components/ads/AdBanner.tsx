import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AdBannerProps {
  position: 'horizontal' | 'vertical' | 'square';
  category?: string;
  className?: string;
  dismissible?: boolean;
}

export const AdBanner = ({ position, category, className, dismissible = false }: AdBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [adContent, setAdContent] = useState<any>(null);

  useEffect(() => {
    // Simulate ad loading from AdSense or other networks
    const loadAd = async () => {
      // This would be replaced with actual ad network integration
      const mockAds = {
        mutui: {
          title: "Confronta i migliori mutui",
          description: "Trova il mutuo perfetto per te. Calcola subito la rata!",
          image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=200&fit=crop",
          cta: "Calcola ora",
          advertiser: "FinanzaOnline",
          url: "https://www.fineco.it/mutui/"
        },
        vacanze: {
          title: "Offerte viaggi imperdibili",
          description: "Scopri le destinazioni più belle a prezzi scontati",
          image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=200&fit=crop",
          cta: "Prenota ora",
          advertiser: "Booking.com",
          url: "https://www.booking.com/deals.html"
        },
        auto: {
          title: "Assicurazione auto conveniente",
          description: "Risparmia fino al 40% sulla tua RC auto",
          image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=200&fit=crop",
          cta: "Preventivo",
          advertiser: "LinearAssicurazioni",
          url: "https://www.linear.it/preventivo/"
        },
        amazon: {
          title: "Offerte Amazon del giorno",
          description: "Prodotti selezionati con sconti fino al 70%",
          image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=200&fit=crop",
          cta: "Scopri ora",
          advertiser: "Amazon",
          url: `https://www.amazon.it/deals?tag=${import.meta.env.VITE_AMAZON_ASSOCIATE_TAG || 'lifeshare-21'}`
        }
      };

      // Select ad based on category or random
      const selectedCategory = category || Object.keys(mockAds)[Math.floor(Math.random() * Object.keys(mockAds).length)];
      setAdContent(mockAds[selectedCategory as keyof typeof mockAds]);
    };

    loadAd();
  }, [category]);

  const handleAdClick = () => {
    // Track click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_click', {
        ad_category: category,
        ad_position: position,
        ad_url: adContent?.url
      });
    }
    
    // Open the ad URL in new tab
    if (adContent?.url) {
      window.open(adContent.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Track dismissal
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'ad_dismiss', {
        ad_category: category,
        ad_position: position
      });
    }
  };

  if (!isVisible || !adContent) return null;

  const getAdDimensions = () => {
    switch (position) {
      case 'horizontal':
        return 'w-full h-32 md:h-24';
      case 'vertical':
        return 'w-80 h-96';
      case 'square':
        return 'w-80 h-80';
      default:
        return 'w-full h-32';
    }
  };

  return (
    <Card className={`relative overflow-hidden border-2 border-dashed border-muted bg-gradient-card hover:shadow-lg transition-all duration-300 ${getAdDimensions()} ${className}`}>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background rounded-full p-1"
          aria-label="Chiudi annuncio"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      <div className="absolute top-2 left-2 z-10">
        <Badge variant="secondary" className="text-xs">
          Sponsorizzato
        </Badge>
      </div>

      <div 
        className="flex h-full cursor-pointer"
        onClick={handleAdClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleAdClick()}
      >
        {position === 'horizontal' ? (
          <>
            <div className="flex-shrink-0 w-32 md:w-24">
              <img 
                src={adContent.image} 
                alt={adContent.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h4 className="font-semibold text-sm mb-1 line-clamp-1">{adContent.title}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{adContent.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-medium">{adContent.cta}</span>
                <span className="text-xs text-muted-foreground">{adContent.advertiser}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="relative w-full h-full">
            <img 
              src={adContent.image} 
              alt={adContent.title}
              className="w-full h-2/3 object-cover"
            />
            <div className="p-4 h-1/3 flex flex-col justify-center">
              <h4 className="font-semibold text-sm mb-1 line-clamp-1">{adContent.title}</h4>
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{adContent.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-primary font-medium">{adContent.cta}</span>
                <span className="text-xs text-muted-foreground">{adContent.advertiser}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};