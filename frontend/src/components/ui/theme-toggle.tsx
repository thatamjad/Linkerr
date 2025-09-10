'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="rounded-xl">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="rounded-xl hover:bg-surface-muted border border-border/50 
                 hover:border-primary/20 transition-all duration-300 
                 hover:shadow-glow group relative overflow-hidden
                 dark:hover:shadow-glow dark:glass-morphism"
    >
      {/* Background gradient for dark mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 dark:from-primary/10 dark:to-accent/10" />
      
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-primary transition-all duration-300 group-hover:text-accent group-hover:scale-110 relative z-10" />
      ) : (
        <Sun className="h-4 w-4 text-accent transition-all duration-300 group-hover:text-primary group-hover:scale-110 group-hover:rotate-90 relative z-10" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
