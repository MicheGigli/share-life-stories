import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ExperienceCard } from '@/components/ExperienceCard';
import { DeleteExperienceButton } from '@/components/DeleteExperienceButton';
import { EditExperienceButton } from '@/components/EditExperienceButton';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProgressSection } from '@/components/gamification/ProgressSection';
import { BadgeCollection } from '@/components/gamification/BadgeCollection';
import { PointsHistory } from '@/components/gamification/PointsHistory';
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { useGameification } from '@/hooks/useGameification';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Bell, Save, Heart, MessageCircle } from 'lucide-react';

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
  image_url?: string | null;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userPoints } = useGameification();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [updating, setUpdating] = useState(false);
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

    setUpdating(true);

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
      setUpdating(false);
      return;
    }

    toast({
      title: "Profilo aggiornato",
      description: "Le modifiche sono state salvate con successo",
    });

    setUpdating(false);
    fetchProfile();
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'mutui': 'Mutui',
      'vacanze': 'Vacanze',
      'auto': 'Auto', 
      'amazon': 'Amazon'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
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
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profilo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center space-y-4">
                  <ProfileImageUpload 
                    currentAvatarUrl={profile?.avatar_url}
                    onImageUpdate={(newUrl) => setProfile(prev => prev ? {...prev, avatar_url: newUrl} : null)}
                  />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg">{profile?.nickname}</h3>
                    <LevelIndicator level={userPoints.current_level} />
                  </div>
                </div>
                
                {/* Profile Form */}
                <div className="md:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nickname">Nickname</Label>
                      <Input
                        id="nickname"
                        value={formData.nickname}
                        onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                        placeholder="Il tuo nickname"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Raccontaci qualcosa di te..."
                      className="min-h-24"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email-notifications"
                      checked={formData.email_notifications}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_notifications: checked }))}
                    />
                    <Label htmlFor="email-notifications" className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Ricevi notifiche via email
                    </Label>
                  </div>

                  <Button onClick={updateProfile} disabled={updating} className="w-full md:w-auto">
                    <Save className="h-4 w-4 mr-2" />
                    {updating ? 'Aggiornamento...' : 'Salva modifiche'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiche */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Le tue statistiche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{experiences.length}</div>
                  <div className="text-sm text-muted-foreground">Esperienze pubblicate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {experiences.reduce((sum, exp) => sum + exp.likes_count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <Heart className="h-4 w-4" />
                    Like ricevuti
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {experiences.reduce((sum, exp) => sum + exp.comments_count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Commenti ricevuti
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sezioni con Tabs */}
          <Tabs defaultValue="experiences" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="experiences">Esperienze</TabsTrigger>
              <TabsTrigger value="progress">Progressi</TabsTrigger>
              <TabsTrigger value="badges">Badge</TabsTrigger>
              <TabsTrigger value="points">Punti</TabsTrigger>
            </TabsList>
            
            <TabsContent value="experiences">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Le mie esperienze</CardTitle>
                    <Button onClick={() => navigate('/create')}>
                      Crea nuova esperienza
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {experiences.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">
                        Non hai ancora pubblicato nessuna esperienza
                      </p>
                      <Button onClick={() => navigate('/create')}>
                        Condividi la tua prima esperienza
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {experiences.map((experience) => (
                        <div key={experience.id} className="relative">
                          <ExperienceCard
                            id={experience.id}
                            title={experience.title}
                            author={profile?.nickname || 'Utente'}
                            content={experience.content}
                            category={getCategoryLabel(experience.category)}
                            likes={experience.likes_count}
                            comments={experience.comments_count}
                            date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                            tags={experience.tags}
                            imageUrl={experience.image_url}
                            userId={user.id}
                          />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <EditExperienceButton 
                              experienceId={experience.id}
                              variant="outline"
                              size="sm"
                            />
                            <DeleteExperienceButton 
                              experienceId={experience.id} 
                              onDeleted={fetchUserExperiences}
                              variant="outline"
                              size="sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="progress">
              <ProgressSection />
            </TabsContent>
            
            <TabsContent value="badges">
              <BadgeCollection />
            </TabsContent>
            
            <TabsContent value="points">
              <PointsHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;