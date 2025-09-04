import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, X, TrendingUp } from 'lucide-react';

interface AdStats {
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  topCategory: string;
}

export const AdManager = () => {
  const [stats, setStats] = useState<AdStats>({
    impressions: 1234,
    clicks: 45,
    ctr: 3.6,
    revenue: 12.45,
    topCategory: 'mutui'
  });

  const [isEnabled, setIsEnabled] = useState(true);

  const toggleAds = () => {
    setIsEnabled(!isEnabled);
    // In a real app, this would update user preferences
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Gestione Pubblicità
          </CardTitle>
          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Attive" : "Disabilitate"}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Pubblicità Display</h3>
                <p className="text-sm text-muted-foreground">
                  Banner pubblicitari e annunci contestuali
                </p>
              </div>
              <Button 
                variant={isEnabled ? "destructive" : "default"}
                onClick={toggleAds}
              >
                {isEnabled ? <X className="h-4 w-4 mr-2" /> : null}
                {isEnabled ? "Disabilita" : "Abilita"}
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              💡 <strong>Disabilitando le pubblicità</strong> riduci le entrate del sito 
              ma migliori l'esperienza utente. Considera un abbonamento premium per 
              supportare la piattaforma senza pubblicità.
            </div>
          </div>
        </CardContent>
      </Card>

      {isEnabled && (
        <Card>
          <CardHeader>
            <CardTitle>Statistiche Pubblicitarie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <Eye className="h-5 w-5 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{stats.impressions.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Visualizzazioni</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <MousePointer className="h-5 w-5 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{stats.clicks}</div>
                <div className="text-xs text-muted-foreground">Click</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="h-5 w-5 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">{stats.ctr}%</div>
                <div className="text-xs text-muted-foreground">CTR</div>
              </div>
              
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">€{stats.revenue}</div>
                <div className="text-xs text-muted-foreground">Guadagni</div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm">
                <strong>Categoria top:</strong> {stats.topCategory} - 
                Le pubblicità in questa categoria generano il 40% delle entrate totali
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};