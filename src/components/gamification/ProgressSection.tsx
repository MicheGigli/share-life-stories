import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { LevelIndicator } from './LevelIndicator';
import { Trophy, TrendingUp } from 'lucide-react';
import { useGameification } from '@/hooks/useGameification';

export const ProgressSection = () => {
  const { userPoints, loading, getProgressToNextLevel } = useGameification();
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-8 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progress = getProgressToNextLevel();

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trophy className="h-5 w-5 text-primary" />
          Progressi LifeSharer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <LevelIndicator level={userPoints.current_level} size="lg" />
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{userPoints.total_points}</p>
            <p className="text-sm text-muted-foreground">Punti totali</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Progresso al livello {userPoints.current_level + 1}
            </span>
            <span className="font-medium">
              {progress.current}/{progress.needed} punti
            </span>
          </div>
          <Progress value={progress.percentage} className="h-3" />
          <p className="text-xs text-muted-foreground text-center">
            Ti servono ancora {progress.needed - progress.current} punti per il prossimo livello
          </p>
        </div>
      </CardContent>
    </Card>
  );
};