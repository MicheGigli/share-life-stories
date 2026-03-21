

## Problema

Il file `src/integrations/supabase/client.ts` contiene URL e chiave anon del **vecchio** progetto Supabase hardcoded:
- URL: `https://tcbpcyawohglfsxomynv.supabase.co` (vecchio)
- Dovrebbe essere: `https://ohxhagblxviophbriguz.supabase.co` (nuovo)

Il `.env` ha i valori corretti, ma il client non li legge.

## Soluzione

**1. Aggiornare `src/integrations/supabase/client.ts`**

Sostituire le credenziali hardcoded con quelle del nuovo progetto (`ohxhagblxviophbriguz`), oppure meglio ancora, leggere dai `VITE_` env vars:

```typescript
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

Questo garantisce che il client si connetta al progetto corretto definito in `.env`.

## Impatto
- Fix immediato degli errori "Failed to fetch"
- Login e tutte le operazioni Supabase funzioneranno con il nuovo database

