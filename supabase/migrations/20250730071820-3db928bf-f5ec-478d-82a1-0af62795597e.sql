-- Reset all likes, comments and related counters
DELETE FROM public.likes;
DELETE FROM public.comments;

-- Reset experience counters
UPDATE public.experiences 
SET likes_count = 0, comments_count = 0;

-- Add vehicle categories for the Veicoli section
INSERT INTO public.experiences (id, user_id, category, title, content, is_published, created_at, updated_at)
VALUES 
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Auto', 'Categoria per automobili', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Moto', 'Categoria per motociclette', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Scooter', 'Categoria per scooter', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Camper', 'Categoria per camper', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Bici', 'Categoria per biciclette', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Monopattini', 'Categoria per monopattini', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Furgoni', 'Categoria per furgoni', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Pickup', 'Categoria per pickup', false, now(), now()),
  (gen_random_uuid(), (SELECT id FROM auth.users LIMIT 1), 'auto', 'Categoria Veicoli Elettrici', 'Categoria per veicoli elettrici', false, now(), now())
ON CONFLICT DO NOTHING;

-- Create vehicle_types table for better organization
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

-- Create policy for vehicle types
CREATE POLICY "Anyone can view vehicle types" 
ON public.vehicle_types 
FOR SELECT 
USING (true);

-- Insert vehicle types
INSERT INTO public.vehicle_types (name, description) VALUES
  ('Auto', 'Automobili di tutte le tipologie'),
  ('Moto', 'Motociclette e ciclomotori'),
  ('Scooter', 'Scooter e mezzi simili'),
  ('Camper', 'Camper e veicoli per il camping'),
  ('Bici', 'Biciclette tradizionali ed elettriche'),
  ('Monopattini', 'Monopattini elettrici e tradizionali'),
  ('Furgoni', 'Furgoni e veicoli commerciali'),
  ('Pickup', 'Pickup e veicoli pickup'),
  ('Veicoli Elettrici', 'Tutti i veicoli a propulsione elettrica')
ON CONFLICT (name) DO NOTHING;

-- Add travel_subcategories for enhanced travel section
CREATE TABLE IF NOT EXISTS public.travel_subcategories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'vacanze',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.travel_subcategories ENABLE ROW LEVEL SECURITY;

-- Create policy for travel subcategories
CREATE POLICY "Anyone can view travel subcategories" 
ON public.travel_subcategories 
FOR SELECT 
USING (true);

-- Insert travel subcategories
INSERT INTO public.travel_subcategories (name, description, category) VALUES
  ('Qualità dei trasporti', 'Recensioni su metropolitana, autobus, treni e trasporti pubblici locali', 'vacanze'),
  ('Accessibilità per disabilità', 'Informazioni su barriere architettoniche, ascensori e accessi facilitati', 'vacanze')
ON CONFLICT DO NOTHING;

-- Add mention functionality to comments
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS mentions TEXT[] DEFAULT '{}';

-- Update notifications table for mentions
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS mention_type TEXT;

-- Create function to handle mentions in comments
CREATE OR REPLACE FUNCTION public.handle_comment_mentions()
RETURNS TRIGGER AS $$
DECLARE
  mentioned_user TEXT;
  mentioned_user_id UUID;
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling mentions
CREATE TRIGGER handle_comment_mentions_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_comment_mentions();