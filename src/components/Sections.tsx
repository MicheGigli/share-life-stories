import { SectionCard } from "./SectionCard";
import { Link } from "react-router-dom";
import mutuiIcon from "@/assets/mutui-icon.png";
import vacanzeIcon from "@/assets/vacanze-icon.png";
import autoIcon from "@/assets/auto-icon.png";
import amazonIcon from "@/assets/amazon-icon.png";
import seriaIcon from "@/assets/seria-icon.png";

export const Sections = () => {
  const sections = [
    {
      title: "Mutui",
      description: "Condividi la tua esperienza con banche e finanziamenti",
      image: mutuiIcon,
      variant: "mutui" as const,
      stats: { posts: 1250, comments: 3400 }
    },
    {
      title: "Vacanze",
      description: "Raccontaci i tuoi viaggi e le tue avventure",
      image: vacanzeIcon,
      variant: "vacanze" as const,
      stats: { posts: 2180, comments: 5670 }
    },
    {
      title: "Auto",
      description: "Esperienze di acquisto, noleggio e manutenzione",
      image: autoIcon,
      variant: "auto" as const,
      stats: { posts: 980, comments: 2340 }
    },
    {
      title: "Prodotti Amazon",
      description: "Recensioni e consigli sui tuoi acquisti online",
      image: amazonIcon,
      variant: "amazon" as const,
      stats: { posts: 3450, comments: 8900 }
    },
    {
      title: "Notizie Serie A",
      description: "Tutte le ultime notizie del calcio italiano",
      image: seriaIcon,
      variant: "seria" as const,
      stats: { posts: 560, comments: 1200 }
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section, index) => (
            <Link 
              key={index} 
              to={section.title === "Notizie Serie A" ? "/serie-a" : `/categoria/${section.variant}`}
            >
              <SectionCard {...section} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};