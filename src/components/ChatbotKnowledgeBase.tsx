import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Send, Bot, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const ChatbotKnowledgeBase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '👋 Ciao! Sono il tuo assistente LifeShare con intelligenza artificiale. Posso aiutarti a esplorare esperienze su mutui, vacanze, veicoli e prodotti. Chiedi pure!',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isLoading]);

  const searchKnowledgeBase = async (query: string) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) {
        return { experiences: [], comments: [] };
      }

      // Search in experiences
      const { data: experiences, error: expError } = await supabase
        .from('experiences')
        .select('id, title, content, category, likes_count, comments_count, user_id')
        .eq('is_published', true)
        .or(`title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
        .limit(5);

      if (expError) throw expError;

      // Search in comments
      const { data: comments, error: commError } = await supabase
        .from('comments')
        .select('content')
        .or(`content.ilike.%${trimmed}%`)
        .limit(3);

      if (commError) throw commError;

      return { experiences: experiences || [], comments: comments || [] };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return { experiences: [], comments: [] };
    }
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Search the knowledge base for context
      const searchResults = await searchKnowledgeBase(text);
      
      // Prepare conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        content: text
      });

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { 
          messages: conversationHistory,
          searchContext: { experiences: searchResults.experiences },
          siteUrl: window.location.origin
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Mi dispiace, non sono riuscito a generare una risposta.',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: '😔 Mi dispiace, si è verificato un errore. Riprova tra poco o riformula la domanda.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel processare la tua richiesta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAsk = (label: string) => {
    const presets: Record<string, string> = {
      'Mutui': 'Quali sono le migliori offerte per mutui a tasso fisso?',
      'Vacanze': 'Consigli per viaggi low cost in Europa?',
      'Veicoli': 'Quale auto usata mi consigli per famiglia?',
      'Prodotti': 'Prodotti più recensiti su LifeShare'
    };
    handleSendMessage(presets[label] ?? label);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-2xl z-50 bg-gradient-to-br from-primary to-primary/80 hover:scale-110 transition-transform"
        size="lg"
      >
        <div className="relative">
          <Bot className="h-7 w-7" />
          <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[420px] h-[600px] shadow-2xl z-50 flex flex-col border-2" role="dialog" aria-label="LifeShare AI Assistant" aria-modal="false">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="relative">
              <Bot className="h-5 w-5 text-primary" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold">
              LifeShare AI Assistant
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 rounded-full"
          >
            ✕
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-4 min-h-0">
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 mb-4 pr-2" aria-live="polite" aria-atomic="false">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] mx-2 p-3 rounded-2xl whitespace-pre-wrap break-words text-sm shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted/60 text-foreground rounded-bl-sm'
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted/60 p-3 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="animate-bounce delay-0">●</span>
                  <span className="animate-bounce delay-100">●</span>
                  <span className="animate-bounce delay-200">●</span>
                </div>
                <span className="text-muted-foreground">Sto pensando...</span>
              </div>
            </div>
          )}
        </div>
        
        {!isLoading && messages.length <= 2 && (
          <div className="mb-3 grid grid-cols-2 gap-2" aria-label="Domande suggerite">
            {['Mutui', 'Vacanze', 'Veicoli', 'Prodotti'].map((label) => (
              <Button 
                key={label} 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickAsk(label)}
                className="justify-start hover:bg-primary/10 border-primary/20"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {label}
              </Button>
            ))}
          </div>
        )}
        
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Chiedimi qualcosa..."
            aria-label="Scrivi un messaggio"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            aria-label="Invia messaggio"
            className="px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};