import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, MessageCircle, Heart, TrendingUp } from 'lucide-react';

interface CommunityStats {
  totalUsers: number;
  totalExperiences: number;
  totalLikes: number;
  totalComments: number;
}

export const CommunityStats = () => {
  const [stats, setStats] = useState<CommunityStats>({
    totalUsers: 0,
    totalExperiences: 0,
    totalLikes: 0,
    totalComments: 0
  });

  useEffect(() => {
    fetchCommunityStats();
  }, []);

  const fetchCommunityStats = async () => {
    try {
      // Get total users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });

      // Get experiences with their stats
      const { data: experiences, error: experiencesError } = await supabase
        .from('experiences')
        .select('likes_count, comments_count')
        .eq('is_published', true);

      if (profilesError || experiencesError) {
        console.error('Error fetching community stats:', profilesError || experiencesError);
        return;
      }

      const totalExperiences = experiences?.length || 0;
      const totalLikes = experiences?.reduce((sum, exp) => sum + (exp.likes_count || 0), 0) || 0;
      const totalComments = experiences?.reduce((sum, exp) => sum + (exp.comments_count || 0), 0) || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        totalExperiences,
        totalLikes,
        totalComments: totalComments
      });
    } catch (error) {
      console.error('Error fetching community stats:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num === 0) return '0';
    if (num < 1000) return num.toString();
    if (num < 10000) return `${(num / 1000).toFixed(1)}k`;
    return `${Math.floor(num / 1000)}k`;
  };

  const statsData = [
    {
      icon: Users,
      value: formatNumber(stats.totalUsers) + '+',
      label: 'Membri attivi',
      fallback: '5.000+'
    },
    {
      icon: MessageCircle,
      value: formatNumber(stats.totalExperiences) + '+',
      label: 'Esperienze condivise',
      fallback: '15.000+'
    },
    {
      icon: Heart,
      value: formatNumber(stats.totalLikes) + '+',
      label: 'Like ricevuti',
      fallback: '50.000+'
    },
    {
      icon: TrendingUp,
      value: formatNumber(stats.totalComments) + '+',
      label: 'Commenti scritti',
      fallback: '25.000+'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
      {statsData.map((stat, index) => (
        <div key={index} className="flex flex-col items-center text-center">
          <div className="bg-white/20 p-3 rounded-full mb-3">
            <stat.icon className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold">
            {stat.value}
          </h3>
          <p className="text-white/80 text-sm">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};