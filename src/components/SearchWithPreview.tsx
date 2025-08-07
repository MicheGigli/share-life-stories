import { useState, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
}

interface SearchWithPreviewProps {
  className?: string;
}

export const SearchWithPreview = ({ className = "" }: SearchWithPreviewProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Experience[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mutui': return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'vacanze': return 'bg-green-500/10 text-green-700 border-green-200';
      case 'auto': return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'amazon': return 'bg-orange-500/10 text-orange-700 border-orange-200';
      default: return 'bg-muted';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mutui': return 'Mutui';
      case 'vacanze': return 'Vacanze';
      case 'auto': return 'Veicoli';
      case 'amazon': return 'Prodotti';
      default: return category;
    }
  };

  const searchExperiences = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('id, title, content, category')
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error searching experiences:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchExperiences(query);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchExperiences]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          navigateToExperience(results[selectedIndex].id);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSubmit = () => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
    }
  };

  const navigateToExperience = (experienceId: string) => {
    navigate(`/experience/${experienceId}`);
    setIsOpen(false);
    setSelectedIndex(-1);
    setQuery('');
    inputRef.current?.blur();
  };

  const truncateContent = (content: string, maxLength: number = 80) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Cerca esperienze..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {isOpen && (query.trim() || results.length > 0) && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 bg-background border shadow-lg">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Ricerca in corso...
            </div>
          ) : results.length > 0 ? (
            <div className="p-1">
              {results.map((experience, index) => (
                <div
                  key={experience.id}
                  onClick={() => navigateToExperience(experience.id)}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-accent text-accent-foreground' 
                      : 'hover:bg-accent/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {experience.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs shrink-0 ${getCategoryColor(experience.category)}`}
                    >
                      {getCategoryLabel(experience.category)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {truncateContent(experience.content)}
                  </p>
                </div>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>Nessun risultato trovato</p>
              <p className="text-xs mt-1">Premi Invio per cercare nella pagina completa</p>
            </div>
          ) : null}
        </Card>
      )}
    </div>
  );
};