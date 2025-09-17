import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { ExperienceCard } from './ExperienceCard';
import { Sparkles, RefreshCw } from 'lucide-react';

export const AIRecommendations = () => {
  const { recommendations, loading, generateRecommendations } = useAIRecommendations();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Consigliati per te
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Consigliati per te
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">
              Nessuna raccomandazione disponibile al momento.
            </div>
            <Button
              variant="outline"
              onClick={generateRecommendations}
              disabled={loading}
            >
              Genera raccomandazioni AI
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="relative">
                <div className="absolute top-2 right-2 z-10">
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    {Math.round(rec.confidence_score * 100)}%
                  </Badge>
                </div>
                <ExperienceCard
                  id={rec.experience.id}
                  title={rec.experience.title}
                  author="AI Suggested"
                  content={rec.experience.content.slice(0, 150) + '...'}
                  category={rec.experience.category}
                  likes={rec.experience.likes_count}
                  comments={rec.experience.comments_count}
                  date={formatDate(rec.experience.created_at)}
                  tags={rec.experience.tags}
                  imageUrl={rec.experience.image_url}
                  userId=""
                  compact
                />
              </div>
            ))}
            
            {recommendations.length > 3 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  Vedi tutte le raccomandazioni ({recommendations.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};