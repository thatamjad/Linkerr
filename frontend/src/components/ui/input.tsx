import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasContent, setHasContent] = React.useState(false);

    return (
      <div className="space-y-1">
        <div className="relative group">
          <input
            type={type}
            className={cn(
              "flex h-11 w-full rounded-input border-2 border-border/60 bg-background/50 px-4 py-3 text-sm font-medium shadow-input-subtle backdrop-blur-sm transition-all duration-300",
              "placeholder:text-muted-foreground/70 placeholder:font-normal",
              "hover:border-border hover:shadow-input hover:bg-background/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:shadow-input-premium focus-visible:bg-background",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50",
              // File input styles
              "file:border-0 file:bg-primary/10 file:text-primary file:text-sm file:font-semibold file:rounded-button-sm file:px-3 file:py-1 file:mr-3 file:transition-colors file:hover:bg-primary/20",
              // Error state
              error && "border-destructive/60 focus-visible:ring-destructive/20 focus-visible:border-destructive hover:border-destructive animate-shake",
              // Focus animation
              isFocused && "animate-glow-subtle",
              className
            )}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            onChange={(e) => {
              setHasContent(e.target.value.length > 0);
              props.onChange?.(e);
            }}
            {...props}
          />
          
          {/* Animated border accent */}
          <div className={cn(
            "absolute inset-0 rounded-input border-2 border-primary/40 opacity-0 transition-all duration-300 pointer-events-none",
            isFocused && "opacity-100 animate-pulse-border"
          )} />
          
          {/* Success indicator */}
          {hasContent && !error && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-fade-in">
              <div className="h-2 w-2 rounded-full bg-accent-emerald animate-ping" />
              <div className="absolute inset-0 h-2 w-2 rounded-full bg-accent-emerald" />
            </div>
          )}
        </div>
        
        {error && (
          <p className="text-sm text-destructive font-medium animate-slide-down flex items-center gap-1">
            <span className="animate-bounce">⚠</span>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
