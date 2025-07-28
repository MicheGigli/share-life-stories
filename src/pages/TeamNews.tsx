import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink, Calendar, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
}

interface NewsItem {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  source_name: string;
  source_url: string;
  published_at: string;
}

const TeamNews = () => {
  const { teamSlug } = useParams<{ teamSlug: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (teamSlug) {
      fetchTeamAndNews();
    }
  }, [teamSlug]);

  const fetchTeamAndNews = async () => {
    if (!teamSlug) return;

    // Fetch team info
    const { data: teamData, error: teamError } = await supabase
      .from('serie_a_teams')
      .select('*')
      .eq('slug', teamSlug)
      .single();

    if (teamError) {
      console.error('Error fetching team:', teamError);
      setLoading(false);
      return;
    }

    setTeam(teamData);

    // Fetch news for this team
    const { data: newsData, error: newsError } = await supabase
      .from('serie_a_news')
      .select('*')
      .eq('team_id', teamData.id)
      .order('published_at', { ascending: false });

    if (newsError) {
      console.error('Error fetching news:', newsError);
      setLoading(false);
      return;
    }

    setNews(newsData || []);
    setLoading(false);
  };

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.excerpt && item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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

  if (!team) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold">Squadra non trovata</h1>
          <Button asChild className="mt-4">
            <Link to="/serie-a">Torna alle squadre</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header squadra */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/serie-a">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle squadre
            </Link>
          </Button>
          
          <div className="text-center">
            <div 
              className="inline-flex items-center gap-4 px-8 py-4 rounded-full text-white mb-6"
              style={{ backgroundColor: team.primary_color }}
            >
              {team.logo_url ? (
                <img 
                  src={team.logo_url} 
                  alt={team.name}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  {team.name.substring(0, 2)}
                </div>
              )}
              <h1 className="text-3xl font-bold">Notizie {team.name}</h1>
            </div>
            <p className="text-muted-foreground">
              Tutte le ultime notizie su {team.name}
            </p>
          </div>
        </div>

        {/* Ricerca */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca nelle notizie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista notizie */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {searchTerm 
                ? `Nessuna notizia trovata per "${searchTerm}"`
                : `Nessuna notizia disponibile per ${team.name}`
              }
            </div>
            <p className="text-sm text-muted-foreground">
              Le notizie vengono aggiornate periodicamente da fonti esterne
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNews.map((newsItem) => (
              <Card key={newsItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl leading-tight">
                    {newsItem.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(newsItem.published_at).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div>
                      Fonte: {newsItem.source_name}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {newsItem.excerpt && (
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {newsItem.excerpt}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <Button variant="outline" asChild>
                      <a 
                        href={newsItem.source_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        Leggi articolo completo
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Disclaimer:</p>
                    <p>
                      Questa sezione riporta notizie provenienti da fonti esterne. 
                      Tutti i diritti e la proprietà intellettuale appartengono ai rispettivi 
                      autori e siti citati.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Statistiche */}
        {filteredNews.length > 0 && (
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Mostrando {filteredNews.length} di {news.length} notizie
            {searchTerm && ` per "${searchTerm}"`}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default TeamNews;