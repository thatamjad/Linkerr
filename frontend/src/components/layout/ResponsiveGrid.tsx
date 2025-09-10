'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ResponsiveGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  columns?: 'auto-fit-min' | 'auto-fit-sm' | 'auto-fit-md' | 'auto-fill-min' | 'auto-fill-sm' | 'custom'
  gap?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  minItemWidth?: string
  maxColumns?: number
  className?: string
}

const columnClasses = {
  'auto-fit-min': 'grid-cols-auto-fit-min',
  'auto-fit-sm': 'grid-cols-auto-fit-sm', 
  'auto-fit-md': 'grid-cols-auto-fit-md',
  'auto-fill-min': 'grid-cols-auto-fill-min',
  'auto-fill-sm': 'grid-cols-auto-fill-sm',
  'custom': ''
}

const gapClasses = {
  sm: 'gap-fluid-sm',
  md: 'gap-fluid-md',
  lg: 'gap-fluid-lg',
  xl: 'gap-fluid-xl',
  '2xl': 'gap-fluid-2xl'
}

export const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ 
    children, 
    columns = 'auto-fit-sm',
    gap = 'md',
    minItemWidth,
    maxColumns,
    className,
    ...props 
  }, ref) => {
    const customGridStyle = columns === 'custom' && minItemWidth ? {
      gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`
    } : undefined

    const maxColumnStyle = maxColumns ? {
      ...customGridStyle,
      gridTemplateColumns: `repeat(auto-fit, minmax(max(${minItemWidth || '280px'}, calc((100% - ${maxColumns - 1} * var(--gap)) / ${maxColumns})), 1fr))`
    } : customGridStyle

    return (
      <div
        ref={ref}
        className={cn(
          // Base grid
          'grid w-full',
          
          // Responsive columns
          columnClasses[columns],
          
          // Gap
          gapClasses[gap],
          
          className
        )}
        style={maxColumnStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

ResponsiveGrid.displayName = 'ResponsiveGrid'
