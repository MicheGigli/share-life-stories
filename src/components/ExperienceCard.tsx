import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExperienceCardProps {
  title: string;
  author: string;
  content: string;
  category: string;
  likes: number;
  comments: number;
  date: string;
  tags: string[];
}

export const ExperienceCard = ({ 
  title, 
  author, 
  content, 
  category, 
  likes, 
  comments, 
  date, 
  tags 
}: ExperienceCardProps) => {
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
    <Card className="hover:shadow-lg transition-all duration-300 group">
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
        <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {content}
        </p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
        
        {/* Azioni */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <Heart className="h-4 w-4 mr-1" />
              {likes}
            </Button>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageCircle className="h-4 w-4 mr-1" />
              {comments}
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};