import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Users } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
}

const SerieA = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('serie_a_teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching teams:', error);
      setLoading(false);
      return;
    }

    setTeams(data || []);
    setLoading(false);
  };

  const filteredTeams = teams.filter(team =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white mb-6">
            <Users className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Serie A News</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tutte le ultime notizie delle squadre di Serie A
          </p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Questa sezione riporta notizie provenienti da fonti esterne.</p>
            <p>Tutti i diritti e la proprietà intellettuale appartengono ai rispettivi autori e siti citati.</p>
          </div>
        </div>

        {/* Ricerca */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca una squadra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Griglia squadre */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Caricamento squadre...</div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              Nessuna squadra trovata per "{searchTerm}"
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredTeams.map((team) => (
              <Link key={team.id} to={`/serie-a/${team.slug}`}>
                <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div 
                      className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{ backgroundColor: team.primary_color }}
                    >
                      {team.logo_url ? (
                        <img 
                          src={team.logo_url} 
                          alt={team.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        team.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ultime notizie
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SerieA;