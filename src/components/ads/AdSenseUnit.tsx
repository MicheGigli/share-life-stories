import { useEffect, useRef } from 'react';

interface AdSenseUnitProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export const AdSenseUnit = ({ 
  adSlot, 
  adFormat = 'auto', 
  className,
  style 
}: AdSenseUnitProps) => {
  const pushed = useRef(false);
  const adsEnabled = import.meta.env.VITE_ADS_ENABLED === 'true';

  useEffect(() => {
    if (!adsEnabled || pushed.current) return;
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, [adsEnabled]);

  if (!adsEnabled) return null;

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-3604467906760129"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

// No-op loader — AdSense script is now in index.html
export const AdSenseLoader = () => null;
