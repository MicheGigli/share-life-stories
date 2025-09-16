import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  animationType?: 'fade' | 'slide' | 'scale' | 'bounce';
  delay?: number;
  hoverEffect?: boolean;
}

export function AnimatedCard({ 
  children, 
  className, 
  animationType = 'fade',
  delay = 0,
  hoverEffect = true,
  ...props 
}: AnimatedCardProps) {
  const animations = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay }
    },
    slide: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, delay }
    },
    scale: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay }
    },
    bounce: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: 0.6, 
        delay,
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  };

  return (
    <motion.div
      {...animations[animationType]}
      whileHover={hoverEffect ? { 
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 }
      } : undefined}
      whileTap={hoverEffect ? { scale: 0.98 } : undefined}
    >
      <Card 
        className={cn(
          "transition-all duration-300",
          hoverEffect && "hover:shadow-lg hover:shadow-primary/10",
          className
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}