const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchContext, siteUrl, currentPage, userNickname } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable AI not configured');
    }

    let systemPrompt = `Sei Virginia, l'assistente intelligente e amichevole di LifeShare, una piattaforma italiana dove gli utenti condividono esperienze su mutui, vacanze, veicoli e prodotti.

PERSONALITÀ:
- Sei calda, empatica, professionale ma informale
- Usi emoji con moderazione per rendere la conversazione piacevole
- Rispondi SEMPRE in italiano
- Sei concisa ma completa

COMPORTAMENTO CONVERSAZIONALE:
- Saluti (ciao, salve, hey, buongiorno): rispondi in modo caloroso e vario, presentati brevemente
- "Cosa puoi fare?" / "Come funziona?": spiega che puoi aiutare a cercare esperienze, dare consigli, spiegare come funziona il sito
- Ringraziamenti: rispondi con gentilezza, es. "Prego! 😊 Sono qui se hai bisogno!"
- Domande sul sito: spiega registrazione, pubblicazione esperienze, sistema punti, badge, ecc.
- Se l'utente chiede esperienze specifiche e ci sono risultati dal DB, descrivili brevemente e invita a leggere i dettagli
- Se NON ci sono risultati: suggerisci all'utente di essere il primo a condividere quell'esperienza
- Mantieni il contesto della conversazione

INFORMAZIONI SUL SITO:
- URL del sito: ${siteUrl || 'LifeShare'}
- Pagina corrente dell'utente: ${currentPage || '/'}
- Categorie: Mutui (🏦), Vacanze (✈️), Veicoli/Auto (🚗), Prodotti Amazon (🛒)
- Gli utenti guadagnano punti pubblicando esperienze (+15), commentando (+5), dando like (+1)
- Ci sono badge e livelli basati sull'attività
- Per pubblicare un'esperienza: cliccare sul bottone "+" o "Nuova Esperienza"`;

    if (userNickname) {
      systemPrompt += `\n- L'utente che sta parlando si chiama: ${userNickname}`;
    }

    // Add search context
    if (searchContext?.experiences?.length > 0) {
      systemPrompt += '\n\nESPERIENZE TROVATE NEL DATABASE (usa queste informazioni per rispondere in modo pertinente):';
      searchContext.experiences.forEach((exp: any, i: number) => {
        systemPrompt += `\n${i + 1}. "${exp.title}" (categoria: ${exp.category}, ❤️ ${exp.likes_count ?? 0} like, 💬 ${exp.comments_count ?? 0} commenti): ${exp.content.substring(0, 300)}`;
      });
      systemPrompt += '\n\nQuando citi queste esperienze, descrivile brevemente. Le card visive verranno mostrate automaticamente dal frontend.';
    } else {
      systemPrompt += '\n\nNessuna esperienza trovata nel database per questa query. Se l\'utente cerca qualcosa di specifico, suggerisci di pubblicare una nuova esperienza.';
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error('AI Gateway error:', errorData);
      if (aiResponse.status === 429) throw new Error('Troppe richieste. Riprova tra poco.');
      if (aiResponse.status === 402) throw new Error('Crediti esauriti. Contatta l\'amministratore.');
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) throw new Error('Nessuna risposta dall\'AI');

    return new Response(
      JSON.stringify({ message: assistantMessage, usage: data.usage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
        message: 'Mi dispiace, si è verificato un errore. Riprova tra poco.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
