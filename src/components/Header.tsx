import { Button } from "@/components/ui/button";
import { User, LogOut, Plus, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { NotificationBell } from './NotificationBell';
import { SearchWithPreview } from './SearchWithPreview';
import lifeshareLogo from "@/assets/lifeshare-logo.png";
import { useState } from "react";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-card animate-fade-in">
      <div className="container flex h-16 items-center justify-between px-4 max-w-7xl mx-auto">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-primary focus:text-primary-foreground focus:px-3 focus:py-1 focus:rounded">Salta al contenuto</a>
        
        {/* Logo e titolo */}
        <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-300 hover:scale-105 group">
          <img src={lifeshareLogo} alt="LifeShare" className="h-10 w-10 group-hover:rotate-12 transition-transform duration-300" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent font-display">
              LifeShare
            </h1>
            <p className="text-xs text-muted-foreground">La tua esperienza, la nostra community</p>
          </div>
        </Link>

        {/* Navigation menu - desktop */}
        {user && (
          <nav role="navigation" aria-label="Sezioni principali" className="hidden lg:flex items-center space-x-8">
            <Link to="/categoria/mutui" className="font-medium text-foreground hover:text-mutui transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-2 py-1 story-link">
              Mutui
            </Link>
            <Link to="/categoria/vacanze" className="font-medium text-foreground hover:text-vacanze transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-2 py-1 story-link">
              Vacanze
            </Link>
            <Link to="/categoria/auto" className="font-medium text-foreground hover:text-auto transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-2 py-1 story-link">
              Veicoli
            </Link>
            <Link to="/categoria/amazon" className="font-medium text-foreground hover:text-amazon transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-2 py-1 story-link">
              Prodotti
            </Link>
            <Link to="/search" className="font-medium text-foreground hover:text-primary transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm px-2 py-1 story-link">
              Cerca
            </Link>
          </nav>
        )}

        {/* Barra di ricerca con anteprima - desktop */}
        {user && (
          <div className="hidden xl:flex flex-1 max-w-md mx-8">
            <SearchWithPreview className="w-full" />
          </div>
        )}

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user && <NotificationBell />}
          {user ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/create')}
                className="hidden lg:flex"
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

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center space-x-2">
          {user && <NotificationBell />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && user && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t animate-slide-in-right">
          <div className="px-4 py-6 space-y-4">
            {/* Mobile search */}
            <div className="mb-4">
              <SearchWithPreview className="w-full" />
            </div>
            
            {/* Mobile navigation */}
            <nav className="space-y-3">
              <Link 
                to="/categoria/mutui" 
                className="block py-2 px-3 text-foreground hover:text-mutui hover:bg-muted/50 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mutui
              </Link>
              <Link 
                to="/categoria/vacanze" 
                className="block py-2 px-3 text-foreground hover:text-vacanze hover:bg-muted/50 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Vacanze
              </Link>
              <Link 
                to="/categoria/auto" 
                className="block py-2 px-3 text-foreground hover:text-auto hover:bg-muted/50 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Veicoli
              </Link>
              <Link 
                to="/categoria/amazon" 
                className="block py-2 px-3 text-foreground hover:text-amazon hover:bg-muted/50 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Prodotti
              </Link>
              <Link 
                to="/search" 
                className="block py-2 px-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-all duration-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                Cerca
              </Link>
            </nav>

            {/* Mobile actions */}
            <div className="pt-4 border-t space-y-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate('/create');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crea Esperienza
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <User className="h-4 w-4 mr-2" />
                Profilo
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile actions for non-authenticated */}
      {mobileMenuOpen && !user && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-t animate-slide-in-right">
          <div className="px-4 py-6 space-y-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                navigate('/auth');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              <User className="h-4 w-4 mr-2" />
              Accedi
            </Button>
            <Button 
              variant="hero" 
              size="sm"
              onClick={() => {
                navigate('/auth');
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start"
            >
              Registrati
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};