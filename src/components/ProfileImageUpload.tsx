import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';

interface ProfileImageUploadProps {
  currentAvatarUrl?: string | null;
  onImageUpdate: (newUrl: string) => void;
}

export const ProfileImageUpload = ({ currentAvatarUrl, onImageUpdate }: ProfileImageUploadProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File) => {
    if (!user) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        throw updateError;
      }

      onImageUpdate(publicUrl);
      
      toast({
        title: "Immagine caricata",
        description: "La tua immagine del profilo è stata aggiornata",
      });

    } catch (error: any) {
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File troppo grande",
        description: "L'immagine deve essere inferiore a 2MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Formato non valido",
        description: "Seleziona un'immagine valida",
        variant: "destructive",
      });
      return;
    }

    uploadAvatar(file);
  };

  const getInitials = () => {
    if (!user?.user_metadata?.name && !user?.email) return 'U';
    const name = user.user_metadata?.name || user.email?.split('@')[0] || 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={currentAvatarUrl || undefined} />
          <AvatarFallback className="text-lg">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="absolute bottom-0 right-0">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <div className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors">
              <Camera className="h-4 w-4" />
            </div>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="text-center">
        <Button 
          variant="outline" 
          size="sm"
          disabled={uploading}
          onClick={() => document.getElementById('avatar-upload')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Caricamento...' : 'Cambia foto'}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          Formati supportati: JPG, PNG (max 2MB)
        </p>
      </div>
    </div>
  );
};