-- Phase 4: Advanced features database schema

-- E-commerce and affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  product_name TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  price DECIMAL(10,2),
  image_url TEXT,
  platform TEXT NOT NULL DEFAULT 'amazon',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI recommendations table
CREATE TABLE public.ai_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experience_id UUID NOT NULL,
  recommendation_type TEXT NOT NULL, -- 'similar', 'category', 'user_based'
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Analytics tracking
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL, -- 'view', 'click', 'share', 'search'
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Push notifications tokens
CREATE TABLE public.push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL, -- 'web', 'android', 'ios'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Structured reviews system
CREATE TABLE public.structured_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  user_id UUID NOT NULL,
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  criteria_ratings JSONB, -- {"price": 4, "quality": 5, "service": 3}
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Location data for travel experiences
CREATE TABLE public.experience_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  address TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QR codes for sharing
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experience_id UUID NOT NULL,
  qr_code_url TEXT NOT NULL,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User export requests
CREATE TABLE public.export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL, -- 'full', 'experiences', 'comments'
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  file_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.structured_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for affiliate_links
CREATE POLICY "Anyone can view active affiliate links" ON public.affiliate_links
  FOR SELECT USING (is_active = true);

CREATE POLICY "System can manage affiliate links" ON public.affiliate_links
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for ai_recommendations
CREATE POLICY "Users can view their own recommendations" ON public.ai_recommendations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create recommendations" ON public.ai_recommendations
  FOR INSERT WITH CHECK (true);

-- RLS Policies for analytics_events
CREATE POLICY "System can insert analytics events" ON public.analytics_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own analytics" ON public.analytics_events
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for push_tokens
CREATE POLICY "Users can manage their own push tokens" ON public.push_tokens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS Policies for structured_reviews
CREATE POLICY "Anyone can view reviews" ON public.structured_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews" ON public.structured_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON public.structured_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.structured_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for experience_locations
CREATE POLICY "Anyone can view locations" ON public.experience_locations
  FOR SELECT USING (true);

CREATE POLICY "Users can manage locations for their experiences" ON public.experience_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = experience_locations.experience_id 
      AND experiences.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.experiences 
      WHERE experiences.id = experience_locations.experience_id 
      AND experiences.user_id = auth.uid()
    )
  );

-- RLS Policies for qr_codes
CREATE POLICY "Anyone can view QR codes" ON public.qr_codes
  FOR SELECT USING (true);

CREATE POLICY "System can manage QR codes" ON public.qr_codes
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for export_requests
CREATE POLICY "Users can view their own export requests" ON public.export_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create export requests" ON public.export_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_affiliate_links_experience_id ON public.affiliate_links(experience_id);
CREATE INDEX idx_ai_recommendations_user_id ON public.ai_recommendations(user_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_push_tokens_user_id ON public.push_tokens(user_id);
CREATE INDEX idx_structured_reviews_experience_id ON public.structured_reviews(experience_id);
CREATE INDEX idx_experience_locations_experience_id ON public.experience_locations(experience_id);
CREATE INDEX idx_qr_codes_experience_id ON public.qr_codes(experience_id);
CREATE INDEX idx_export_requests_user_id ON public.export_requests(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_affiliate_links_updated_at
  BEFORE UPDATE ON public.affiliate_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_push_tokens_updated_at
  BEFORE UPDATE ON public.push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_structured_reviews_updated_at
  BEFORE UPDATE ON public.structured_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate QR codes
CREATE OR REPLACE FUNCTION public.generate_qr_code(experience_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_url TEXT := 'https://lifeshare.it/experience/';
  qr_service_url TEXT := 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=';
  full_url TEXT;
  qr_url TEXT;
BEGIN
  full_url := base_url || experience_id::text;
  qr_url := qr_service_url || encode(full_url::bytea, 'escape');
  
  INSERT INTO public.qr_codes (experience_id, qr_code_url)
  VALUES (experience_id, qr_url)
  ON CONFLICT (experience_id) DO UPDATE SET qr_code_url = EXCLUDED.qr_code_url;
  
  RETURN qr_url;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;