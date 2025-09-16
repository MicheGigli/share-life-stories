import { useEffect, useRef, useState, ReactNode } from 'react';
import { LoadingSpinner } from './loading-spinner';

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  loader?: ReactNode;
}

export function InfiniteScroll({
  children,
  hasMore,
  loading,
  onLoadMore,
  threshold = 100,
  loader
}: InfiniteScrollProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: `${threshold}px` }
    );

    const currentTarget = targetRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [threshold]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  return (
    <div>
      {children}
      
      {hasMore && (
        <div 
          ref={targetRef}
          className="flex justify-center py-8"
        >
          {loading && (
            loader || (
              <div className="flex items-center gap-2 text-muted-foreground">
                <LoadingSpinner size="sm" />
                <span>Caricamento...</span>
              </div>
            )
          )}
        </div>
      )}
      
      {!hasMore && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Non ci sono più contenuti da caricare</p>
        </div>
      )}
    </div>
  );
}