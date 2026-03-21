// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useFollow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [followers, setFollowers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchFollowData = async () => {
    if (!user) return;

    try {
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingData) {
        setFollowing(new Set(followingData.map((f: any) => f.following_id)));
      }

      const { data: followerCounts } = await supabase
        .from('follows')
        .select('following_id');

      if (followerCounts) {
        const counts: Record<string, number> = {};
        followerCounts.forEach((f: any) => {
          counts[f.following_id] = (counts[f.following_id] || 0) + 1;
        });
        setFollowers(counts);
      }
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per seguire utenti",
        variant: "destructive",
      });
      return false;
    }

    if (targetUserId === user.id) {
      toast({
        title: "Azione non permessa",
        description: "Non puoi seguire te stesso",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId
        });

      if (error) throw error;

      setFollowing(prev => new Set([...prev, targetUserId]));
      setFollowers(prev => ({
        ...prev,
        [targetUserId]: (prev[targetUserId] || 0) + 1
      }));

      toast({
        title: "Utente seguito",
        description: "Ora segui questo utente",
      });

      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast({
          title: "Già seguito",
          description: "Stai già seguendo questo utente",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Errore",
          description: "Impossibile seguire l'utente",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;

      setFollowing(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });

      setFollowers(prev => ({
        ...prev,
        [targetUserId]: Math.max((prev[targetUserId] || 1) - 1, 0)
      }));

      toast({
        title: "Non segui più",
        description: "Hai smesso di seguire questo utente",
      });

      return true;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile smettere di seguire l'utente",
        variant: "destructive",
      });
      return false;
    }
  };

  const isFollowing = (targetUserId: string) => {
    return following.has(targetUserId);
  };

  const getFollowerCount = (targetUserId: string) => {
    return followers[targetUserId] || 0;
  };

  const getFollowingList = async () => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!data || data.length === 0) return [];

      const userIds = data.map((f: any) => f.following_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', userIds);

      return profiles || [];
    } catch (error) {
      console.error('Error fetching following list:', error);
      return [];
    }
  };

  return {
    following,
    followers,
    loading,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowerCount,
    getFollowingList,
    refresh: fetchFollowData
  };
};
