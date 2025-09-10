import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Modern Color System
      colors: {
        // Background System
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        
        // Premium Brand Colors
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        
        // Surface System
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          muted: 'hsl(var(--surface-muted))',
          elevated: 'hsl(var(--surface-elevated))',
        },
        
        // Modern Accent Colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          purple: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            300: '#d8b4fe',
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7c3aed',
            800: '#6b21a8',
            900: '#581c87',
            950: '#3b0764',
            DEFAULT: '#8b5cf6',
            light: '#a78bfa',
            dark: '#7c3aed',
          },
          cyan: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63',
            950: '#083344',
            DEFAULT: '#06b6d4',
            light: '#67e8f9',
            dark: '#0891b2',
          },
          emerald: {
            DEFAULT: '#10b981',
            light: '#34d399',
            dark: '#059669',
          },
          rose: {
            DEFAULT: '#f43f5e',
            light: '#fb7185',
            dark: '#e11d48',
          },
        },
        
        // Enhanced Semantic Colors
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          foreground: 'hsl(138, 62%, 47%)',
        },
        warning: {
          DEFAULT: 'hsl(38, 92%, 50%)',
          foreground: 'hsl(48, 96%, 89%)',
        },
        info: {
          DEFAULT: 'hsl(204, 94%, 94%)',
          foreground: 'hsl(204, 80%, 16%)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      
      // Modern Typography
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter', 
          'ui-sans-serif', 
          'system-ui', 
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono Variable',
          'JetBrains Mono', 
          'ui-monospace', 
          'SFMono-Regular',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace'
        ],
        display: [
          'Cal Sans',
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif'
        ],
      },
      
      // Enhanced Typography Scale
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem', letterSpacing: '0.025em' }],
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.375rem', letterSpacing: '0.025em' }],
        'base': ['1rem', { lineHeight: '1.625rem', letterSpacing: '0.015em' }],
        'lg': ['1.125rem', { lineHeight: '1.875rem', letterSpacing: '0.015em' }],
        'xl': ['1.25rem', { lineHeight: '2rem', letterSpacing: '0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2.25rem', letterSpacing: '0.01em' }],
        '3xl': ['1.875rem', { lineHeight: '2.5rem', letterSpacing: '0.01em' }],
        '4xl': ['2.25rem', { lineHeight: '2.75rem', letterSpacing: '0.005em' }],
        '5xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '0.005em' }],
        '6xl': ['3.75rem', { lineHeight: '4rem', letterSpacing: '0' }],
        '7xl': ['4.5rem', { lineHeight: '4.75rem', letterSpacing: '-0.005em' }],
        '8xl': ['6rem', { lineHeight: '6.25rem', letterSpacing: '-0.01em' }],
        '9xl': ['8rem', { lineHeight: '8.25rem', letterSpacing: '-0.015em' }],
        
        // Fluid responsive typography for Phase 5
        'fluid-xs': ['clamp(0.625rem, 0.5rem + 0.5vw, 0.75rem)', { lineHeight: '1.2' }],
        'fluid-sm': ['clamp(0.75rem, 0.625rem + 0.5vw, 0.875rem)', { lineHeight: '1.3' }],
        'fluid-base': ['clamp(0.875rem, 0.75rem + 0.5vw, 1rem)', { lineHeight: '1.5' }],
        'fluid-lg': ['clamp(1rem, 0.875rem + 0.5vw, 1.125rem)', { lineHeight: '1.4' }],
        'fluid-xl': ['clamp(1.125rem, 1rem + 0.5vw, 1.25rem)', { lineHeight: '1.3' }],
        'fluid-2xl': ['clamp(1.25rem, 1rem + 1vw, 1.5rem)', { lineHeight: '1.2' }],
        'fluid-3xl': ['clamp(1.5rem, 1.125rem + 1.5vw, 1.875rem)', { lineHeight: '1.1' }],
        'fluid-4xl': ['clamp(1.875rem, 1.25rem + 2vw, 2.25rem)', { lineHeight: '1.05' }],
        'fluid-5xl': ['clamp(2.25rem, 1.5rem + 3vw, 3rem)', { lineHeight: '1' }],
      },
      
      // Enhanced Letter Spacing
      letterSpacing: {
        tightest: '-0.075em',
        tighter: '-0.05em', 
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
        'heading': '-0.02em',
        'body': '0.015em',
      },
      
      // Enhanced Spacing with Phase 5 additions
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
        
        // Layout-specific spacing for Phase 5
        'sidebar': '280px',
        'sidebar-collapsed': '80px',
        'navbar': '60px',
        'footer': '80px',
        'panel': '320px',
        'content-max': '1200px',
        'reading-width': '65ch',
        
        // Fluid spacing system
        'fluid-xs': 'clamp(0.5rem, 1vw, 0.75rem)',
        'fluid-sm': 'clamp(0.75rem, 1.5vw, 1rem)', 
        'fluid-md': 'clamp(1rem, 2vw, 1.5rem)',
        'fluid-lg': 'clamp(1.5rem, 3vw, 2rem)',
        'fluid-xl': 'clamp(2rem, 4vw, 3rem)',
        'fluid-2xl': 'clamp(2.5rem, 5vw, 4rem)',
        'fluid-3xl': 'clamp(3rem, 6vw, 5rem)',
      },
      
      // Advanced Border Radius System
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        DEFAULT: '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        
        // Component-specific radius
        'button': '0.5rem',
        'button-sm': '0.375rem',
        'button-lg': '0.75rem',
        'button-xl': '1rem',
        'card': '0.75rem',
        'modal': '1rem',
        'input': '0.5rem',
        'toast': '0.5rem',
      },
      
      // Advanced Layout System for Phase 5
      gridTemplateColumns: {
        'auto-fit-min': 'repeat(auto-fit, minmax(280px, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(320px, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(400px, 1fr))',
        'auto-fill-min': 'repeat(auto-fill, minmax(250px, 1fr))',
        'auto-fill-sm': 'repeat(auto-fill, minmax(300px, 1fr))',
        'dashboard': '280px 1fr 320px',
        'dashboard-collapsed': '80px 1fr 320px',
        'feed': '1fr 400px',
        'profile': '300px 1fr',
        'sidebar': '240px 1fr',
        'masonry': 'masonry',
      },
      
      gridTemplateRows: {
        'layout': 'auto 1fr auto',
        'header-content': 'auto 1fr',
        'dashboard': '60px 1fr',
        'profile': 'auto auto 1fr',
      },
      
      // Container Queries Support for Phase 5
      containers: {
        'xs': '20rem',
        'sm': '24rem', 
        'md': '28rem',
        'lg': '32rem',
        'xl': '36rem',
        '2xl': '42rem',
        '3xl': '48rem',
        '4xl': '56rem',
        '5xl': '64rem',
        '6xl': '72rem',
        '7xl': '80rem',
      },
      
      // Advanced Aspect Ratios
      aspectRatio: {
        'auto': 'auto',
        'square': '1 / 1',
        'video': '16 / 9',
        'photo': '4 / 3',
        'portrait': '3 / 4',
        'wide': '21 / 9',
        'golden': '1.618 / 1',
        'story': '9 / 16',
        'card': '5 / 4',
        'hero': '5 / 2',
      },
      
      // Mobile-First Sizing System
      minWidth: {
        'touch': '44px',
        'button': '120px',
        'input': '200px',
        'sidebar': '280px',
        'panel': '320px',
      },
      
      minHeight: {
        'touch': '44px',
        'button': '44px',
        'input': '44px',
        'card': '120px',
        'hero': '400px',
        'screen-mobile': '100dvh',
        'screen-desktop': '100vh',
      },
      
      maxWidth: {
        'content': '1200px',
        'reading': '65ch',
        'mobile': '480px',
        'tablet': '768px',
        'desktop': '1024px',
        'wide': '1440px',
      },
      
      // Enhanced Z-Index System
      zIndex: {
        'below': '-1',
        'base': '0',
        'content': '10',
        'dropdown': '20',
        'sticky': '30',
        'banner': '40',
        'overlay': '50',
        'modal': '60',
        'popover': '70',
        'tooltip': '80',
        'toast': '90',
        'max': '9999',
      },
      
      // Enhanced Shadow System
      boxShadow: {
        'button-subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'button-subtle-lg': '0 2px 4px -1px rgb(0 0 0 / 0.1)',
        'button-premium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'button-premium-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'card-subtle': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.06)',
        'card-premium': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'card-premium-lg': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
        'input-subtle': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'input-premium': '0 0 0 1px rgb(59 130 246 / 0.1), 0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'modal': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'modal-premium': '0 32px 64px -12px rgb(0 0 0 / 0.4)',
        'toast': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'toast-success': '0 10px 15px -3px rgb(16 185 129 / 0.2), 0 4px 6px -2px rgb(16 185 129 / 0.1)',
        'toast-error': '0 10px 15px -3px rgb(239 68 68 / 0.2), 0 4px 6px -2px rgb(239 68 68 / 0.1)',
        'toast-warning': '0 10px 15px -3px rgb(245 158 11 / 0.2), 0 4px 6px -2px rgb(245 158 11 / 0.1)',
        'toast-info': '0 10px 15px -3px rgb(59 130 246 / 0.2), 0 4px 6px -2px rgb(59 130 246 / 0.1)',
        
        // Enhanced Dark Mode Glow Effects
        'glow': '0 0 20px rgb(59 130 246 / 0.3), 0 0 40px rgb(59 130 246 / 0.2), 0 0 60px rgb(59 130 246 / 0.1)',
        'glow-sm': '0 0 10px rgb(59 130 246 / 0.4), 0 0 20px rgb(59 130 246 / 0.2)',
        'glow-lg': '0 0 30px rgb(59 130 246 / 0.4), 0 0 60px rgb(59 130 246 / 0.3), 0 0 90px rgb(59 130 246 / 0.1)',
        'glow-accent': '0 0 20px rgb(139 92 246 / 0.3), 0 0 40px rgb(139 92 246 / 0.2), 0 0 60px rgb(139 92 246 / 0.1)',
        'glow-success': '0 0 20px rgb(16 185 129 / 0.3), 0 0 40px rgb(16 185 129 / 0.2)',
        'glow-warning': '0 0 20px rgb(245 158 11 / 0.3), 0 0 40px rgb(245 158 11 / 0.2)',
        'glow-destructive': '0 0 20px rgb(239 68 68 / 0.3), 0 0 40px rgb(239 68 68 / 0.2)',
      },
      
      // Enhanced Animation System (From Phase 4)
      animation: {
        // Entrance animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'slide-in-left': 'slideInLeft 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.4s ease-out',
        'slide-out-left': 'slideOutLeft 0.3s ease-in',
        'slide-out-right': 'slideOutRight 0.3s ease-in',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.2s ease-in',
        
        // Micro-interactions
        'bounce-soft': 'bounceSoft 0.6s ease-out',
        'bounce-subtle': 'bounceSubtle 0.4s ease-out',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'swing': 'swing 0.6s ease-in-out',
        'rubberBand': 'rubberBand 1s ease-out',
        'jello': 'jello 0.9s ease-out',
        'heartbeat': 'heartbeat 1s ease-in-out infinite',
        'tada': 'tada 1s ease-out',
        'flip': 'flip 0.6s ease-in-out',
        
        // Continuous effects
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-soft': 'glowSoft 3s ease-in-out infinite alternate',
        'glow-subtle': 'glowSubtle 2s ease-in-out infinite alternate',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
        'pulse-border': 'pulseBorder 1s ease-in-out infinite',
        
        // Loading animations
        'shimmer': 'shimmer 2s infinite linear',
        'shimmer-slow': 'shimmerSlow 3s infinite linear',
        'shimmer-subtle': 'shimmerSubtle 2s infinite linear',
        'loading-dots': 'loadingDots 1.4s infinite ease-in-out',
        'loading-bounce': 'loadingBounce 1.4s infinite ease-in-out both',
        'spin-slow': 'spin 3s linear infinite',
        
        // Notification effects
        'notificationPop': 'notificationPop 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'shake': 'shake 0.5s ease-in-out',
        'shake-subtle': 'shakeSubtle 0.4s ease-in-out',
        
        // Modal animations
        'modal-in': 'modalIn 0.3s ease-out',
        'modal-out': 'modalOut 0.2s ease-in',
      },
      
      keyframes: {
        // Basic animations
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(-20px)' },
        },
        slideOutRight: {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(20px)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        
        // Micro-interactions
        bounceSoft: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-8px,0)' },
          '70%': { transform: 'translate3d(0,-4px,0)' },
          '90%': { transform: 'translate3d(0,-2px,0)' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0,-4px,0)' },
          '70%': { transform: 'translate3d(0,-2px,0)' },
          '90%': { transform: 'translate3d(0,-1px,0)' },
        },
        wiggle: {
          '0%, 7%': { transform: 'rotateZ(0)' },
          '15%': { transform: 'rotateZ(-15deg)' },
          '20%': { transform: 'rotateZ(10deg)' },
          '25%': { transform: 'rotateZ(-10deg)' },
          '30%': { transform: 'rotateZ(6deg)' },
          '35%': { transform: 'rotateZ(-4deg)' },
          '40%, 100%': { transform: 'rotateZ(0)' },
        },
        swing: {
          '20%': { transform: 'rotate3d(0,0,1,15deg)' },
          '40%': { transform: 'rotate3d(0,0,1,-10deg)' },
          '60%': { transform: 'rotate3d(0,0,1,5deg)' },
          '80%': { transform: 'rotate3d(0,0,1,-5deg)' },
          '100%': { transform: 'rotate3d(0,0,1,0deg)' },
        },
        rubberBand: {
          '0%': { transform: 'scale3d(1,1,1)' },
          '30%': { transform: 'scale3d(1.25,0.75,1)' },
          '40%': { transform: 'scale3d(0.75,1.25,1)' },
          '50%': { transform: 'scale3d(1.15,0.85,1)' },
          '65%': { transform: 'scale3d(0.95,1.05,1)' },
          '75%': { transform: 'scale3d(1.05,0.95,1)' },
          '100%': { transform: 'scale3d(1,1,1)' },
        },
        jello: {
          '11.1%': { transform: 'none' },
          '22.2%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
          '33.3%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
          '44.4%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
          '55.5%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
          '66.6%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
          '77.7%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
          '88.8%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' },
          '100%': { transform: 'none' },
        },
        heartbeat: {
          '0%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.1)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(1)' },
        },
        tada: {
          '0%': { transform: 'scale3d(1,1,1)' },
          '10%, 20%': { transform: 'scale3d(0.9,0.9,0.9) rotate3d(0,0,1,-3deg)' },
          '30%, 50%, 70%, 90%': { transform: 'scale3d(1.1,1.1,1.1) rotate3d(0,0,1,3deg)' },
          '40%, 60%, 80%': { transform: 'scale3d(1.1,1.1,1.1) rotate3d(0,0,1,-3deg)' },
          '100%': { transform: 'scale3d(1,1,1)' },
        },
        flip: {
          '0%': { transform: 'perspective(400px) scale3d(1,1,1) translate3d(0,0,0) rotate3d(0,1,0,-360deg)' },
          '40%': { transform: 'perspective(400px) scale3d(1,1,1) translate3d(0,0,150px) rotate3d(0,1,0,-190deg)' },
          '50%': { transform: 'perspective(400px) scale3d(1,1,1) translate3d(0,0,150px) rotate3d(0,1,0,-170deg)' },
          '80%': { transform: 'perspective(400px) scale3d(0.95,0.95,0.95) translate3d(0,0,0) rotate3d(0,1,0,0deg)' },
          '100%': { transform: 'perspective(400px) scale3d(1,1,1) translate3d(0,0,0) rotate3d(0,1,0,0deg)' },
        },
        
        // Continuous effects
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)' },
        },
        glowSoft: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(59, 130, 246, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' },
        },
        glowSubtle: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
          '50%': { boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
        pulseSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.01)' },
        },
        pulseBorder: {
          '0%': { borderColor: 'rgba(59, 130, 246, 0.3)' },
          '50%': { borderColor: 'rgba(59, 130, 246, 0.8)' },
          '100%': { borderColor: 'rgba(59, 130, 246, 0.3)' },
        },
        
        // Loading animations
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        shimmerSlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        shimmerSubtle: {
          '0%': { backgroundPosition: '-100% 0' },
          '100%': { backgroundPosition: '100% 0' },
        },
        loadingDots: {
          '0%, 80%, 100%': { transform: 'scale(0)' },
          '40%': { transform: 'scale(1)' },
        },
        loadingBounce: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        
        // Attention effects
        notificationPop: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        shakeSubtle: {
          '10%, 90%': { transform: 'translate3d(-0.5px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(1px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-2px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(2px, 0, 0)' },
        },
        
        // Modal animations
        modalIn: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(-10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        modalOut: {
          '0%': { opacity: '1', transform: 'scale(1) translateY(0)' },
          '100%': { opacity: '0', transform: 'scale(0.9) translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}

export default config