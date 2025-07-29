import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Sample experiences data to insert when user signs up
const sampleExperiences = [
  {
    title: 'La mia esperienza con il mutuo prima casa',
    content: `Dopo mesi di ricerche tra diverse banche, ho finalmente trovato il mutuo perfetto per la mia prima casa. Vi racconto tutto il processo, dalle prime visite in banca fino alla firma del contratto.

La cosa più importante che ho imparato è che non bisogna fermarsi alla prima offerta. Ho visitato 5 banche diverse e i tassi variavano anche dell'1%. Alla fine ho scelto una banca online che mi ha offerto condizioni molto vantaggiose.

Il processo di valutazione è durato circa 2 mesi, ma ne è valsa la pena. Consiglio a tutti di:
- Confrontare almeno 3-4 offerte
- Controllare bene tutti i costi accessori
- Non avere fretta nella scelta

Spero che la mia esperienza possa essere utile a chi si trova nella mia stessa situazione!`,
    category: 'mutui' as const,
    tags: ['prima-casa', 'tasso-fisso', 'banche-online']
  },
  {
    title: 'Weekend magico a Barcellona con 200€',
    content: `Vi racconto come sono riuscito a passare un weekend fantastico a Barcellona spendendo solo 200€ tutto incluso. Con un po' di organizzazione e qualche trucco, si può viaggiare low-cost senza rinunciare al divertimento!

VOLO: 45€ andata e ritorno con Ryanair (prenotato 2 mesi prima)
ALLOGGIO: 60€ per 2 notti in ostello nel centro (Booking.com)
TRASPORTI: 15€ per metro pass weekend
CIBO: 50€ tra tapas, mercati e qualche ristorante
ATTRAZIONI: 30€ per Sagrada Familia e Parc Güell

I miei consigli per risparmiare:
- Prenotare volo con largo anticipo
- Scegliere ostelli nel centro città
- Mangiare nei mercati locali (Boqueria è fantastico!)
- Camminare il più possibile

Barcellona è una città incredibile e si può visitare anche con budget limitati!`,
    category: 'vacanze' as const,
    tags: ['barcellona', 'low-cost', 'weekend', 'spagna']
  },
  {
    title: 'Tesla Model 3: la mia esperienza dopo 1 anno',
    content: `Dopo un anno di utilizzo quotidiano della mia Tesla Model 3, vi racconto pro e contro di questa auto elettrica. Una recensione onesta basata sulla mia esperienza reale.

PRO:
- Consumi bassissimi: circa 15 kWh/100km
- Accelerazione incredibile (0-100 in 5.3 secondi)
- Tecnologia avanzata e aggiornamenti OTA
- Silenziosità di marcia
- Costi di manutenzione quasi nulli

CONTRO:
- Prezzo di acquisto elevato (52.000€)
- Rete di ricarica ancora limitata in alcune zone
- Tempi di ricarica lunghi nei viaggi
- Qualità degli interni migliorabile
- Assistenza Tesla a volte lenta

CONSUMI REALI:
- In città: 13-14 kWh/100km
- In autostrada: 18-20 kWh/100km
- Inverno: +20% di consumo per riscaldamento

Nel complesso sono molto soddisfatto. L'auto è fantastica per l'uso quotidiano, ma per i viaggi lunghi bisogna ancora organizzarsi bene.`,
    category: 'auto' as const,
    tags: ['tesla', 'elettrico', 'recensione', 'model-3']
  },
  {
    title: '5 prodotti Amazon che hanno cambiato la mia vita',
    content: `Vi presento 5 acquisti su Amazon che uso ogni giorno e che consiglio a tutti. Tutti con rapporto qualità-prezzo eccezionale!

1. ROBOT ASPIRAPOLVERE ROOMBA (€299)
Non posso più farne a meno! Aspira ogni giorno mentre sono al lavoro. Casa sempre pulita senza sforzo.

2. ECHO DOT (€29 in offerta)
Controllo luci, musica, timer. Perfetto per la smart home. Lo uso per tutto, dalle sveglie alle ricette.

3. KINDLE PAPERWHITE (€139)
Ho riscoperto il piacere di leggere. Schermo perfetto anche al sole, batteria infinita. Leggo ovunque.

4. CARICATORE WIRELESS ANKER (€19)
Addio ai cavi! Appoggio il telefono e si carica. Semplice ma geniale.

5. WEBCAM LOGITECH C920 (€89)
Per smart working è perfetta. Qualità video eccellente, autofocus veloce.

Tutti prodotti testati per mesi. Li ricomprerei subito! Avete altri prodotti da consigliare?`,
    category: 'amazon' as const,
    tags: ['top-5', 'consigliati', 'qualità-prezzo', 'recensioni']
  }
];

export const useSampleData = () => {
  // Sample data creation has been removed - users must create their own content
  return {};
};