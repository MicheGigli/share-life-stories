import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LevelIndicatorProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LevelIndicator = ({ level, size = 'md', showLabel = true }: LevelIndicatorProps) => {
  const getLevelColor = (level: number) => {
    if (level <= 5) return 'bg-gray-500';
    if (level <= 10) return 'bg-blue-500';
    if (level <= 15) return 'bg-purple-500';
    if (level <= 25) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getLevelText = (level: number) => {
    if (level <= 5) return 'Principiante';
    if (level <= 10) return 'Esperto';
    if (level <= 15) return 'Veterano';
    if (level <= 25) return 'Maestro';
    return 'Leggenda';
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className="flex items-center gap-1">
      <div className={`${getLevelColor(level)} rounded-full flex items-center justify-center ${sizeClasses[size]}`}>
        <Star className={`${sizeClasses[size]} text-white`} fill="currentColor" />
      </div>
      <span className={`font-semibold ${textSizes[size]}`}>
        Lv.{level}
      </span>
      {showLabel && (
        <Badge variant="outline" className={textSizes[size]}>
          {getLevelText(level)}
        </Badge>
      )}
    </div>
  );
};