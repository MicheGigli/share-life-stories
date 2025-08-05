-- Create missing triggers for notifications system

-- Trigger for comment mentions
CREATE TRIGGER comment_mentions_trigger
  BEFORE INSERT OR UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_mentions();

-- Trigger for like notifications
CREATE TRIGGER like_notifications_trigger
  AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_like_notifications();

-- Trigger for comment notifications
CREATE TRIGGER comment_notifications_trigger
  AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_comment_notifications();

-- Enable real-time for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;