-- Fix security warnings
-- 1. Fix function search path for handle_comment_mentions
CREATE OR REPLACE FUNCTION public.handle_comment_mentions()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  mentioned_user TEXT;
  mentioned_user_id UUID;
BEGIN
  -- Extract mentions from comment content (looking for @username pattern)
  IF NEW.content ~ '@[a-zA-Z0-9_]+' THEN
    -- Extract all mentions and store them
    NEW.mentions := regexp_split_to_array(
      regexp_replace(NEW.content, '.*@([a-zA-Z0-9_]+).*', '\1', 'g'), 
      ','
    );
    
    -- Create notifications for each mentioned user
    FOREACH mentioned_user IN ARRAY NEW.mentions
    LOOP
      -- Get user ID from nickname
      SELECT user_id INTO mentioned_user_id 
      FROM public.profiles 
      WHERE nickname = mentioned_user;
      
      IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id, 
          type, 
          title, 
          message, 
          related_id,
          mention_type
        ) VALUES (
          mentioned_user_id,
          'mention',
          'Sei stato menzionato in un commento',
          'Un utente ti ha menzionato in un commento',
          NEW.id,
          'comment'
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;