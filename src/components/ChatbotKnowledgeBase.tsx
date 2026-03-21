import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ChatMessageBubble } from './chat/ChatMessageBubble';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number | null;
  comments_count: number | null;
  nickname?: string;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  experiences?: Experience[];
}

const WELCOME_MESSAGE = "Ciao! 👋 Sono Virginia, l'assistente di LifeShare. Posso aiutarti a trovare esperienze su mutui, vacanze, veicoli e prodotti, o rispondere a qualsiasi domanda sul sito. Prova a chiedermi qualcosa come 'esperienze su Barcellona' oppure 'come funzionano i punti'!";

export const ChatbotKnowledgeBase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && !hasShownWelcome) {
      const timer = setTimeout(() => {
        setMessages([{
          id: 'welcome',
          content: WELCOME_MESSAGE,
          role: 'assistant',
          timestamp: new Date(),
        }]);
        setHasShownWelcome(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasShownWelcome]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const getUserNickname = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('user_id', user.id)
      .single();
    return data?.nickname ?? null;
  };

  const searchExperiences = async (query: string): Promise<Experience[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const { data, error } = await supabase
      .from('experiences')
      .select('id, title, content, category, likes_count, comments_count, user_id')
      .eq('is_published', true)
      .or(`title.ilike.%${trimmed}%,content.ilike.%${trimmed}%`)
      .limit(5);

    if (error || !data) return [];

    // Fetch nicknames for authors
    const userIds = [...new Set(data.map(e => e.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('user_id', userIds);

    const nicknameMap = new Map(profiles?.map(p => [p.user_id, p.nickname]) ?? []);

    return data.map(e => ({
      ...e,
      nickname: nicknameMap.get(e.user_id) ?? undefined,
    }));
  };

  const handleSendMessage = async (textOverride?: string) => {
    const text = (textOverride ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: text,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Search DB for relevant experiences
      const experiences = await searchExperiences(text);
      const userNickname = await getUserNickname();

      // Prepare conversation history
      const conversationHistory = messages
        .filter(m => m.id !== 'welcome' || messages.length <= 1)
        .map(msg => ({ role: msg.role, content: msg.content }));
      conversationHistory.push({ role: 'user', content: text });

      // Call Edge Function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: conversationHistory,
          searchContext: { experiences },
          siteUrl: window.location.origin,
          currentPage: window.location.pathname,
          userNickname: userNickname,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: data.message || 'Mi dispiace, non sono riuscita a generare una risposta.',
        role: 'assistant',
        timestamp: new Date(),
        experiences: experiences.length > 0 ? experiences : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: '😔 Mi dispiace, si è verificato un errore. Riprova tra poco o riformula la domanda.',
        role: 'assistant',
        timestamp: new Date(),
      }]);
      toast({
        title: "Errore",
        description: "Si è verificato un errore nel processare la richiesta.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAsk = (label: string) => {
    const presets: Record<string, string> = {
      '🏦 Mutui': 'Quali sono le migliori esperienze su mutui?',
      '✈️ Vacanze': 'Mostrami esperienze di viaggio interessanti',
      '🚗 Veicoli': 'Cerco esperienze su auto e veicoli',
      '🛒 Prodotti': 'Prodotti più consigliati dalla community',
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
    <div
      className="fixed bottom-6 right-6 w-[420px] h-[600px] shadow-2xl z-50 flex flex-col rounded-2xl border border-border bg-background overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300"
      role="dialog"
      aria-label="Virginia - LifeShare AI Assistant"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-sm">
            V
          </div>
          <div>
            <div className="font-bold text-sm text-foreground flex items-center gap-1.5">
              Virginia 🤖
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Online
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8 rounded-full"
        >
          ✕
        </Button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3 p-4 bg-muted/30"
        aria-live="polite"
      >
        {messages.map((message) => (
          <ChatMessageBubble
            key={message.id}
            content={message.content}
            role={message.role}
            experiences={message.experiences}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
              V
            </div>
            <div className="bg-card border border-border p-3 rounded-2xl rounded-bl-sm text-sm flex items-center gap-2 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-muted-foreground text-xs">Virginia sta scrivendo...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!isLoading && messages.length <= 1 && (
        <div className="px-4 pb-2 pt-1 grid grid-cols-2 gap-1.5 bg-background">
          {['🏦 Mutui', '✈️ Vacanze', '🚗 Veicoli', '🛒 Prodotti'].map((label) => (
            <Button
              key={label}
              variant="outline"
              size="sm"
              onClick={() => handleQuickAsk(label)}
              className="justify-start text-xs hover:bg-primary/10 border-primary/20"
            >
              {label}
            </Button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 p-3 border-t border-border bg-background">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Scrivi a Virginia..."
          aria-label="Scrivi un messaggio"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
          className="flex-1 text-sm"
        />
        <Button
          onClick={() => handleSendMessage()}
          disabled={!inputValue.trim() || isLoading}
          size="sm"
          aria-label="Invia messaggio"
          className="px-3"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
