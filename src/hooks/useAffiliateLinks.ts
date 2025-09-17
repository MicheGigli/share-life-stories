import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateLink {
  id: string;
  experience_id: string;
  product_name: string;
  affiliate_url: string;
  price?: number;
  image_url?: string;
  platform: string;
  is_active: boolean;
}

export const useAffiliateLinks = (experienceId?: string) => {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (experienceId) {
      fetchAffiliateLinks();
    }
  }, [experienceId]);

  const fetchAffiliateLinks = async () => {
    if (!experienceId) return;

    try {
      const { data, error } = await supabase
        .from('affiliate_links')
        .select('*')
        .eq('experience_id', experienceId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackAffiliateClick = async (linkId: string) => {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          event_type: 'affiliate_click',
          event_data: { link_id: linkId }
        });
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
    }
  };

  return {
    links,
    loading,
    trackAffiliateClick,
    refreshLinks: fetchAffiliateLinks
  };
};