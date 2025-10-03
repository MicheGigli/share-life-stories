-- Create the has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  )
$$;

-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Users can view all roles" ON public.user_roles;

-- Allow authenticated users to view only their own role
CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all roles for management purposes
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));