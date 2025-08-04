import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { PenTool, Tag, X, Upload, Image as ImageIcon } from 'lucide-react';

const CreateExperience = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [moderating, setModerating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
    image: null as File | null
  });
  const [currentTag, setCurrentTag] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const categories = [
    { value: 'mutui', label: 'Mutui', color: 'bg-mutui' },
    { value: 'vacanze', label: 'Vacanze', color: 'bg-vacanze' },
    { value: 'veicoli', label: 'Veicoli', color: 'bg-auto' },
    { value: 'prodotti', label: 'Prodotti', color: 'bg-amazon' }
  ];

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, currentTag.trim()]
      });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File troppo grande",
          description: "L'immagine deve essere massimo 5MB",
          variant: "destructive",
        });
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato non valido",
          description: "Carica solo immagini (JPG, PNG, GIF)",
          variant: "destructive",
        });
        return;
      }

      setFormData({ ...formData, image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
    setImagePreview(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      toast({
        title: "Campi obbligatori",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Moderate content before publishing
    const fullContent = `${formData.title} ${formData.content}`;
    const isContentAppropriate = await moderateContent(fullContent);
    
    if (!isContentAppropriate) {
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = null;
      
      // Upload image if present
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('experience-images')
          .upload(fileName, formData.image);

        if (uploadError) {
          toast({
            title: "Errore caricamento immagine",
            description: "Impossibile caricare l'immagine",
            variant: "destructive",
          });
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('experience-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }

      const { error } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags,
          image_url: imageUrl,
          is_published: true
        });

      if (error) {
        toast({
          title: "Errore",
          description: "Impossibile pubblicare l'esperienza",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Esperienza pubblicata",
        description: "La tua esperienza è stata condivisa con successo!",
      });

      navigate('/profile');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore imprevisto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Condividi la tua esperienza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Titolo */}
              <div>
                <Label htmlFor="title">Titolo *</Label>
                <Input
                  id="title"
                  placeholder="Es: La mia esperienza con il mutuo prima casa"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  maxLength={100}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.title.length}/100 caratteri
                </p>
              </div>

              {/* Categoria */}
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona una categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${category.color}`} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Contenuto */}
              <div>
                <Label htmlFor="content">Racconta la tua esperienza *</Label>
                <Textarea
                  id="content"
                  placeholder="Descrivi in dettaglio la tua esperienza. Cosa hai imparato? Cosa consiglieresti ad altri?"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  maxLength={5000}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.content.length}/5000 caratteri
                </p>
              </div>

              {/* Upload immagine */}
              <div>
                <Label htmlFor="image">Immagine (opzionale)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Anteprima" 
                        className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        className="absolute top-2 right-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Carica un'immagine (max 5MB)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => document.getElementById('image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Seleziona immagine
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Formati supportati: JPG, PNG, GIF (massimo 5MB)
                </p>
              </div>

              {/* Tags */}
              <div>
                <Label htmlFor="tags">Tag (opzionale)</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="tags"
                    placeholder="Aggiungi un tag"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  I tag aiutano gli altri utenti a trovare la tua esperienza
                </p>
              </div>

              {/* Pulsanti */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={isSubmitting || moderating} className="flex-1">
                  {moderating ? 'Verifica contenuto...' : isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica esperienza'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/profile')}
                  disabled={isSubmitting}
                >
                  Annulla
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default CreateExperience;