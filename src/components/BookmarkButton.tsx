import { Button } from '@/components/ui/button';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarkButtonProps {
  experienceId: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'ghost';
  showText?: boolean;
}

export const BookmarkButton = ({ 
  experienceId, 
  size = 'sm', 
  variant = 'ghost',
  showText = false 
}: BookmarkButtonProps) => {
  const { isBookmarked, toggleBookmark, loading } = useBookmarks();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleBookmark(experienceId);
  };

  const bookmarked = isBookmarked(experienceId);

  if (loading) {
    return (
      <Button size={size} variant={variant} disabled>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleClick}
      className={`flex items-center gap-2 ${
        bookmarked ? 'text-primary' : ''
      }`}
      aria-label={bookmarked ? 'Rimuovi dai salvati' : 'Salva esperienza'}
    >
      {bookmarked ? (
        <BookmarkCheck className="h-4 w-4 fill-current" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="text-xs">
          {bookmarked ? 'Salvato' : 'Salva'}
        </span>
      )}
    </Button>
  );
};