-- Check and add only missing foreign key constraints

-- Add foreign key from comments.user_id to auth.users (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_user_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from comments.experience_id to experiences (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'comments_experience_id_fkey' 
        AND table_name = 'comments'
    ) THEN
        ALTER TABLE public.comments
        ADD CONSTRAINT comments_experience_id_fkey 
        FOREIGN KEY (experience_id) 
        REFERENCES public.experiences(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- Add foreign key from experiences.user_id to auth.users (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'experiences_user_id_fkey' 
        AND table_name = 'experiences'
    ) THEN
        ALTER TABLE public.experiences
        ADD CONSTRAINT experiences_user_id_fkey 
        FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE;
    END IF;
END $$;