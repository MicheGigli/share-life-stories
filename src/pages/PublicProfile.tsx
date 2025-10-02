import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ExperienceCard } from '@/components/ExperienceCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FollowButton } from '@/components/FollowButton';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { User, ArrowLeft, BookOpen, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Profile {
  user_id: string;
  nickname: string;
  bio: string | null;
  avatar_url: string | null;
}

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  image_url?: string | null;
}

interface UserPoints {
  total_points: number;
  current_level: number;
}

const PublicProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    if (userId) {
      // Redirect to own profile if viewing own user ID
      if (currentUser && userId === currentUser.id) {
        navigate('/profile');
        return;
      }
      fetchPublicProfile();
      fetchUserExperiences();
      fetchUserPoints();
      fetchFollowCounts();
    }
  }, [userId, currentUser]);

  const fetchPublicProfile = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, nickname, bio, avatar_url')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
      return;
    }

    setProfile(data);
    setLoading(false);
  };

  const fetchUserExperiences = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', userId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiences:', error);
      return;
    }

    setExperiences(data || []);
  };

  const fetchUserPoints = async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('user_points')
      .select('total_points, current_level')
      .eq('user_id', userId)
      .single();

    if (data) {
      setUserPoints(data);
    }
  };

  const fetchFollowCounts = async () => {
    if (!userId) return;

    const { count: followersCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    const { count: followingCount } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    setFollowersCount(followersCount || 0);
    setFollowingCount(followingCount || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="py-8 text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Profilo non trovato</h2>
              <p className="text-muted-foreground mb-4">
                L'utente che stai cercando non esiste.
              </p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Torna alla home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <Avatar className="h-24 w-24">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">
                  {profile.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.nickname}</h1>
                    {userPoints && (
                      <div className="flex items-center gap-4 mt-2">
                    <LevelIndicator level={userPoints.current_level} />
                      </div>
                    )}
                  </div>
                  {currentUser && (
                    <FollowButton userId={profile.user_id} />
                  )}
                </div>

                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}

                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{experiences.length}</div>
                    <div className="text-sm text-muted-foreground">Esperienze</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{followersCount}</div>
                    <div className="text-sm text-muted-foreground">Follower</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{followingCount}</div>
                    <div className="text-sm text-muted-foreground">Seguiti</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="experiences" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="experiences">
              <BookOpen className="h-4 w-4 mr-2" />
              Esperienze Pubblicate ({experiences.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="experiences" className="space-y-4">
            {experiences.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Questo utente non ha ancora pubblicato esperienze.
                  </p>
                </CardContent>
              </Card>
            ) : (
              experiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  id={experience.id}
                  title={experience.title}
                  author={profile.nickname}
                  content={experience.content}
                  category={experience.category}
                  likes={experience.likes_count}
                  comments={experience.comments_count}
                  date={formatDate(experience.created_at)}
                  tags={experience.tags}
                  imageUrl={experience.image_url}
                  userId={profile.user_id}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </>
  );
};

export default PublicProfile;
