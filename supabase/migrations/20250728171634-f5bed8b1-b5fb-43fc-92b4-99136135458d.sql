-- Create enum types
CREATE TYPE public.experience_category AS ENUM ('mutui', 'vacanze', 'auto', 'amazon');
CREATE TYPE public.user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE public.notification_type AS ENUM ('like', 'comment', 'mention', 'system');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nickname TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  email_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Create experiences table
CREATE TABLE public.experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category experience_category NOT NULL,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, experience_id),
  UNIQUE(user_id, comment_id),
  CHECK ((experience_id IS NOT NULL AND comment_id IS NULL) OR (experience_id IS NULL AND comment_id IS NOT NULL))
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create serie_a_teams table
CREATE TABLE public.serie_a_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#000000',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create serie_a_news table
CREATE TABLE public.serie_a_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.serie_a_teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  excerpt TEXT,
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create reports table for moderation
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  experience_id UUID REFERENCES public.experiences(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CHECK ((experience_id IS NOT NULL AND comment_id IS NULL) OR (experience_id IS NULL AND comment_id IS NOT NULL))
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serie_a_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.serie_a_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Only admins can manage roles" ON public.user_roles FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for experiences
CREATE POLICY "Anyone can view published experiences" ON public.experiences FOR SELECT USING (is_published = true);
CREATE POLICY "Users can create their own experiences" ON public.experiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own experiences" ON public.experiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own experiences" ON public.experiences FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Anyone can view likes" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage their own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Serie A data (public read)
CREATE POLICY "Anyone can view teams" ON public.serie_a_teams FOR SELECT USING (true);
CREATE POLICY "Anyone can view news" ON public.serie_a_news FOR SELECT USING (true);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Authenticated users can create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Create functions for updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_experiences_updated_at BEFORE UPDATE ON public.experiences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nickname)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update like/comment counts
CREATE OR REPLACE FUNCTION public.update_experience_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.experience_id IS NOT NULL THEN
      UPDATE public.experiences 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.experience_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.experience_id IS NOT NULL THEN
      UPDATE public.experiences 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.experience_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_comment_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.experiences 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.experience_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.experiences 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.experience_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for counts
CREATE TRIGGER update_experience_likes_count AFTER INSERT OR DELETE ON public.likes FOR EACH ROW EXECUTE FUNCTION public.update_experience_counts();
CREATE TRIGGER update_experience_comments_count AFTER INSERT OR DELETE ON public.comments FOR EACH ROW EXECUTE FUNCTION public.update_comment_counts();

-- Insert Serie A teams
INSERT INTO public.serie_a_teams (name, slug, primary_color) VALUES
('Juventus', 'juventus', '#000000'),
('Inter', 'inter', '#0068B5'),
('Milan', 'milan', '#FB090B'),
('Napoli', 'napoli', '#004B9F'),
('Roma', 'roma', '#C8102E'),
('Lazio', 'lazio', '#87CEEB'),
('Atalanta', 'atalanta', '#003399'),
('Fiorentina', 'fiorentina', '#663399'),
('Torino', 'torino', '#8B0000'),
('Bologna', 'bologna', '#0047AB'),
('Sassuolo', 'sassuolo', '#00A86B'),
('Udinese', 'udinese', '#000000'),
('Sampdoria', 'sampdoria', '#0066CC'),
('Cagliari', 'cagliari', '#CC0000'),
('Genoa', 'genoa', '#8B0000'),
('Spezia', 'spezia', '#FFFFFF'),
('Venezia', 'venezia', '#FF8C00'),
('Salernitana', 'salernitana', '#8B0000'),
('Empoli', 'empoli', '#0066CC'),
('Verona', 'verona', '#FFD700');