'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'floating' | 'filled'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(!!props.defaultValue || !!props.value)

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    React.useEffect(() => {
      setHasValue(!!props.value)
    }, [props.value])

    const baseClasses = cn(
      'flex w-full transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/60 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      {
        // Default variant
        'border-2 border-border bg-surface px-4 py-3 text-base font-medium rounded-input hover:border-border/80 focus:border-primary/60 focus:ring-4 focus:ring-primary/10': 
          variant === 'default',
        
        // Floating label variant
        'border-2 border-border bg-surface/50 px-4 pt-6 pb-2 text-base font-medium rounded-input hover:border-border/80 focus:border-primary/60 focus:ring-4 focus:ring-primary/10 backdrop-blur-sm': 
          variant === 'floating',
        
        // Filled variant
        'border-0 border-b-2 border-border bg-surface-muted/30 px-4 py-4 text-base font-medium rounded-t-input hover:bg-surface-muted/50 focus:border-primary focus:bg-surface/80': 
          variant === 'filled',
      },
      {
        'border-destructive/60 focus:border-destructive focus:ring-destructive/10': error,
        'pl-12': leftIcon && variant !== 'filled',
        'pr-12': (rightIcon || isPassword) && variant !== 'filled',
      },
      className
    )

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {variant === 'floating' && label && (
          <label
            className={cn(
              'absolute left-4 transition-all duration-300 ease-out pointer-events-none select-none font-medium',
              {
                'top-2 text-xs text-primary': isFocused || hasValue,
                'top-1/2 -translate-y-1/2 text-base text-muted-foreground': !isFocused && !hasValue,
                'text-destructive': error,
              }
            )}
          >
            {label}
          </label>
        )}

        {/* Traditional Label */}
        {variant !== 'floating' && label && (
          <label className="block text-sm font-semibold text-foreground mb-2 tracking-wide">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}

          <input
            type={inputType}
            className={baseClasses}
            ref={ref}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
              props.onBlur?.(e)
            }}
            onChange={(e) => {
              setHasValue(!!e.target.value)
              props.onChange?.(e)
            }}
            placeholder={variant === 'floating' ? '' : props.placeholder}
            {...props}
          />

          {/* Right Icon or Password Toggle */}
          {(rightIcon || isPassword) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-surface-muted/50"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm font-medium text-destructive flex items-center">
            <span className="w-1 h-1 bg-destructive rounded-full mr-2" />
            {error}
          </p>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
