'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface AnimatedElementProps extends React.HTMLAttributes<HTMLElement> {
  animation?: string
  delay?: number
  duration?: number
  trigger?: 'onView' | 'onHover' | 'onFocus' | 'immediate'
  children: React.ReactNode
  as?: React.ElementType
}

const AnimatedElement = React.forwardRef<HTMLElement, AnimatedElementProps>(
  ({ 
    className, 
    animation = 'fade-in',
    delay = 0, 
    duration,
    trigger = 'immediate',
    children,
    as = 'div',
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = React.useState(trigger === 'immediate')
    const [isHovered, setIsHovered] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const elementRef = React.useRef<HTMLElement>(null)

    // Intersection Observer for scroll-triggered animations
    React.useEffect(() => {
      if (trigger !== 'onView') return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true)
              observer.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.1 }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => observer.disconnect()
    }, [trigger])

    const shouldAnimate = () => {
      switch (trigger) {
        case 'immediate':
          return isVisible
        case 'onView':
          return isVisible
        case 'onHover':
          return isHovered
        case 'onFocus':
          return isFocused
        default:
          return false
      }
    }

    const Component = as as React.ElementType

    const style = {
      ...props.style,
      animationDelay: delay ? `${delay}ms` : undefined,
      animationDuration: duration ? `${duration}ms` : undefined,
    }

    return (
      <Component
        ref={ref || elementRef}
        className={cn(
          shouldAnimate() && `animate-${animation}`,
          className
        )}
        style={style}
        onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
          setIsHovered(true)
          props.onMouseEnter?.(e)
        }}
        onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
          setIsHovered(false)
          props.onMouseLeave?.(e)
        }}
        onFocus={(e: React.FocusEvent<HTMLElement>) => {
          setIsFocused(true)
          props.onFocus?.(e)
        }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          setIsFocused(false)
          props.onBlur?.(e)
        }}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

AnimatedElement.displayName = 'AnimatedElement'

// Predefined animation components for common use cases
export const FadeIn = ({ children, delay = 0, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="fade-in" delay={delay} {...props}>
    {children}
  </AnimatedElement>
)

export const SlideUp = ({ children, delay = 0, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="slide-up" delay={delay} {...props}>
    {children}
  </AnimatedElement>
)

export const SlideInLeft = ({ children, delay = 0, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="slide-in-left" delay={delay} {...props}>
    {children}
  </AnimatedElement>
)

export const SlideInRight = ({ children, delay = 0, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="slide-in-right" delay={delay} {...props}>
    {children}
  </AnimatedElement>
)

export const ScaleIn = ({ children, delay = 0, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="scale-in" delay={delay} {...props}>
    {children}
  </AnimatedElement>
)

export const BounceSoft = ({ children, trigger = 'onHover', ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="bounce-soft" trigger={trigger} {...props}>
    {children}
  </AnimatedElement>
)

export const Wiggle = ({ children, trigger = 'onHover', ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="wiggle" trigger={trigger} {...props}>
    {children}
  </AnimatedElement>
)

export const Tada = ({ children, trigger = 'onView', ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="tada" trigger={trigger} {...props}>
    {children}
  </AnimatedElement>
)

export const Float = ({ children, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="float" {...props}>
    {children}
  </AnimatedElement>
)

export const Glow = ({ children, ...props }: Omit<AnimatedElementProps, 'animation'>) => (
  <AnimatedElement animation="glow" {...props}>
    {children}
  </AnimatedElement>
)

// Utility hook for programmatic animations
export const useAnimation = () => {
  const [isAnimating, setIsAnimating] = React.useState(false)

  const triggerAnimation = React.useCallback((element: HTMLElement, animation: string, duration = 1000) => {
    if (!element) return

    setIsAnimating(true)
    element.style.animation = `${animation} ${duration}ms ease-out`
    
    const handleAnimationEnd = () => {
      element.style.animation = ''
      setIsAnimating(false)
      element.removeEventListener('animationend', handleAnimationEnd)
    }

    element.addEventListener('animationend', handleAnimationEnd)
  }, [])

  return { triggerAnimation, isAnimating }
}

// Animation sequence utility
export const useAnimationSequence = () => {
  const [currentStep, setCurrentStep] = React.useState(-1)
  
  const playSequence = React.useCallback((animations: Array<{ 
    element: HTMLElement, 
    animation: string, 
    delay?: number,
    duration?: number 
  }>) => {
    setCurrentStep(0)
    
    animations.forEach((anim, index) => {
      setTimeout(() => {
        anim.element.style.animation = `${anim.animation} ${anim.duration || 300}ms ease-out`
        setCurrentStep(index + 1)
        
        const handleEnd = () => {
          if (index === animations.length - 1) {
            setCurrentStep(-1)
          }
          anim.element.removeEventListener('animationend', handleEnd)
        }
        
        anim.element.addEventListener('animationend', handleEnd)
      }, anim.delay || index * 100)
    })
  }, [])

  return { playSequence, currentStep }
}

export { AnimatedElement }
