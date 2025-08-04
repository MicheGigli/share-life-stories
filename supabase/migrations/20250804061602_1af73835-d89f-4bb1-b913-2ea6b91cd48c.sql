-- Create function to handle like notifications with grouping
CREATE OR REPLACE FUNCTION public.handle_like_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  experience_owner_id UUID;
  existing_notification_id UUID;
  like_count INTEGER;
  liker_names TEXT[];
  notification_message TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get experience owner
    SELECT user_id INTO experience_owner_id 
    FROM experiences 
    WHERE id = NEW.experience_id;
    
    -- Don't notify self-likes
    IF experience_owner_id IS NULL OR experience_owner_id = NEW.user_id THEN
      RETURN NEW;
    END IF;
    
    -- Check for existing grouped like notification for this experience
    SELECT id INTO existing_notification_id
    FROM notifications
    WHERE user_id = experience_owner_id
      AND type = 'like'
      AND related_id = NEW.experience_id
      AND created_at > NOW() - INTERVAL '24 hours'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- Get total like count for this experience
    SELECT COUNT(*) INTO like_count
    FROM likes
    WHERE experience_id = NEW.experience_id;
    
    -- Get names of recent likers (last 3)
    SELECT ARRAY_AGG(p.nickname ORDER BY l.created_at DESC)
    INTO liker_names
    FROM likes l
    JOIN profiles p ON l.user_id = p.user_id
    WHERE l.experience_id = NEW.experience_id
    LIMIT 3;
    
    -- Build notification message
    IF like_count <= 3 THEN
      notification_message := array_to_string(liker_names, ', ') || 
        CASE 
          WHEN like_count = 1 THEN ' ha messo mi piace alla tua esperienza'
          ELSE ' hanno messo mi piace alla tua esperienza'
        END;
    ELSE
      notification_message := liker_names[1] || ', ' || liker_names[2] || 
        ' e altri ' || (like_count - 2) || ' hanno messo mi piace alla tua esperienza';
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
        'like',
        'Mi piace ricevuti',
        notification_message,
        NEW.experience_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to handle comment notifications with grouping
CREATE OR REPLACE FUNCTION public.handle_comment_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  experience_owner_id UUID;
  existing_notification_id UUID;
  comment_count INTEGER;
  commenter_names TEXT[];
  notification_message TEXT;
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
    IF comment_count <= 3 THEN
      notification_message := array_to_string(commenter_names, ', ') || 
        CASE 
          WHEN comment_count = 1 THEN ' ha commentato la tua esperienza'
          ELSE ' hanno commentato la tua esperienza'
        END;
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
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_like_notifications_trigger ON public.likes;
DROP TRIGGER IF EXISTS handle_comment_notifications_trigger ON public.comments;

-- Create triggers for like and comment notifications
CREATE TRIGGER handle_like_notifications_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_like_notifications();

CREATE TRIGGER handle_comment_notifications_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_notifications();