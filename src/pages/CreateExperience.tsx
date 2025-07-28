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
import { PenTool, Tag, X } from 'lucide-react';

const CreateExperience = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[]
  });
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const categories = [
    { value: 'mutui', label: 'Mutui', color: 'bg-mutui' },
    { value: 'vacanze', label: 'Vacanze', color: 'bg-vacanze' },
    { value: 'auto', label: 'Auto', color: 'bg-auto' },
    { value: 'amazon', label: 'Prodotti Amazon', color: 'bg-amazon' }
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

    try {
      const { error } = await supabase
        .from('experiences')
        .insert({
          user_id: user.id,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category as 'mutui' | 'vacanze' | 'auto' | 'amazon',
          tags: formData.tags,
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
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Pubblicazione in corso...' : 'Pubblica esperienza'}
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