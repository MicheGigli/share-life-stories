-- FASE 1: Sistema di Ruoli e Sicurezza
-- Aggiungere funzioni security definer e RLS policies per il sistema di ruoli

-- Creare funzione security definer per check admin (evita RLS ricorsivi)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
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
      AND role = 'admin'
  )
$$;

-- Creare funzione security definer per check moderator
CREATE OR REPLACE FUNCTION public.is_moderator(_user_id uuid)
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
      AND (role = 'admin' OR role = 'moderator')
  )
$$;

-- Rimuovere vecchie policies per ricrearle
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Moderators can view all experiences" ON public.experiences;
DROP POLICY IF EXISTS "Admins can delete any experience" ON public.experiences;
DROP POLICY IF EXISTS "Moderators can view all reports" ON public.reports;
DROP POLICY IF EXISTS "Moderators can update reports" ON public.reports;

-- Policy per permettere agli admin di gestire i ruoli di altri utenti
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Policy per permettere ai moderatori di vedere i contenuti
CREATE POLICY "Moderators can view all experiences"
ON public.experiences
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()) OR is_published = true);

-- Policy per permettere agli admin di eliminare qualsiasi contenuto
CREATE POLICY "Admins can delete any experience"
ON public.experiences
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy per permettere ai moderatori di gestire reports
CREATE POLICY "Moderators can view all reports"
ON public.reports
FOR SELECT
TO authenticated
USING (public.is_moderator(auth.uid()) OR auth.uid() = reporter_id);

CREATE POLICY "Moderators can update reports"
ON public.reports
FOR UPDATE
TO authenticated
USING (public.is_moderator(auth.uid()));

-- Indici per performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_experiences_created_at ON public.experiences(created_at DESC);