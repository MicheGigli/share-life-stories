-- Fix security issues by setting proper search paths

-- Update the can_delete_experience function with proper search path
CREATE OR REPLACE FUNCTION public.can_delete_experience(experience_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if the experience belongs to the user
  IF NOT EXISTS (
    SELECT 1 FROM public.experiences 
    WHERE id = experience_id AND experiences.user_id = can_delete_experience.user_id
  ) THEN
    RETURN false;
  END IF;
  
  -- Check if there are comments from other users
  IF EXISTS (
    SELECT 1 FROM public.comments 
    WHERE comments.experience_id = can_delete_experience.experience_id 
    AND comments.user_id != can_delete_experience.user_id
  ) THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Update the get_user_nickname function with proper search path
CREATE OR REPLACE FUNCTION public.get_user_nickname(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  nickname text;
BEGIN
  SELECT profiles.nickname INTO nickname
  FROM public.profiles
  WHERE profiles.user_id = get_user_nickname.user_id;
  
  RETURN COALESCE(nickname, 'Utente');
END;
$$;