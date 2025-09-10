import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CommunityStats } from "./CommunityStats";
import heroBackground from "@/assets/hero-background.jpg";
import { useEffect, useState } from "react";

export const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center text-center px-4 py-20 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3)), url(${heroBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40"></div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 text-white/20 animate-floating">
        <Sparkles className="h-8 w-8" />
      </div>
      <div className="absolute top-40 right-20 text-white/20 animate-floating animate-delay-300">
        <Heart className="h-6 w-6" />
      </div>
      <div className="absolute bottom-40 left-20 text-white/20 animate-floating animate-delay-500">
        <Users className="h-7 w-7" />
      </div>

      <div className={`max-w-5xl mx-auto text-white relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="animate-fade-in">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight font-display">
            Condividi le tue{" "}
            <span className="text-transparent bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text animate-shimmer bg-[length:200%_100%]">
              esperienze
            </span>
          </h1>
        </div>
        
        <div className="animate-fade-in animate-delay-200">
          <h2 className="text-2xl md:text-4xl lg:text-5xl mb-8 font-light font-serif">
            Aiuta gli altri a scegliere meglio!
          </h2>
        </div>

        <div className="animate-fade-in animate-delay-300">
          <p className="text-xl md:text-2xl lg:text-3xl mb-16 max-w-4xl mx-auto leading-relaxed font-light">
            Unisciti alla community italiana che condivide esperienze reali su mutui, viaggi, auto e prodotti. 
            <br />
            <span className="text-gradient font-medium">Le tue storie possono fare la differenza nella vita di qualcuno.</span>
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 animate-fade-in animate-delay-400">
          <Button 
            variant="hero" 
            size="xl" 
            className="group px-12 py-6 text-xl font-semibold hover:scale-110 transition-all duration-300" 
            onClick={() => navigate('/auth')}
          >
            <Sparkles className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
            Inizia Subito
            <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
          
          <Button 
            variant="glass" 
            size="xl" 
            className="group px-12 py-6 text-xl font-medium hover:scale-105 transition-all duration-300" 
            onClick={() => navigate('/auth')}
          >
            Scopri di più
          </Button>
        </div>

        {/* Enhanced Community Stats */}
        <div className="animate-fade-in animate-delay-500">
          <CommunityStats />
        </div>

        {/* Trust indicators */}
        <div className="mt-12 animate-fade-in animate-delay-600">
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <Users className="h-5 w-5" />
              <span className="text-sm font-medium">Community attiva</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <Heart className="h-5 w-5 text-red-400" />
              <span className="text-sm font-medium">100% gratuito</span>
            </div>
            <div className="flex items-center gap-2 hover:text-white transition-colors duration-300">
              <Sparkles className="h-5 w-5 text-yellow-400" />
              <span className="text-sm font-medium">Esperienze autentiche</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce-gentle">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};