import { Button } from "@/components/ui/button";
import { Heart, Mail, MessageCircle, Facebook, Twitter, Instagram, ArrowUp } from "lucide-react";
import { Link } from "react-router-dom";
import lifeshareLogo from "@/assets/lifeshare-logo.png";
import { useState, useEffect } from "react";

export const Footer = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-primary via-primary-glow to-primary text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.05),transparent_50%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* Scroll to top button */}
        {showScrollTop && (
          <Button
            variant="glass"
            size="icon"
            className="fixed bottom-8 right-8 z-50 animate-bounce-gentle"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrizione */}
          <div className="md:col-span-2 animate-fade-in">
            <div className="flex items-center space-x-3 mb-6 group">
              <img 
                src={lifeshareLogo} 
                alt="LifeShare" 
                className="h-12 w-12 group-hover:scale-110 transition-transform duration-300" 
              />
              <div>
                <h3 className="text-3xl font-bold font-display">LifeShare</h3>
                <p className="text-sm opacity-90">La tua esperienza, la nostra community</p>
              </div>
            </div>
            <p className="text-primary-foreground/90 mb-8 max-w-md leading-relaxed">
              La community italiana per condividere esperienze autentiche su mutui, viaggi, veicoli e prodotti. 
              Aiutiamo le persone a prendere decisioni migliori grazie alle storie di chi c'è già passato.
            </p>
            <div className="flex space-x-3">
              <Button 
                variant="glass" 
                size="icon" 
                className="hover:scale-110 transition-all duration-300 hover:bg-white/20"
              >
                <Facebook className="h-5 w-5" />
              </Button>
              <Button 
                variant="glass" 
                size="icon" 
                className="hover:scale-110 transition-all duration-300 hover:bg-white/20"
              >
                <Twitter className="h-5 w-5" />
              </Button>
              <Button 
                variant="glass" 
                size="icon" 
                className="hover:scale-110 transition-all duration-300 hover:bg-white/20"
              >
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sezioni */}
          <div className="animate-fade-in animate-delay-200">
            <h4 className="font-semibold mb-6 text-lg font-display">Esplora</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li>
                <Link 
                  to="/categoria/mutui" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Mutui
                </Link>
              </li>
              <li>
                <Link 
                  to="/categoria/vacanze" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Vacanze
                </Link>
              </li>
              <li>
                <Link 
                  to="/categoria/auto" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Veicoli
                </Link>
              </li>
              <li>
                <Link 
                  to="/categoria/amazon" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Prodotti
                </Link>
              </li>
            </ul>
          </div>

          {/* Info legali */}
          <div className="animate-fade-in animate-delay-300">
            <h4 className="font-semibold mb-6 text-lg font-display">Informazioni</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li>
                <Link 
                  to="/privacy" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  to="/terms" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  Termini di servizio
                </Link>
              </li>
              <li>
                <Link 
                  to="/gdpr" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link"
                >
                  GDPR
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:info@lifeshare.it" 
                  className="hover:text-primary-foreground transition-all duration-300 hover:translate-x-1 inline-block story-link flex items-center"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contatti
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Sezione newsletter */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center animate-fade-in animate-delay-400">
          <h4 className="text-xl font-semibold mb-4 font-display">Resta aggiornato</h4>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Ricevi le migliori esperienze della community direttamente nella tua inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="La tua email"
              className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
            />
            <Button variant="glass" className="px-8 hover:bg-white/20">
              Iscriviti
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-primary-foreground/70 animate-fade-in animate-delay-500">
          <p className="flex items-center justify-center gap-2 text-sm">
            © 2024 LifeShare. Realizzato con 
            <Heart className="h-4 w-4 text-red-400 animate-pulse" /> 
            per la community italiana.
          </p>
        </div>
      </div>
    </footer>
  );
};
