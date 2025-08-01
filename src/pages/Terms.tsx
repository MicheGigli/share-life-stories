import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Terms = () => {
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
            <CardTitle className="text-3xl">Termini di Servizio</CardTitle>
            <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT')}</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Accettazione dei termini</h2>
            <p>
              Utilizzando LifeShare, accetti questi Termini di Servizio. Se non sei d'accordo, 
              ti preghiamo di non utilizzare la nostra piattaforma.
            </p>

            <h2>2. Descrizione del servizio</h2>
            <p>
              LifeShare è una piattaforma sociale che permette agli utenti di condividere 
              esperienze di vita nelle categorie Mutui, Vacanze, Auto e Prodotti Amazon.
            </p>

            <h2>3. Registrazione e account</h2>
            <ul>
              <li>Devi fornire informazioni accurate e aggiornate</li>
              <li>Sei responsabile della sicurezza del tuo account</li>
              <li>Un account per persona fisica</li>
              <li>Età minima: 16 anni (con consenso genitoriale) o 18 anni</li>
            </ul>

            <h2>4. Contenuti e comportamento</h2>
            <h3>4.1 Contenuti consentiti</h3>
            <ul>
              <li>Esperienze autentiche e personali</li>
              <li>Commenti costruttivi e rispettosi</li>
              <li>Contenuti legali e appropriati</li>
            </ul>

            <h3>4.2 Contenuti vietati</h3>
            <ul>
              <li>Contenuti illegali, offensivi o discriminatori</li>
              <li>Spam o contenuti promozionali non autorizzati</li>
              <li>Informazioni false o fuorvianti</li>
              <li>Violazioni di copyright o proprietà intellettuale</li>
              <li>Contenuti che incitano all'odio o alla violenza</li>
            </ul>

            <h2>5. Proprietà intellettuale</h2>
            <ul>
              <li>Tu mantieni i diritti sui tuoi contenuti</li>
              <li>Ci concedi una licenza per utilizzare i contenuti sulla piattaforma</li>
              <li>Rispetta i diritti di proprietà intellettuale altrui</li>
            </ul>

            <h2>6. Privacy e dati personali</h2>
            <p>
              Il trattamento dei tuoi dati personali è regolato dalla nostra Privacy Policy, 
              che costituisce parte integrante di questi termini.
            </p>

            <h2>7. Sistema di gamification</h2>
            <ul>
              <li>I punti e i badge sono virtuali e senza valore monetario</li>
              <li>Ci riserviamo il diritto di modificare il sistema di punti</li>
              <li>È vietato manipolare artificialmente il sistema di punti</li>
            </ul>

            <h2>8. Moderazione e sanzioni</h2>
            <p>
              Ci riserviamo il diritto di:
            </p>
            <ul>
              <li>Rimuovere contenuti non conformi</li>
              <li>Sospendere o terminare account</li>
              <li>Moderare commenti e discussioni</li>
            </ul>

            <h2>9. Limitazione di responsabilità</h2>
            <ul>
              <li>Il servizio è fornito "così com'è"</li>
              <li>Non garantiamo disponibilità continua</li>
              <li>Non siamo responsabili per contenuti di terzi</li>
              <li>Limitiamo la nostra responsabilità nei limiti di legge</li>
            </ul>

            <h2>10. Modifiche ai termini</h2>
            <p>
              Possiamo modificare questi termini in qualsiasi momento. Le modifiche significative 
              saranno comunicate con almeno 30 giorni di preavviso.
            </p>

            <h2>11. Risoluzione delle controversie</h2>
            <p>
              Eventuali controversie saranno risolte secondo la legge italiana e 
              presso il foro competente di Milano.
            </p>

            <h2>12. Contatti</h2>
            <p>
              Per domande sui Termini di Servizio, contattaci all'indirizzo: 
              <strong>support@lifeshare.it</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};