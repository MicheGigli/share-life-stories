import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, Settings, Plus, Menu, X } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import lifeshareLogo from "@/assets/lifeshare-logo.png";
import { LevelIndicator } from './gamification/LevelIndicator';
import { useGameification } from '@/hooks/useGameification';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { userPoints } = useGameification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:scale-105 transition-transform duration-300">
              <img src={lifeshareLogo} alt="Lifeshare" className="h-8 w-8 hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold text-xl text-foreground">Lifeshare</span>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar />
            </div>

            {/* Desktop User Menu */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <Button 
                  onClick={() => navigate('/create')}
                  size="sm"
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crea
                </Button>
                
                <ThemeToggle />
                <NotificationBell />
                
                <div className="flex items-center space-x-2">
                  <LevelIndicator level={userPoints.current_level} size="sm" />
                  <Badge variant="secondary" className="hover:scale-105 transition-transform duration-200">
                    {userPoints.total_points} punti
                  </Badge>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:scale-105 transition-transform duration-200">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profilo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/create')}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crea esperienza
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Esci
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <ThemeToggle />
                <Button variant="ghost" onClick={() => navigate('/auth')}>
                  Accedi
                </Button>
                <Button onClick={() => navigate('/auth')}>
                  Registrati
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed top-16 right-0 bottom-0 w-64 bg-background border-l border-border shadow-lg transform transition-transform duration-300 ease-in-out">
            <div className="p-4 space-y-4">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 pb-4 border-b">
                    <div className="bg-muted p-2 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <LevelIndicator level={userPoints.current_level} size="sm" />
                      <Badge variant="secondary" className="mt-1">
                        {userPoints.total_points} punti
                      </Badge>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      navigate('/create');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crea esperienza
                  </Button>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profilo
                  </Button>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Esci
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tema</span>
                    <ThemeToggle />
                  </div>
                  
                  <Button 
                    variant="ghost"
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full justify-start"
                  >
                    Accedi
                  </Button>
                  
                  <Button 
                    onClick={() => {
                      navigate('/auth');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full"
                  >
                    Registrati
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};