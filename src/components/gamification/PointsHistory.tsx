import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, Plus, Minus } from 'lucide-react';
import { useGameification } from '@/hooks/useGameification';

export const PointsHistory = () => {
  const { pointHistory, loading } = useGameification();
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="h-6 w-16 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActionLabel = (actionType: string) => {
    const labels = {
      'experience_created': 'Esperienza pubblicata',
      'comment_created': 'Commento scritto',
      'like_given': 'Like dato',
      'like_received': 'Like ricevuto',
      'badge_earned': 'Badge sbloccato',
      'level_up': 'Livello aumentato'
    };
    return labels[actionType] || actionType;
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('received') || actionType.includes('earned') || actionType.includes('level_up')) {
      return <Plus className="h-4 w-4 text-green-600" />;
    }
    return <Plus className="h-4 w-4 text-blue-600" />;
  };

  const getActionColor = (actionType: string) => {
    if (actionType.includes('received') || actionType.includes('earned')) {
      return 'text-green-600 bg-green-50';
    }
    return 'text-blue-600 bg-blue-50';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Storico Punti
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pointHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessuna attività registrata ancora.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pointHistory.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-card/50">
                <div className={`p-2 rounded-full ${getActionColor(item.action_type)}`}>
                  {getActionIcon(item.action_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm">{getActionLabel(item.action_type)}</h4>
                  {item.description && (
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`${getActionColor(item.action_type)} border-0 font-bold`}
                >
                  +{item.points_earned}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};