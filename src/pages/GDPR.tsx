import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const GDPR = () => {
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
            <CardTitle className="text-3xl">Informativa GDPR</CardTitle>
            <p className="text-muted-foreground">Regolamento Generale sulla Protezione dei Dati (UE) 2016/679</p>
          </CardHeader>
          <CardContent className="prose prose-gray max-w-none">
            <h2>1. Titolare del trattamento</h2>
            <p>
              <strong>LifeShare S.r.l.</strong><br />
              Via Example 123, 20123 Milano (MI)<br />
              P.IVA: 12345678901<br />
              Email: gdpr@lifeshare.it<br />
              PEC: lifeshare@pec.it
            </p>

            <h2>2. Data Protection Officer (DPO)</h2>
            <p>
              Email: dpo@lifeshare.it<br />
              Il DPO è il punto di contatto per tutte le questioni relative alla protezione dei dati.
            </p>

            <h2>3. Base giuridica del trattamento</h2>
            <p>I tuoi dati personali sono trattati sulla base di:</p>
            <ul>
              <li><strong>Consenso (Art. 6.1.a GDPR):</strong> Per newsletter e marketing</li>
              <li><strong>Esecuzione contratto (Art. 6.1.b GDPR):</strong> Per fornire i servizi</li>
              <li><strong>Interesse legittimo (Art. 6.1.f GDPR):</strong> Per sicurezza e prevenzione frodi</li>
              <li><strong>Obbligo legale (Art. 6.1.c GDPR):</strong> Per adempimenti fiscali e legali</li>
            </ul>

            <h2>4. Categorie di dati trattati</h2>
            <h3>4.1 Dati di identificazione</h3>
            <ul>
              <li>Nome, cognome, nickname</li>
              <li>Indirizzo email</li>
              <li>Data di nascita (se fornita)</li>
            </ul>

            <h3>4.2 Dati di navigazione</h3>
            <ul>
              <li>Indirizzo IP</li>
              <li>Tipo di browser e dispositivo</li>
              <li>Pagine visitate e tempo di permanenza</li>
            </ul>

            <h3>4.3 Dati relativi ai contenuti</h3>
            <ul>
              <li>Esperienze pubblicate</li>
              <li>Commenti e interazioni</li>
              <li>Preferenze e valutazioni</li>
            </ul>

            <h2>5. Finalità del trattamento</h2>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Finalità</th>
                  <th className="border border-gray-300 p-2">Base giuridica</th>
                  <th className="border border-gray-300 p-2">Periodo di conservazione</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">Gestione account e servizi</td>
                  <td className="border border-gray-300 p-2">Esecuzione contratto</td>
                  <td className="border border-gray-300 p-2">Fino alla cancellazione account</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Comunicazioni di servizio</td>
                  <td className="border border-gray-300 p-2">Esecuzione contratto</td>
                  <td className="border border-gray-300 p-2">Fino alla cancellazione account</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Marketing e newsletter</td>
                  <td className="border border-gray-300 p-2">Consenso</td>
                  <td className="border border-gray-300 p-2">Fino alla revoca del consenso</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">Analisi e miglioramento</td>
                  <td className="border border-gray-300 p-2">Interesse legittimo</td>
                  <td className="border border-gray-300 p-2">2 anni</td>
                </tr>
              </tbody>
            </table>

            <h2>6. I tuoi diritti secondo il GDPR</h2>
            <h3>6.1 Diritto di accesso (Art. 15)</h3>
            <p>Puoi richiedere una copia dei tuoi dati personali che trattiamo.</p>

            <h3>6.2 Diritto di rettifica (Art. 16)</h3>
            <p>Puoi correggere dati inesatti o incompleti.</p>

            <h3>6.3 Diritto alla cancellazione (Art. 17)</h3>
            <p>Puoi richiedere la cancellazione dei tuoi dati in specifiche circostanze.</p>

            <h3>6.4 Diritto di limitazione (Art. 18)</h3>
            <p>Puoi richiedere la limitazione del trattamento in determinate situazioni.</p>

            <h3>6.5 Diritto alla portabilità (Art. 20)</h3>
            <p>Puoi richiedere i tuoi dati in formato strutturato e leggibile.</p>

            <h3>6.6 Diritto di opposizione (Art. 21)</h3>
            <p>Puoi opporti al trattamento basato su interesse legittimo.</p>

            <h2>7. Come esercitare i tuoi diritti</h2>
            <p>
              Per esercitare i tuoi diritti, contattaci:
            </p>
            <ul>
              <li>Email: gdpr@lifeshare.it</li>
              <li>Form online: [link al form]</li>
              <li>Posta ordinaria: all'indirizzo del Titolare</li>
            </ul>
            <p>
              Risponderemo entro 30 giorni dalla richiesta (estendibili a 60 in casi complessi).
            </p>

            <h2>8. Trasferimenti internazionali</h2>
            <p>
              I tuoi dati potrebbero essere trasferiti in paesi extra-UE solo con garanzie adeguate 
              (clausole contrattuali standard, decisioni di adeguatezza).
            </p>

            <h2>9. Sicurezza dei dati</h2>
            <p>Implementiamo misure tecniche e organizzative quali:</p>
            <ul>
              <li>Crittografia dei dati sensibili</li>
              <li>Controllo degli accessi</li>
              <li>Backup regolari</li>
              <li>Formazione del personale</li>
              <li>Procedure di incident response</li>
            </ul>

            <h2>10. Violazioni dei dati (Data Breach)</h2>
            <p>
              In caso di violazione dei dati che comporti rischi per i tuoi diritti, 
              ti notificheremo entro 72 ore come richiesto dal GDPR.
            </p>

            <h2>11. Diritto di reclamo</h2>
            <p>
              Hai il diritto di presentare reclamo al Garante per la Protezione dei Dati Personali:
            </p>
            <p>
              <strong>Garante Privacy</strong><br />
              Piazza di Monte Citorio, 121 - 00186 Roma<br />
              Tel: +39 06 69677 1<br />
              Email: garante@gpdp.it<br />
              Web: www.garanteprivacy.it
            </p>

            <h2>12. Modifiche all'informativa</h2>
            <p>
              Questa informativa può essere aggiornata. Le modifiche sostanziali saranno 
              comunicate con almeno 30 giorni di preavviso.
            </p>

            <p className="text-sm text-muted-foreground mt-8">
              Ultima modifica: {new Date().toLocaleDateString('it-IT')}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};