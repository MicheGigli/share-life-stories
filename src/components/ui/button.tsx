import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-glow hover:scale-[1.02]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:scale-[1.02]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm hover:shadow-md hover:scale-[1.02]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm hover:shadow-md hover:scale-[1.02]",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.02]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow transition-colors",
        hero: "bg-gradient-hero text-white shadow-elegant hover:shadow-glow hover:scale-105 hover:bg-gradient-hero-glow font-semibold",
        mutui: "bg-gradient-mutui text-white hover:shadow-glow shadow-elegant hover:scale-[1.02] font-medium",
        vacanze: "bg-gradient-vacanze text-white hover:shadow-glow shadow-elegant hover:scale-[1.02] font-medium",
        auto: "bg-gradient-auto text-white hover:shadow-glow shadow-elegant hover:scale-[1.02] font-medium",
        amazon: "bg-gradient-amazon text-white hover:shadow-glow shadow-elegant hover:scale-[1.02] font-medium",
        glass: "glass text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-elegant hover:shadow-glow",
        premium: "bg-gradient-to-r from-primary via-primary-glow to-primary text-white shadow-glow hover:shadow-hover hover:scale-105 animate-pulse-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-sm",
        lg: "h-12 rounded-lg px-8 text-base font-medium",
        xl: "h-14 rounded-lg px-12 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
