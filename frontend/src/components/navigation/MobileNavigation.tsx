'use client'

import { useState, useEffect, forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Menu, X, Search, Bell, MessageCircle, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface MobileNavigationProps extends HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  searchEnabled?: boolean
  onSearch?: (query: string) => void
  notifications?: number
  messages?: number
  user?: {
    name: string
    avatar?: string
  }
  onProfileClick?: () => void
  className?: string
}

export const MobileNavigation = forwardRef<HTMLElement, MobileNavigationProps>(
  ({ 
    logo,
    searchEnabled = true,
    onSearch,
    notifications = 0,
    messages = 0,
    user,
    onProfileClick,
    className,
    ...props 
  }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Close menu on escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMenuOpen(false)
          setIsSearchOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      if (onSearch && searchQuery.trim()) {
        onSearch(searchQuery.trim())
        setIsSearchOpen(false)
        setSearchQuery('')
      }
    }

    return (
      <nav
        ref={ref}
        className={cn(
          // Base mobile nav styles
          'sticky top-0 z-sticky',
          'h-navbar w-full',
          'bg-background/95 backdrop-blur-md',
          'border-b border-border',
          'px-fluid-md py-2',
          
          // Mobile first, hidden on desktop
          'block lg:hidden',
          
          className
        )}
        {...props}
      >
        {/* Main navigation bar */}
        <div className="flex items-center justify-between h-full max-w-content mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            {logo || (
              <div className="text-fluid-lg font-bold text-primary">
                SocialApp
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {/* Search toggle */}
            {searchEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="relative p-2 min-w-touch min-h-touch"
                aria-label="Open search"
              >
                <Search className="w-5 h-5" />
              </Button>
            )}

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 min-w-touch min-h-touch"
              aria-label={`${notifications} notifications`}
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {notifications > 99 ? '99+' : notifications}
                </span>
              )}
            </Button>

            {/* Messages */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 min-w-touch min-h-touch"
              aria-label={`${messages} messages`}
            >
              <MessageCircle className="w-5 h-5" />
              {messages > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-cyan text-white text-xs font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {messages > 99 ? '99+' : messages}
                </span>
              )}
            </Button>

            {/* Profile/Menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="relative p-2 min-w-touch min-h-touch"
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <AnimatePresence mode="wait">
                {isMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.div>
                ) : user?.avatar ? (
                  <motion.div
                    key="avatar"
                    className="w-6 h-6 rounded-full overflow-hidden relative"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-5 h-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Search overlay */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-background border-b border-border p-fluid-md"
            >
              <form onSubmit={handleSearch} className="max-w-content mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-10 pr-4 bg-surface rounded-input border border-border focus:ring-2 focus:ring-ring focus:border-transparent"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile menu overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-overlay"
                onClick={() => setIsMenuOpen(false)}
              />

              {/* Menu content */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full left-fluid-md right-fluid-md bg-surface border border-border rounded-card shadow-card-premium z-modal p-6 max-h-[80vh] overflow-y-auto"
              >
                {/* User info */}
                {user && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-button hover:bg-surface-muted transition-colors cursor-pointer mb-6"
                    onClick={() => {
                      onProfileClick?.()
                      setIsMenuOpen(false)
                    }}
                  >
                    {user.avatar ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden relative">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-surface-elevated rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-foreground">{user.name}</div>
                      <div className="text-sm text-muted-foreground">View profile</div>
                    </div>
                  </div>
                )}

                {/* Navigation items */}
                <div className="space-y-2">
                  <MenuItem onClick={() => setIsMenuOpen(false)}>
                    Home
                  </MenuItem>
                  <MenuItem onClick={() => setIsMenuOpen(false)}>
                    Explore
                  </MenuItem>
                  <MenuItem onClick={() => setIsMenuOpen(false)}>
                    Following
                  </MenuItem>
                  <MenuItem onClick={() => setIsMenuOpen(false)}>
                    Bookmarks
                  </MenuItem>
                  <MenuItem onClick={() => setIsMenuOpen(false)}>
                    Settings
                  </MenuItem>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    )
  }
)

// Menu item component
interface MenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

const MenuItem = ({ children, onClick, className }: MenuItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      'w-full text-left px-3 py-3 rounded-button',
      'text-foreground hover:bg-surface-muted',
      'transition-colors duration-200',
      'min-h-touch',
      className
    )}
  >
    {children}
  </button>
)

MobileNavigation.displayName = 'MobileNavigation'
