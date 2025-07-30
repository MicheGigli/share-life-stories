-- Complete Gamification System Migration

-- Create user_points table to track total points
CREATE TABLE public.user_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_points
CREATE POLICY "Users can view all points" ON public.user_points FOR SELECT USING (true);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create point_history table to track point movements
CREATE TABLE public.point_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  description TEXT,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;

-- RLS policies for point_history
CREATE POLICY "Users can view their own point history" ON public.point_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert point history" ON public.point_history FOR INSERT WITH CHECK (true);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER,
  image_url TEXT,
  rarity TEXT DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);

-- Create user_badges table for earned badges
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_badges
CREATE POLICY "Users can view all earned badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can award badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Insert initial badges with proper escaping
INSERT INTO public.badges (name, description, category, condition_type, condition_value, rarity) VALUES
('Prima Parola', 'Hai pubblicato il tuo primo commento', 'attività', 'first_comment', 1, 'common'),
('Critico in Erba', 'Hai scritto la tua prima recensione', 'attività', 'first_experience', 1, 'common'),
('Pioggia di Like', 'Hai ricevuto 50 like totali', 'popolarità', 'likes_received', 50, 'rare'),
('Voce della Community', 'Hai pubblicato 50 commenti', 'interazione', 'comments_count', 50, 'rare'),
('Inarrestabile', 'Hai raggiunto 1000 punti totali', 'fedeltà', 'total_points', 1000, 'epic'),
('Like a chi piace', 'Hai messo 100 like ad altri utenti', 'interazione', 'likes_given', 100, 'rare'),
('Chiacchierone', 'Hai pubblicato 10 commenti', 'interazione', 'comments_count', 10, 'common'),
('Influencer', 'Hai ricevuto 100 like totali', 'popolarità', 'likes_received', 100, 'epic'),
('Veterano', 'Hai raggiunto 2000 punti totali', 'fedeltà', 'total_points', 2000, 'legendary'),
('Esperto', 'Hai pubblicato 10 esperienze', 'attività', 'experiences_count', 10, 'rare'),
('Maestro LifeSharer', 'Hai raggiunto 5000 punti totali', 'fedeltà', 'total_points', 5000, 'legendary'),
('Cuore d''Oro', 'Hai dato 250 like ad altri utenti', 'interazione', 'likes_given', 250, 'epic'),
('Leggenda Vivente', 'Hai raggiunto 10000 punti totali', 'fedeltà', 'total_points', 10000, 'legendary'),
('Narratore', 'Hai pubblicato 5 esperienze', 'attività', 'experiences_count', 5, 'common'),
('Popolare', 'Hai ricevuto 25 like totali', 'popolarità', 'likes_received', 25, 'common'),
('Generoso', 'Hai dato 50 like ad altri utenti', 'interazione', 'likes_given', 50, 'common'),
('Conversatore', 'Hai pubblicato 25 commenti', 'interazione', 'comments_count', 25, 'common');