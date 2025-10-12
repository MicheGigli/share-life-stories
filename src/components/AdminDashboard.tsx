import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserManagement } from './admin/UserManagement';
import { ContentModeration } from './admin/ContentModeration';
import { ReportsManager } from './admin/ReportsManager';
import { AnalyticsDashboard } from './admin/AnalyticsDashboard';

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
          <TabsTrigger value="overview">Analytics</TabsTrigger>
          <TabsTrigger value="users">Utenti</TabsTrigger>
          <TabsTrigger value="content">Contenuti</TabsTrigger>
          <TabsTrigger value="reports">Segnalazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-6 mt-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="content" className="space-y-6 mt-6">
          <ContentModeration />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 mt-6">
          <ReportsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};