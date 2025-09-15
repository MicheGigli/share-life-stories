import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Lightbulb, Star, Zap, Sparkles } from 'lucide-react';
import { useReactions, ReactionType } from '@/hooks/useReactions';

interface ReactionButtonsProps {
  experienceId: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'ghost';
  showCounts?: boolean;
  compact?: boolean;
}

const reactionConfig = {
  like: {
    icon: Heart,
    label: 'Mi piace',
    color: 'text-red-500',
    bgColor: 'bg-red-50 hover:bg-red-100'
  },
  useful: {
    icon: Lightbulb,
    label: 'Utile',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 hover:bg-blue-100'
  },
  interesting: {
    icon: Star,
    label: 'Interessante',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100'
  },
  wow: {
    icon: Zap,
    label: 'Wow',
    color: 'text-orange-500',
    bgColor: 'bg-orange-50 hover:bg-orange-100'
  },
  love: {
    icon: Sparkles,
    label: 'Fantastico',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 hover:bg-purple-100'
  }
};

export const ReactionButtons = ({ 
  experienceId, 
  size = 'sm', 
  variant = 'ghost',
  showCounts = true,
  compact = false
}: ReactionButtonsProps) => {
  const { hasReaction, reactionCounts, toggleReaction, loading } = useReactions(experienceId);

  const handleReaction = async (reactionType: ReactionType, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleReaction(reactionType);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse bg-muted rounded" />
        <div className="h-8 w-8 animate-pulse bg-muted rounded" />
        <div className="h-8 w-8 animate-pulse bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {(Object.keys(reactionConfig) as ReactionType[]).map((reactionType) => {
        const config = reactionConfig[reactionType];
        const Icon = config.icon;
        const isActive = hasReaction(reactionType);
        const count = reactionCounts[reactionType];

        return (
          <div key={reactionType} className="flex items-center gap-1">
            <Button
              size={size}
              variant={isActive ? 'default' : variant}
              onClick={(e) => handleReaction(reactionType, e)}
              className={`flex items-center gap-1 transition-all duration-200 ${
                isActive 
                  ? `${config.color} ${config.bgColor} border-current` 
                  : `hover:${config.color} ${config.bgColor}`
              }`}
              aria-label={`${config.label} (${count})`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'fill-current' : ''}`} />
              {!compact && (
                <span className="text-xs hidden sm:inline">
                  {config.label}
                </span>
              )}
            </Button>
            
            {showCounts && count > 0 && (
              <Badge 
                variant="secondary" 
                className="text-xs px-1.5 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center"
              >
                {count}
              </Badge>
            )}
          </div>
        );
      })}
    </div>
  );
};