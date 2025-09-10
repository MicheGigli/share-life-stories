-- Fix security issue: Restrict profiles access to authenticated users only

-- Drop the current overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create new secure policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (true);

-- Keep existing policies for insert/update (they are already secure)
-- Users can insert their own profile: (auth.uid() = user_id) ✅
-- Users can update their own profile: (auth.uid() = user_id) ✅