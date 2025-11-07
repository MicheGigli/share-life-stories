import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExperienceCard } from "./ExperienceCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { InfiniteScroll } from "@/components/ui/infinite-scroll";

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
  author?: string;
}

export const LatestExperiences = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 8;

  useEffect(() => {
    fetchLatestExperiences();
  }, []);

  const getCategoryColor = (category: string) => {
    const colors = {
      mutui: 'bg-mutui text-mutui-foreground border-mutui',
      vacanze: 'bg-vacanze text-vacanze-foreground border-vacanze',
      veicoli: 'bg-auto text-auto-foreground border-auto',
      prodotti: 'bg-amazon text-amazon-foreground border-amazon'
    };
    return colors[category as keyof typeof colors] || 'bg-muted text-muted-foreground border-muted';
  };

  const fetchLatestExperiences = async (pageNum: number = 0) => {
    const from = pageNum * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    const { data, error } = await supabase
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
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching experiences:', error);
      setLoading(false);
      return;
    }

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(exp => exp.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, nickname')
        .in('user_id', userIds);

      const experiencesWithProfiles = data.map(exp => ({
        ...exp,
        author: profiles?.find(p => p.user_id === exp.user_id)?.nickname || 'Utente'
      }));

      setExperiences(prev => pageNum === 0 ? experiencesWithProfiles as any : [...prev, ...(experiencesWithProfiles as any)]);
      setHasMore(data.length === ITEMS_PER_PAGE);
    } else {
      if (pageNum === 0) setExperiences([]);
      setHasMore(false);
    }
    
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchLatestExperiences(nextPage);
  };

  const categoryLabels: Record<string, string> = {
    'mutui': 'Mutui',
    'vacanze': 'Vacanze',
    'auto': 'Veicoli',
    'amazon': 'Prodotti'
  };

  // Fallback experiences if none exist
  const fallbackExperiences = [
    {
      title: "La mia esperienza con il mutuo prima casa",
      author: "Marco Rossi",
      content: "Dopo mesi di ricerche, ho finalmente trovato il mutuo perfetto per la mia prima casa. Vi racconto tutto il processo, dalle prime visite in banca fino alla firma del contratto...",
      category: "Mutui",
      likes: 34,
      comments: 12,
      date: "2 giorni fa",
      tags: ["prima-casa", "tasso-fisso", "surroga"]
    },
    {
      title: "Weekend a Barcellona con 200€",
      author: "Sofia Bianchi",
      content: "Vi spiego come sono riuscita a passare un weekend fantastico a Barcellona spendendo solo 200€ tutto incluso. Trucchi, consigli e luoghi da non perdere...",
      category: "Vacanze",
      likes: 89,
      comments: 23,
      date: "1 giorno fa",
      tags: ["low-cost", "barcellona", "weekend"]
    },
    {
      title: "Recensione onesta: Tesla Model 3 dopo 1 anno",
      author: "Luca Verdi",
      content: "Dopo un anno di utilizzo quotidiano della mia Tesla Model 3, vi racconto pro e contro di questa auto elettrica. Consumi reali, manutenzione e molto altro...",
      category: "Veicoli",
      likes: 156,
      comments: 45,
      date: "3 giorni fa",
      tags: ["tesla", "elettrico", "recensione"]
    },
    {
      title: "5 prodotti Amazon che hanno cambiato la mia vita",
      author: "Anna Neri",
      content: "Vi presento 5 acquisti su Amazon che uso ogni giorno e che consiglio a tutti. Rapporto qualità-prezzo eccezionale e funzionalità sorprendenti...",
      category: "Prodotti",
      likes: 203,
      comments: 67,
      date: "4 giorni fa",
      tags: ["top-5", "consigliati", "qualità-prezzo"]
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ultime <span className="text-primary">esperienze</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Scopri le storie più recenti condivise dalla nostra community
          </p>
        </div>

        {loading && page === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Caricamento esperienze...</div>
          </div>
        ) : (
          <InfiniteScroll
            hasMore={hasMore}
            loading={loading}
            onLoadMore={loadMore}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
              {experiences.length > 0 ? experiences.map((experience) => (
                <ExperienceCard 
                  key={experience.id}
                  id={experience.id}
                  title={experience.title}
                  author={experience.author || 'Utente'}
                  content={experience.content}
                  category={categoryLabels[experience.category] || experience.category}
                  likes={experience.likes_count || 0}
                  comments={experience.comments_count || 0}
                  date={new Date(experience.created_at).toLocaleDateString('it-IT')}
                  tags={experience.tags}
                  imageUrl={experience.image_url}
                  categoryKey={experience.category}
                  userId={experience.user_id}
                />
              )) : fallbackExperiences.map((experience, index) => (
                <ExperienceCard 
                  key={index}
                  id={`fallback-${index}`}
                  title={experience.title}
                  author={experience.author}
                  content={experience.content}
                  category={experience.category}
                  likes={experience.likes}
                  comments={experience.comments}
                  date={experience.date}
                  tags={experience.tags}
                  categoryKey={experience.category.toLowerCase()}
                />
              ))}
            </div>
          </InfiniteScroll>
        )}

        <div className="text-center">
          <Button variant="outline" size="lg" className="group" asChild>
            <Link to="/search">
              Vedi tutte le esperienze
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
