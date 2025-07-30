import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { CommunityStats } from "./CommunityStats";
import heroBackground from "@/assets/hero-background.jpg";

export const Hero = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
        
        <div className="flex justify-center mb-16">
          <Button variant="hero" size="xl" className="group px-12 py-4 text-xl" onClick={() => navigate('/auth')}>
            Inizia Subito
            <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Statistiche */}
        <CommunityStats />
      </div>
    </section>
  );
};