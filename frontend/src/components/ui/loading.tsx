'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'shimmer' | 'pulse' | 'wave'
  shape?: 'rectangle' | 'circle' | 'text' | 'avatar' | 'card'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'shimmer', shape = 'rectangle', ...props }, ref) => {
    const baseClasses = cn(
      'relative overflow-hidden bg-surface-muted/30',
      {
        // Variants
        'animate-pulse': variant === 'pulse',
        'animate-shimmer bg-gradient-to-r from-surface-muted/30 via-surface-muted/50 to-surface-muted/30 bg-[length:200%_100%]': 
          variant === 'shimmer',
        'animate-wave': variant === 'wave',
      },
      {
        // Shapes
        'rounded-md': shape === 'rectangle',
        'rounded-full': shape === 'circle' || shape === 'avatar',
        'h-4 rounded': shape === 'text',
        'rounded-card p-6': shape === 'card',
      },
      className
    )

    if (shape === 'avatar') {
      return (
        <div
          ref={ref}
          className={cn(baseClasses, 'w-10 h-10')}
          {...props}
        />
      )
    }

    if (shape === 'card') {
      return (
        <div
          ref={ref}
          className={cn(baseClasses, 'w-full min-h-[120px]')}
          {...props}
        >
          <div className="space-y-3">
            <Skeleton variant={variant} className="h-4 w-3/4" />
            <Skeleton variant={variant} className="h-4 w-1/2" />
            <Skeleton variant={variant} className="h-8 w-full" />
          </div>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      />
    )
  }
)
Skeleton.displayName = 'Skeleton'

// Loading Spinner Component
interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'dots' | 'ring' | 'bars'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'default', ...props }, ref) => {
    const sizeClasses = {
      'xs': 'w-3 h-3',
      'sm': 'w-4 h-4',
      'md': 'w-6 h-6',
      'lg': 'w-8 h-8',
      'xl': 'w-12 h-12',
    }

    if (variant === 'dots') {
      return (
        <div
          ref={ref}
          className={cn('flex space-x-1', className)}
          {...props}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-current animate-bounce',
                {
                  'w-1 h-1': size === 'xs',
                  'w-1.5 h-1.5': size === 'sm',
                  'w-2 h-2': size === 'md',
                  'w-3 h-3': size === 'lg',
                  'w-4 h-4': size === 'xl',
                }
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '0.8s'
              }}
            />
          ))}
        </div>
      )
    }

    if (variant === 'ring') {
      return (
        <div
          ref={ref}
          className={cn(
            'animate-spin rounded-full border-2 border-current border-t-transparent',
            sizeClasses[size],
            className
          )}
          {...props}
        />
      )
    }

    if (variant === 'bars') {
      return (
        <div
          ref={ref}
          className={cn('flex space-x-1', className)}
          {...props}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={cn(
                'bg-current animate-pulse',
                {
                  'w-0.5 h-3': size === 'xs',
                  'w-1 h-4': size === 'sm',
                  'w-1 h-6': size === 'md',
                  'w-1.5 h-8': size === 'lg',
                  'w-2 h-12': size === 'xl',
                }
              )}
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      )
    }

    // Default spinner
    return (
      <div
        ref={ref}
        className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent opacity-60',
          sizeClasses[size],
          className
        )}
        {...props}
      />
    )
  }
)
Spinner.displayName = 'Spinner'

// Loading State Component
interface LoadingProps {
  text?: string
  variant?: 'overlay' | 'inline' | 'page'
  spinnerVariant?: 'default' | 'dots' | 'ring' | 'bars'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const Loading = ({
  text = 'Loading...',
  variant = 'inline',
  spinnerVariant = 'default',
  size = 'md',
  className
}: LoadingProps) => {
  if (variant === 'overlay') {
    return (
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm',
        className
      )}>
        <div className="flex flex-col items-center space-y-4 bg-surface/90 backdrop-blur-md p-8 rounded-modal border border-border/50 shadow-glass">
          <Spinner variant={spinnerVariant} size={size} />
          <p className="text-sm font-medium text-foreground">{text}</p>
        </div>
      </div>
    )
  }

  if (variant === 'page') {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center min-h-[400px] space-y-4',
        className
      )}>
        <Spinner variant={spinnerVariant} size="lg" />
        <p className="text-base font-medium text-muted-foreground">{text}</p>
      </div>
    )
  }

  // Inline variant
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      <Spinner variant={spinnerVariant} size={size} />
      <span className="text-sm font-medium text-muted-foreground">{text}</span>
    </div>
  )
}

// Content Placeholder Component
interface PlaceholderProps {
  type?: 'post' | 'profile' | 'list' | 'grid' | 'form'
  count?: number
  className?: string
}

const ContentPlaceholder = ({ 
  type = 'post', 
  count = 1, 
  className 
}: PlaceholderProps) => {
  const renderPlaceholder = () => {
    switch (type) {
      case 'post':
        return (
          <div className="space-y-4 p-6 border border-border rounded-card">
            <div className="flex items-center space-x-3">
              <Skeleton shape="avatar" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-1/6" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-32 w-full rounded" />
          </div>
        )
      
      case 'profile':
        return (
          <div className="space-y-6 p-6 border border-border rounded-card">
            <div className="flex items-center space-x-4">
              <Skeleton shape="circle" className="w-16 h-16" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3">
                <Skeleton shape="avatar" className="w-8 h-8" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        )
      
      case 'grid':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )
      
      case 'form':
        return (
          <div className="space-y-6 p-6 border border-border rounded-card">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            ))}
            <Skeleton className="h-10 w-32 rounded" />
          </div>
        )
      
      default:
        return <Skeleton className="h-24 w-full" />
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          {renderPlaceholder()}
        </div>
      ))}
    </div>
  )
}

export { 
  Skeleton, 
  Spinner, 
  Loading, 
  ContentPlaceholder 
}
