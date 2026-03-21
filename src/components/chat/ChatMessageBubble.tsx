import ReactMarkdown from 'react-markdown';
import { ChatExperienceCard } from './ChatExperienceCard';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number | null;
  comments_count: number | null;
  nickname?: string;
}

interface ChatMessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  experiences?: Experience[];
}

export const ChatMessageBubble = ({ content, role, experiences }: ChatMessageBubbleProps) => {
  if (role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] p-3 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm shadow-sm whitespace-pre-wrap break-words">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      {/* Virginia avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm mt-0.5">
        V
      </div>
      <div className="max-w-[85%]">
        <div className="p-3 rounded-2xl rounded-bl-sm bg-card border border-border text-foreground text-sm shadow-sm">
          <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_a]:text-primary [&_a]:underline [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        {/* Experience cards */}
        {experiences && experiences.length > 0 && (
          <div className="mt-1 space-y-1">
            {experiences.map((exp) => (
              <ChatExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
