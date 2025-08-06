-- Fix the handle_comment_mentions function to properly populate message field
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
          commenter_nickname || ' ti ha menzionato in un commento',
          NEW.id,
          'comment'
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix the handle_comment_notifications function to properly populate message field
CREATE OR REPLACE FUNCTION public.handle_comment_notifications()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  experience_owner_id UUID;
  existing_notification_id UUID;
  comment_count INTEGER;
  commenter_names TEXT[];
  notification_message TEXT;
  commenter_nickname TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get experience owner
    SELECT user_id INTO experience_owner_id 
    FROM experiences 
    WHERE id = NEW.experience_id;
    
    -- Don't notify self-comments
    IF experience_owner_id IS NULL OR experience_owner_id = NEW.user_id THEN
      RETURN NEW;
    END IF;
    
    -- Get commenter's nickname
    SELECT nickname INTO commenter_nickname 
    FROM public.profiles 
    WHERE user_id = NEW.user_id;
    
    -- Set default value if no nickname found
    IF commenter_nickname IS NULL THEN
      commenter_nickname := 'Un utente';
    END IF;
    
    -- Check for existing grouped comment notification for this experience
    SELECT id INTO existing_notification_id
    FROM notifications
    WHERE user_id = experience_owner_id
      AND type = 'comment'
      AND related_id = NEW.experience_id
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get total comment count for this experience (from other users)
    SELECT COUNT(*) INTO comment_count
    FROM comments
    WHERE experience_id = NEW.experience_id
      AND user_id != experience_owner_id;
    
    -- Get names of recent commenters (last 3, excluding owner)
    SELECT ARRAY_AGG(DISTINCT p.nickname ORDER BY p.nickname)
    INTO commenter_names
    FROM comments c
    JOIN profiles p ON c.user_id = p.user_id
    WHERE c.experience_id = NEW.experience_id
      AND c.user_id != experience_owner_id
      AND c.created_at > NOW() - INTERVAL '24 hours'
    LIMIT 3;
    
    -- Build notification message
    IF comment_count <= 1 THEN
      notification_message := commenter_nickname || ' ha commentato la tua esperienza';
    ELSIF comment_count <= 3 THEN
      notification_message := array_to_string(commenter_names, ', ') || ' hanno commentato la tua esperienza';
    ELSE
      notification_message := commenter_names[1] || ', ' || commenter_names[2] || 
        ' e altri ' || (comment_count - 2) || ' hanno commentato la tua esperienza';
    END IF;
    
    -- Update existing notification or create new one
    IF existing_notification_id IS NOT NULL THEN
      UPDATE notifications
      SET message = notification_message,
          is_read = false,
          created_at = NOW()
      WHERE id = existing_notification_id;
    ELSE
      INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        related_id
      ) VALUES (
        experience_owner_id,
        'comment',
        'Nuovi commenti',
        notification_message,
        NEW.experience_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;