import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { ExperienceCard } from '@/components/ExperienceCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  image_url?: string | null;
  nickname: string | null;
}

const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    searchExperiences(query);
  }, [query, sortBy, categoryFilter]);

  const searchExperiences = async (searchQuery: string) => {
    if (!searchQuery.trim() && categoryFilter === 'all') {
      setExperiences([]);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await (supabase.rpc as any)('search_experiences', {
        search_query: searchQuery.trim() || null,
        category_filter: categoryFilter !== 'all' ? categoryFilter : null,
        result_limit: 20
      });

      if (error) throw error;

      let results = data || [];

      // Apply client-side sorting if not relevance
      if (sortBy === 'recent') {
        results.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'popular') {
        results.sort((a: any, b: any) => (b.likes_count || 0) - (a.likes_count || 0));
      } else if (sortBy === 'discussed') {
        results.sort((a: any, b: any) => (b.comments_count || 0) - (a.comments_count || 0));
      }

      setExperiences(results);
    } catch (error) {
      console.error('Error searching experiences:', error);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setSearchParams({ q: newQuery });
  };

  const categoryLabels: Record<string, string> = {
    'all': 'Tutte le categorie',
    'mutui': 'Mutui',
    'vacanze': 'Vacanze',
    'auto': 'Auto',
    'amazon': 'Prodotti'
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>

          <h1 className="text-3xl font-bold mb-8 text-center">
            Cerca esperienze
          </h1>

          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Cerca per titolo, contenuto o tag..."
            />
          </div>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Più rilevanti</SelectItem>
                <SelectItem value="recent">Più recenti</SelectItem>
                <SelectItem value="popular">Più apprezzate</SelectItem>
                <SelectItem value="discussed">Più commentate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {query && (
            <div className="mb-6">
              <p className="text-muted-foreground">
                {loading ? 'Ricerca in corso...' : (
                  <>
                    {experiences.length} risultat{experiences.length !== 1 ? 'i' : 'o'} 
                    per <Badge variant="outline">"{query}"</Badge>
                    {categoryFilter !== 'all' && (
                      <> in <Badge variant="secondary">{categoryLabels[categoryFilter]}</Badge></>
                    )}
                  </>
                )}
              </p>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Ricerca in corso...</div>
            </div>
          ) : experiences.length === 0 && query ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                Nessun risultato trovato per "{query}"
              </div>
              <p className="text-sm text-muted-foreground">
                Prova con parole chiave diverse o rimuovi i filtri
              </p>
            </div>
          ) : (
            <>
              {experiences.length > 0 && (
                <AdBanner 
                  position="horizontal" 
                  category={categoryFilter !== 'all' ? categoryFilter : undefined}
                  className="mb-6"
                  dismissible
                />
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {experiences.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    id={experience.id}
                    title={experience.title}
                    author={experience.nickname || 'Utente'}
                    content={experience.content}
                    category={categoryLabels[experience.category] || experience.category}
                    likes={experience.likes_count}
                    comments={experience.comments_count}
                    date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                    tags={experience.tags}
                    imageUrl={experience.image_url}
                    userId={experience.user_id}
                    views={experience.views_count}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Search;
