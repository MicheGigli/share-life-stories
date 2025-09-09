import { useEffect } from 'react';

export const AdSenseScript = () => {
  useEffect(() => {
    // Load AdSense script if not already loaded
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