import { Button } from "@/components/ui/button";
import { User, LogOut, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { NotificationBell } from './NotificationBell';
import { SearchWithPreview } from './SearchWithPreview';
import lifeshareLogo from "@/assets/lifeshare-logo.png";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1 focus:rounded">Salta al contenuto</a>
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

        {/* Navigation menu - only show if user is authenticated */}
        {user && (
          <nav role="navigation" aria-label="Sezioni principali" className="hidden md:flex items-center space-x-6">
            <Link to="/categoria/mutui" className="font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1">
              Mutui
            </Link>
            <Link to="/categoria/vacanze" className="font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1">
              Vacanze
            </Link>
            <Link to="/categoria/auto" className="font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1">
              Veicoli
            </Link>
            <Link to="/categoria/amazon" className="font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1">
              Prodotti
            </Link>
            <Link to="/search" className="font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-1">
              Cerca
            </Link>
          </nav>
        )}

        {/* Barra di ricerca con anteprima - only show if user is authenticated */}
        {user && (
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <SearchWithPreview className="w-full" />
          </div>
        )}

        {/* Pulsanti di azione */}
        <div className="flex items-center space-x-2">
          {user && <NotificationBell />}
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