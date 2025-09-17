import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_type: string;
  event_data?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await supabase
        .from('analytics_events')
        .insert({
          user_id: user?.id,
          event_type: event.event_type,
          event_data: event.event_data || {}
        });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  };

  const trackPageView = (page: string) => {
    trackEvent({
      event_type: 'page_view',
      event_data: { page }
    });
  };

  const trackExperienceView = (experienceId: string, category: string) => {
    trackEvent({
      event_type: 'experience_view',
      event_data: { experience_id: experienceId, category }
    });
  };

  const trackSearch = (query: string, results_count: number) => {
    trackEvent({
      event_type: 'search',
      event_data: { query, results_count }
    });
  };

  const trackShare = (experienceId: string, platform: string) => {
    trackEvent({
      event_type: 'share',
      event_data: { experience_id: experienceId, platform }
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackExperienceView,
    trackSearch,
    trackShare
  };
};