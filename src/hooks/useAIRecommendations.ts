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
    category: 'mutui' | 'vacanze' | 'auto' | 'amazon';
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
      // Get recommendations with proper join
      const { data: recData, error: recError } = await supabase
        .from('ai_recommendations')
        .select('id, experience_id, recommendation_type, confidence_score')
        .eq('user_id', user.id)
        .gte('confidence_score', 0.6)
        .order('confidence_score', { ascending: false })
        .limit(10);

      if (recError) throw recError;

      if (!recData || recData.length === 0) {
        setRecommendations([]);
        setLoading(false);
        return;
      }

      // Get experiences separately
      const experienceIds = recData.map(r => r.experience_id);
      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('id, title, content, category, likes_count, comments_count, created_at, tags, image_url')
        .in('id', experienceIds);

      if (expError) throw expError;

      // Combine data
      const formattedRecommendations: Recommendation[] = [];
      for (const rec of recData) {
        const exp = expData?.find(e => e.id === rec.experience_id);
        if (exp) {
          formattedRecommendations.push({
            id: rec.id,
            experience_id: rec.experience_id,
            recommendation_type: rec.recommendation_type,
            confidence_score: rec.confidence_score,
            experience: {
              id: exp.id,
              title: exp.title,
              content: exp.content,
              category: exp.category,
              likes_count: exp.likes_count,
              comments_count: exp.comments_count,
              created_at: exp.created_at,
              tags: exp.tags,
              image_url: exp.image_url || undefined
            }
          });
        }
      }

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setRecommendations([]);
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

      // Valid categories type
      type ValidCategory = 'mutui' | 'vacanze' | 'auto' | 'amazon';
      const validCategories: ValidCategory[] = topCategories.filter(
        (cat): cat is ValidCategory => ['mutui', 'vacanze', 'auto', 'amazon'].includes(cat)
      );

      const { data: similarExperiences } = await supabase
        .from('experiences')
        .select('id, category, tags, likes_count')
        .in('category', validCategories.length > 0 ? validCategories : ['mutui'])
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