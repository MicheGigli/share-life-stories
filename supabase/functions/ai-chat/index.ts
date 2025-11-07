import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, searchContext } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('Lovable AI not configured');
    }

    // Build the system prompt with context
    let systemPrompt = `Sei l'assistente intelligente di LifeShare, una piattaforma italiana dove gli utenti condividono esperienze su mutui, vacanze, veicoli e prodotti.

Il tuo compito è:
- Aiutare gli utenti a trovare informazioni pertinenti
- Rispondere in modo amichevole e professionale
- Suggerire esperienze e contenuti rilevanti dalla piattaforma
- Essere conciso ma completo nelle risposte
- Rispondere SEMPRE in italiano

Categorie principali: Mutui, Vacanze, Veicoli (Auto), Prodotti (Amazon)`;

    // Add search context if available
    if (searchContext && (searchContext.experiences?.length > 0 || searchContext.comments?.length > 0)) {
      systemPrompt += '\n\nCONTESTO DALLA KNOWLEDGE BASE:\n';
      
      if (searchContext.experiences?.length > 0) {
        systemPrompt += '\nEsperienze rilevanti:\n';
        searchContext.experiences.forEach((exp: any, i: number) => {
          systemPrompt += `${i + 1}. "${exp.title}" (${exp.category}): ${exp.content.substring(0, 200)}...\n`;
        });
      }
      
      if (searchContext.comments?.length > 0) {
        systemPrompt += '\nCommenti rilevanti:\n';
        searchContext.comments.forEach((comment: any, i: number) => {
          systemPrompt += `${i + 1}. ${comment.content.substring(0, 150)}...\n`;
        });
      }
      
      systemPrompt += '\nUsa queste informazioni per fornire risposte accurate e cita le esperienze quando rilevanti.';
    }

    // Call Lovable AI Gateway
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
      
      if (aiResponse.status === 429) {
        throw new Error('Troppe richieste. Riprova tra poco.');
      }
      if (aiResponse.status === 402) {
        throw new Error('Crediti esauriti. Contatta l\'amministratore.');
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('Nessuna risposta dall\'AI');
    }

    return new Response(
      JSON.stringify({ 
        message: assistantMessage,
        usage: data.usage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        message: 'Mi dispiace, si è verificato un errore. Riprova tra poco.'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});