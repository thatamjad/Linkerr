'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FlexLayoutProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: boolean
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  responsive?: {
    direction?: {
      sm?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
      md?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
      lg?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
    }
    justify?: {
      sm?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
      md?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
      lg?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
    }
  }
  className?: string
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse'
}

const justifyClasses = {
  start: 'justify-start',
  end: 'justify-end',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  evenly: 'justify-evenly'
}

const alignClasses = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch'
}

const gapClasses = {
  xs: 'gap-fluid-xs',
  sm: 'gap-fluid-sm',
  md: 'gap-fluid-md',
  lg: 'gap-fluid-lg',
  xl: 'gap-fluid-xl',
  '2xl': 'gap-fluid-2xl'
}

export const FlexLayout = forwardRef<HTMLDivElement, FlexLayoutProps>(
  ({ 
    children, 
    direction = 'row',
    wrap = false,
    justify = 'start',
    align = 'start',
    gap = 'md',
    responsive,
    className,
    ...props 
  }, ref) => {
    const responsiveDirectionClasses = responsive?.direction ? [
      responsive.direction.sm && `sm:${directionClasses[responsive.direction.sm]}`,
      responsive.direction.md && `md:${directionClasses[responsive.direction.md]}`,
      responsive.direction.lg && `lg:${directionClasses[responsive.direction.lg]}`
    ].filter(Boolean).join(' ') : ''

    const responsiveJustifyClasses = responsive?.justify ? [
      responsive.justify.sm && `sm:${justifyClasses[responsive.justify.sm]}`,
      responsive.justify.md && `md:${justifyClasses[responsive.justify.md]}`,
      responsive.justify.lg && `lg:${justifyClasses[responsive.justify.lg]}`
    ].filter(Boolean).join(' ') : ''

    return (
      <div
        ref={ref}
        className={cn(
          // Base flex
          'flex',
          
          // Direction
          directionClasses[direction],
          responsiveDirectionClasses,
          
          // Wrap
          wrap && 'flex-wrap',
          
          // Justify
          justifyClasses[justify],
          responsiveJustifyClasses,
          
          // Align
          alignClasses[align],
          
          // Gap
          gapClasses[gap],
          
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

FlexLayout.displayName = 'FlexLayout'
