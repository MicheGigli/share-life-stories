import { Button } from "@/components/ui/button";
import { Bell, Search, User, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import lifeshareLogo from "@/assets/lifeshare-logo.png";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo e titolo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
          <img src={lifeshareLogo} alt="LifeShare" className="h-10 w-10" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              LifeShare
            </h1>
            <p className="text-xs text-muted-foreground">La tua esperienza, la nostra community</p>
          </div>
        </Link>

        {/* Barra di ricerca */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cerca esperienze..."
              className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Pulsanti di azione */}
        <div className="flex items-center space-x-2">
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/create')}
                className="hidden md:flex"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea
              </Button>
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/profile')}
              >
                <User className="h-4 w-4 mr-2" />
                Profilo
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={signOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Accedi
              </Button>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => navigate('/auth')}
              >
                Registrati
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};