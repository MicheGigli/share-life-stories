import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Recommendation {
  id: string;
  experience_id: string;
  recommendation_type: string;
  confidence_score: number;
  experience: {
    id: string;
    title: string;
    content: string;
    category: string;
    likes_count: number;
    comments_count: number;
    created_at: string;
    tags: string[];
    image_url?: string;
  };
}

export const useAIRecommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecommendations();
    }
  }, [user]);

  const fetchRecommendations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select(`
          id,
          experience_id,
          recommendation_type,
          confidence_score,
          experiences(
            id,
            title,
            content,
            category,
            likes_count,
            comments_count,
            created_at,
            tags,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .gte('confidence_score', 0.6)
        .order('confidence_score', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedRecommendations = (data || []).map(item => ({
        ...item,
        experience: item.experiences
      }));

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!user) return;

    setLoading(true);
    
    try {
      // Get user's interaction history
      const { data: likes } = await supabase
        .from('likes')
        .select('experience_id, experiences!inner(category, tags)')
        .eq('user_id', user.id)
        .limit(50);

      const { data: comments } = await supabase
        .from('comments')
        .select('experience_id, experiences!inner(category, tags)')
        .eq('user_id', user.id)
        .limit(50);

      // Analyze user preferences
      const interactedExperiences = [
        ...(likes || []).map(l => l.experiences),
        ...(comments || []).map(c => c.experiences)
      ];

      const categoryPreferences: Record<string, number> = {};
      const tagPreferences: Record<string, number> = {};

      interactedExperiences.forEach(exp => {
        categoryPreferences[exp.category] = (categoryPreferences[exp.category] || 0) + 1;
        exp.tags?.forEach(tag => {
          tagPreferences[tag] = (tagPreferences[tag] || 0) + 1;
        });
      });

      // Get similar experiences based on preferences
      const topCategories = Object.entries(categoryPreferences)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);

      if (topCategories.length === 0) {
        setLoading(false);
        return;
      }

      const { data: similarExperiences } = await supabase
        .from('experiences')
        .select('id, category, tags, likes_count')
        .in('category', topCategories.length > 0 ? topCategories : ['mutui']) // Fallback
        .neq('user_id', user.id)
        .eq('is_published', true)
        .gte('likes_count', 2)
        .order('likes_count', { ascending: false })
        .limit(20);

      // Create AI recommendations
      const recommendations = (similarExperiences || []).map(exp => {
        let confidence = 0.5;
        
        // Boost confidence based on category match
        if (categoryPreferences[exp.category]) {
          confidence += Math.min(categoryPreferences[exp.category] * 0.1, 0.3);
        }

        // Boost confidence based on tag overlap
        const tagMatches = (exp.tags || []).filter(tag => tagPreferences[tag]).length;
        confidence += Math.min(tagMatches * 0.05, 0.2);

        return {
          user_id: user.id,
          experience_id: exp.id,
          recommendation_type: 'similar',
          confidence_score: Math.min(confidence, 1.0)
        };
      }).filter(rec => rec.confidence_score >= 0.6);

      // Insert recommendations
      if (recommendations.length > 0) {
        await supabase
          .from('ai_recommendations')
          .upsert(recommendations, { onConflict: 'user_id,experience_id' });
      }

      await fetchRecommendations();
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    recommendations,
    loading,
    generateRecommendations,
    refreshRecommendations: fetchRecommendations
  };
};