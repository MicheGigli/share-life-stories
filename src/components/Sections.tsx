import { useState, useEffect } from 'react';
import { SectionCard } from "./SectionCard";
import { Link } from "react-router-dom";
import { supabase } from '@/integrations/supabase/client';
import mutuiIcon from "@/assets/mutui-icon.png";
import vacanzeIcon from "@/assets/vacanze-icon.png";
import autoIcon from "@/assets/auto-icon.png";
import amazonIcon from "@/assets/amazon-icon.png";
interface SectionStats {
  mutui: { posts: number; comments: number };
  vacanze: { posts: number; comments: number };
  auto: { posts: number; comments: number };
  amazon: { posts: number; comments: number };
}

export const Sections = () => {
  const [stats, setStats] = useState<SectionStats>({
    mutui: { posts: 0, comments: 0 },
    vacanze: { posts: 0, comments: 0 },
    auto: { posts: 0, comments: 0 },
    amazon: { posts: 0, comments: 0 }
  });

  useEffect(() => {
    fetchSectionStats();
  }, []);

  const fetchSectionStats = async () => {
    try {
      const { data: experiences, error } = await supabase
        .from('experiences')
        .select('category, comments_count')
        .eq('is_published', true);

      if (error) {
        console.error('Error fetching section stats:', error);
        return;
      }

      const newStats: SectionStats = {
        mutui: { posts: 0, comments: 0 },
        vacanze: { posts: 0, comments: 0 },
        auto: { posts: 0, comments: 0 },
        amazon: { posts: 0, comments: 0 }
      };

      experiences?.forEach(exp => {
        if (exp.category in newStats) {
          newStats[exp.category as keyof SectionStats].posts += 1;
          newStats[exp.category as keyof SectionStats].comments += exp.comments_count || 0;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching section stats:', error);
    }
  };

  const sections = [
    {
      title: "Mutui",
      description: "Condividi la tua esperienza con banche e finanziamenti",
      image: mutuiIcon,
      variant: "mutui" as const,
      stats: stats.mutui
    },
    {
      title: "Vacanze",
      description: "Raccontaci i tuoi viaggi e le tue avventure",
      image: vacanzeIcon,
      variant: "vacanze" as const,
      stats: stats.vacanze
    },
    {
      title: "Veicoli",
      description: "Esperienze di acquisto, noleggio e manutenzione",
      image: autoIcon,
      variant: "auto" as const,
      stats: stats.auto
    },
    {
      title: "Prodotti",
      description: "Recensioni e consigli sui tuoi acquisti online",
      image: amazonIcon,
      variant: "amazon" as const,
      stats: stats.amazon
    }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Esplora le nostre <span className="text-primary">sezioni</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ogni sezione è una community dedicata dove puoi condividere e scoprire esperienze autentiche
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sections.map((section, index) => (
            <Link 
              key={index} 
              to={`/categoria/${section.variant}`}
            >
              <SectionCard {...section} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};