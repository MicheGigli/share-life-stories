import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Bot } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
      // Search in experiences
      const { data: experiences, error: expError } = await supabase
        .from('experiences')
        .select('title, content, category')
        .eq('is_published', true)
        .textSearch('title,content', query)
        .limit(5);

      if (expError) throw expError;

      // Search in comments
      const { data: comments, error: commError } = await supabase
        .from('comments')
        .select('content')
        .textSearch('content', query)
        .limit(5);

      if (commError) throw commError;

      return { experiences: experiences || [], comments: comments || [] };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return { experiences: [], comments: [] };
    }
  };

  const generateResponse = (query: string, searchResults: any) => {
    const { experiences, comments } = searchResults;
    
    if (experiences.length === 0 && comments.length === 0) {
      return `Mi dispiace, non ho trovato informazioni specifiche su "${query}" nelle esperienze condivise dagli utenti. Prova a riformulare la domanda o a essere più specifico.`;
    }

    let response = `Ho trovato alcune informazioni rilevanti su "${query}":\n\n`;

    if (experiences.length > 0) {
      response += "📝 **Esperienze correlate:**\n";
      experiences.forEach((exp: any, index: number) => {
        response += `${index + 1}. **${exp.title}** (Categoria: ${exp.category})\n`;
        response += `   ${exp.content.substring(0, 150)}...\n\n`;
      });
    }

    if (comments.length > 0) {
      response += "💬 **Commenti correlati:**\n";
      comments.forEach((comment: any, index: number) => {
        response += `${index + 1}. ${comment.content.substring(0, 100)}...\n`;
      });
    }

    response += "\nSpero che queste informazioni ti siano utili! Hai altre domande?";
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
              <div
                className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap text-sm ${
                  message.isBot
                    ? 'bg-muted text-foreground'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {message.content}
              </div>
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