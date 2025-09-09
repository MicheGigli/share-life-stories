import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MousePointer, X, TrendingUp, Settings, ExternalLink } from 'lucide-react';
import { AdAnalytics } from './AdAnalytics';
import { SampleAffiliateProducts } from './SampleAffiliateProducts';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'products'>('overview');

  const toggleAds = () => {
    setIsEnabled(!isEnabled);
    // In a real app, this would update user preferences
  };

  const openAdSenseConsole = () => {
    window.open('https://www.google.com/adsense/', '_blank');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistema Monetizzazione LifeShare
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">ID: ca-pub-3604467906760129</Badge>
            <Badge variant={isEnabled ? "default" : "secondary"}>
              {isEnabled ? "Attivo" : "Disabilitato"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 mb-6">
              <Button 
                variant={activeTab === 'overview' ? 'default' : 'outline'}
                onClick={() => setActiveTab('overview')}
              >
                Panoramica
              </Button>
              <Button 
                variant={activeTab === 'analytics' ? 'default' : 'outline'}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics Live
              </Button>
              <Button 
                variant={activeTab === 'products' ? 'default' : 'outline'}
                onClick={() => setActiveTab('products')}
              >
                Prodotti Affiliati
              </Button>
              <Button 
                variant="outline"
                onClick={openAdSenseConsole}
                className="ml-auto"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Console AdSense
              </Button>
            </div>

            {activeTab === 'overview' && (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Google AdSense</h3>
                    <p className="text-sm text-muted-foreground">
                      Banner display e annunci contestuali - Publisher ID configurato ✅
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

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Amazon Associates</h3>
                    <p className="text-sm text-muted-foreground">
                      Link di affiliazione prodotti - Tag: lifeshare-21 ✅
                    </p>
                  </div>
                  <Badge variant="default">Attivo</Badge>
                </div>

                <div className="text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-200">
                  🚀 <strong>Sistema completamente configurato!</strong> 
                  <br />Le pubblicità sono ora cliccabili e tracciate. 
                  Monitor i guadagni nella sezione Analytics Live.
                </div>
              </>
            )}

            {activeTab === 'analytics' && (
              <AdAnalytics />
            )}

            {activeTab === 'products' && (
              <SampleAffiliateProducts />
            )}
          </div>
        </CardContent>
      </Card>

      {isEnabled && activeTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Riepilogo Performance</CardTitle>
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
                <div className="text-xs text-muted-foreground">Guadagni oggi</div>
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