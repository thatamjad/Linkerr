'use client'

import { useState, forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ResponsiveSidebarProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  position?: 'left' | 'right'
  overlay?: boolean
  className?: string
}

export const ResponsiveSidebar = forwardRef<HTMLDivElement, ResponsiveSidebarProps>(
  ({ 
    children,
    collapsible = true,
    defaultCollapsed = false,
    position = 'left',
    overlay = false,
    className,
    ...props 
  }, ref) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)
    const [isVisible, setIsVisible] = useState(!overlay)

    const toggleCollapse = () => {
      setIsCollapsed(!isCollapsed)
    }

    const toggleVisibility = () => {
      setIsVisible(!isVisible)
    }

    return (
      <>
        {/* Mobile overlay backdrop */}
        <AnimatePresence>
          {overlay && isVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-overlay lg:hidden"
              onClick={() => setIsVisible(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          ref={ref}
          initial={false}
          animate={{
            width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar)',
            x: overlay && !isVisible ? (position === 'left' ? '-100%' : '100%') : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={cn(
            // Base sidebar styles
            'fixed top-0 h-screen bg-surface border-border z-modal',
            'flex flex-col',
            'overflow-hidden',
            
            // Position
            position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
            
            // Desktop behavior
            'lg:sticky lg:top-navbar lg:h-[calc(100vh-var(--navbar))] lg:z-sticky',
            
            className
          )}
          {...props}
        >
          {/* Collapse toggle */}
          {collapsible && (
            <div className="p-2 border-b border-border flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="p-1 h-8 w-8"
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  position === 'left' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
                ) : (
                  position === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {isCollapsed ? (
                <motion.div
                  key="collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="p-2"
                >
                  {/* Collapsed content - show only icons */}
                  {typeof children === 'object' && children && 'props' in children && children.props.collapsedContent || null}
                </motion.div>
              ) : (
                <motion.div
                  key="expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="p-4"
                >
                  {children}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.aside>

        {/* Mobile toggle button */}
        {overlay && (
          <Button
            onClick={toggleVisibility}
            className={cn(
              'fixed top-4 z-max lg:hidden',
              position === 'left' ? 'left-4' : 'right-4'
            )}
            size="sm"
            variant="outline"
          >
            {position === 'left' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </>
    )
  }
)

ResponsiveSidebar.displayName = 'ResponsiveSidebar'

// Sidebar section component
interface SidebarSectionProps {
  title?: string
  children: ReactNode
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}

export const SidebarSection = ({ 
  title, 
  children, 
  collapsible = false,
  defaultCollapsed = false,
  className 
}: SidebarSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
          {collapsible && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 h-6 w-6"
            >
              <ChevronRight className={cn(
                'w-3 h-3 transition-transform',
                !isCollapsed && 'transform rotate-90'
              )} />
            </Button>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Sidebar item component
interface SidebarItemProps {
  icon?: ReactNode
  children: ReactNode
  active?: boolean
  onClick?: () => void
  href?: string
  className?: string
}

export const SidebarItem = ({ 
  icon, 
  children, 
  active = false, 
  onClick, 
  href,
  className 
}: SidebarItemProps) => {
  const Component = href ? 'a' : 'button'
  
  return (
    <Component
      href={href}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-button',
        'text-left text-foreground hover:bg-surface-muted',
        'transition-colors duration-200',
        'min-h-touch',
        active && 'bg-surface-elevated text-primary font-medium',
        className
      )}
    >
      {icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </Component>
  )
}
