-- Add admin delete policy for comments
CREATE POLICY "Admins can delete any comment"
ON public.comments
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));