import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Award, Calendar } from 'lucide-react';
import { useGameification } from '@/hooks/useGameification';

export const BadgeCollection = () => {
  const { badges, loading, getBadgesByRarity } = useGameification();
  
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const badgesByRarity = getBadgesByRarity();
  const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
  const rarityColors = {
    legendary: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    epic: 'bg-gradient-to-br from-purple-500 to-pink-500',
    rare: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    common: 'bg-gradient-to-br from-gray-400 to-gray-600'
  };

  const rarityLabels = {
    legendary: 'Leggendari',
    epic: 'Epici',
    rare: 'Rari',
    common: 'Comuni'
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Collezione Badge ({badges.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {badges.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun badge guadagnato ancora.</p>
            <p className="text-sm">Inizia a interagire per sbloccare i primi badge!</p>
          </div>
        ) : (
          rarityOrder.map(rarity => {
            const rarityBadges = badgesByRarity[rarity] || [];
            if (rarityBadges.length === 0) return null;

            return (
              <div key={rarity} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`${rarityColors[rarity]} text-white border-0`}>
                    {rarityLabels[rarity]} ({rarityBadges.length})
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {rarityBadges.map(badge => (
                    <div
                      key={badge.id}
                      className="group relative p-4 border rounded-lg bg-card hover:shadow-md transition-all duration-200 hover:scale-105"
                    >
                      <div className="text-center space-y-2">
                        <div className={`w-12 h-12 mx-auto rounded-full ${rarityColors[badge.rarity]} flex items-center justify-center`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-sm">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                        {badge.earned_at && (
                          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(badge.earned_at).toLocaleDateString('it-IT')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};