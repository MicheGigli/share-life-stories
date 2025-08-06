-- Fix mention notifications to store experience_id in related_id for proper navigation
-- This allows clicking on mention notifications to navigate to the correct experience

-- Update the comment mentions function to store experience_id instead of comment_id
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
    
    -- Update the comment with mentions array
    UPDATE public.comments 
    SET mentions = COALESCE(matches, ARRAY[]::TEXT[])
    WHERE id = NEW.id;
    
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
            NEW.experience_id,  -- Store experience_id instead of comment_id for proper navigation
            'comment'
          );
        END IF;
      END LOOP;
    END IF;
  ELSE
    -- Update comment with empty mentions array if no mentions
    UPDATE public.comments 
    SET mentions = ARRAY[]::TEXT[]
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;