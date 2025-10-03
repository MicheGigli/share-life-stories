-- Fix push_tokens table RLS policies to explicitly restrict SELECT access
-- Drop existing generic policy
DROP POLICY IF EXISTS "Users can manage their own push tokens" ON public.push_tokens;

-- Create explicit SELECT policy restricted to authenticated users and their own tokens
CREATE POLICY "Users can view their own push tokens" 
ON public.push_tokens 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Create explicit INSERT policy
CREATE POLICY "Users can insert their own push tokens" 
ON public.push_tokens 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create explicit UPDATE policy
CREATE POLICY "Users can update their own push tokens" 
ON public.push_tokens 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create explicit DELETE policy
CREATE POLICY "Users can delete their own push tokens" 
ON public.push_tokens 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);