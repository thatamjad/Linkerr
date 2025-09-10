'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Heart, MessageCircle, Share2, Star, Bookmark } from 'lucide-react';

export default function DarkModeShowcase() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
      {/* Header with Theme Toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gradient">
          Enhanced Dark Mode Showcase
        </h1>
        <ThemeToggle />
      </div>

      {/* Button Showcase */}
      <Card variant="glass" className="p-6">
        <CardHeader>
          <CardTitle className="text-gradient">Button Variations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card variant="default" className="interactive-element">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Default Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This card shows the enhanced default styling with improved contrast 
              and subtle glow effects in dark mode.
            </p>
          </CardContent>
        </Card>

        <Card variant="glass" className="interactive-element">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Glass Morphism
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Glass morphism effect with backdrop blur and enhanced borders 
              for a modern, immersive dark mode experience.
            </p>
          </CardContent>
        </Card>

        <Card variant="premium" className="interactive-element">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-primary" />
              Premium Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Premium styling with enhanced gradients, shadows, and 
              interactive glow effects that create depth and dimension.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Social Media Post Example */}
      <Card variant="elevated" className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">JD</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">John Developer</h3>
              <p className="text-sm text-muted-foreground">Senior Frontend Engineer • 2h</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">
            Just implemented an amazing dark mode with enhanced contrast, 
            beautiful glow effects, and glass morphism! The new color palette 
            creates such an immersive experience. 🌙✨
          </p>
          
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-destructive"
            >
              <Heart className="h-4 w-4" />
              <span>24 likes</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span>8 comments</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center space-x-2 text-muted-foreground hover:text-accent"
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Color Palette Showcase */}
      <Card variant="premium">
        <CardHeader>
          <CardTitle className="text-gradient">Enhanced Dark Mode Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-primary rounded-lg shadow-glow"></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-muted-foreground">Vibrant Blue</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-accent rounded-lg shadow-glow-accent"></div>
              <p className="text-sm font-medium">Accent</p>
              <p className="text-xs text-muted-foreground">Rich Purple</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-success rounded-lg shadow-glow-success"></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-muted-foreground">Vibrant Green</p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto bg-destructive rounded-lg shadow-glow-destructive"></div>
              <p className="text-sm font-medium">Destructive</p>
              <p className="text-xs text-muted-foreground">Vibrant Red</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Examples */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-gradient">Enhanced Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Heading 1</h1>
            <p className="text-muted-foreground">Crisp contrast with warm undertones</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gradient">Gradient Heading</h2>
            <p className="text-muted-foreground">Beautiful gradient text effects</p>
          </div>
          <div>
            <p className="text-foreground">
              Body text with enhanced readability and improved contrast ratios 
              for better accessibility in dark mode. The color palette creates 
              a comfortable viewing experience.
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              Secondary text maintains perfect balance between visibility and 
              hierarchy while reducing eye strain in low-light conditions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
