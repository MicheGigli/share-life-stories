import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Experience {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number | null;
  comments_count: number | null;
  user_id?: string;
  nickname?: string;
}

const categoryEmoji: Record<string, string> = {
  mutui: '🏦',
  vacanze: '✈️',
  auto: '🚗',
  amazon: '🛒',
};

const categoryColors: Record<string, string> = {
  mutui: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  vacanze: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  auto: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  amazon: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export const ChatExperienceCard = ({ experience }: { experience: Experience }) => {
  const navigate = useNavigate();

  const preview = experience.content.length > 160
    ? experience.content.substring(0, 160) + '...'
    : experience.content;

  return (
    <div
      className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow p-3 my-2 cursor-pointer group"
      onClick={() => navigate(`/experience/${experience.id}`)}
    >
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-lg">{categoryEmoji[experience.category] || '📝'}</span>
        <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight flex-1">
          {experience.title}
        </h4>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${categoryColors[experience.category] || 'bg-muted text-muted-foreground'}`}>
          {experience.category}
        </span>
        {experience.nickname && (
          <span className="text-[11px] text-muted-foreground">@{experience.nickname}</span>
        )}
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{preview}</p>

      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" /> {experience.likes_count ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3 w-3" /> {experience.comments_count ?? 0}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-[11px] text-primary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/experience/${experience.id}`);
          }}
        >
          Leggi <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};
