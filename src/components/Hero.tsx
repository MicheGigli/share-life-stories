import { Button } from "@/components/ui/button";
import { ArrowRight, Users, MessageCircle, Heart } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

export const Hero = () => {
  return (
    <section 
      className="relative min-h-screen flex items-center justify-center text-center px-4 py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Condividi le tue <span className="text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">esperienze</span>
        </h1>
        <h2 className="text-2xl md:text-3xl mb-8 font-light">
          Aiuta gli altri a scegliere meglio!
        </h2>
        <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed">
          Unisciti alla community italiana che condivide esperienze reali su mutui, viaggi, auto e prodotti. 
          Le tue storie possono fare la differenza nella vita di qualcuno.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button variant="hero" size="xl" className="group">
            Inizia ora
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="xl" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
            Scopri le esperienze
          </Button>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold">5.000+</h3>
            <p className="text-white/80">Membri attivi</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold">15.000+</h3>
            <p className="text-white/80">Esperienze condivise</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-white/20 p-3 rounded-full mb-3">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold">50.000+</h3>
            <p className="text-white/80">Utenti aiutati</p>
          </div>
        </div>
      </div>
    </section>
  );
};