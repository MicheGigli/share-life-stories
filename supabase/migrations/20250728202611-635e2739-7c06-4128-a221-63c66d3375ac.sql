-- Add storage for experience images
INSERT INTO storage.buckets (id, name, public, file_size_limit) 
VALUES ('experience-images', 'experience-images', true, 5242880); -- 5MB limit

-- Create storage policies for experience images
CREATE POLICY "Users can view all experience images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'experience-images');

CREATE POLICY "Authenticated users can upload experience images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'experience-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own experience images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own experience images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'experience-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Remove Serie A related data and tables
DROP TABLE IF EXISTS public.serie_a_news;
DROP TABLE IF EXISTS public.serie_a_teams;

-- Delete Serie A routes and references will be handled in code