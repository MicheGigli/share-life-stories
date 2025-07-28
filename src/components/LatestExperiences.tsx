import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExperienceCard } from "./ExperienceCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

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

export const LatestExperiences = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestExperiences();
  }, []);

  const fetchLatestExperiences = async () => {
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
        profiles!inner(nickname)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(4);

    if (error) {
      console.error('Error fetching experiences:', error);
      setLoading(false);
      return;
    }

    setExperiences(data || []);
    setLoading(false);
  };

  const categoryLabels: Record<string, string> = {
    'mutui': 'Mutui',
    'vacanze': 'Vacanze',
    'auto': 'Auto',
    'amazon': 'Amazon'
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
      category: "Auto",
      likes: 156,
      comments: 45,
      date: "3 giorni fa",
      tags: ["tesla", "elettrico", "recensione"]
    },
    {
      title: "5 prodotti Amazon che hanno cambiato la mia vita",
      author: "Anna Neri",
      content: "Vi presento 5 acquisti su Amazon che uso ogni giorno e che consiglio a tutti. Rapporto qualità-prezzo eccezionale e funzionalità sorprendenti...",
      category: "Amazon",
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

        {loading ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground">Caricamento esperienze...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
            {(experiences.length > 0 ? experiences : fallbackExperiences).map((experience, index) => (
              <ExperienceCard 
                key={experience.id || index} 
                title={experience.title}
                author={experience.profiles?.nickname || experience.author || 'Utente'}
                content={experience.content}
                category={categoryLabels[experience.category] || experience.category}
                likes={experience.likes_count || experience.likes || 0}
                comments={experience.comments_count || experience.comments || 0}
                date={experience.created_at ? new Date(experience.created_at).toLocaleDateString('it-IT') : experience.date}
                tags={experience.tags}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button variant="outline" size="lg" className="group" asChild>
            <Link to="/categoria/mutui">
              Vedi tutte le esperienze
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};