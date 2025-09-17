import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle, 
  Settings,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AdminStats {
  totalUsers: number;
  totalExperiences: number;
  totalComments: number;
  reportsCount: number;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalExperiences: 0,
    totalComments: 0,
    reportsCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const [usersResult, experiencesResult, commentsResult, reportsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('experiences').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending')
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        totalExperiences: experiencesResult.count || 0,
        totalComments: commentsResult.count || 0,
        reportsCount: reportsResult.count || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{loading ? '...' : value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p>Accesso richiesto</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Amministratore</h1>
        <Badge variant="outline">Admin Panel</Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Utenti Totali"
          value={stats.totalUsers}
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Esperienze"
          value={stats.totalExperiences}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Commenti"
          value={stats.totalComments}
          icon={MessageSquare}
          color="bg-purple-500"
        />
        <StatCard
          title="Segnalazioni"
          value={stats.reportsCount}
          icon={AlertCircle}
          color="bg-red-500"
        />
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="content">Contenuti</TabsTrigger>
          <TabsTrigger value="reports">Segnalazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Attività Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Utenti registrati oggi</span>
                  <Badge>+{Math.floor(Math.random() * 10)}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Esperienze pubblicate oggi</span>
                  <Badge>+{Math.floor(Math.random() * 15)}</Badge>
                </div>
                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <span>Commenti oggi</span>
                  <Badge>+{Math.floor(Math.random() * 25)}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Utenti</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Cerca utenti..." className="max-w-sm" />
                <Button variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funzionalità di gestione utenti in sviluppo...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestione Contenuti</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Cerca contenuti..." className="max-w-sm" />
                <Button variant="outline">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Esperienze in attesa di moderazione</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Commenti segnalati</span>
                  <Badge variant="destructive">{stats.reportsCount}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Segnalazioni Pendenti
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.reportsCount === 0 ? (
                <p className="text-muted-foreground">Nessuna segnalazione pendente</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Ci sono {stats.reportsCount} segnalazioni che richiedono attenzione.
                  </p>
                  <Button>
                    Rivedi Segnalazioni
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Download className="h-6 w-6" />
              Esporta Dati
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Settings className="h-6 w-6" />
              Configurazioni
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};