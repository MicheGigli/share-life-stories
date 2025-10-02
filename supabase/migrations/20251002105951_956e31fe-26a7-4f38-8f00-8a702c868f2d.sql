-- Mark all existing users as having completed the welcome tour
-- This ensures existing users never see the onboarding
UPDATE user_onboarding 
SET welcome_tour_completed = true 
WHERE welcome_tour_completed = false;

-- Update the trigger to properly initialize onboarding for NEW users only
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public 
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create onboarding record with welcome tour NOT completed for new users
  INSERT INTO public.user_onboarding (
    user_id, 
    welcome_tour_completed,
    profile_completed,
    first_experience_created,
    first_like_given,
    first_comment_made,
    tutorial_completed
  ) VALUES (
    NEW.id,
    false,  -- New users should see the tour
    false,
    false,
    false,
    false,
    false
  );
  
  RETURN NEW;
END;
$$;