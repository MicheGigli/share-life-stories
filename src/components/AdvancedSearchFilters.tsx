import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Filter, X, Search } from 'lucide-react';

interface AdvancedSearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: (query: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

interface SearchFilters {
  query: string;
  category?: string;
  dateRange?: { from: Date; to: Date };
  minLikes?: number;
  tags?: string[];
  sortBy: 'recent' | 'popular' | 'relevant';
}

const categoryOptions = [
  { value: 'mutui', label: 'Mutui' },
  { value: 'vacanze', label: 'Vacanze' },
  { value: 'veicoli', label: 'Veicoli' },  
  { value: 'prodotti', label: 'Prodotti Amazon' },
];

export const AdvancedSearchFilters = ({ 
  onFiltersChange, 
  onSearch, 
  isVisible, 
  onToggle 
}: AdvancedSearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    sortBy: 'relevant'
  });
  const [tagInput, setTagInput] = useState('');

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const handleSearch = () => {
    onSearch(filters.query);
  };

  const addTag = () => {
    if (tagInput.trim() && (!filters.tags || !filters.tags.includes(tagInput.trim()))) {
      const newTags = [...(filters.tags || []), tagInput.trim()];
      updateFilters({ tags: newTags });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = filters.tags?.filter(tag => tag !== tagToRemove) || [];
    updateFilters({ tags: newTags.length > 0 ? newTags : undefined });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: filters.query,
      sortBy: 'relevant'
    };
    setFilters(clearedFilters);
    setTagInput('');
    onFiltersChange(clearedFilters);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cerca esperienze..."
            value={filters.query}
            onChange={(e) => updateFilters({ query: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>
          Cerca
        </Button>
        <Button variant="outline" onClick={onToggle}>
          <Filter className="h-4 w-4" />
          Filtri
        </Button>
      </div>

      {/* Advanced Filters */}
      {isVisible && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filtri avanzati</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Cancella
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.category || ''}
                onValueChange={(value) => updateFilters({ category: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le categorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte le categorie</SelectItem>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <Label>Ordina per</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value: 'recent' | 'popular' | 'relevant') => 
                  updateFilters({ sortBy: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevant">Più rilevanti</SelectItem>
                  <SelectItem value="recent">Più recenti</SelectItem>
                  <SelectItem value="popular">Più popolari</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Likes Filter */}
            <div className="space-y-2">
              <Label>Minimo di like: {filters.minLikes || 0}</Label>
              <Slider
                value={[filters.minLikes || 0]}
                onValueChange={([value]) => updateFilters({ minLikes: value || undefined })}
                max={50}
                step={1}
                className="w-full"
              />
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <Label>Tag</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Aggiungi tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1"
                />
                <Button onClick={addTag} size="sm">
                  Aggiungi
                </Button>
              </div>
              
              {filters.tags && filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {filters.tags.map((tag) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => removeTag(tag)}
                    >
                      #{tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range - Simplified for now */}
            <div className="space-y-2">
              <Label>Periodo</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={!filters.dateRange ? 'default' : 'outline'}
                  onClick={() => updateFilters({ dateRange: undefined })}
                  size="sm"
                >
                  Sempre
                </Button>
                <Button
                  variant={filters.dateRange ? 'default' : 'outline'}
                  onClick={() => updateFilters({ 
                    dateRange: {
                      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      to: new Date()
                    }
                  })}
                  size="sm"
                >
                  Ultimo mese
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};