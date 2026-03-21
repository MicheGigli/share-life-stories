// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFollow } from '@/hooks/useFollow';

interface FollowingProfile {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
}

export const FollowingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { unfollowUser } = useFollow();
  const [followingList, setFollowingList] = useState<FollowingProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFollowing();
  }, [user]);

  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data: followData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (!followData || followData.length === 0) {
        setFollowingList([]);
        setLoading(false);
        return;
      }

      const followingIds = followData.map((f: any) => f.following_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', followingIds);

      setFollowingList(profiles || []);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
    setFollowingList(prev => prev.filter(p => p.user_id !== userId));
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Caricamento...</div>;
  }

  if (followingList.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Non segui ancora nessuno</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {followingList.map((profile) => (
        <Card key={profile.user_id} className="hover:shadow-md transition-shadow">
          <CardContent className="flex items-center justify-between py-3 px-4">
            <div className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate(`/profile/${profile.user_id}`)}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback>{profile.nickname?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{profile.nickname}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUnfollow(profile.user_id)}
            >
              <UserMinus className="h-4 w-4 mr-1" />
              Non seguire
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
