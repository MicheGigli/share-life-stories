-- Fix remaining function search_path security issues

-- Update handle_experience_points function
CREATE OR REPLACE FUNCTION public.handle_experience_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 'experience_created', 15, 'Esperienza pubblicata', NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update handle_comment_points function
CREATE OR REPLACE FUNCTION public.handle_comment_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 'comment_created', 5, 'Commento pubblicato', NEW.id);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update handle_like_points function
CREATE OR REPLACE FUNCTION public.handle_like_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  experience_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award 1 point to the user who gave the like
    PERFORM public.award_points(NEW.user_id, 'like_given', 1, 'Like dato', NEW.id);
    
    -- Award 3 points to the experience owner who received the like
    IF NEW.experience_id IS NOT NULL THEN
      SELECT user_id INTO experience_owner_id FROM experiences WHERE id = NEW.experience_id;
      IF experience_owner_id IS NOT NULL AND experience_owner_id != NEW.user_id THEN
        PERFORM public.award_points(experience_owner_id, 'like_received', 3, 'Like ricevuto', NEW.id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Update update_experience_counts function
CREATE OR REPLACE FUNCTION public.update_experience_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.experience_id IS NOT NULL THEN
      UPDATE public.experiences 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.experience_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.experience_id IS NOT NULL THEN
      UPDATE public.experiences 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.experience_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update update_comment_counts function
CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiences 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.experience_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experiences 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.experience_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;