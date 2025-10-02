import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Follower {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
}

export const FollowersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowers();
    }
  }, [user]);

  const fetchFollowers = async () => {
    if (!user) return;

    try {
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followError) throw followError;

      if (!followData || followData.length === 0) {
        setFollowers([]);
        setLoading(false);
        return;
      }

      const followerIds = followData.map(f => f.follower_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url, bio')
        .in('user_id', followerIds);

      if (profilesError) throw profilesError;

      const formattedData = profilesData?.map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
        bio: profile.bio
      })) || [];

      setFollowers(formattedData);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (followers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Non hai ancora follower
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/profile/${follower.user_id}`)}
            >
              <Avatar className="h-12 w-12">
                <AvatarImage src={follower.avatar_url || undefined} />
                <AvatarFallback>
                  {follower.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{follower.nickname}</h3>
                {follower.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {follower.bio}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
