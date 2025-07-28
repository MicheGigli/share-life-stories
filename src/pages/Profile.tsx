import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ExperienceCard } from '@/components/ExperienceCard';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, Settings, Heart, MessageCircle } from 'lucide-react';

interface Profile {
  id: string;
  nickname: string;
  bio: string | null;
  avatar_url: string | null;
  email_notifications: boolean;
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
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nickname: '',
    bio: '',
    email_notifications: true
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      fetchProfile();
      fetchUserExperiences();
    }
  }, [user, loading, navigate]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
      setFormData({
        nickname: data.nickname,
        bio: data.bio || '',
        email_notifications: data.email_notifications
      });
    }
  };

  const fetchUserExperiences = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching experiences:', error);
      return;
    }

    setExperiences(data || []);
  };

  const updateProfile = async () => {
    if (!user || !profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: formData.nickname,
        bio: formData.bio,
        email_notifications: formData.email_notifications
      })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il profilo",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche sono state salvate con successo",
    });

    setIsEditing(false);
    fetchProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Caricamento...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profilo */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Il mio profilo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile?.avatar_url || ''} />
                    <AvatarFallback>
                      {profile?.nickname?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-semibold">{profile?.nickname}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        placeholder="Racconta qualcosa di te..."
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="notifications"
                        checked={formData.email_notifications}
                        onCheckedChange={(checked) => setFormData({ ...formData, email_notifications: checked })}
                      />
                      <Label htmlFor="notifications">Notifiche email</Label>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={updateProfile} size="sm">
                        Salva
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)} 
                        size="sm"
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Bio</p>
                      <p className="text-sm">{profile?.bio || 'Nessuna bio disponibile'}</p>
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Modifica profilo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Statistiche */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Statistiche</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Esperienze pubblicate</span>
                    <span className="font-semibold">{experiences.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      Like ricevuti
                    </span>
                    <span className="font-semibold">
                      {experiences.reduce((sum, exp) => sum + exp.likes_count, 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      Commenti ricevuti
                    </span>
                    <span className="font-semibold">
                      {experiences.reduce((sum, exp) => sum + exp.comments_count, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Esperienze dell'utente */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Le mie esperienze</h2>
              <Button onClick={() => navigate('/create')}>
                Crea nuova esperienza
              </Button>
            </div>

            {experiences.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Non hai ancora pubblicato nessuna esperienza
                  </p>
                  <Button onClick={() => navigate('/create')}>
                    Condividi la tua prima esperienza
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {experiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    title={experience.title}
                    author={profile?.nickname || 'Utente'}
                    content={experience.content}
                    category={experience.category}
                    likes={experience.likes_count}
                    comments={experience.comments_count}
                    date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                    tags={experience.tags}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;