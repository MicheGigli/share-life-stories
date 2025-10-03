import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SearchBar } from '@/components/SearchBar';
import { ExperienceCard } from '@/components/ExperienceCard';
import { AdBanner } from '@/components/ads/AdBanner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_id: string;
  image_url?: string | null;
}

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const query = searchParams.get('q') || '';

  useEffect(() => {
    searchExperiences(query);
  }, [query, sortBy, categoryFilter]);

  const searchExperiences = async (searchQuery: string) => {
    setLoading(true);

    let supabaseQuery = supabase
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
        user_id,
        image_url
      `)
      .eq('is_published', true);

    // Apply text search only if query present; otherwise allow filtering by category alone
    if (searchQuery && searchQuery.trim().length > 0) {
      supabaseQuery = supabaseQuery.or(
        `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`
      );
    } else {
      // If no query and no category selected, avoid fetching everything
      if (categoryFilter === 'all') {
        setExperiences([]);
        setLoading(false);
        return;
      }
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      supabaseQuery = supabaseQuery.eq('category', categoryFilter as any);
    }

    // Apply sorting
    switch (sortBy) {
      case 'recent':
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        break;
      case 'popular':
        supabaseQuery = supabaseQuery.order('likes_count', { ascending: false });
        break;
      case 'discussed':
        supabaseQuery = supabaseQuery.order('comments_count', { ascending: false });
        break;
    }

    const { data, error } = await supabaseQuery;

    if (error) {
      console.error('Error searching experiences:', error);
      setLoading(false);
      return;
    }

    setExperiences(data || []);
    setLoading(false);
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
          <h1 className="text-3xl font-bold mb-8 text-center">
            Cerca esperienze
          </h1>

          {/* Search bar */}
          <div className="mb-8">
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Cerca per titolo, contenuto o tag..."
            />
          </div>

          {/* Filters */}
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
                <SelectItem value="recent">Più recenti</SelectItem>
                <SelectItem value="popular">Più apprezzate</SelectItem>
                <SelectItem value="discussed">Più commentate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search results */}
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

          {/* Results grid */}
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
              {/* Ad banner prima dei risultati se ci sono risultati */}
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
                    author="Utente"
                    content={experience.content}
                    category={categoryLabels[experience.category] || experience.category}
                    likes={experience.likes_count}
                    comments={experience.comments_count}
                    date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                    tags={experience.tags}
                    imageUrl={experience.image_url}
                    userId={experience.user_id}
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