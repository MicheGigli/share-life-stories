import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline' | 'ghost';
  showCount?: boolean;
}

export const FollowButton = ({ 
  userId, 
  size = 'sm', 
  variant = 'outline',
  showCount = false 
}: FollowButtonProps) => {
  const { isFollowing, followUser, unfollowUser, getFollowerCount, loading } = useFollow();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFollowing(userId)) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  const following = isFollowing(userId);
  const followerCount = getFollowerCount(userId);

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
      variant={following ? 'default' : variant}
      onClick={handleClick}
      className="flex items-center gap-2"
    >
      {following ? (
        <>
          <UserMinus className="h-4 w-4" />
          Non seguire
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Segui
        </>
      )}
      {showCount && followerCount > 0 && (
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
          {followerCount}
        </span>
      )}
    </Button>
  );
};