import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alla home
            </Button>
          </Link>
        </div>

        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Privacy Policy</CardTitle>
            <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Introduzione</h2>
            <p>
              Benvenuto su LifeShare. Questa Privacy Policy descrive come raccogliamo, utilizziamo e proteggiamo 
              le tue informazioni personali quando utilizzi la nostra piattaforma per condividere esperienze di vita.
            </p>

            <h2>2. Informazioni che raccogliamo</h2>
            <h3>2.1 Informazioni fornite direttamente</h3>
            <ul>
              <li>Nome utente e nickname</li>
              <li>Indirizzo email</li>
              <li>Biografia e foto profilo (opzionali)</li>
              <li>Contenuti pubblicati (esperienze, commenti)</li>
            </ul>

            <h3>2.2 Informazioni raccolte automaticamente</h3>
            <ul>
              <li>Indirizzo IP e informazioni del dispositivo</li>
              <li>Dati di utilizzo e navigazione</li>
              <li>Cookie e tecnologie simili</li>
            </ul>

            <h2>3. Come utilizziamo le tue informazioni</h2>
            <ul>
              <li>Fornire e migliorare i nostri servizi</li>
              <li>Personalizzare la tua esperienza</li>
              <li>Comunicare con te riguardo al servizio</li>
              <li>Prevenire frodi e garantire la sicurezza</li>
              <li>Rispettare obblighi legali</li>
            </ul>

            <h2>4. Condivisione delle informazioni</h2>
            <p>
              Non vendiamo le tue informazioni personali. Potremmo condividerle solo in casi specifici:
            </p>
            <ul>
              <li>Con il tuo consenso esplicito</li>
              <li>Per adempiere a obblighi legali</li>
              <li>Per proteggere i diritti e la sicurezza degli utenti</li>
              <li>Con fornitori di servizi terzi che ci aiutano a gestire la piattaforma</li>
            </ul>

            <h2>5. Sicurezza dei dati</h2>
            <p>
              Implementiamo misure di sicurezza tecniche e organizzative appropriate per proteggere 
              le tue informazioni personali da accesso non autorizzato, perdita o distruzione.
            </p>

            <h2>6. I tuoi diritti</h2>
            <p>Hai il diritto di:</p>
            <ul>
              <li>Accedere alle tue informazioni personali</li>
              <li>Correggere dati inesatti</li>
              <li>Richiedere la cancellazione dei tuoi dati</li>
              <li>Opporti al trattamento</li>
              <li>Richiedere la portabilità dei dati</li>
            </ul>

            <h2>7. Cookie</h2>
            <p>
              Utilizziamo cookie essenziali per il funzionamento del sito e cookie di analisi 
              per migliorare l'esperienza utente. Puoi gestire le preferenze sui cookie 
              nelle impostazioni del tuo browser.
            </p>

            <h2>8. Modifiche alla Privacy Policy</h2>
            <p>
              Ci riserviamo il diritto di aggiornare questa Privacy Policy. Ti notificheremo 
              eventuali modifiche significative tramite email o avviso sulla piattaforma.
            </p>

            <h2>9. Contatti</h2>
            <p>
              Per domande sulla Privacy Policy o per esercitare i tuoi diritti, contattaci all'indirizzo: 
              <strong>privacy@lifeshare.it</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};