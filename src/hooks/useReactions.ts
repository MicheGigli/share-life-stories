// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type ReactionType = 'like' | 'useful' | 'interesting' | 'wow' | 'love';

export interface ReactionCounts {
  like: number;
  useful: number;
  interesting: number;
  wow: number;
  love: number;
}

export const useReactions = (experienceId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userReactions, setUserReactions] = useState<Set<ReactionType>>(new Set());
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>({
    like: 0,
    useful: 0,
    interesting: 0,
    wow: 0,
    love: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReactions();
  }, [experienceId, user]);

  const fetchReactions = async () => {
    try {
      // Get reaction counts for this experience
      const { data: counts } = await supabase
        .from('reactions')
        .select('reaction_type')
        .eq('experience_id', experienceId);

      if (counts) {
        const newCounts: ReactionCounts = {
          like: 0,
          useful: 0,
          interesting: 0,
          wow: 0,
          love: 0,
        };

        counts.forEach(reaction => {
          newCounts[reaction.reaction_type as ReactionType]++;
        });

        setReactionCounts(newCounts);
      }

      // Get user's reactions if authenticated
      if (user) {
        const { data: userReactionsData } = await supabase
          .from('reactions')
          .select('reaction_type')
          .eq('experience_id', experienceId)
          .eq('user_id', user.id);

        if (userReactionsData) {
          setUserReactions(new Set(userReactionsData.map(r => r.reaction_type as ReactionType)));
        }
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReaction = async (reactionType: ReactionType) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per reagire",
        variant: "destructive",
      });
      return false;
    }

    const hasReaction = userReactions.has(reactionType);

    try {
      if (hasReaction) {
        // Remove reaction
        const { error } = await supabase
          .from('reactions')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experienceId)
          .eq('reaction_type', reactionType);

        if (error) throw error;

        setUserReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(reactionType);
          return newSet;
        });

        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: Math.max(prev[reactionType] - 1, 0)
        }));
      } else {
        // Add reaction
        const { error } = await supabase
          .from('reactions')
          .insert({
            user_id: user.id,
            experience_id: experienceId,
            reaction_type: reactionType
          });

        if (error) throw error;

        setUserReactions(prev => new Set([...prev, reactionType]));
        setReactionCounts(prev => ({
          ...prev,
          [reactionType]: prev[reactionType] + 1
        }));
      }

      return true;
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast({
        title: "Errore",
        description: "Impossibile modificare la reazione",
        variant: "destructive",
      });
      return false;
    }
  };

  const hasReaction = (reactionType: ReactionType) => {
    return userReactions.has(reactionType);
  };

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  return {
    userReactions,
    reactionCounts,
    loading,
    toggleReaction,
    hasReaction,
    getTotalReactions,
    refresh: fetchReactions
  };
};