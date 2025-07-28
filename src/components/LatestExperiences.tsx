import { ExperienceCard } from "./ExperienceCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const LatestExperiences = () => {
  const experiences = [
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {experiences.map((experience, index) => (
            <ExperienceCard key={index} {...experience} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg" className="group">
            Vedi tutte le esperienze
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};