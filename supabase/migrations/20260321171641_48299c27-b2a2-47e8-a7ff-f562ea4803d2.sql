
-- Drop and recreate increment_experience_views with correct param name
DROP FUNCTION IF EXISTS public.increment_experience_views(uuid);

CREATE FUNCTION public.increment_experience_views(p_experience_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.experiences
  SET views_count = views_count + 1
  WHERE id = p_experience_id;
END;
$$;

-- Recreate search_experiences (may also have param conflicts)
DROP FUNCTION IF EXISTS public.search_experiences(text, text, integer);

CREATE FUNCTION public.search_experiences(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  result_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  category experience_category,
  tags TEXT[],
  likes_count INTEGER,
  comments_count INTEGER,
  views_count INTEGER,
  created_at TIMESTAMPTZ,
  user_id UUID,
  image_url TEXT,
  nickname TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id, e.title, e.content, e.category, e.tags,
    e.likes_count, e.comments_count, e.views_count,
    e.created_at, e.user_id, e.image_url,
    p.nickname
  FROM public.experiences e
  LEFT JOIN public.profiles p ON p.user_id = e.user_id
  WHERE e.is_published = true
    AND (
      search_query IS NULL OR search_query = '' OR
      e.title ILIKE '%' || search_query || '%' OR
      e.content ILIKE '%' || search_query || '%' OR
      search_query = ANY(e.tags)
    )
    AND (
      category_filter IS NULL OR category_filter = '' OR
      e.category::text = category_filter
    )
  ORDER BY
    CASE
      WHEN search_query IS NOT NULL AND search_query != '' AND e.title ILIKE '%' || search_query || '%' THEN 0
      WHEN search_query IS NOT NULL AND search_query != '' AND search_query = ANY(e.tags) THEN 1
      ELSE 2
    END,
    e.likes_count DESC,
    e.created_at DESC
  LIMIT result_limit;
END;
$$;

-- Backfill experiences_count
UPDATE public.profiles p
SET experiences_count = (
  SELECT COUNT(*) FROM public.experiences e WHERE e.user_id = p.user_id
);
