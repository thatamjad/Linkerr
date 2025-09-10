"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 hover:from-blue-700 hover:to-indigo-800 active:scale-[0.98] dark:from-blue-500 dark:via-blue-600 dark:to-indigo-600 dark:shadow-blue-400/30 dark:hover:shadow-blue-400/50",
        destructive:
          "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 hover:from-red-700 hover:to-red-800 active:scale-[0.98] dark:from-red-500 dark:to-red-600 dark:shadow-red-400/30 dark:hover:shadow-red-400/50",
        outline:
          "border-2 border-gray-200/50 bg-white/50 backdrop-blur-sm text-gray-900 shadow-sm hover:bg-gray-50/80 hover:border-gray-300 hover:shadow-md active:scale-[0.98] dark:border-gray-600/60 dark:bg-gray-900/60 dark:text-gray-200 dark:hover:bg-gray-800/80 dark:hover:border-gray-500/80 dark:backdrop-blur-md",
        secondary:
          "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-sm hover:shadow-md hover:from-gray-200 hover:to-gray-300 active:scale-[0.98] dark:from-gray-800 dark:to-gray-700 dark:text-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 dark:shadow-gray-900/30",
        ghost:
          "text-gray-700 hover:bg-gray-100/80 hover:text-gray-900 active:scale-[0.98] dark:text-gray-300 dark:hover:bg-gray-800/60 dark:hover:text-gray-100 dark:hover:shadow-sm dark:hover:shadow-gray-900/20",
        link: "text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 active:scale-[0.98] dark:text-blue-400 dark:hover:text-blue-300",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
        
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
        )}
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
