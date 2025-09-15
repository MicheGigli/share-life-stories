import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Star, Users, Heart, MessageCircle, Trophy } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useNavigate } from 'react-router-dom';

const OnboardingWelcome = () => {
  const { progress, updateProgress, getCompletionPercentage, getNextStep, isCompleted } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(!isCompleted() && !progress.welcome_tour_completed);
  const navigate = useNavigate();

  const steps = [
    {
      title: "Benvenuto su Lifeshare! 🎉",
      description: "Condividi le tue esperienze e scopri quelle degli altri",
      icon: <Star className="h-8 w-8 text-primary" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Lifeshare è la piattaforma dove puoi condividere le tue esperienze reali su mutui, viaggi, auto e prodotti Amazon, aiutando altri utenti nelle loro scelte.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Community attiva</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Sistema a punti</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Completa il tuo profilo",
      description: "Aggiungi informazioni su di te per essere più credibile",
      icon: <Circle className="h-8 w-8 text-muted-foreground" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Un profilo completo con nickname e biografia ti aiuta a costruire fiducia nella community e a ricevere più interazioni.
          </p>
          <Button 
            onClick={() => {
              navigate('/profile');
              setIsOpen(false);
            }}
            className="w-full"
          >
            Vai al profilo
          </Button>
        </div>
      )
    },
    {
      title: "Condividi la tua prima esperienza",
      description: "Racconta un'esperienza che può aiutare altri",
      icon: <Circle className="h-8 w-8 text-muted-foreground" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Le esperienze più utili sono quelle dettagliate e oneste. Racconta cosa hai vissuto, i pro e i contro, per aiutare davvero gli altri.
          </p>
          <Button 
            onClick={() => {
              navigate('/create');
              setIsOpen(false);
            }}
            className="w-full"
          >
            Crea esperienza
          </Button>
        </div>
      )
    },
    {
      title: "Interagisci con la community",
      description: "Metti like e commenta le esperienze che trovi utili",
      icon: <Heart className="h-8 w-8 text-red-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Le interazioni sono il cuore di Lifeshare. Ogni like, commento e condivisione aiuta a creare una community più ricca e utile.
          </p>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              +1 punto per like dato
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              +5 punti per commento
            </Badge>
          </div>
        </div>
      )
    },
    {
      title: "Guadagna punti e badge! 🏆",
      description: "Più contribuisci, più sali di livello",
      icon: <Trophy className="h-8 w-8 text-yellow-500" />,
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Il sistema di gamification premia i contributi di qualità. Guadagna punti per ogni azione e sblocca badge speciali!
          </p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Esperienza pubblicata</span>
              <Badge>+15 punti</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Like ricevuto</span>
              <Badge>+3 punti</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Commento pubblicato</span>
              <Badge>+5 punti</Badge>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    updateProgress('welcome_tour_completed');
    setIsOpen(false);
  };

  const handleSkip = () => {
    updateProgress('welcome_tour_completed');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {steps[currentStep].icon}
            {steps[currentStep].title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Progress value={(currentStep + 1) / steps.length * 100} className="w-full" />
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{steps[currentStep].title}</CardTitle>
              <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
            </CardHeader>
            <CardContent>
              {steps[currentStep].content}
            </CardContent>
          </Card>

          <div className="flex justify-between gap-2">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="flex-1"
            >
              Salta tour
            </Button>
            
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Indietro
                </Button>
              )}
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Completa' : 'Avanti'}
              </Button>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Passo {currentStep + 1} di {steps.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWelcome;