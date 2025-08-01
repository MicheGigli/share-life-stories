import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
  categoryKey 
}: ExperienceCardProps) => {
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [currentLikes, setCurrentLikes] = useState(likes);

  const getCategoryTagColor = (categoryKey: string) => {
    const colors = {
      mutui: 'bg-blue-100 text-blue-800 border-blue-200',
      vacanze: 'bg-green-100 text-green-800 border-green-200',
      auto: 'bg-orange-100 text-orange-800 border-orange-200',
      amazon: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[categoryKey as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  useEffect(() => {
    if (user) {
      checkIfLiked();
    }
  }, [user, id]);

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
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'mutui': return 'bg-mutui text-white';
      case 'vacanze': return 'bg-vacanze text-white';
      case 'auto': return 'bg-auto text-white';
      case 'amazon': return 'bg-amazon text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Link to={`/experience/${id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-muted p-2 rounded-full">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">{author}</p>
                <p className="text-xs text-muted-foreground">{date}</p>
              </div>
            </div>
            <Badge className={getCategoryColor(category)}>
              {category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-3">
            {content}
          </p>
          
          {/* Tags */}
          {tags.length > 0 && (
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`p-0 h-auto ${isLiked ? 'text-red-500' : ''}`}
                onClick={toggleLike}
              >
                <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                {currentLikes}
              </Button>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                {comments}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};