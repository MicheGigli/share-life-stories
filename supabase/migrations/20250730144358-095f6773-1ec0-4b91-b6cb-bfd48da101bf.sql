-- Gamification System Tables

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

-- Create function to calculate level from points
CREATE OR REPLACE FUNCTION public.calculate_level_from_points(points INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  level INTEGER := 1;
  required_points INTEGER := 0;
BEGIN
  WHILE required_points <= points LOOP
    level := level + 1;
    required_points := 100 * level * (level - 1);
  END LOOP;
  
  RETURN level - 1;
END;
$$;

-- Create function to calculate points needed for next level
CREATE OR REPLACE FUNCTION public.points_for_next_level(current_level INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN 100 * (current_level + 1) * current_level;
END;
$$;

-- Create function to award points
CREATE OR REPLACE FUNCTION public.award_points(
  target_user_id UUID,
  action_type TEXT,
  points INTEGER,
  description TEXT DEFAULT NULL,
  related_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Insert point history
  INSERT INTO public.point_history (user_id, action_type, points_earned, description, related_id)
  VALUES (target_user_id, action_type, points, description, related_id);
  
  -- Update or insert user points
  INSERT INTO public.user_points (user_id, total_points, current_level)
  VALUES (target_user_id, points, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = user_points.total_points + points,
    updated_at = now();
  
  -- Get new total and calculate level
  SELECT total_points INTO new_total FROM public.user_points WHERE user_id = target_user_id;
  SELECT public.calculate_level_from_points(new_total) INTO new_level;
  
  -- Update level
  UPDATE public.user_points SET current_level = new_level WHERE user_id = target_user_id;
  
  -- Check and award badges
  PERFORM public.check_and_award_badges(target_user_id);
END;
$$;

-- Create function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
BEGIN
  -- Get user statistics
  SELECT 
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.current_level, 1) as current_level,
    COALESCE((SELECT COUNT(*) FROM experiences WHERE user_id = target_user_id), 0) as experience_count,
    COALESCE((SELECT COUNT(*) FROM comments WHERE user_id = target_user_id), 0) as comment_count,
    COALESCE((SELECT COUNT(*) FROM likes WHERE user_id = target_user_id), 0) as likes_given,
    COALESCE((SELECT COUNT(*) FROM likes l JOIN experiences e ON l.experience_id = e.id WHERE e.user_id = target_user_id), 0) as likes_received
  INTO user_stats
  FROM public.user_points up
  WHERE up.user_id = target_user_id;
  
  -- Check each badge condition
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Skip if user already has this badge
    IF NOT EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = target_user_id AND badge_id = badge_record.id) THEN
      
      -- Check conditions based on badge type
      CASE badge_record.condition_type
        WHEN 'first_comment' THEN
          IF user_stats.comment_count >= 1 THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'first_experience' THEN
          IF user_stats.experience_count >= 1 THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'likes_received' THEN
          IF user_stats.likes_received >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'total_points' THEN
          IF user_stats.total_points >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'comments_count' THEN
          IF user_stats.comment_count >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
        WHEN 'likes_given' THEN
          IF user_stats.likes_given >= badge_record.condition_value THEN
            INSERT INTO public.user_badges (user_id, badge_id) VALUES (target_user_id, badge_record.id);
          END IF;
      END CASE;
    END IF;
  END LOOP;
END;
$$;

-- Create triggers to award points automatically
CREATE OR REPLACE FUNCTION public.handle_experience_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 'experience_created', 15, 'Esperienza pubblicata', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_comment_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.award_points(NEW.user_id, 'comment_created', 5, 'Commento pubblicato', NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_like_points()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  experience_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award 1 point to the user who gave the like
    PERFORM public.award_points(NEW.user_id, 'like_given', 1, 'Like dato', NEW.id);
    
    -- Award 3 points to the experience owner who received the like
    IF NEW.experience_id IS NOT NULL THEN
      SELECT user_id INTO experience_owner_id FROM experiences WHERE id = NEW.experience_id;
      IF experience_owner_id IS NOT NULL AND experience_owner_id != NEW.user_id THEN
        PERFORM public.award_points(experience_owner_id, 'like_received', 3, 'Like ricevuto', NEW.id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER experience_points_trigger
  AFTER INSERT ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.handle_experience_points();

CREATE TRIGGER comment_points_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_points();

CREATE TRIGGER like_points_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_points();

-- Insert initial badges
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
('Cuore d\'Oro', 'Hai dato 250 like ad altri utenti', 'interazione', 'likes_given', 250, 'epic'),
('Leggenda Vivente', 'Hai raggiunto 10000 punti totali', 'fedeltà', 'total_points', 10000, 'legendary'),
('Narratore', 'Hai pubblicato 5 esperienze', 'attività', 'experiences_count', 5, 'common'),
('Popolare', 'Hai ricevuto 25 like totali', 'popolarità', 'likes_received', 25, 'common'),
('Generoso', 'Hai dato 50 like ad altri utenti', 'interazione', 'likes_given', 50, 'common'),
('Conversatore', 'Hai pubblicato 25 commenti', 'interazione', 'comments_count', 25, 'common');

-- Create function to get active users count
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT user_id) INTO user_count FROM public.profiles;
  RETURN COALESCE(user_count, 0);
END;
$$;

-- Update triggers to fix comment mentions and email notifications
CREATE OR REPLACE FUNCTION public.handle_comment_mentions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  mentioned_user TEXT;
  mentioned_user_id UUID;
  experience_owner_id UUID;
  experience_owner_profile RECORD;
BEGIN
  -- Extract mentions from comment content (looking for @username pattern)
  IF NEW.content ~ '@[a-zA-Z0-9_]+' THEN
    -- Extract all mentions and store them
    NEW.mentions := regexp_split_to_array(
      regexp_replace(NEW.content, '.*@([a-zA-Z0-9_]+).*', '\1', 'g'), 
      ','
    );
    
    -- Create notifications for each mentioned user
    FOREACH mentioned_user IN ARRAY NEW.mentions
    LOOP
      -- Get user ID from nickname
      SELECT user_id INTO mentioned_user_id 
      FROM public.profiles 
      WHERE nickname = mentioned_user;
      
      IF mentioned_user_id IS NOT NULL AND mentioned_user_id != NEW.user_id THEN
        INSERT INTO public.notifications (
          user_id, 
          type, 
          title, 
          message, 
          related_id,
          mention_type
        ) VALUES (
          mentioned_user_id,
          'mention',
          'Sei stato menzionato in un commento',
          'Un utente ti ha menzionato in un commento',
          NEW.id,
          'comment'
        );
      END IF;
    END LOOP;
  END IF;
  
  -- Notify experience owner about new comment
  SELECT user_id INTO experience_owner_id FROM public.experiences WHERE id = NEW.experience_id;
  
  -- Check if experience owner has email notifications enabled
  IF experience_owner_id IS NOT NULL AND experience_owner_id != NEW.user_id THEN
    SELECT email_notifications INTO experience_owner_profile FROM public.profiles WHERE user_id = experience_owner_id;
    
    -- Create notification
    INSERT INTO public.notifications (
      user_id, 
      type, 
      title, 
      message, 
      related_id
    ) VALUES (
      experience_owner_id,
      'comment',
      'Nuovo commento sulla tua esperienza',
      'Qualcuno ha commentato la tua esperienza',
      NEW.experience_id
    );
    
    -- Send email if notifications are enabled
    IF experience_owner_profile.email_notifications = true THEN
      -- Here we would trigger an email notification
      -- This will be handled by an edge function
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update updated_at trigger for user_points
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON public.user_points
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();