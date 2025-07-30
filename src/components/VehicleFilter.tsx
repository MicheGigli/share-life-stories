import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface VehicleType {
  id: string;
  name: string;
  description: string;
}

interface VehicleFilterProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
}

export const VehicleFilter = ({ selectedType, onTypeChange }: VehicleFilterProps) => {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  const fetchVehicleTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching vehicle types:', error);
        return;
      }

      setVehicleTypes(data || []);
    } catch (error) {
      console.error('Error fetching vehicle types:', error);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Filtra per tipologia veicolo</h3>
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedType === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onTypeChange('all')}
        >
          Tutti
        </Button>
        {vehicleTypes.map((type) => (
          <Button
            key={type.id}
            variant={selectedType === type.name ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTypeChange(type.name)}
          >
            {type.name}
          </Button>
        ))}
      </div>
    </div>
  );
};