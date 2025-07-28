import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SectionCardProps {
  title: string;
  description: string;
  image: string;
  variant: "mutui" | "vacanze" | "auto" | "amazon";
  stats: {
    posts: number;
    comments: number;
  };
}

export const SectionCard = ({ title, description, image, variant, stats }: SectionCardProps) => {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      <div className="relative">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <span>{stats.posts} esperienze</span>
            <span>{stats.comments} commenti</span>
          </div>
        </div>
        
        <Button variant={variant} className="w-full group">
          Esplora sezione
          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
};