import { CheckCircle, Users, Shield, Sparkles } from "lucide-react";

export const HowItWorks = () => {
  const demoItems = [
    {
      name: "Giulia R.",
      title: "Come condividere un'esperienza",
      text:
        "Scrivi un titolo chiaro, descrivi cosa ti è piaciuto o meno e aggiungi #tag per aiutare gli altri a trovarti.",
    },
    {
      name: "Davide M.",
      title: "Come trovare ciò che ti serve",
      text:
        "Cerca per parola chiave oppure filtra per categoria (mutui, vacanze, veicoli, prodotti) e ordina per like o commenti.",
    },
    {
      name: "Sara L.",
      title: "Metti like e commenta",
      text:
        "Premia i contenuti utili con un like e fai domande nei commenti per ottenere chiarimenti rapidamente.",
    },
  ];

  return (
    <section aria-labelledby="howitworks-title" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h2 id="howitworks-title" className="text-3xl md:text-4xl font-bold mb-3">
            Come funziona LifeShare
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Scopri in poche mosse come creare, cercare e interagire con le esperienze.
            I contenuti qui sotto sono di esempio e non rappresentano dati reali.
          </p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoItems.map((item, idx) => (
            <article key={idx} className="rounded-lg border bg-card text-card-foreground p-6">
              <div className="flex items-center gap-2 mb-3 text-primary">
                {idx === 0 && <Sparkles className="h-5 w-5" />} 
                {idx === 1 && <Users className="h-5 w-5" />} 
                {idx === 2 && <CheckCircle className="h-5 w-5" />} 
                <h3 className="font-semibold text-lg">{item.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{item.text}</p>
              <div className="text-xs opacity-80">Esempio a cura di {item.name}</div>
            </article>
          ))}
        </main>

        <aside className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <p>
            Privacy prima di tutto: i contenuti reali sono visibili solo dopo l’accesso. Gli esempi qui presenti sono
            generati casualmente.
          </p>
        </aside>
      </div>
    </section>
  );
};
