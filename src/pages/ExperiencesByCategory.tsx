import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ExperienceCard } from '@/components/ExperienceCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    nickname: string;
  };
}

const ExperiencesByCategory = () => {
  const { category } = useParams<{ category: string }>();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const categoryLabels: Record<string, string> = {
    'mutui': 'Mutui',
    'vacanze': 'Vacanze',
    'auto': 'Auto',
    'amazon': 'Prodotti Amazon'
  };

  const categoryColors: Record<string, string> = {
    'mutui': 'bg-mutui',
    'vacanze': 'bg-vacanze',
    'auto': 'bg-auto',
    'amazon': 'bg-amazon'
  };

  useEffect(() => {
    if (category) {
      fetchExperiences();
    }
  }, [category, sortBy]);

  const fetchExperiences = async () => {
    if (!category) return;

    setLoading(true);

    let query = supabase
      .from('experiences')
      .select(`
        id,
        title,
        content,
        category,
        tags,
        likes_count,
        comments_count,
        created_at,
        profiles:user_id (nickname)
      `)
      .eq('category', category)
      .eq('is_published', true);

    // Ordinamento
    switch (sortBy) {
      case 'recent':
        query = query.order('created_at', { ascending: false });
        break;
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'discussed':
        query = query.order('comments_count', { ascending: false });
        break;
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching experiences:', error);
      setLoading(false);
      return;
    }

    setExperiences(data || []);
    setLoading(false);
  };

  const filteredExperiences = experiences.filter(experience =>
    experience.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    experience.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    experience.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!category || !categoryLabels[category]) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Categoria non trovata</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header sezione */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${categoryColors[category]} text-white mb-4`}>
            <div className="w-3 h-3 bg-white rounded-full" />
            <h1 className="text-2xl font-bold">{categoryLabels[category]}</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Scopri le esperienze condivise dalla community nella categoria {categoryLabels[category].toLowerCase()}
          </p>
        </div>

        {/* Filtri e ricerca */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca esperienze..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Più recenti</SelectItem>
              <SelectItem value="popular">Più apprezzate</SelectItem>
              <SelectItem value="discussed">Più commentate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista esperienze */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Caricamento esperienze...</div>
          </div>
        ) : filteredExperiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchTerm 
                ? `Nessuna esperienza trovata per "${searchTerm}"`
                : `Nessuna esperienza trovata nella categoria ${categoryLabels[category]}`
              }
            </div>
            <Button onClick={() => window.location.href = '/create'}>
              Condividi la tua esperienza
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredExperiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                title={experience.title}
                author={experience.profiles?.nickname || 'Utente'}
                content={experience.content}
                category={categoryLabels[experience.category]}
                likes={experience.likes_count}
                comments={experience.comments_count}
                date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                tags={experience.tags}
              />
            ))}
          </div>
        )}

        {/* Statistiche */}
        {!loading && filteredExperiences.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Mostrando {filteredExperiences.length} di {experiences.length} esperienze
            {searchTerm && ` per "${searchTerm}"`}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ExperiencesByCategory;