-- Fix reactions table RLS policy to require authentication
DROP POLICY IF EXISTS "Anyone can view reactions" ON public.reactions;

CREATE POLICY "Authenticated users can view reactions" 
ON public.reactions 
FOR SELECT 
TO authenticated
USING (true);

-- Fix comments table RLS policy to require authentication
DROP POLICY IF EXISTS "Authenticated users can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments" 
ON public.comments 
FOR SELECT 
TO authenticated
USING (true);