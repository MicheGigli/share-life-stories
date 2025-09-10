-- Comprehensive Security Fixes Migration

-- Phase 1: Fix infinite recursion in user_roles policy
-- First, create a security definer function to safely check user roles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create new safe admin policy using the security definer function
CREATE POLICY "Only admins can manage roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.get_current_user_role() = 'admin')
WITH CHECK (public.get_current_user_role() = 'admin');

-- Phase 2: Restrict public access to user data tables

-- Fix likes table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view likes" ON public.likes;
CREATE POLICY "Authenticated users can view likes" 
ON public.likes 
FOR SELECT 
TO authenticated
USING (true);

-- Fix user_badges table - restrict to authenticated users  
DROP POLICY IF EXISTS "Users can view all earned badges" ON public.user_badges;
CREATE POLICY "Authenticated users can view earned badges" 
ON public.user_badges 
FOR SELECT 
TO authenticated
USING (true);

-- Fix user_points table - restrict to authenticated users
DROP POLICY IF EXISTS "Users can view all points" ON public.user_points;
CREATE POLICY "Authenticated users can view points" 
ON public.user_points 
FOR SELECT 
TO authenticated
USING (true);

-- Fix comments table - restrict to authenticated users
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
CREATE POLICY "Authenticated users can view comments" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (true);

-- Phase 3: Secure database functions by adding proper search_path settings

-- Update calculate_level_from_points function
CREATE OR REPLACE FUNCTION public.calculate_level_from_points(points integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  level INTEGER := 1;
  required_points INTEGER := 0;
BEGIN
  WHILE required_points <= points LOOP
    level := level + 1;
    required_points := 100 * level * (level - 1);
  END LOOP;
  
  RETURN level - 1;
END;
$function$;

-- Update points_for_next_level function
CREATE OR REPLACE FUNCTION public.points_for_next_level(current_level integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  RETURN 100 * (current_level + 1) * current_level;
END;
$function$;

-- Update award_points function
CREATE OR REPLACE FUNCTION public.award_points(target_user_id uuid, action_type text, points integer, description text DEFAULT NULL::text, related_id uuid DEFAULT NULL::uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert point history
  INSERT INTO public.point_history (user_id, action_type, points_earned, description, related_id)
  VALUES (target_user_id, action_type, points, description, related_id);
  
  -- Update or insert user points
  INSERT INTO public.user_points (user_id, total_points, current_level)
  VALUES (target_user_id, points, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + points,
    updated_at = now();
  
  -- Get new total and calculate level
  SELECT total_points INTO new_total FROM public.user_points WHERE user_id = target_user_id;
  SELECT public.calculate_level_from_points(new_total) INTO new_level;
  
  -- Update level
  UPDATE public.user_points SET current_level = new_level WHERE user_id = target_user_id;
  
  -- Check and award badges
  PERFORM public.check_and_award_badges(target_user_id);
END;
$function$;

-- Update check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.current_level, 1) as current_level,
    COALESCE((SELECT COUNT(*) FROM experiences WHERE user_id = target_user_id), 0) as experience_count,
    COALESCE((SELECT COUNT(*) FROM comments WHERE user_id = target_user_id), 0) as comment_count,
    COALESCE((SELECT COUNT(*) FROM likes WHERE user_id = target_user_id), 0) as likes_given,
    COALESCE((SELECT COUNT(*) FROM likes l JOIN experiences e ON l.experience_id = e.id WHERE e.user_id = target_user_id), 0) as likes_received
  INTO user_stats
  FROM public.user_points up
  WHERE up.user_id = target_user_id;
  
  -- Check each badge condition
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF NOT EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = target_user_id AND badge_id = badge_record.id) THEN
      
      -- Check conditions based on badge type
      CASE badge_record.condition_type
        WHEN 'first_comment' THEN
          IF user_stats.comment_count >= 1 THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'first_experience' THEN
          IF user_stats.experience_count >= 1 THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'likes_received' THEN
          IF user_stats.likes_received >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'total_points' THEN
          IF user_stats.total_points >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'comments_count' THEN
          IF user_stats.comment_count >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'likes_given' THEN
          IF user_stats.likes_given >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'experiences_count' THEN
          IF user_stats.experience_count >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
      END CASE;
    END IF;
  END LOOP;
END;
$function$;

-- Update get_active_users_count function
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO user_count FROM public.profiles;
  RETURN COALESCE(user_count, 0);
END;
$function$;