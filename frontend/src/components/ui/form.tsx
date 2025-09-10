'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface FormFieldContextValue {
  id: string
  name?: string
  error?: string
  required?: boolean
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(null)

export const useFormField = () => {
  const context = React.useContext(FormFieldContext)
  if (!context) {
    throw new Error('useFormField must be used within a FormField')
  }
  return context
}

interface FormFieldProps {
  children: React.ReactNode
  name?: string
  error?: string
  required?: boolean
}

const FormField = ({ children, name, error, required }: FormFieldProps) => {
  const id = React.useId()
  
  return (
    <FormFieldContext.Provider value={{ id, name, error, required }}>
      <div className="space-y-2">
        {children}
      </div>
    </FormFieldContext.Provider>
  )
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    const { id, error } = useFormField()
    
    return (
      <label
        ref={ref}
        className={cn(
          'text-sm font-semibold tracking-wide transition-colors',
          error ? 'text-destructive' : 'text-foreground',
          className
        )}
        htmlFor={id}
        {...props}
      >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
    )
  }
)
FormLabel.displayName = 'FormLabel'

const FormControl = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative', className)}
        {...props}
      />
    )
  }
)
FormControl.displayName = 'FormControl'

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground font-medium', className)}
        {...props}
      />
    )
  }
)
FormDescription.displayName = 'FormDescription'

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  type?: 'error' | 'warning' | 'success' | 'info'
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, type = 'error', ...props }, ref) => {
    const { error } = useFormField()
    const body = error || children

    if (!body) {
      return null
    }

    const iconClasses = cn(
      'w-1 h-1 rounded-full mr-2 flex-shrink-0 mt-2',
      {
        'bg-destructive': type === 'error',
        'bg-warning': type === 'warning',
        'bg-success': type === 'success',
        'bg-info': type === 'info',
      }
    )

    const textClasses = cn(
      'text-sm font-medium flex items-start',
      {
        'text-destructive': type === 'error',
        'text-warning': type === 'warning',
        'text-success': type === 'success',
        'text-info': type === 'info',
      },
      className
    )

    return (
      <p
        ref={ref}
        className={textClasses}
        {...props}
      >
        <span className={iconClasses} />
        {body}
      </p>
    )
  }
)
FormMessage.displayName = 'FormMessage'

// Enhanced Form Container
interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  variant?: 'default' | 'card' | 'glass'
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const containerClasses = cn(
      'space-y-6',
      {
        'p-8 rounded-card border border-border bg-surface shadow-card-subtle': 
          variant === 'card',
        'p-8 rounded-card bg-surface/80 backdrop-blur-md border border-border/50 shadow-glass': 
          variant === 'glass',
      },
      className
    )

    return (
      <form ref={ref} className={containerClasses} {...props}>
        {children}
      </form>
    )
  }
)
Form.displayName = 'Form'

// Form Section for grouping related fields
interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {title && (
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-muted-foreground font-medium">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)
FormSection.displayName = 'FormSection'

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
}
