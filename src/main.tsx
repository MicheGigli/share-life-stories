import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'

// Load Google AdSense script
if (typeof window !== 'undefined' && import.meta.env.VITE_ADS_ENABLED === 'true') {
  const adsenseScript = document.createElement('script');
  adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3604467906760129';
  adsenseScript.async = true;
  adsenseScript.crossOrigin = 'anonymous';
  document.head.appendChild(adsenseScript);
  
  // Initialize adsbygoogle
  (window as any).adsbygoogle = (window as any).adsbygoogle || [];
}

// Load Google Analytics
if (typeof window !== 'undefined' && import.meta.env.VITE_GA_MEASUREMENT_ID) {
  const gaScript = document.createElement('script');
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID}`;
  gaScript.async = true;
  document.head.appendChild(gaScript);
  
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).gtag = function() {
    (window as any).dataLayer.push(arguments);
  };
  (window as any).gtag('js', new Date());
  (window as any).gtag('config', import.meta.env.VITE_GA_MEASUREMENT_ID);
}

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
