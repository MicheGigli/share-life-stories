import { CheckCircle, Users, Shield, Sparkles, Home, Plane, Car, ShoppingBag, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Categorie con icone e count placeholder
const categories = [
  { icon: Home, label: "Mutui", desc: "Tassi, banche, surroga", color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", path: "/categoria/mutui" },
  { icon: Plane, label: "Vacanze", desc: "Viaggi, hotel, mete", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", path: "/categoria/vacanze" },
  { icon: Car, label: "Veicoli", desc: "Auto, moto, noleggio", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", path: "/categoria/auto" },
  { icon: ShoppingBag, label: "Prodotti", desc: "Acquisti online, recensioni", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20", path: "/categoria/amazon" },
];

// Testimonianze
const testimonials = [
  {
    stars: 5,
    text: "Ho trovato l'esperienza di un altro utente sul mutuo che mi ha fatto risparmiare settimane di ricerca. Dettagli pratici che non trovi da nessuna parte.",
    name: "Giulia V.",
    location: "Milano · membro da 3 mesi",
    initials: "GV",
    color: "bg-primary/10 text-primary",
  },
  {
    stars: 5,
    text: "Stavo per acquistare un'auto rivelatasi un disastro secondo altri utenti. Il commento di Davide mi ha salvato da un cattivo acquisto.",
    name: "Luca P.",
    location: "Roma · membro da 1 mese",
    initials: "LP",
    color: "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300",
  },
];

const steps = [
  {
    icon: Sparkles,
    title: "Condividi la tua storia",
    text: "Scrivi un titolo chiaro, descrivi cosa hai vissuto e aggiungi #tag per aiutare gli altri a trovarti.",
    by: "Giulia R.",
  },
  {
    icon: Users,
    title: "Trova ciò che ti serve",
    text: "Cerca per parola chiave o filtra per categoria. Ordina per like o commenti per trovare le storie più utili.",
    by: "Davide M.",
  },
  {
    icon: CheckCircle,
    title: "Metti like e commenta",
    text: "Premia i contenuti utili con un like e fai domande nei commenti per ottenere chiarimenti rapidamente.",
    by: "Sara L.",
  },
];

export const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* Categorie */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              Di cosa vuoi leggere?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Scegli una categoria e scopri le esperienze di chi c'è già passato.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.label}
                  onClick={() => navigate('/auth')}
                  className="group rounded-xl border border-border bg-card p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`h-5 w-5 ${cat.color}`} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">{cat.label}</p>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section aria-labelledby="howitworks-title" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 id="howitworks-title" className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              Come funziona LifeShare
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tre passi per iniziare. Nessuna iscrizione a pagamento, nessuna pubblicità invasiva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <article key={idx} className="rounded-xl border border-border bg-card p-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.text}</p>
                  <p className="text-xs text-muted-foreground/70">Esempio a cura di {step.by}</p>
                </article>
              );
            })}
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 max-w-2xl">
            <Shield className="h-4 w-4 flex-shrink-0 text-primary" />
            <p>
              Privacy prima di tutto: i contenuti reali sono visibili solo dopo l'accesso. Gli esempi qui presenti sono generati casualmente.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonianze */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              Chi ha già condiviso
            </h2>
            <p className="text-muted-foreground">Storie vere da membri della community.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-semibold`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-16 px-4">
        <div className="max-w-xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Unisciti alla community italiana
          </h2>
          <p className="text-muted-foreground mb-8">
            Gratis, senza pubblicità invasive. Solo esperienze autentiche da persone reali.
          </p>
          <Button
            variant="hero"
            size="lg"
            className="px-10 py-5 text-base font-semibold"
            onClick={() => (window.location.href = '/auth')}
          >
            Registrati gratis →
          </Button>
        </div>
      </section>
    </div>
  );
};
