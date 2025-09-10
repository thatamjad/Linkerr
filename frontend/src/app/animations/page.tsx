'use client'

import { useState } from 'react'
import { 
  Star, 
  Heart, 
  User, 
  Settings, 
  Bell, 
  Sparkles, 
  Zap,
  Play,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { 
  FadeIn, 
  SlideUp, 
  SlideInLeft, 
  ScaleIn, 
  BounceSoft, 
  Tada, 
  Float, 
  Glow,
  useAnimationSequence
} from '@/components/ui/animated'

export default function AnimationShowcase() {
  const [showModal, setShowModal] = useState(false)
  const [activeDemo, setActiveDemo] = useState('entrance')
  const { playSequence } = useAnimationSequence()
  
  const [animationElements, setAnimationElements] = useState<HTMLElement[]>([])

  const registerElement = (element: HTMLElement | null) => {
    if (element && !animationElements.includes(element)) {
      setAnimationElements(prev => [...prev, element])
    }
  }

  const playSequenceDemo = () => {
    if (animationElements.length >= 3) {
      playSequence([
        { element: animationElements[0], animation: 'fade-in', delay: 0, duration: 500 },
        { element: animationElements[1], animation: 'slide-up', delay: 200, duration: 500 },
        { element: animationElements[2], animation: 'scale-in', delay: 400, duration: 500 },
      ])
    }
  }

  const showToastAnimation = (variant: 'success' | 'destructive' | 'info' | 'warning') => {
    // For demonstration - in a real app you'd use your toast system
    console.log(`${variant.charAt(0).toUpperCase() + variant.slice(1)} Animation triggered`)
    alert(`Watch the enhanced ${variant} notification with micro-animations! (This would be a toast notification)`)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-surface-muted/30 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-20 animate-pulse-subtle" />
      <Float>
        <div className="fixed top-10 right-10 w-96 h-96 bg-gradient-radial-primary opacity-8 rounded-full blur-3xl" />
      </Float>
      <Float delay={2000}>
        <div className="fixed bottom-10 left-10 w-80 h-80 bg-gradient-radial-accent opacity-8 rounded-full blur-3xl" />
      </Float>
      
      <div className="relative z-10 container mx-auto px-4 py-8">

        {/* Animated Header */}
        <div className="text-center mb-12">
          <FadeIn trigger="immediate">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4 flex items-center justify-center">
              Phase 4: Advanced Animations
              <Sparkles className="ml-4 h-12 w-12 text-primary animate-glow" />
            </h1>
          </FadeIn>
          
          <SlideUp delay={300}>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
              Experience our enhanced design system with advanced micro-interactions, smooth transitions, and delightful hover effects.
            </p>
          </SlideUp>
        </div>

        {/* Navigation */}
        <FadeIn delay={600}>
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { id: 'entrance', label: 'Entrance Animations', icon: Play },
              { id: 'interactions', label: 'Micro-interactions', icon: Zap },
              { id: 'sequences', label: 'Animation Sequences', icon: RotateCcw },
              { id: 'components', label: 'Enhanced Components', icon: Sparkles }
            ].map(({ id, label, icon: Icon }, index) => (
              <BounceSoft key={id} delay={index * 100}>
                <Button
                  variant={activeDemo === id ? 'premium' : 'outline'}
                  onClick={() => setActiveDemo(id)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </BounceSoft>
            ))}
          </div>
        </FadeIn>

        {/* Demo Sections */}
        <div className="space-y-12">
          
          {/* Entrance Animations */}
          {activeDemo === 'entrance' && (
            <SlideUp>
              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Entrance Animations
                  </CardTitle>
                  <CardDescription>
                    Watch elements come to life with smooth entrance effects
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FadeIn trigger="onView">
                      <Card className="text-center p-6">
                        <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold mb-1">Fade In</h3>
                        <p className="text-sm text-muted-foreground">Smooth opacity transition</p>
                      </Card>
                    </FadeIn>
                    
                    <SlideUp trigger="onView" delay={200}>
                      <Card className="text-center p-6">
                        <Star className="h-8 w-8 mx-auto mb-2 text-accent" />
                        <h3 className="font-semibold mb-1">Slide Up</h3>
                        <p className="text-sm text-muted-foreground">Elegant upward motion</p>
                      </Card>
                    </SlideUp>
                    
                    <SlideInLeft trigger="onView" delay={400}>
                      <Card className="text-center p-6">
                        <Heart className="h-8 w-8 mx-auto mb-2 text-pink-500" />
                        <h3 className="font-semibold mb-1">Slide In Left</h3>
                        <p className="text-sm text-muted-foreground">From the left edge</p>
                      </Card>
                    </SlideInLeft>
                    
                    <ScaleIn trigger="onView" delay={600}>
                      <Card className="text-center p-6">
                        <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                        <h3 className="font-semibold mb-1">Scale In</h3>
                        <p className="text-sm text-muted-foreground">Growing from center</p>
                      </Card>
                    </ScaleIn>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          )}

          {/* Micro-interactions */}
          {activeDemo === 'interactions' && (
            <SlideUp>
              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Interactive Micro-animations
                  </CardTitle>
                  <CardDescription>
                    Hover, focus, and click animations that provide instant feedback
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Enhanced Buttons */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Enhanced Buttons</h3>
                    <div className="flex flex-wrap gap-4">
                      <Button variant="premium">Premium Shine</Button>
                      <Button variant="success">Heartbeat Success</Button>
                      <Button variant="destructive">Pulsing Alert</Button>
                      <Button variant="outline">Glowing Border</Button>
                      <Button variant="ghost">Wiggle Ghost</Button>
                      <Button variant="link">Swinging Link</Button>
                    </div>
                  </div>

                  {/* Enhanced Cards */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Interactive Cards</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card variant="default">
                        <CardHeader>
                          <CardTitle>Subtle Glow</CardTitle>
                          <CardDescription>Hover for a gentle glow effect</CardDescription>
                        </CardHeader>
                      </Card>
                      
                      <Card variant="glass">
                        <CardHeader>
                          <CardTitle>Glass Shimmer</CardTitle>
                          <CardDescription>Glass morphism with shimmer</CardDescription>
                        </CardHeader>
                      </Card>
                      
                      <Card variant="elevated">
                        <CardHeader>
                          <CardTitle>Bounce Elevated</CardTitle>
                          <CardDescription>Soft bounce on interaction</CardDescription>
                        </CardHeader>
                      </Card>
                    </div>
                  </div>

                  {/* Enhanced Inputs */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Animated Form Elements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input placeholder="Watch the focus animation..." />
                      <Input placeholder="Try typing something..." />
                      <Input placeholder="username@example.com" error="This field has an animated error" />
                      <Input placeholder="Success state indicator" />
                    </div>
                  </div>

                </CardContent>
              </Card>
            </SlideUp>
          )}

          {/* Animation Sequences */}
          {activeDemo === 'sequences' && (
            <SlideUp>
              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    Animation Sequences
                  </CardTitle>
                  <CardDescription>
                    Choreographed animations that create engaging user experiences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex justify-center">
                    <Button onClick={playSequenceDemo} variant="premium" className="gap-2">
                      <Play className="h-4 w-4" />
                      Play Sequence Demo
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div 
                      ref={registerElement}
                      className="text-center p-8 rounded-card border border-border/50 bg-surface"
                    >
                      <User className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <h3 className="font-semibold mb-2">Step 1</h3>
                      <p className="text-sm text-muted-foreground">First element in sequence</p>
                    </div>
                    
                    <div 
                      ref={registerElement}
                      className="text-center p-8 rounded-card border border-border/50 bg-surface"
                    >
                      <Settings className="h-12 w-12 mx-auto mb-4 text-accent" />
                      <h3 className="font-semibold mb-2">Step 2</h3>
                      <p className="text-sm text-muted-foreground">Second element follows</p>
                    </div>
                    
                    <div 
                      ref={registerElement}
                      className="text-center p-8 rounded-card border border-border/50 bg-surface"
                    >
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-pink-500" />
                      <h3 className="font-semibold mb-2">Step 3</h3>
                      <p className="text-sm text-muted-foreground">Final flourish</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>
          )}

          {/* Enhanced Components */}
          {activeDemo === 'components' && (
            <SlideUp>
              <Card variant="premium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Enhanced Components
                  </CardTitle>
                  <CardDescription>
                    All components enhanced with advanced animations and micro-interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  
                  {/* Modal Demo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Enhanced Modal</h3>
                    <Button onClick={() => setShowModal(true)} variant="outline" className="gap-2">
                      <Settings className="h-4 w-4" />
                      Open Enhanced Modal
                    </Button>
                  </div>

                  {/* Toast Notifications */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Animated Toast Notifications</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => showToastAnimation('success')} variant="success" size="sm">
                        Success Toast
                      </Button>
                      <Button onClick={() => showToastAnimation('destructive')} variant="destructive" size="sm">
                        Error Toast
                      </Button>
                      <Button onClick={() => showToastAnimation('warning')} variant="outline" size="sm">
                        Warning Toast
                      </Button>
                      <Button onClick={() => showToastAnimation('info')} variant="secondary" size="sm">
                        Info Toast
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Layout Elements */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Layout Animations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Glow>
                        <Card variant="glass">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Bell className="h-5 w-5 animate-wiggle" />
                              Continuous Glow
                            </CardTitle>
                            <CardDescription>
                              This card has a continuous gentle glow animation
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">Perfect for highlighting important content or calls-to-action.</p>
                          </CardContent>
                        </Card>
                      </Glow>

                      <Float>
                        <Card variant="elevated">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Star className="h-5 w-5 animate-tada" />
                              Floating Element
                            </CardTitle>
                            <CardDescription>
                              This card gently floats up and down
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">Great for creating a sense of depth and playfulness.</p>
                          </CardContent>
                        </Card>
                      </Float>
                    </div>
                  </div>

                </CardContent>
                <CardFooter>
                  <div className="w-full text-center">
                    <Tada trigger="onView">
                      <p className="text-sm text-muted-foreground font-medium">
                        🎉 Phase 4 Complete: Advanced Animations & Micro-interactions implemented! 🎉
                      </p>
                    </Tada>
                  </div>
                </CardFooter>
              </Card>
            </SlideUp>
          )}

        </div>
      </div>

      {/* Enhanced Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        variant="premium"
        size="lg"
        title="Enhanced Modal"
        description="Experience the premium modal with shimmer effects, enhanced close animations, and smooth content transitions."
      >
        <div className="space-y-6">            
          <SlideUp delay={200}>
            <div className="space-y-4">
              <Input placeholder="Try the enhanced input field..." />
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="premium" onClick={() => setShowModal(false)}>
                  Amazing!
                </Button>
              </div>
            </div>
          </SlideUp>
        </div>
      </Modal>
    </div>
  )
}
