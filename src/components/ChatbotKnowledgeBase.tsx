import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export const ChatbotKnowledgeBase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Ciao! Sono il tuo assistente LifeShare. Posso aiutarti a trovare informazioni basate sulle esperienze condivise dagli utenti. Cosa vorresti sapere?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const searchKnowledgeBase = async (query: string) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) {
        return { experiences: [], comments: [] };
      }

      // Search in experiences (by title and content)
      const { data: experiences, error: expError } = await supabase
        .from('experiences')
        .select('id, title, content, category')
        .eq('is_published', true)
        .or(`title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
        .order('likes_count', { ascending: false })
        .limit(5);

      if (expError) throw expError;

      // Search in comments (content)
      const { data: comments, error: commError } = await supabase
        .from('comments')
        .select('content')
        .or(`content.ilike.%${trimmed}%`)
        .limit(5);

      if (commError) throw commError;

      return { experiences: experiences || [], comments: comments || [] };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return { experiences: [], comments: [] };
    }
  };

  const generateResponse = (query: string, searchResults: any) => {
    const escapeHtml = (str: string) =>
      String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const { experiences, comments } = searchResults;

    if (experiences.length === 0 && comments.length === 0) {
      return `Non ho trovato risultati specifici per "${escapeHtml(query)}". Prova a riformulare la domanda o chiedimi ad esempio: Mutui tasso fisso, Viaggi low cost, Recensioni auto, Prodotti consigliati.`;
    }

    let response = `<div><p>Ho trovato alcune informazioni utili su "<strong>${escapeHtml(query)}</strong>":</p>`;

    if (experiences.length > 0) {
      response += `<div class="mt-2">
        <p class="font-semibold mb-1">Esperienze correlate:</p>
        <ul class="list-disc pl-5 space-y-1">`;
      experiences.forEach((exp: any, index: number) => {
        const preview = (exp.content || '').slice(0, 140).replace(/\n/g, ' ');
        response += `<li>
            <strong>${index + 1}. ${escapeHtml(exp.title || '')}</strong> · <span class="opacity-80">${escapeHtml(exp.category || '')}</span><br/>
            <span class="opacity-80">${escapeHtml(preview)}...</span><br/>
            <a href="/experience/${escapeHtml(exp.id)}" class="underline text-primary hover:opacity-80">Apri esperienza</a>
          </li>`;
      });
      response += `</ul></div>`;
    }

    if (comments.length > 0) {
      response += `<div class="mt-3">
        <p class="font-semibold mb-1">Commenti correlati:</p>
        <ul class="list-disc pl-5 space-y-1">`;
      comments.forEach((comment: any, index: number) => {
        const text = (comment.content || '').slice(0, 100).replace(/\n/g, ' ');
        response += `<li>${index + 1}. ${escapeHtml(text)}...</li>`;
      });
      response += `</ul></div>`;
    }

    response += `<p class="mt-3">Vuoi che affini la ricerca? Dimmi una categoria (mutui, vacanze, veicoli, prodotti) o un dettaglio in più.</p></div>`;
    return response;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Search the knowledge base
      const searchResults = await searchKnowledgeBase(inputValue);
      
      // Generate response
      const botResponse = generateResponse(inputValue, searchResults);

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel processare la tua richiesta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
        size="lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-96 shadow-xl z-50 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            LifeShare Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4">
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-72">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {message.isBot ? (
                    <div
                      className="max-w-[80%] p-3 rounded-lg whitespace-pre-wrap text-sm bg-muted text-foreground"
                      dangerouslySetInnerHTML={{ __html: message.content }}
                    />
                  ) : (
                    <div className="max-w-[80%] p-3 rounded-lg whitespace-pre-wrap text-sm bg-primary text-primary-foreground">
                      {message.content}
                    </div>
                  )}
                </div>
              ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-3 rounded-lg text-sm">
                Sto cercando informazioni...
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Fai una domanda..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};