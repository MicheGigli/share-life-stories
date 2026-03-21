import { useEffect } from 'react';

interface AdEvent {
  type: 'impression' | 'click' | 'dismiss';
  adId: string;
  category?: string;
  position?: string;
  userId?: string;
}

export const useAdTracking = () => {
  useEffect(() => {
    // Initialize tracking
    if (typeof window !== 'undefined') {
      // Google Analytics 4 setup for ads
      if (!(window as any).gtag) {
        const script = document.createElement('script');
        script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'}`;
        script.async = true;
        document.head.appendChild(script);

        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments);
        };
        (window as any).gtag('js', new Date());
        (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX');
      }
    }
  }, []);

  const trackAdEvent = (event: AdEvent) => {
    try {
      // Google Analytics tracking
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', `ad_${event.type}`, {
          ad_id: event.adId,
          ad_category: event.category,
          ad_position: event.position,
          user_id: event.userId
        });
      }

      // Custom analytics (could be sent to your backend)
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/track-ad', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        }).catch(console.error);
      }

      console.log('Ad event tracked:', event);
    } catch (error) {
      console.error('Ad tracking error:', error);
    }
  };

  const trackAdImpression = (adId: string, category?: string, position?: string) => {
    trackAdEvent({ type: 'impression', adId, category, position });
  };

  const trackAdClick = (adId: string, category?: string, position?: string) => {
    trackAdEvent({ type: 'click', adId, category, position });
  };

  const trackAdDismiss = (adId: string, category?: string, position?: string) => {
    trackAdEvent({ type: 'dismiss', adId, category, position });
  };

  return {
    trackAdImpression,
    trackAdClick,
    trackAdDismiss
  };
};