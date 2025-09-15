import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash } from 'lucide-react';
import { useTrending } from '@/hooks/useTrending';
import { useNavigate } from 'react-router-dom';

interface TrendingTopicsProps {
  limit?: number;
  category?: string;
  showCategory?: boolean;
}

export const TrendingTopics = ({ 
  limit = 5, 
  category,
  showCategory = true 
}: TrendingTopicsProps) => {
  const { topics, loading } = useTrending();
  const navigate = useNavigate();

  const filteredTopics = category 
    ? topics.filter(topic => topic.category === category)
    : topics;

  const displayTopics = filteredTopics.slice(0, limit);

  const handleTopicClick = (topic: string) => {
    navigate(`/search?q=${encodeURIComponent(topic)}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Argomenti di tendenza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (displayTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Argomenti di tendenza
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nessun argomento di tendenza al momento
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Argomenti di tendenza
          {category && (
            <Badge variant="outline" className="ml-auto">
              {category}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => handleTopicClick(topic.topic)}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {index + 1}
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium capitalize">{topic.topic}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {topic.usage_count}
                </Badge>
                {showCategory && topic.category && (
                  <Badge variant="outline" className="text-xs">
                    {topic.category}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredTopics.length > limit && (
          <div className="mt-4 pt-3 border-t">
            <button
              onClick={() => navigate('/search')}
              className="text-sm text-primary hover:underline"
            >
              Vedi tutti gli argomenti →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};