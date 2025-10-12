import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, FileText, MessageSquare, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsData {
  totalUsers: number;
  newUsersToday: number;
  totalExperiences: number;
  experiencesToday: number;
  totalComments: number;
  commentsToday: number;
  totalLikes: number;
  likesToday: number;
  topCategories: { category: string; count: number }[];
  topContributors: { nickname: string; count: number }[];
}

export const AnalyticsDashboard = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all data in parallel
      const [
        usersTotal,
        usersToday,
        experiencesTotal,
        experiencesToday,
        commentsTotal,
        commentsToday,
        likesTotal,
        likesToday,
        categoryData,
        contributorData
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('experiences').select('id', { count: 'exact', head: true }),
        supabase.from('experiences').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('comments').select('id', { count: 'exact', head: true }),
        supabase.from('comments').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('likes').select('id', { count: 'exact', head: true }),
        supabase.from('likes').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('experiences').select('category'),
        supabase.from('experiences').select('user_id, profiles!inner(nickname)')
      ]);

      // Process category data
      const categoryCounts = new Map<string, number>();
      categoryData.data?.forEach(exp => {
        categoryCounts.set(exp.category, (categoryCounts.get(exp.category) || 0) + 1);
      });
      const topCategories = Array.from(categoryCounts.entries())
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      // Process contributor data
      const contributorCounts = new Map<string, number>();
      contributorData.data?.forEach(exp => {
        const nickname = (exp.profiles as any)?.nickname;
        if (nickname) {
          contributorCounts.set(nickname, (contributorCounts.get(nickname) || 0) + 1);
        }
      });
      const topContributors = Array.from(contributorCounts.entries())
        .map(([nickname, count]) => ({ nickname, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setData({
        totalUsers: usersTotal.count || 0,
        newUsersToday: usersToday.count || 0,
        totalExperiences: experiencesTotal.count || 0,
        experiencesToday: experiencesToday.count || 0,
        totalComments: commentsTotal.count || 0,
        commentsToday: commentsToday.count || 0,
        totalLikes: likesTotal.count || 0,
        likesToday: likesToday.count || 0,
        topCategories,
        topContributors
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryDisplayName = (category: string) => {
    const categories: Record<string, string> = {
      'mutui': 'Mutui',
      'vacanze': 'Vacanze',
      'auto': 'Veicoli',
      'amazon': 'Prodotti'
    };
    return categories[category] || category;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utenti</p>
                <p className="text-2xl font-bold">{data.totalUsers}</p>
                <p className="text-xs text-green-500 mt-1">+{data.newUsersToday} oggi</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esperienze</p>
                <p className="text-2xl font-bold">{data.totalExperiences}</p>
                <p className="text-xs text-green-500 mt-1">+{data.experiencesToday} oggi</p>
              </div>
              <FileText className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commenti</p>
                <p className="text-2xl font-bold">{data.totalComments}</p>
                <p className="text-xs text-green-500 mt-1">+{data.commentsToday} oggi</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mi Piace</p>
                <p className="text-2xl font-bold">{data.totalLikes}</p>
                <p className="text-xs text-green-500 mt-1">+{data.likesToday} oggi</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories and Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Categorie Popolari</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topCategories.map((cat, index) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{getCategoryDisplayName(cat.category)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{cat.count} esperienze</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topContributors.map((contributor, index) => (
                <div key={contributor.nickname} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{contributor.nickname}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{contributor.count} esperienze</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
