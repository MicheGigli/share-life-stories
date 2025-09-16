import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  className?: string;
}

export function FloatingActionButton({ className }: FloatingActionButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/create')}
      size="lg"
      className={cn(
        "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
        "hover:scale-110 transition-all duration-300 hover:shadow-xl",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "md:hidden", // Solo su mobile
        className
      )}
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Crea esperienza</span>
    </Button>
  );
}