import { supabase } from '@/integrations/supabase/client';

interface ModerationResult {
  isAppropriate: boolean;
  reason: string;
}

export const useModeration = () => {
  const moderateContent = async (
    content: string,
    contentType: 'experience' | 'comment',
    contentId?: string,
    userId?: string
  ): Promise<ModerationResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { 
          content, 
          contentType, 
          contentId,
          userId 
        }
      });

      if (error) throw error;

      return data as ModerationResult;
    } catch (error) {
      console.error('Moderation error:', error);
      // In case of error, allow content but log the issue
      return { isAppropriate: true, reason: "" };
    }
  };

  return { moderateContent };
};
