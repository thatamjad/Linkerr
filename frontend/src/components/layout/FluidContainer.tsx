'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FluidContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  centerContent?: boolean
  constrainHeight?: boolean
  className?: string
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-content',
  full: 'max-w-full'
}

const paddingClasses = {
  none: '',
  sm: 'px-fluid-sm py-fluid-xs',
  md: 'px-fluid-md py-fluid-sm',
  lg: 'px-fluid-lg py-fluid-md',
  xl: 'px-fluid-xl py-fluid-lg'
}

export const FluidContainer = forwardRef<HTMLDivElement, FluidContainerProps>(
  ({ 
    children, 
    size = 'xl', 
    padding = 'md',
    centerContent = false,
    constrainHeight = false,
    className,
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base container styles
          'w-full mx-auto',
          
          // Size constraints
          sizeClasses[size],
          
          // Padding
          paddingClasses[padding],
          
          // Content centering
          centerContent && 'flex items-center justify-center',
          
          // Height constraints
          constrainHeight && 'min-h-screen-mobile md:min-h-screen-desktop',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FluidContainer.displayName = 'FluidContainer'
