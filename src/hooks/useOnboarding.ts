import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnboardingProgress {
  profile_completed: boolean;
  first_experience_created: boolean;
  first_like_given: boolean;
  first_comment_made: boolean;
  tutorial_completed: boolean;
  welcome_tour_completed: boolean;
}

export const useOnboarding = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<OnboardingProgress>({
    profile_completed: false,
    first_experience_created: false,
    first_like_given: false,
    first_comment_made: false,
    tutorial_completed: false,
    welcome_tour_completed: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgress();
      initializeOnboarding();
    }
  }, [user]);

  const fetchProgress = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setProgress({
          profile_completed: data.profile_completed,
          first_experience_created: data.first_experience_created,
          first_like_given: data.first_like_given,
          first_comment_made: data.first_comment_made,
          tutorial_completed: data.tutorial_completed,
          welcome_tour_completed: data.welcome_tour_completed,
        });
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        profile_completed: false,
        first_experience_created: false,
        first_like_given: false,
        first_comment_made: false,
        tutorial_completed: false,
        welcome_tour_completed: false,
      }, { onConflict: 'user_id' });

    if (error) {
      console.error('Error initializing onboarding:', error);
    }
  };

  const updateProgress = async (field: keyof OnboardingProgress) => {
    if (!user) return;

    const { error } = await supabase
      .from('user_onboarding')
      .update({ [field]: true })
      .eq('user_id', user.id);

    if (!error) {
      setProgress(prev => ({ ...prev, [field]: true }));
    }
  };

  const getCompletionPercentage = () => {
    const totalSteps = Object.keys(progress).length;
    const completedSteps = Object.values(progress).filter(Boolean).length;
    return Math.round((completedSteps / totalSteps) * 100);
  };

  const getNextStep = () => {
    if (!progress.welcome_tour_completed) return 'welcome_tour';
    if (!progress.profile_completed) return 'profile';
    if (!progress.first_experience_created) return 'experience';
    if (!progress.first_like_given) return 'like';
    if (!progress.first_comment_made) return 'comment';
    if (!progress.tutorial_completed) return 'tutorial';
    return null;
  };

  const isCompleted = () => {
    return Object.values(progress).every(Boolean);
  };

  return {
    progress,
    loading,
    updateProgress,
    getCompletionPercentage,
    getNextStep,
    isCompleted,
    refreshProgress: fetchProgress
  };
};