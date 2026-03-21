// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingTopic {
  id: string;
  topic: string;
  category?: string;
  usage_count: number;
  last_used: string;
}

export const useTrending = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingTopics();
  }, []);

  const fetchTrendingTopics = async () => {
    try {
      const { data } = await supabase
        .from('trending_topics')
        .select('*')
        .order('usage_count', { ascending: false })
        .order('last_used', { ascending: false })
        .limit(10);

      if (data) {
        setTopics(data);
      }
    } catch (error) {
      console.error('Error fetching trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTopic = async (topic: string, category?: string) => {
    try {
      // Check if topic exists
      const { data: existing } = await supabase
        .from('trending_topics')
        .select('*')
        .eq('topic', topic.toLowerCase())
        .single();

      if (existing) {
        // Update existing topic
        await supabase
          .from('trending_topics')
          .update({
            usage_count: existing.usage_count + 1,
            last_used: new Date().toISOString()
          })
          .eq('id', existing.id);
      } else {
        // Create new topic
        await supabase
          .from('trending_topics')
          .insert({
            topic: topic.toLowerCase(),
            category: category,
            usage_count: 1,
            last_used: new Date().toISOString()
          });
      }

      // Refresh trending topics
      await fetchTrendingTopics();
    } catch (error) {
      console.error('Error updating trending topic:', error);
    }
  };

  const getTrendingByCategory = (category: string) => {
    return topics.filter(topic => topic.category === category);
  };

  const getTopTrending = (limit: number = 5) => {
    return topics.slice(0, limit);
  };

  return {
    topics,
    loading,
    updateTopic,
    getTrendingByCategory,
    getTopTrending,
    refresh: fetchTrendingTopics
  };
};