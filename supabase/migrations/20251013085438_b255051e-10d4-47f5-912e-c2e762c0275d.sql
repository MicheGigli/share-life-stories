-- Create moderation_logs table for tracking AI moderation
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('experience', 'comment')),
  content_id UUID,
  content TEXT NOT NULL,
  is_appropriate BOOLEAN NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Moderators can view all moderation logs"
  ON public.moderation_logs FOR SELECT
  USING (is_moderator(auth.uid()));

CREATE POLICY "System can insert moderation logs"
  ON public.moderation_logs FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_moderation_logs_user_id ON public.moderation_logs(user_id);
CREATE INDEX idx_moderation_logs_created_at ON public.moderation_logs(created_at DESC);
CREATE INDEX idx_moderation_logs_is_appropriate ON public.moderation_logs(is_appropriate);