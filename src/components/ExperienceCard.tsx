import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, User, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LevelIndicator } from '@/components/gamification/LevelIndicator';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FollowButton } from './FollowButton';
import { BookmarkButton } from './BookmarkButton';
import { ReactionButtons } from './ReactionButtons';

interface ExperienceCardProps {
  id: string;
  title: string;
  author: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  date: string;
  tags: string[];
  imageUrl?: string | null;
  categoryKey?: string;
  userId?: string;
  compact?: boolean;
  views?: number;
}

export const ExperienceCard = ({ 
  id, 
  title, 
  author, 
  content, 
  category, 
  likes, 
  comments, 
  date, 
  tags, 
  imageUrl,
  categoryKey,
  userId,
  compact = false,
  views = 0
}: ExperienceCardProps) => {
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { trackExperienceView } = useAnalytics();

  const handleCardClick = () => {
    trackExperienceView(id, category);
    navigate(`/experience/${id}`);
  };
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);
  const [authorLevel, setAuthorLevel] = useState<number | null>(null);

  const getCategoryTagColor = (categoryKey: string) => {
    const colors = {
      mutui: 'bg-mutui text-mutui-foreground border-mutui',
      vacanze: 'bg-vacanze text-vacanze-foreground border-vacanze',
      veicoli: 'bg-auto text-auto-foreground border-auto',
      prodotti: 'bg-amazon text-amazon-foreground border-amazon',
      auto: 'bg-auto text-auto-foreground border-auto',
      amazon: 'bg-amazon text-amazon-foreground border-amazon'
    };
    return colors[categoryKey as keyof typeof colors] || 'bg-muted text-muted-foreground border-muted';
  };

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, id]);

  useEffect(() => {
    const fetchLevel = async () => {
      if (!userId) return;
      const { data } = await supabase
        .from('user_points')
        .select('current_level')
        .eq('user_id', userId)
        .single();
      setAuthorLevel(data?.current_level || 1);
    };
    fetchLevel();
  }, [userId]);

  const checkIfLiked = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('experience_id', id)
      .single();

    setIsLiked(!!data);
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Accesso richiesto",
        description: "Devi essere autenticato per mettere like",
        variant: "destructive",
      });
      return;
    }

    if (isLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('experience_id', id);

      if (!error) {
        setIsLiked(false);
        setCurrentLikes(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          experience_id: id
        });

      if (!error) {
        setIsLiked(true);
        setCurrentLikes(prev => prev + 1);
      }
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/experience/${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiato", 
        description: url
      });
    } catch (error) {
      // Fallback
      window.prompt("Copia il link dell'esperienza:", url);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'mutui': return 'bg-mutui text-white';
      case 'vacanze': return 'bg-vacanze text-white';
      case 'veicoli': return 'bg-auto text-white';
      case 'prodotti': return 'bg-amazon text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getCategoryDisplayName = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'auto': return 'Veicoli';
      case 'amazon': return 'Prodotti';
      case 'mutui': return 'Mutui';
      case 'vacanze': return 'Vacanze';
      default: return cat;
    }
  };
  return (
    <div onClick={handleCardClick}>
      <Card className={`hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group cursor-pointer hover:scale-[1.02] hover:-translate-y-1 ${compact ? 'text-sm' : ''}`}>
        <CardHeader className={compact ? "pb-2" : "pb-3"}>
          <div className="flex items-start justify-between">
            <div 
              className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity rounded-lg p-1 -m-1"
              onClick={(e) => {
                e.stopPropagation();
                if (userId) navigate(`/profile/${userId}`);
              }}
            >
              <div className="bg-muted p-2 rounded-full">
                <User className={compact ? "h-3 w-3" : "h-4 w-4"} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{author}</p>
                  {authorLevel && <LevelIndicator level={authorLevel} size="sm" showLabel={false} />}
                </div>
                <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-xs'}`}>{date}</p>
              </div>
            </div>
            <Badge className={getCategoryColor(category)}>
              {getCategoryDisplayName(category)}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {imageUrl && !compact && (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <h3 className={`font-bold mb-3 group-hover:text-primary transition-all duration-300 group-hover:scale-105 ${compact ? 'text-sm' : 'text-lg'}`}>
            {title}
          </h3>
          <p className={`text-muted-foreground mb-4 line-clamp-3 ${compact ? 'text-xs' : ''}`}>
            {content}
          </p>
          
          {/* Tags */}
          {tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className={`text-xs ${categoryKey ? getCategoryTagColor(categoryKey) : 'bg-gray-100 text-gray-800 border-gray-200'}`}
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* Azioni */}
          <div className="space-y-3">
            {/* Advanced Reactions */}
            {!compact && (
              <ReactionButtons 
                experienceId={id} 
                showCounts={true}
                compact={true}
              />
            )}
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`flex items-center text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                  <MessageCircle className={compact ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1"} />
                  {comments}
                </div>
                {userId && userId !== user?.id && !compact && (
                  <FollowButton userId={userId} size="sm" />
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!compact && <BookmarkButton experienceId={id} />}
                <Button variant="ghost" size={compact ? "sm" : "sm"} onClick={handleShare} aria-label="Condividi esperienza">
                  <Share2 className={compact ? "h-3 w-3" : "h-4 w-4"} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};