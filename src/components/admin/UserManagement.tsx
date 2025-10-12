import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Shield, User, Crown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface UserData {
  id: string;
  nickname: string;
  avatar_url: string | null;
  created_at: string;
  role: 'admin' | 'moderator' | 'user';
  level: number;
  points: number;
  experiences_count: number;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, nickname, avatar_url, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (profilesError) throw profilesError;

      // Fetch roles, points, and experience counts
      const userIds = profiles?.map(p => p.user_id) || [];
      
      const [rolesData, pointsData, experiencesData] = await Promise.all([
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
        supabase.from('user_points').select('user_id, current_level, total_points').in('user_id', userIds),
        supabase.from('experiences').select('user_id').in('user_id', userIds)
      ]);

      const rolesMap = new Map(rolesData.data?.map(r => [r.user_id, r.role]) || []);
      const pointsMap = new Map(pointsData.data?.map(p => [p.user_id, { level: p.current_level, points: p.total_points }]) || []);
      
      // Count experiences per user
      const experiencesCount = new Map<string, number>();
      experiencesData.data?.forEach(exp => {
        experiencesCount.set(exp.user_id, (experiencesCount.get(exp.user_id) || 0) + 1);
      });

      const enrichedUsers: UserData[] = profiles?.map(profile => ({
        id: profile.user_id,
        nickname: profile.nickname,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        role: (rolesMap.get(profile.user_id) as 'admin' | 'moderator' | 'user') || 'user',
        level: pointsMap.get(profile.user_id)?.level || 1,
        points: pointsMap.get(profile.user_id)?.points || 0,
        experiences_count: experiencesCount.get(profile.user_id) || 0
      })) || [];

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare gli utenti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole as 'admin' | 'moderator' | 'user' })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Ruolo aggiornato",
        description: "Il ruolo dell'utente è stato modificato con successo"
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare il ruolo",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'moderator': return <Shield className="h-4 w-4 text-blue-500" />;
      default: return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      admin: "destructive",
      moderator: "default",
      user: "secondary"
    };
    return <Badge variant={variants[role] || "secondary"}>{role}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Utenti</CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca utenti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <Avatar>
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback>{user.nickname[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(user.role)}
                    <p className="font-semibold">{user.nickname}</p>
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span>Livello {user.level}</span>
                    <span>{user.points} punti</span>
                    <span>{user.experiences_count} esperienze</span>
                  </div>
                </div>
              </div>

              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user.id, value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nessun utente trovato
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
