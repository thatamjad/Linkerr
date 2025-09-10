'use client'

import { useState, forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Bell, MessageCircle, User, Settings, BookmarkIcon, CompassIcon, Home } from 'lucide-react'
import Image from 'next/image'

interface DesktopNavigationProps extends HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode
  searchEnabled?: boolean
  onSearch?: (query: string) => void
  notifications?: number
  messages?: number
  user?: {
    name: string
    avatar?: string
    username?: string
  }
  onProfileClick?: () => void
  className?: string
}

export const DesktopNavigation = forwardRef<HTMLElement, DesktopNavigationProps>(
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
    const [searchQuery, setSearchQuery] = useState('')

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
      e.preventDefault()
      if (onSearch && searchQuery.trim()) {
        onSearch(searchQuery.trim())
        setSearchQuery('')
      }
    }

    return (
      <nav
        ref={ref}
        className={cn(
          // Base desktop nav styles
          'sticky top-0 z-sticky',
          'h-navbar w-full',
          'bg-background/95 backdrop-blur-md',
          'border-b border-border',
          'px-fluid-lg py-3',
          
          // Desktop only
          'hidden lg:block',
          
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between h-full max-w-wide mx-auto">
          {/* Left section - Logo + Primary Nav */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center">
              {logo || (
                <div className="text-xl font-bold text-primary">
                  SocialApp
                </div>
              )}
            </div>

            {/* Primary navigation */}
            <div className="flex items-center gap-1">
              <NavButton icon={Home} label="Home" active />
              <NavButton icon={CompassIcon} label="Explore" />
              <NavButton icon={BookmarkIcon} label="Bookmarks" />
            </div>
          </div>

          {/* Center section - Search */}
          {searchEnabled && (
            <div className="flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-surface border-border focus:bg-background"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right section - Actions + Profile */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              className="relative p-2 hover:bg-surface-muted"
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
              className="relative p-2 hover:bg-surface-muted"
              aria-label={`${messages} messages`}
            >
              <MessageCircle className="w-5 h-5" />
              {messages > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-cyan text-white text-xs font-medium min-w-[18px] h-[18px] rounded-full flex items-center justify-center">
                  {messages > 99 ? '99+' : messages}
                </span>
              )}
            </Button>

            {/* Settings */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-surface-muted"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </Button>

            {/* Profile */}
            {user && (
              <Button
                variant="ghost"
                onClick={onProfileClick}
                className="flex items-center gap-3 px-3 py-2 hover:bg-surface-muted rounded-button"
              >
                {user.avatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden relative">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-surface-elevated rounded-full flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                )}
                <div className="text-left hidden xl:block">
                  <div className="font-medium text-sm text-foreground">{user.name}</div>
                  {user.username && (
                    <div className="text-xs text-muted-foreground">@{user.username}</div>
                  )}
                </div>
              </Button>
            )}
          </div>
        </div>
      </nav>
    )
  }
)

// Navigation button component
interface NavButtonProps {
  icon: React.ElementType
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

const NavButton = ({ icon: Icon, label, active = false, onClick, className }: NavButtonProps) => (
  <Button
    variant="ghost"
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-2 rounded-button',
      'transition-colors duration-200',
      'hover:bg-surface-muted',
      active && 'bg-surface text-primary font-medium',
      className
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm">{label}</span>
  </Button>
)

DesktopNavigation.displayName = 'DesktopNavigation'
