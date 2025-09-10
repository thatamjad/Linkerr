'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MasonryGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  gap?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const gapClasses = {
  sm: 'gap-fluid-sm',
  md: 'gap-fluid-md', 
  lg: 'gap-fluid-lg',
  xl: 'gap-fluid-xl'
}

export const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ 
    children, 
    columns = { sm: 1, md: 2, lg: 3, xl: 4 },
    gap = 'md',
    className,
    ...props 
  }, ref) => {
    const columnClasses = [
      `columns-${columns.sm || 1}`,
      columns.md && `md:columns-${columns.md}`,
      columns.lg && `lg:columns-${columns.lg}`,
      columns.xl && `xl:columns-${columns.xl}`
    ].filter(Boolean).join(' ')

    return (
      <div
        ref={ref}
        className={cn(
          // Base masonry
          'w-full',
          columnClasses,
          
          // Gap
          gapClasses[gap],
          
          // Masonry specific
          'space-y-0',
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MasonryGrid.displayName = 'MasonryGrid'

// Individual masonry item wrapper
interface MasonryItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  className?: string
}

export const MasonryItem = forwardRef<HTMLDivElement, MasonryItemProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Break inside avoid for proper masonry
          'break-inside-avoid mb-fluid-md',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

MasonryItem.displayName = 'MasonryItem'
