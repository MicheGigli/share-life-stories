import { Button } from "@/components/ui/button";
import { Heart, Mail, MessageCircle, Facebook, Twitter, Instagram } from "lucide-react";
import lifeshareLogo from "@/assets/lifeshare-logo.png";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e descrizione */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src={lifeshareLogo} alt="LifeShare" className="h-10 w-10" />
              <div>
                <h3 className="text-2xl font-bold">LifeShare</h3>
                <p className="text-sm opacity-90">La tua esperienza, la nostra community</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              La community italiana per condividere esperienze autentiche su mutui, viaggi, auto e prodotti. 
              Aiutiamo le persone a prendere decisioni migliori grazie alle storie di chi c'è già passato.
            </p>
            <div className="flex space-x-3">
              <Button variant="secondary" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="secondary" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Sezioni */}
          <div>
            <h4 className="font-semibold mb-4">Sezioni</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Mutui</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Vacanze</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Auto</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Prodotti Amazon</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Notizie Serie A</a></li>
            </ul>
          </div>

          {/* Info legali */}
          <div>
            <h4 className="font-semibold mb-4">Informazioni</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Chi siamo</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Termini di servizio</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Contatti</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-primary-foreground/20 mt-12 pt-8">
          <div className="text-center mb-8">
            <h4 className="text-xl font-semibold mb-2">Resta aggiornato</h4>
            <p className="text-primary-foreground/80 mb-4">
              Ricevi il meglio della community ogni settimana (solo se vuoi!)
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="La tua email"
                className="flex-1 px-4 py-2 rounded-md bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary-foreground/50"
              />
              <Button variant="secondary">
                <Mail className="h-4 w-4 mr-2" />
                Iscriviti
              </Button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center text-primary-foreground/60">
          <p>© 2024 LifeShare. Realizzato con <Heart className="h-4 w-4 inline text-red-400" /> per la community italiana.</p>
          <p className="mt-2 text-sm">
            Tutte le notizie sportive sono di proprietà delle rispettive fonti citate.
          </p>
        </div>
      </div>
    </footer>
  );
};