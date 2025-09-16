import { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

export function PullToRefresh({ 
  onRefresh, 
  children, 
  threshold = 80,
  disabled = false 
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);
  const currentY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || !startY.current || window.scrollY > 0) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;
    
    if (distance > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, threshold * 1.5));
      e.preventDefault();
    }
  };

  const handleTouchEnd = async () => {
    if (disabled || !isPulling) return;
    
    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, pullDistance, threshold]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showRefreshIndicator = isPulling || isRefreshing;

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Pull indicator */}
      <div 
        className={`absolute top-0 left-0 right-0 flex items-center justify-center transition-all duration-300 bg-primary/10 backdrop-blur-sm ${
          showRefreshIndicator ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          height: Math.max(pullDistance, 0),
          transform: `translateY(${showRefreshIndicator ? 0 : -100}%)` 
        }}
      >
        <div className="flex items-center gap-2 text-primary">
          <RefreshCw 
            className={`h-5 w-5 transition-transform duration-300 ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{ 
              transform: `rotate(${pullProgress * 360}deg)` 
            }}
          />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Aggiornamento...' : pullProgress >= 1 ? 'Rilascia per aggiornare' : 'Trascina per aggiornare'}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div 
        style={{ 
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
}