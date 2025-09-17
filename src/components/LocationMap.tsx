import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface LocationMapProps {
  experienceId: string;
  isOwner?: boolean;
  category: string;
}

interface LocationData {
  id?: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  country?: string;
}

export const LocationMap = ({ experienceId, isOwner = false, category }: LocationMapProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData>({});
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Only show map for travel experiences
  if (category !== 'vacanze') {
    return null;
  }

  useEffect(() => {
    fetchLocation();
  }, [experienceId]);

  const fetchLocation = async () => {
    try {
      const { data, error } = await supabase
        .from('experience_locations')
        .select('*')
        .eq('experience_id', experienceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setLocation(data);
      }
    } catch (error) {
      console.error('Error fetching location:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          toast({
            title: "Errore",
            description: "Impossibile ottenere la posizione corrente",
            variant: "destructive"
          });
        }
      );
    }
  };

  const geocodeAddress = async (address: string) => {
    try {
      // Using a simple geocoding service (in production, use Google Maps API or similar)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setLocation(prev => ({
          ...prev,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          address: result.display_name
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const saveLocation = async () => {
    if (!user || !isOwner) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('experience_locations')
        .upsert({
          experience_id: experienceId,
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address,
          city: location.city,
          country: location.country
        }, { onConflict: 'experience_id' });

      if (error) throw error;

      toast({
        title: "Posizione salvata",
        description: "La posizione è stata salvata con successo"
      });
      
      setEditing(false);
      await fetchLocation();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nel salvare la posizione",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Posizione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Posizione
          </CardTitle>
          {isOwner && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Annulla' : 'Modifica'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Città</Label>
                <Input
                  id="city"
                  value={location.city || ''}
                  onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Es. Roma"
                />
              </div>
              <div>
                <Label htmlFor="country">Paese</Label>
                <Input
                  id="country"
                  value={location.country || ''}
                  onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Es. Italia"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Indirizzo</Label>
              <Input
                id="address"
                value={location.address || ''}
                onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Indirizzo completo"
                onBlur={(e) => {
                  if (e.target.value) {
                    geocodeAddress(e.target.value);
                  }
                }}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-1"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Posizione Corrente
              </Button>
              <Button
                onClick={saveLocation}
                disabled={saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salva'}
              </Button>
            </div>
          </div>
        ) : location.latitude && location.longitude ? (
          <div className="space-y-3">
            {/* Simple static map using OpenStreetMap */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={`https://static-maps.yandex.ru/1.x/?lang=en_US&size=400,200&z=13&l=map&pt=${location.longitude},${location.latitude},pm2rdm`}
                alt="Mappa della posizione"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a simple map placeholder
                  e.currentTarget.src = `data:image/svg+xml,${encodeURIComponent(`
                    <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
                      <rect width="400" height="200" fill="#f3f4f6"/>
                      <circle cx="200" cy="100" r="20" fill="#ef4444"/>
                      <text x="200" y="160" text-anchor="middle" font-family="Arial" font-size="12" fill="#6b7280">
                        ${location.city || 'Posizione'}
                      </text>
                    </svg>
                  `)}`;
                }}
              />
            </div>
            
            <div className="space-y-1 text-sm">
              {location.city && (
                <p><strong>Città:</strong> {location.city}</p>
              )}
              {location.country && (
                <p><strong>Paese:</strong> {location.country}</p>
              )}
              {location.address && (
                <p><strong>Indirizzo:</strong> {location.address}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {isOwner ? (
              <div>
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nessuna posizione aggiunta</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setEditing(true)}
                >
                  Aggiungi posizione
                </Button>
              </div>
            ) : (
              <p>Posizione non disponibile</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};