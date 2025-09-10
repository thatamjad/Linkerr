'use client'

import * as React from 'react'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = {
  default: {
    container: 'bg-surface border-border text-foreground shadow-toast hover:shadow-toast-lg transform hover:scale-[1.01]',
    icon: null,
    iconColor: '',
  },
  success: {
    container: 'bg-success/10 border-success/20 text-success-foreground backdrop-blur-sm shadow-toast-success hover:shadow-toast-success-lg transform hover:scale-[1.01] animate-notificationPop',
    icon: CheckCircle,
    iconColor: 'text-success animate-bounce-soft',
  },
  destructive: {
    container: 'bg-destructive/10 border-destructive/20 text-destructive-foreground backdrop-blur-sm shadow-toast-error hover:shadow-toast-error-lg transform hover:scale-[1.01] animate-shake-subtle',
    icon: AlertCircle,
    iconColor: 'text-destructive animate-pulse-soft',
  },
  warning: {
    container: 'bg-warning/10 border-warning/20 text-warning-foreground backdrop-blur-sm shadow-toast-warning hover:shadow-toast-warning-lg transform hover:scale-[1.01] animate-wiggle-subtle',
    icon: AlertTriangle,
    iconColor: 'text-warning animate-bounce-soft',
  },
  info: {
    container: 'bg-info/10 border-info/20 text-info-foreground backdrop-blur-sm shadow-toast-info hover:shadow-toast-info-lg transform hover:scale-[1.01] animate-slide-in-right',
    icon: Info,
    iconColor: 'text-info animate-glow-soft',
  },
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: keyof typeof toastVariants
  }
>(({ className, variant = 'default', ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-toast border p-4 pr-8 shadow-toast transition-all duration-300',
        'data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none',
        // Enhanced animations
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
        'data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full',
        'data-[state=open]:animate-slide-in-right data-[state=open]:sm:animate-slide-in-bottom',
        // Hover effects
        'hover:transform hover:-translate-y-1',
        toastVariants[variant].container,
        className
      )}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      'inline-flex h-8 shrink-0 items-center justify-center rounded-button border border-border bg-transparent px-3 text-xs font-semibold ring-offset-surface transition-all duration-200 hover:bg-surface-muted hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-destructive/30 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive',
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      'absolute right-2 top-2 rounded-button p-1 text-foreground/50 opacity-0 transition-all duration-200 hover:text-foreground hover:scale-110 hover:rotate-90 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600',
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn('text-sm font-semibold', className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn('text-sm opacity-90 font-medium', className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

// Enhanced Toast Component with Icon
interface EnhancedToastProps {
  title?: string
  description?: string
  variant?: keyof typeof toastVariants
  action?: React.ReactNode
  showIcon?: boolean
  duration?: number
  onOpenChange?: (open: boolean) => void
}

const EnhancedToast = ({
  title,
  description,
  variant = 'default',
  action,
  showIcon = true,
  duration = 5000,
  onOpenChange,
}: EnhancedToastProps) => {
  const [open, setOpen] = React.useState(true)
  const variantConfig = toastVariants[variant]
  const Icon = variantConfig.icon

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    onOpenChange?.(isOpen)
  }

  return (
    <Toast
      variant={variant}
      open={open}
      onOpenChange={handleOpenChange}
      duration={duration}
    >
      <div className="flex items-start space-x-3">
        {showIcon && Icon && (
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', variantConfig.iconColor)} />
        )}
        <div className="flex-1 space-y-1">
          {title && <ToastTitle>{title}</ToastTitle>}
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      {action && <div className="ml-auto">{action}</div>}
      <ToastClose />
    </Toast>
  )
}

// Notification Component (for in-app notifications)
interface NotificationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  title?: string
  description?: string
  showIcon?: boolean
  dismissible?: boolean
  onDismiss?: () => void
  action?: React.ReactNode
}

const Notification = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ 
    className, 
    variant = 'default', 
    title, 
    description, 
    showIcon = true, 
    dismissible = true,
    onDismiss,
    action,
    ...props 
  }, ref) => {
    const variantStyles = {
      default: 'bg-surface border-border text-foreground',
      success: 'bg-success/10 border-success/20 text-success-foreground',
      warning: 'bg-warning/10 border-warning/20 text-warning-foreground',
      error: 'bg-destructive/10 border-destructive/20 text-destructive-foreground',
      info: 'bg-info/10 border-info/20 text-info-foreground',
    }

    const icons = {
      default: null,
      success: CheckCircle,
      warning: AlertTriangle,
      error: AlertCircle,
      info: Info,
    }

    const iconColors = {
      default: '',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-destructive',
      info: 'text-info',
    }

    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex items-start space-x-3 rounded-notification border p-4 shadow-notification backdrop-blur-sm',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {showIcon && Icon && (
          <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[variant])} />
        )}
        
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className="text-sm font-semibold leading-none tracking-tight">
              {title}
            </h4>
          )}
          {description && (
            <p className="text-sm opacity-90 font-medium">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {action}
          {dismissible && (
            <button
              onClick={onDismiss}
              className="rounded-button p-1 text-foreground/50 hover:text-foreground hover:bg-surface-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }
)
Notification.displayName = 'Notification'

type ToasterToast = {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: keyof typeof toastVariants
}

export {
  type ToasterToast,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  EnhancedToast,
  Notification,
}
