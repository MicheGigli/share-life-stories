-- First, let's create a user profile for "michele"
-- We'll use a dummy auth user ID for this example
INSERT INTO public.profiles (user_id, nickname, bio) VALUES 
('00000000-0000-0000-0000-000000000001', 'michele', 'Utente esperto di LifeShare, condivido le mie esperienze per aiutare la community');

-- Insert sample experiences for each category
INSERT INTO public.experiences (user_id, title, content, category, tags, is_published) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'La mia esperienza con il mutuo prima casa',
  'Dopo mesi di ricerche tra diverse banche, ho finalmente trovato il mutuo perfetto per la mia prima casa. Vi racconto tutto il processo, dalle prime visite in banca fino alla firma del contratto. 

La cosa più importante che ho imparato è che non bisogna fermarsi alla prima offerta. Ho visitato 5 banche diverse e i tassi variavano anche dell''1%. Alla fine ho scelto una banca online che mi ha offerto condizioni molto vantaggiose.

Il processo di valutazione è durato circa 2 mesi, ma ne è valsa la pena. Consiglio a tutti di:
- Confrontare almeno 3-4 offerte
- Controllare bene tutti i costi accessori
- Non avere fretta nella scelta

Spero che la mia esperienza possa essere utile a chi si trova nella mia stessa situazione!',
  'mutui',
  ARRAY['prima-casa', 'tasso-fisso', 'banche-online'],
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Weekend magico a Barcellona con 200€',
  'Vi racconto come sono riuscito a passare un weekend fantastico a Barcellona spendendo solo 200€ tutto incluso. Con un po'' di organizzazione e qualche trucco, si può viaggiare low-cost senza rinunciare al divertimento!

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

Barcellona è una città incredibile e si può visitare anche con budget limitati. Fatevi ispirare e organizzate il vostro viaggio!',
  'vacanze',
  ARRAY['barcellona', 'low-cost', 'weekend', 'spagna'],
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  'Tesla Model 3: la mia esperienza dopo 1 anno',
  'Dopo un anno di utilizzo quotidiano della mia Tesla Model 3, vi racconto pro e contro di questa auto elettrica. Una recensione onesta basata sulla mia esperienza reale.

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

Nel complesso sono molto soddisfatto. L''auto è fantastica per l''uso quotidiano, ma per i viaggi lunghi bisogna ancora organizzarsi bene. La consiglio a chi fa principalmente città e prima cintura.',
  'auto',
  ARRAY['tesla', 'elettrico', 'recensione', 'model-3'],
  true
),
(
  '00000000-0000-0000-0000-000000000001',
  '5 prodotti Amazon che hanno cambiato la mia vita',
  'Vi presento 5 acquisti su Amazon che uso ogni giorno e che consiglio a tutti. Tutti con rapporto qualità-prezzo eccezionale e funzionalità che mi hanno davvero semplificato la vita!

1. ROBOT ASPIRAPOLVERE ROOMBA (€299)
Non posso più farne a meno! Aspira ogni giorno mentre sono al lavoro. Casa sempre pulita senza sforzo.

2. ECHO DOT (€29 in offerta)
Controllo luci, musica, timer. Perfetto per la smart home. Lo uso per tutto, dalle sveglie alle ricette.

3. KINDLE PAPERWHITE (€139)
Ho riscoperto il piacere di leggere. Schermo perfetto anche al sole, batteria infinita. Leggo ovunque.

4. CARICATORE WIRELESS ANKER (€19)
Addio ai cavi! Appoggio il telefono e si carica. Semplice ma geniale.

5. WEBCAM LOGITECH C920 (€89)
Per smart working è perfetta. Qualità video eccellente, autofocus veloce. Fondamentale per videochiamate professionali.

Tutti prodotti testati per mesi. Li ricomprerei subito! Avete altri prodotti da consigliare?',
  'amazon',
  ARRAY['top-5', 'consigliati', 'qualità-prezzo', 'recensioni'],
  true
);

-- Update experiences with some likes and comments counts
UPDATE public.experiences SET likes_count = 34, comments_count = 12 WHERE title LIKE '%mutuo%';
UPDATE public.experiences SET likes_count = 89, comments_count = 23 WHERE title LIKE '%Barcellona%';
UPDATE public.experiences SET likes_count = 156, comments_count = 45 WHERE title LIKE '%Tesla%';
UPDATE public.experiences SET likes_count = 203, comments_count = 67 WHERE title LIKE '%Amazon%';