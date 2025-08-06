-- Drop all existing comment triggers to start clean
DROP TRIGGER IF EXISTS comment_mentions_trigger ON public.comments;
DROP TRIGGER IF EXISTS handle_comment_mentions_trigger ON public.comments;
DROP TRIGGER IF EXISTS comment_notifications_trigger ON public.comments;
DROP TRIGGER IF EXISTS handle_comment_notifications_trigger ON public.comments;

-- Recreate the triggers in the correct order
-- 1. First, handle mentions (BEFORE trigger to process mentions array)
CREATE TRIGGER handle_comment_mentions_trigger
  BEFORE INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_mentions();

-- 2. Then, handle general comment notifications (AFTER trigger)
CREATE TRIGGER handle_comment_notifications_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_notifications();

-- Also ensure we have proper notification creation permissions
-- Add a trigger to allow system to create notifications
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;
CREATE POLICY "System can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Update the handle_comment_mentions function to ensure it always returns NEW
CREATE OR REPLACE FUNCTION public.handle_comment_mentions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  mentioned_user TEXT;
  mentioned_user_id UUID;
  commenter_nickname TEXT;
  mention_pattern TEXT := '@([a-zA-Z0-9_]+)';
  matches TEXT[];
BEGIN
  -- Get commenter's nickname
  SELECT nickname INTO commenter_nickname 
  FROM public.profiles 
  WHERE user_id = NEW.user_id;
  
  -- Set default value if no nickname found
  IF commenter_nickname IS NULL THEN
    commenter_nickname := 'Un utente';
  END IF;

  -- Extract mentions from comment content (looking for @username pattern)
  IF NEW.content ~ mention_pattern THEN
    -- Extract all @username mentions
    SELECT array_agg(match[1]) INTO matches
    FROM regexp_matches(NEW.content, mention_pattern, 'g') AS match;
    
    -- Store mentions in the mentions array
    NEW.mentions := COALESCE(matches, ARRAY[]::TEXT[]);
    
    -- Create notifications for each mentioned user
    IF matches IS NOT NULL THEN
      FOREACH mentioned_user IN ARRAY matches
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
            commenter_nickname || ' ti ha menzionato in un commento',
            NEW.id,
            'comment'
          );
        END IF;
      END LOOP;
    END IF;
  ELSE
    -- Ensure mentions array is always set (empty if no mentions)
    NEW.mentions := ARRAY[]::TEXT[];
  END IF;
  
  RETURN NEW;
END;
$function$;