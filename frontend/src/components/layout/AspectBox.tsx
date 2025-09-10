'use client'

import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AspectBoxProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  ratio?: 'square' | 'video' | 'photo' | 'portrait' | 'wide' | 'golden' | 'story' | 'card' | 'hero'
  className?: string
}

const ratioClasses = {
  square: 'aspect-square',
  video: 'aspect-video',
  photo: 'aspect-photo',
  portrait: 'aspect-portrait',
  wide: 'aspect-wide',
  golden: 'aspect-golden',
  story: 'aspect-story',
  card: 'aspect-card',
  hero: 'aspect-hero'
}

export const AspectBox = forwardRef<HTMLDivElement, AspectBoxProps>(
  ({ children, ratio = 'square', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base aspect ratio container
          'relative w-full overflow-hidden',
          
          // Aspect ratio
          ratioClasses[ratio],
          
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    )
  }
)

AspectBox.displayName = 'AspectBox'
