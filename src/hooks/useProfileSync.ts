import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfileSync = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Check if profile exists, if not create one
      checkAndCreateProfile();
    }
  }, [user]);

  const checkAndCreateProfile = async () => {
    if (!user) return;

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile for existing user
        await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            nickname: user.user_metadata?.name || user.email?.split('@')[0] || 'Utente',
            bio: 'Nuovo membro della community LifeShare'
          });
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
    }
  };

  return { checkAndCreateProfile };
};