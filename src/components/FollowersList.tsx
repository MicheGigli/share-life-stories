// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FollowerProfile {
  user_id: string;
  nickname: string;
  avatar_url: string | null;
}

export const FollowersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [followers, setFollowers] = useState<FollowerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchFollowers();
  }, [user]);

  const fetchFollowers = async () => {
    if (!user) return;

    try {
      const { data: followData } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (!followData || followData.length === 0) {
        setFollowers([]);
        setLoading(false);
        return;
      }

      const followerIds = followData.map((f: any) => f.follower_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname, avatar_url')
        .in('user_id', followerIds);

      setFollowers(profiles || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4 text-muted-foreground">Caricamento...</div>;
  }

  if (followers.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Nessun follower ancora</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {followers.map((follower) => (
        <Card key={follower.user_id} className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(`/profile/${follower.user_id}`)}>
          <CardContent className="flex items-center gap-3 py-3 px-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={follower.avatar_url || undefined} />
              <AvatarFallback>{follower.nickname?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{follower.nickname}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
