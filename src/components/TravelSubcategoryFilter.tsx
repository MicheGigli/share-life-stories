import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TravelSubcategory {
  id: string;
  name: string;
  description: string;
}

interface TravelSubcategoryFilterProps {
  selectedSubcategory: string;
  onSubcategoryChange: (subcategory: string) => void;
}

export const TravelSubcategoryFilter = ({ selectedSubcategory, onSubcategoryChange }: TravelSubcategoryFilterProps) => {
  const [subcategories, setSubcategories] = useState<TravelSubcategory[]>([]);

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await supabase
        .from('travel_subcategories')
        .select('*')
        .eq('category', 'vacanze')
        .order('name');

      if (error) {
        console.error('Error fetching travel subcategories:', error);
        return;
      }

      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching travel subcategories:', error);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Sottocategorie Viaggi</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedSubcategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onSubcategoryChange('all')}
        >
          Tutte le esperienze
        </Button>
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant={selectedSubcategory === subcategory.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSubcategoryChange(subcategory.name)}
          >
            {subcategory.name}
          </Button>
        ))}
      </div>
      
      {/* Info cards for subcategories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {subcategories.map((subcategory) => (
          <div key={subcategory.id} className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{subcategory.name}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{subcategory.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};