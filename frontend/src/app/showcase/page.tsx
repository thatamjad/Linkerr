'use client'

import { useState } from 'react'
import { Star, Heart, MessageCircle, Search, Mail, Phone, User, Lock, Settings, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/enhanced-input'
import { Form, FormField, FormSection } from '@/components/ui/form'
import { Modal } from '@/components/ui/modal'
import { Loading, Skeleton, ContentPlaceholder, Spinner } from '@/components/ui/loading'
import { Notification } from '@/components/ui/toast'

export default function ComponentShowcase() {
  const [showModal, setShowModal] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [activeDemo, setActiveDemo] = useState('buttons')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface/50 to-surface-muted/30 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-gradient-mesh opacity-20" />
      <div className="fixed top-10 right-10 w-96 h-96 bg-gradient-radial-primary opacity-8 rounded-full blur-3xl" />
      <div className="fixed bottom-10 left-10 w-80 h-80 bg-gradient-radial-accent opacity-8 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <Notification
              variant="success"
              title="Component Demo"
              description="This is how notifications look in the new design system!"
              onDismiss={() => setShowNotification(false)}
            />
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4 flex items-center justify-center">
            Enhanced Component Library
            <Sparkles className="ml-4 h-12 w-12 text-primary animate-pulse" />
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            A showcase of our premium design system with glass morphism, advanced shadows, and micro-interactions.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            { id: 'buttons', label: 'Buttons', icon: Star },
            { id: 'forms', label: 'Forms', icon: User },
            { id: 'cards', label: 'Cards', icon: MessageCircle },
            { id: 'modals', label: 'Modals', icon: Settings },
            { id: 'loading', label: 'Loading', icon: Bell }
          ].map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              variant={activeDemo === id ? 'premium' : 'outline'}
              onClick={() => setActiveDemo(id)}
              className="group"
            >
              <Icon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              {label}
            </Button>
          ))}
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Buttons Demo */}
          {activeDemo === 'buttons' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <Card variant="glass" className="shadow-card-premium">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Button Variants
                  </CardTitle>
                  <CardDescription>
                    All button styles with hover effects and micro-interactions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="default">Default</Button>
                    <Button variant="premium">Premium</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="link">Link</Button>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Button Sizes</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="xl">Extra Large</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Interactive Buttons</h4>
                    <div className="flex flex-wrap gap-4">
                      <Button 
                        onClick={() => setShowNotification(true)}
                        className="premium-gradient group"
                      >
                        <Bell className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Show Notification
                      </Button>
                      <Button 
                        onClick={() => setShowModal(true)}
                        variant="outline"
                        className="group"
                      >
                        <Settings className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" />
                        Open Modal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Forms Demo */}
          {activeDemo === 'forms' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <Card variant="glass" className="shadow-card-premium">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Enhanced Form Components
                  </CardTitle>
                  <CardDescription>
                    Modern inputs with floating labels, validation, and smooth animations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form variant="glass">
                    <FormSection 
                      title="Personal Information"
                      description="Enter your details below"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField>
                          <Input
                            variant="floating"
                            label="Full Name"
                            leftIcon={<User className="h-4 w-4" />}
                            placeholder="John Doe"
                          />
                        </FormField>
                        
                        <FormField>
                          <Input
                            variant="floating"
                            label="Email Address"
                            type="email"
                            leftIcon={<Mail className="h-4 w-4" />}
                            placeholder="john@example.com"
                          />
                        </FormField>
                      </div>

                      <FormField>
                        <Input
                          variant="floating"
                          label="Phone Number"
                          leftIcon={<Phone className="h-4 w-4" />}
                          placeholder="+1 (555) 123-4567"
                        />
                      </FormField>

                      <FormField error="Password must be at least 8 characters long">
                        <Input
                          variant="floating"
                          label="Password"
                          type="password"
                          leftIcon={<Lock className="h-4 w-4" />}
                        />
                      </FormField>
                    </FormSection>

                    <FormSection title="Preferences">
                      <FormField>
                        <Input
                          variant="filled"
                          label="Search Preferences"
                          leftIcon={<Search className="h-4 w-4" />}
                          helperText="This will help us personalize your experience"
                        />
                      </FormField>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button variant="outline">Cancel</Button>
                        <Button variant="premium">Save Changes</Button>
                      </div>
                    </FormSection>
                  </Form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Cards Demo */}
          {activeDemo === 'cards' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card variant="default" className="hover:scale-105 transition-all duration-300 group">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Default Card</CardTitle>
                    <CardDescription>Standard card with subtle shadow</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      This is a default card with hover effects and smooth transitions.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="glass" className="hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Glass Morphism
                    </CardTitle>
                    <CardDescription>Frosted glass effect with backdrop blur</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Beautiful glass morphism with transparency and blur effects.
                    </p>
                  </CardContent>
                </Card>

                <Card variant="premium" className="hover:scale-105 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-primary">Premium Card</CardTitle>
                    <CardDescription>Enhanced with premium gradients</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Premium styling with advanced shadows and gradients.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card variant="glass" className="shadow-card-premium">
                <CardHeader>
                  <CardTitle className="text-2xl flex items-center">
                    <Heart className="w-6 h-6 mr-3 text-red-500" />
                    Interactive Card
                  </CardTitle>
                  <CardDescription>
                    Cards with interactive elements and micro-animations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 rounded-button bg-surface-muted/30 hover:bg-surface-muted/50 transition-colors group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 premium-gradient rounded-full flex items-center justify-center text-white font-semibold group-hover:scale-110 transition-transform">
                        JD
                      </div>
                      <div>
                        <h4 className="font-semibold">John Doe</h4>
                        <p className="text-sm text-muted-foreground">Software Engineer</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="ghost" className="group/heart">
                        <Heart className="w-4 h-4 group-hover/heart:text-red-500 group-hover/heart:scale-125 transition-all" />
                      </Button>
                      <Button size="sm" variant="ghost" className="group/message">
                        <MessageCircle className="w-4 h-4 group-hover/message:text-blue-500 group-hover/message:scale-125 transition-all" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Loading Demo */}
          {activeDemo === 'loading' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <Card variant="glass" className="shadow-card-premium">
                <CardHeader>
                  <CardTitle className="text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Loading States
                  </CardTitle>
                  <CardDescription>
                    Spinners, skeletons, and loading placeholders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Spinners</h4>
                    <div className="flex items-center space-x-6">
                      <Spinner variant="default" size="sm" />
                      <Spinner variant="dots" size="md" />
                      <Spinner variant="ring" size="lg" />
                      <Spinner variant="bars" size="md" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Loading Components</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Loading variant="inline" text="Loading content..." />
                      <Loading variant="inline" spinnerVariant="dots" text="Processing..." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Skeletons</h4>
                    <div className="space-y-3">
                      <Skeleton variant="shimmer" className="h-4 w-3/4" />
                      <Skeleton variant="shimmer" className="h-4 w-1/2" />
                      <Skeleton variant="shimmer" className="h-32 w-full" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold">Content Placeholders</h4>
                    <ContentPlaceholder type="post" count={1} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Modal Demo */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Enhanced Modal"
        description="This modal showcases the new design system"
        variant="premium"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button variant="premium">
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-foreground font-medium leading-relaxed">
            This modal demonstrates our enhanced design system with premium styling, 
            glass morphism effects, and smooth animations.
          </p>
          <div className="p-4 rounded-button bg-surface-muted/30 border border-border/50">
            <p className="text-sm text-muted-foreground font-medium">
              ✨ Features include advanced shadows, micro-interactions, and seamless theming support.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}
