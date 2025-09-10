import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group rounded-card border bg-surface text-foreground shadow-card-subtle transition-all duration-500 overflow-hidden relative hover:shadow-card-premium transform hover:-translate-y-1 dark:shadow-md",
  {
    variants: {
      variant: {
        default: "border-border/50 hover:border-primary/20 hover:animate-glow-subtle hover:bg-surface/95 dark:hover:shadow-glow dark:glass-morphism",
        glass: "glass-effect border-border/30 hover:border-primary/20 backdrop-blur-md hover:backdrop-blur-lg hover:animate-shimmer-subtle dark:glass-morphism dark:hover:shadow-glow-accent",
        premium: "bg-gradient-to-br from-surface to-surface-muted border-primary/20 shadow-card-premium hover:shadow-card-premium-lg hover:scale-[1.02] hover:animate-float-subtle dark:card-glow dark:hover:shadow-glow",
        elevated: "bg-surface-elevated border-border/40 shadow-card-premium hover:shadow-card-premium-lg hover:scale-[1.01] hover:animate-bounce-subtle dark:hover:shadow-glow dark:interactive-element",
        interactive: "border-border/50 hover:border-primary/30 hover:shadow-card-premium cursor-pointer hover:bg-gradient-to-br hover:from-surface hover:to-surface-muted/50 hover:animate-pulse-subtle dark:interactive-element dark:hover:shadow-glow",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant }), className)}
    {...props}
  >
    {children}
    
    {/* Subtle shimmer effect overlay */}
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full pointer-events-none dark:via-white/10" />
    
    {/* Interactive glow border - enhanced for dark mode */}
    <div className="absolute inset-0 rounded-card opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 blur-sm -z-10 dark:from-primary/20 dark:via-accent/20 dark:to-primary/20 dark:blur-md" />
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 transition-all duration-300", className)}
    {...props}
  >
    <div className="transition-transform duration-300 group-hover:translate-y-[-2px]">
      {children}
    </div>
  </div>
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-bold leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-muted-foreground font-medium leading-relaxed transition-colors duration-300 group-hover:text-muted-foreground/90",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0 transition-all duration-300", className)} {...props}>
    <div className="transition-transform duration-300 group-hover:translate-y-[-1px]">
      {children}
    </div>
  </div>
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center p-6 pt-0 border-t border-border/50 transition-all duration-300 group-hover:border-border",
      className
    )}
    {...props}
  >
    <div className="transition-transform duration-300 group-hover:translate-y-[-1px] w-full">
      {children}
    </div>
  </div>
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
