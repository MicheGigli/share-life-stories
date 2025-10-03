-- Create user_preferences table for private user settings
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view their own preferences
CREATE POLICY "Users can view their own preferences"
ON public.user_preferences
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert their own preferences"
ON public.user_preferences
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update their own preferences"
ON public.user_preferences
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Migrate existing email_notifications data to new table
INSERT INTO public.user_preferences (user_id, email_notifications)
SELECT user_id, COALESCE(email_notifications, true)
FROM public.profiles
ON CONFLICT (user_id) DO NOTHING;

-- Remove email_notifications column from profiles (making it truly public)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email_notifications;

-- Update the handle_new_user function to create preferences record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Create user preferences
  INSERT INTO public.user_preferences (user_id, email_notifications)
  VALUES (NEW.id, true);
  
  -- Create onboarding record
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
    false,
    false,
    false,
    false,
    false,
    false
  );
  
  RETURN NEW;
END;
$$;

-- Add trigger for updated_at on user_preferences
CREATE TRIGGER update_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();