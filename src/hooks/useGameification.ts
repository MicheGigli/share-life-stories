import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserPoints {
  total_points: number;
  current_level: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  image_url: string;
  rarity: string;
  category: string;
  earned_at?: string;
}

interface PointHistoryItem {
  id: string;
  action_type: string;
  points_earned: number;
  description: string;
  created_at: string;
}

export const useGameification = () => {
  const { user } = useAuth();
  const [userPoints, setUserPoints] = useState<UserPoints>({ total_points: 0, current_level: 1 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch user points and level
      const { data: points } = await supabase
        .from('user_points')
        .select('total_points, current_level')
        .eq('user_id', user.id)
        .single();

      if (points) {
        setUserPoints(points);
      }

      // Fetch user badges - due to relationship constraints, we'll fetch separately
      const { data: userBadges } = await supabase
        .from('user_badges')
        .select('badge_id, earned_at')
        .eq('user_id', user.id);

      if (userBadges && userBadges.length > 0) {
        const badgeIds = userBadges.map(ub => ub.badge_id);
        const { data: badgesData } = await supabase
          .from('badges')
          .select('*')
          .in('id', badgeIds);

        if (badgesData) {
          const formattedBadges = badgesData.map(badge => {
            const userBadge = userBadges.find(ub => ub.badge_id === badge.id);
            return {
              ...badge,
              earned_at: userBadge?.earned_at
            };
          }) as Badge[];
          setBadges(formattedBadges);
        }
      } else {
        setBadges([]);
      }

      // Fetch point history
      const { data: history } = await supabase
        .from('point_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (history) {
        setPointHistory(history);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPointsForNextLevel = (currentLevel: number) => {
    return 100 * (currentLevel + 1) * currentLevel;
  };

  const getProgressToNextLevel = () => {
    const currentLevelPoints = 100 * userPoints.current_level * (userPoints.current_level - 1);
    const nextLevelPoints = getPointsForNextLevel(userPoints.current_level);
    const progressPoints = userPoints.total_points - currentLevelPoints;
    const pointsNeeded = nextLevelPoints - currentLevelPoints;
    
    return {
      current: progressPoints,
      needed: pointsNeeded,
      percentage: Math.min((progressPoints / pointsNeeded) * 100, 100)
    };
  };

  const getBadgesByRarity = () => {
    const grouped = badges.reduce((acc, badge) => {
      if (!acc[badge.rarity]) acc[badge.rarity] = [];
      acc[badge.rarity].push(badge);
      return acc;
    }, {} as Record<string, Badge[]>);

    return grouped;
  };

  return {
    userPoints,
    badges,
    pointHistory,
    loading,
    getPointsForNextLevel,
    getProgressToNextLevel,
    getBadgesByRarity,
    refreshData: fetchUserData
  };
};