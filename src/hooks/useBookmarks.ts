import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useBookmarks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('experience_id')
        .eq('user_id', user.id);

      if (data) {
        setBookmarks(new Set(data.map(b => b.experience_id)));
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async (experienceId: string) => {
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per salvare esperienze",
        variant: "destructive",
      });
      return false;
    }

    const isBookmarked = bookmarks.has(experienceId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('experience_id', experienceId);

        if (error) throw error;

        setBookmarks(prev => {
          const newSet = new Set(prev);
          newSet.delete(experienceId);
          return newSet;
        });

        toast({
          title: "Rimosso dai salvati",
          description: "L'esperienza è stata rimossa dai salvati",
        });
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            experience_id: experienceId
          });

        if (error) throw error;

        setBookmarks(prev => new Set([...prev, experienceId]));

        toast({
          title: "Salvato",
          description: "L'esperienza è stata salvata",
        });
      }

      return true;
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile modificare i salvati",
        variant: "destructive",
      });
      return false;
    }
  };

  const isBookmarked = (experienceId: string) => {
    return bookmarks.has(experienceId);
  };

  const getBookmarkedExperiences = async () => {
    if (!user) return [];

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select(`
          experience_id,
          created_at
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!data || data.length === 0) return [];

      // Get experience details separately
      const experienceIds = data.map(b => b.experience_id);
      const { data: experiences } = await supabase
        .from('experiences')
        .select(`
          id,
          title,
          content,
          category,
          likes_count,
          comments_count,
          created_at,
          tags,
          image_url,
          user_id
        `)
        .in('id', experienceIds);

      if (!experiences) return [];

      // Get author info
      const userIds = experiences.map(exp => exp.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);

      return experiences.map(exp => ({
        ...exp,
        author: profiles?.find(p => p.user_id === exp.user_id)?.nickname || 'Utente'
      }));
    } catch (error) {
      console.error('Error fetching bookmarked experiences:', error);
      return [];
    }
  };

  return {
    bookmarks,
    loading,
    toggleBookmark,
    isBookmarked,
    getBookmarkedExperiences,
    refresh: fetchBookmarks
  };
};