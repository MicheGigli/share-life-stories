import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Moderating content:', content.substring(0, 100) + '...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Sei un moderatore di contenuti per una piattaforma italiana di condivisione esperienze. 
            Analizza il testo e determina se contiene:
            - Parolacce o linguaggio volgare
            - Contenuti razzisti o discriminatori
            - Blasfemie
            - Incitamenti alla violenza, guerra o odio
            - Contenuti inappropriati o offensivi
            
            Rispondi SOLO con un JSON nel formato: {"isAppropriate": true/false, "reason": "motivo se inappropriato"}
            Se il contenuto è appropriato, reason deve essere una stringa vuota.`
          },
          { role: 'user', content: content }
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to moderate content' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const moderationResult = data.choices[0].message.content;
    
    console.log('Moderation result:', moderationResult);
    
    try {
      const parsedResult = JSON.parse(moderationResult);
      return new Response(
        JSON.stringify(parsedResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (parseError) {
      console.error('Failed to parse moderation result:', parseError);
      // Fallback: if AI response is not valid JSON, assume content is appropriate
      return new Response(
        JSON.stringify({ isAppropriate: true, reason: "" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in moderate-content function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});