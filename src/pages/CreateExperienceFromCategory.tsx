import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { X, Upload, ArrowLeft } from 'lucide-react';

const CreateExperienceFromCategory = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: category || '',
    tags: [] as string[],
    images: [] as File[]
  });
  const [currentTag, setCurrentTag] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (category) {
      setFormData(prev => ({ ...prev, category }));
    }
  }, [user, category, navigate]);

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim().toLowerCase()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files].slice(0, 5) // Limit to 5 images
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const uploadImages = async (): Promise<string[]> => {
    const imageUrls: string[] = [];
    
    for (const image of formData.images) {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('experience-images')
        .upload(fileName, image);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('experience-images')
        .getPublicUrl(fileName);
      
      imageUrls.push(publicUrl);
    }
    
    return imageUrls;
  };

  const moderateContent = async (content: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: { content }
      });

      if (error) {
        console.error('Moderation error:', error);
        return true; // Allow content if moderation fails
      }

      return data.approved;
    } catch (error) {
      console.error('Moderation error:', error);
      return true; // Allow content if moderation fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Errore",
        description: "Devi essere autenticato per creare un'esperienza",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Moderate content
      const fullContent = `${formData.title} ${formData.content}`;
      const isApproved = await moderateContent(fullContent);
      
      if (!isApproved) {
        toast({
          title: "Contenuto non approvato",
          description: "Il contenuto contiene elementi non appropriati. Modifica il testo e riprova.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Upload images
      const imageUrls = await uploadImages();

      // Create experience
      const { error } = await supabase
        .from('experiences')
        .insert({
          title: formData.title,
          content: formData.content,
          category: formData.category as 'mutui' | 'vacanze' | 'auto' | 'amazon',
          tags: formData.tags,
          image_url: imageUrls.length > 0 ? imageUrls[0] : null,
          user_id: user.id,
          is_published: true
        });

      if (error) {
        toast({
          title: "Errore",
          description: "Errore durante la creazione dell'esperienza",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Esperienza creata",
        description: "La tua esperienza è stata pubblicata con successo!",
      });

      navigate(`/categoria/${category}`);
    } catch (error) {
      console.error('Error creating experience:', error);
      toast({
        title: "Errore",
        description: "Errore durante la creazione dell'esperienza",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const getCategoryLabel = (cat: string) => {
    const labels: { [key: string]: string } = {
      'mutui': 'Mutui',
      'vacanze': 'Vacanze', 
      'auto': 'Auto',
      'amazon': 'Amazon'
    };
    return labels[cat] || cat;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Indietro
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Crea nuova esperienza - {getCategoryLabel(category || '')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Titolo della tua esperienza"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenuto</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Racconta la tua esperienza in dettaglio..."
                  className="min-h-32"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <div className="p-2 border rounded-md bg-muted">
                  <Badge variant="secondary">{getCategoryLabel(category || '')}</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tag (premi Invio per aggiungere)</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Aggiungi tag..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Immagini (max 5)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <label htmlFor="images" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Clicca per caricare immagini
                        </span>
                        <input
                          id="images"
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/categoria/${category}`)}
                  className="flex-1"
                >
                  Annulla
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Pubblicazione...' : 'Pubblica Esperienza'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateExperienceFromCategory;