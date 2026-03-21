// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Users, UserMinus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FollowingUser {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
}

export const FollowingList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [following, setFollowing] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFollowing();
    }
  }, [user]);

  const fetchFollowing = async () => {
    if (!user) return;

    try {
      const { data: followData, error: followError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followError) throw followError;

      if (!followData || followData.length === 0) {
        setFollowing([]);
        setLoading(false);
        return;
      }

      const followingIds = followData.map(f => f.following_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url, bio')
        .in('user_id', followingIds);

      if (profilesError) throw profilesError;

      const formattedData = profilesData?.map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
        bio: profile.bio
      })) || [];

      setFollowing(formattedData);
    } catch (error) {
      console.error('Error fetching following:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      toast({
        title: 'Successo',
        description: 'Hai smesso di seguire questo utente',
      });

      fetchFollowing();
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast({
        title: 'Errore',
        description: 'Si è verificato un errore',
        variant: 'destructive',
      });
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

  if (following.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Non stai seguendo nessun utente
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <div className="space-y-4">
          {following.map((followedUser) => (
            <div
              key={followedUser.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div 
                className="flex items-center gap-4 flex-1 cursor-pointer"
                onClick={() => navigate(`/profile/${followedUser.user_id}`)}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={followedUser.avatar_url || undefined} />
                  <AvatarFallback>
                    {followedUser.nickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{followedUser.nickname}</h3>
                  {followedUser.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {followedUser.bio}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnfollow(followedUser.user_id)}
              >
                <UserMinus className="h-4 w-4 mr-2" />
                Smetti di seguire
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
