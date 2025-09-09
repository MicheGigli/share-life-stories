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

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Initialize AdSense
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

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

// AdSense loader component
export const AdSenseLoader = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && !document.querySelector('script[src*="adsbygoogle"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3604467906760129';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
      
      // Initialize adsbygoogle array
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
    }
  }, []);

  return null;
};