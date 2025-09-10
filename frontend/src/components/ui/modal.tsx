'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    variant?: 'default' | 'blur' | 'gradient'
  }
>(({ className, variant = 'blur', ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 transition-all duration-500 ease-out',
      {
        'bg-black/50': variant === 'default',
        'bg-black/20 backdrop-blur-md': variant === 'blur',
        'bg-gradient-to-br from-black/30 via-primary/5 to-accent/5 backdrop-blur-md': 
          variant === 'gradient',
      },
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    variant?: 'default' | 'glass' | 'premium' | 'minimal'
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    showClose?: boolean
  }
>(({ 
  className, 
  children, 
  variant = 'glass', 
  size = 'md', 
  showClose = true, 
  ...props 
}, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant === 'glass' ? 'blur' : variant === 'premium' ? 'gradient' : 'default'} />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] shadow-modal border border-border overflow-hidden',
        'duration-500 ease-out transition-all',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
        'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
        // Enhanced animations
        'data-[state=open]:animate-modal-in data-[state=closed]:animate-modal-out',
        // Hover effects for premium variant
        variant === 'premium' && 'hover:shadow-modal-premium',
        {
          // Sizes
          'w-full max-w-sm': size === 'sm',
          'w-full max-w-md': size === 'md',
          'w-full max-w-lg': size === 'lg',
          'w-full max-w-2xl': size === 'xl',
          'w-[95vw] h-[95vh] max-w-none': size === 'full',
          
          // Variants with enhanced animations
          'bg-surface rounded-modal p-6': variant === 'default',
          'bg-surface/90 backdrop-blur-xl rounded-modal p-6 border-border/50': variant === 'glass',
          'bg-gradient-to-br from-surface via-surface/95 to-surface-muted/50 backdrop-blur-xl rounded-modal p-8 border-border/30 shadow-premium relative': variant === 'premium',
          'bg-surface rounded-modal p-4 border-0 shadow-minimal': variant === 'minimal',
        },
        className
      )}
      {...props}
    >
      {/* Premium shimmer effect */}
      {variant === 'premium' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 hover:translate-x-full pointer-events-none animate-shimmer-slow" />
      )}
      
      <div className="animate-slide-up-delayed">{children}</div>
      
      {showClose && (
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-button opacity-70 ring-offset-surface transition-all duration-300 hover:opacity-100 hover:bg-surface-muted/50 hover:scale-110 hover:rotate-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none p-2 group z-10">
          <X className="h-4 w-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-45" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      'text-xl font-bold leading-none tracking-tight text-foreground',
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground font-medium', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

// Enhanced Modal Component with common patterns
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  variant?: 'default' | 'glass' | 'premium' | 'minimal'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  footer?: React.ReactNode
  className?: string
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  variant = 'glass',
  size = 'md',
  showClose = true,
  footer,
  className,
}: ModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        variant={variant}
        size={size}
        showClose={showClose}
        className={className}
      >
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        
        <div className={cn('py-4', { 'py-0': !title && !description })}>
          {children}
        </div>

        {footer && (
          <DialogFooter>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Modal,
}
