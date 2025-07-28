import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, ArrowLeft } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  user_id: string;
  image_url?: string | null;
}

const EditExperience = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [moderating, setModerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user && id) {
      fetchExperience();
    }
  }, [user, authLoading, id, navigate]);

  const fetchExperience = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('experiences')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .single();

    if (error) {
      console.error('Error fetching experience:', error);
      toast({
        title: "Errore",
        description: "Esperienza non trovata o non hai i permessi per modificarla",
        variant: "destructive",
      });
      navigate('/');
      return;
    }

    setExperience(data);
    setFormData({
      title: data.title,
      content: data.content,
      category: data.category,
      tags: data.tags || [],
    });
    
    if (data.image_url) {
      setCurrentImages([data.image_url]);
    }
    
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      
      if (!isValidType) {
        toast({
          title: "Formato non supportato",
          description: "Sono supportati solo file JPG, PNG e GIF",
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File troppo grande",
          description: "I file devono essere massimo 5MB",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const moderateContent = async (content: string): Promise<boolean> => {
    try {
      setModerating(true);
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (error) {
        console.error('Error moderating content:', error);
        return true; // Allow content if moderation fails
      }

      if (!data.isAppropriate) {
        toast({
          title: "Contenuto non appropriato",
          description: data.reason || "Il contenuto contiene elementi non permessi",
          variant: "destructive",
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in content moderation:', error);
      return true; // Allow content if moderation fails
    } finally {
      setModerating(false);
    }
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of selectedFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('experience-images')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        continue;
      }

      const { data } = supabase.storage
        .from('experience-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(data.publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !experience) return;

    // Validate form
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Moderate content
    const fullContent = `${formData.title} ${formData.content}`;
    const isContentAppropriate = await moderateContent(fullContent);
    
    if (!isContentAppropriate) {
      setSubmitting(false);
      return;
    }

    try {
      // Upload new images
      const newImageUrls = await uploadImages();
      
      // Combine current images with new ones
      const allImages = [...currentImages, ...newImageUrls];
      const mainImageUrl = allImages.length > 0 ? allImages[0] : null;

      // Update experience
      const { error } = await supabase
        .from('experiences')
        .update({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category as "mutui" | "vacanze" | "auto" | "amazon",
          tags: formData.tags,
          image_url: mainImageUrl
        })
        .eq('id', experience.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Esperienza aggiornata",
        description: "Le modifiche sono state salvate con successo",
      });

      navigate(`/experience/${experience.id}`);
    } catch (error) {
      console.error('Error updating experience:', error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'esperienza",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
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

  if (!experience) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Esperienza non trovata</h1>
          <Button asChild className="mt-4">
            <a href="/">Torna alla home</a>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(`/experience/${experience.id}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Torna all'esperienza
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Modifica Esperienza</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titolo */}
              <div className="space-y-2">
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Inserisci il titolo della tua esperienza"
                  required
                />
              </div>

              {/* Categoria */}
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mutui">Mutui</SelectItem>
                    <SelectItem value="vacanze">Vacanze</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                    <SelectItem value="amazon">Prodotti</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contenuto */}
              <div className="space-y-2">
                <Label htmlFor="content">Racconta la tua esperienza *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Descrivi la tua esperienza in dettaglio..."
                  rows={8}
                  required
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tag</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Aggiungi un tag"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" onClick={addTag} disabled={!newTag.trim()}>
                    Aggiungi
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1">
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Immagini attuali */}
              {currentImages.length > 0 && (
                <div className="space-y-2">
                  <Label>Immagini attuali</Label>
                  <div className="flex flex-wrap gap-2">
                    {currentImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img src={image} alt={`Immagine ${index + 1}`} className="w-20 h-20 object-cover rounded" />
                        <button
                          type="button"
                          onClick={() => removeCurrentImage(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload nuove immagini */}
              <div className="space-y-2">
                <Label htmlFor="images">Aggiungi nuove immagini</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  <input
                    id="images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="images" className="flex flex-col items-center cursor-pointer">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clicca per selezionare le immagini (JPG, PNG, GIF - max 5MB)
                    </span>
                  </label>
                </div>
                
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={submitting || moderating} 
                className="w-full"
              >
                {moderating ? 'Verifica contenuto...' : submitting ? 'Salvataggio...' : 'Salva modifiche'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default EditExperience;