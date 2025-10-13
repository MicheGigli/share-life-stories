import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from './skeleton';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
}

export const LazyImage = ({ src, alt, className, fallback, ...props }: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  if (error && fallback) {
    return (
      <img
        ref={imgRef}
        src={fallback}
        alt={alt}
        className={cn(className, 'animate-fade-in')}
        {...props}
      />
    );
  }

  return (
    <div className="relative">
      {isLoading && <Skeleton className={cn('absolute inset-0', className)} />}
      <img
        ref={imgRef}
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          className,
          isLoading ? 'opacity-0' : 'opacity-100 animate-fade-in',
          'transition-opacity duration-300'
        )}
        loading="lazy"
        {...props}
      />
    </div>
  );
};
