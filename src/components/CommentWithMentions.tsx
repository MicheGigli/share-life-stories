import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  nickname: string;
}

interface CommentWithMentionsProps {
  experienceId: string;
  onCommentAdded: () => void;
}

export const CommentWithMentions = ({ experienceId, onCommentAdded }: CommentWithMentionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<Profile[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionStart, setMentionStart] = useState(0);

  const handleCommentChange = async (value: string) => {
    setComment(value);
    
    // Check for @ mentions
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const searchTerm = value.substring(lastAtIndex + 1);
      const spaceAfterAt = searchTerm.indexOf(' ');
      
      if (spaceAfterAt === -1 && searchTerm.length > 0) {
        // Show suggestions
        setMentionStart(lastAtIndex);
        await fetchUserSuggestions(searchTerm);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const fetchUserSuggestions = async (searchTerm: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('nickname')
        .ilike('nickname', `%${searchTerm}%`)
        .limit(5);

      if (error) {
        console.error('Error fetching user suggestions:', error);
        return;
      }

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
    }
  };

  const handleSuggestionClick = (nickname: string) => {
    const beforeMention = comment.substring(0, mentionStart);
    const afterMention = comment.substring(comment.indexOf(' ', mentionStart) !== -1 ? comment.indexOf(' ', mentionStart) : comment.length);
    const newComment = `${beforeMention}@${nickname} ${afterMention}`;
    setComment(newComment);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          experience_id: experienceId,
          user_id: user.id,
          content: comment.trim()
        });

      if (error) throw error;

      setComment('');
      onCommentAdded();
      
      toast({
        title: "Commento aggiunto",
        description: "Il tuo commento è stato pubblicato con successo.",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'aggiungere il commento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="Scrivi un commento... (usa @username per menzionare utenti)"
            className="min-h-[100px]"
          />
          
          {/* Mention suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
              {suggestions.map((profile) => (
                <button
                  key={profile.nickname}
                  type="button"
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                  onClick={() => handleSuggestionClick(profile.nickname)}
                >
                  @{profile.nickname}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <Button type="submit" disabled={isSubmitting || !comment.trim()}>
          {isSubmitting ? 'Pubblicando...' : 'Pubblica commento'}
        </Button>
      </form>
    </div>
  );
};