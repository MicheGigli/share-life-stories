import { useState } from 'react';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const DataExportButton = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const exportData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch all user data
      const [profileData, experiencesData, commentsData, likesData, bookmarksData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('experiences').select('*').eq('user_id', user.id),
        supabase.from('comments').select('*').eq('user_id', user.id),
        supabase.from('likes').select('*').eq('user_id', user.id),
        supabase.from('bookmarks').select('*').eq('user_id', user.id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        email: user.email,
        profile: profileData.data,
        experiences: experiencesData.data,
        comments: commentsData.data,
        likes: likesData.data,
        bookmarks: bookmarksData.data,
      };

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lifeshare-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Dati esportati con successo!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Errore durante l\'esportazione dei dati');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={exportData}
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Esportazione in corso...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Esporta i miei dati (GDPR)
        </>
      )}
    </Button>
  );
};
