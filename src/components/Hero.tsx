import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Heart, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

// Mini mockup delle experience card per la preview
const MockupPreview = () => (
  <div className="relative">
    {/* Browser chrome */}
    <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/60 border-b border-border">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
          <span className="w-3 h-3 rounded-full bg-green-400/80" />
        </div>
        <div className="flex-1 mx-4 bg-background rounded-md px-3 py-1 text-xs text-muted-foreground border border-border">
          lifeshare.it
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 bg-background">
        {/* Search bar */}
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-xs text-muted-foreground border border-border">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          Cerca esperienze su mutui, vacanze, auto...
        </div>

        {/* Card 1 */}
        <div className="rounded-lg border border-border p-3 bg-card hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">MR</div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">Marco R.</p>
                <p className="text-[10px] text-muted-foreground">2 giorni fa</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium">Mutui</span>
          </div>
          <p className="text-[11px] font-medium text-foreground mb-1">Mutuo prima casa con BancaXY: tasso 3.2%</p>
          <p className="text-[10px] text-muted-foreground line-clamp-2">Approvato in 3 settimane. Consiglio di preparare tutti i documenti in anticipo…</p>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              12
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              5
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-lg border border-border p-3 bg-card hover:shadow-sm transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-300">SL</div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">Sara L.</p>
                <p className="text-[10px] text-muted-foreground">5 giorni fa</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium">Vacanze</span>
          </div>
          <p className="text-[11px] font-medium text-foreground mb-1">Sardegna a settembre: metà prezzo, spiagge libere</p>
          <p className="text-[10px] text-muted-foreground line-clamp-2">Evitato agosto: costi dimezzati e spiagge deserte. Vi racconto tutti i dettagli…</p>
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              8
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              3
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Floating badge */}
    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-lg animate-bounce-gentle">
      ✓ 100% gratuito
    </div>
  </div>
);

export const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center px-4 py-24 overflow-hidden bg-background">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left: copy */}
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Community italiana attiva
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground mb-6">
              Condividi le tue{" "}
              <span className="text-primary">esperienze reali</span>{" "}
              con chi ne ha bisogno
            </h1>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
              Mutui, viaggi, auto, prodotti: aiuta altri italiani a scegliere meglio grazie alla tua storia vera. La community che mette le persone prima della pubblicità.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                variant="hero"
                size="lg"
                className="group px-8 py-5 text-base font-semibold"
                onClick={() => navigate('/auth')}
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                Inizia subito
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8 py-5 text-base font-medium"
                onClick={() => navigate('/auth')}
              >
                Scopri di più
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span>Community attiva</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-400" />
                <span>100% gratuito</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>Privacy prima di tutto</span>
              </div>
            </div>
          </div>

          {/* Right: mockup */}
          <div className={`transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <MockupPreview />
          </div>
        </div>


      </div>
    </section>
  );
};
