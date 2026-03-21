// @ts-nocheck
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StructuredReviewProps {
  experienceId: string;
  category: string;
  existingReview?: any;
  onReviewSubmitted?: () => void;
}

const getCriteriaForCategory = (category: string): string[] => {
  switch (category) {
    case 'mutui':
      return ['tasso_interesse', 'facilita_richiesta', 'tempi_approvazione', 'assistenza'];
    case 'vacanze':
      return ['rapporto_qualita_prezzo', 'location', 'servizio', 'pulizia'];
    case 'auto':
      return ['affidabilita', 'consumi', 'comfort', 'design'];
    case 'amazon':
      return ['qualita_prodotto', 'rapporto_qualita_prezzo', 'tempi_consegna', 'imballaggio'];
    default:
      return ['qualita', 'prezzo', 'servizio', 'soddisfazione'];
  }
};

const translateCriteria = (criteria: string): string => {
  const translations: Record<string, string> = {
    'tasso_interesse': 'Tasso di interesse',
    'facilita_richiesta': 'Facilità richiesta',
    'tempi_approvazione': 'Tempi approvazione',
    'assistenza': 'Assistenza clienti',
    'rapporto_qualita_prezzo': 'Rapporto qualità/prezzo',
    'location': 'Posizione',
    'servizio': 'Servizio',
    'pulizia': 'Pulizia',
    'affidabilita': 'Affidabilità',
    'consumi': 'Consumi',
    'comfort': 'Comfort',
    'design': 'Design',
    'qualita_prodotto': 'Qualità prodotto',
    'tempi_consegna': 'Tempi consegna',
    'imballaggio': 'Imballaggio',
    'qualita': 'Qualità',
    'prezzo': 'Prezzo',
    'soddisfazione': 'Soddisfazione generale'
  };
  return translations[criteria] || criteria;
};

export const StructuredReview = ({ 
  experienceId, 
  category, 
  existingReview,
  onReviewSubmitted 
}: StructuredReviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const criteria = getCriteriaForCategory(category);
  
  const [review, setReview] = useState({
    overall_rating: existingReview?.overall_rating || 0,
    criteria_ratings: existingReview?.criteria_ratings || {},
    pros: existingReview?.pros || [],
    cons: existingReview?.cons || [],
    would_recommend: existingReview?.would_recommend ?? true
  });
  
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const handleCriteriaRating = (criterion: string, rating: number) => {
    setReview(prev => ({
      ...prev,
      criteria_ratings: {
        ...prev.criteria_ratings,
        [criterion]: rating
      }
    }));
  };

  const addPro = () => {
    if (newPro.trim()) {
      setReview(prev => ({
        ...prev,
        pros: [...prev.pros, newPro.trim()]
      }));
      setNewPro('');
    }
  };

  const addCon = () => {
    if (newCon.trim()) {
      setReview(prev => ({
        ...prev,
        cons: [...prev.cons, newCon.trim()]
      }));
      setNewCon('');
    }
  };

  const removePro = (index: number) => {
    setReview(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const removeCon = (index: number) => {
    setReview(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  const submitReview = async () => {
    if (!user) return;
    
    if (review.overall_rating === 0) {
      toast({
        title: "Errore",
        description: "Seleziona una valutazione generale",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('structured_reviews')
        .upsert({
          experience_id: experienceId,
          user_id: user.id,
          overall_rating: review.overall_rating,
          criteria_ratings: review.criteria_ratings,
          pros: review.pros,
          cons: review.cons,
          would_recommend: review.would_recommend
        }, { onConflict: 'experience_id,user_id' });

      if (error) throw error;

      toast({
        title: "Recensione salvata",
        description: "La tua recensione strutturata è stata salvata con successo"
      });
      
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvare la recensione",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, onRate }: { rating: number; onRate: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="p-1"
        >
          <Star
            className={`h-5 w-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recensione Strutturata</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Rating */}
        <div>
          <Label className="text-base font-medium">Valutazione Generale</Label>
          <div className="mt-2">
            <StarRating
              rating={review.overall_rating}
              onRate={(rating) => setReview(prev => ({ ...prev, overall_rating: rating }))}
            />
          </div>
        </div>

        {/* Criteria Ratings */}
        <div>
          <Label className="text-base font-medium">Valutazioni Specifiche</Label>
          <div className="mt-3 space-y-3">
            {criteria.map((criterion) => (
              <div key={criterion} className="flex items-center justify-between">
                <span className="text-sm">{translateCriteria(criterion)}</span>
                <StarRating
                  rating={review.criteria_ratings[criterion] || 0}
                  onRate={(rating) => handleCriteriaRating(criterion, rating)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pros */}
        <div>
          <Label className="text-base font-medium">Aspetti Positivi</Label>
          <div className="mt-2 space-y-2">
            {review.pros.map((pro, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <ThumbsUp className="h-3 w-3" />
                  {pro}
                  <button
                    onClick={() => removePro(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea
                placeholder="Aggiungi un aspetto positivo..."
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={addPro} variant="outline" size="sm">
                Aggiungi
              </Button>
            </div>
          </div>
        </div>

        {/* Cons */}
        <div>
          <Label className="text-base font-medium">Aspetti Negativi</Label>
          <div className="mt-2 space-y-2">
            {review.cons.map((con, index) => (
              <div key={index} className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <ThumbsDown className="h-3 w-3" />
                  {con}
                  <button
                    onClick={() => removeCon(index)}
                    className="ml-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </Badge>
              </div>
            ))}
            <div className="flex gap-2">
              <Textarea
                placeholder="Aggiungi un aspetto negativo..."
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                className="min-h-[60px]"
              />
              <Button onClick={addCon} variant="outline" size="sm">
                Aggiungi
              </Button>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="recommend"
            checked={review.would_recommend}
            onCheckedChange={(checked) => 
              setReview(prev => ({ ...prev, would_recommend: !!checked }))
            }
          />
          <Label htmlFor="recommend">Lo consiglieresti ad altri?</Label>
        </div>

        {/* Submit Button */}
        <Button
          onClick={submitReview}
          disabled={loading || review.overall_rating === 0}
          className="w-full"
        >
          {loading ? 'Salvando...' : existingReview ? 'Aggiorna Recensione' : 'Salva Recensione'}
        </Button>
      </CardContent>
    </Card>
  );
};