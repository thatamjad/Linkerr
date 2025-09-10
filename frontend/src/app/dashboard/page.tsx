'use client';

// Export statements for Next.js build configuration
export const dynamic = 'force-dynamic';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Users, Briefcase, Bell } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PostCard } from '@/components/features';
import { useFeed, useProfile, useNotifications, useConnections } from '@/hooks/api';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Profile Views',
    shortTitle: 'Views',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30',
    glowColor: 'glow',
  },
  {
    title: 'Connections',
    shortTitle: 'Connects',
    value: '892',
    change: '+5%',
    trend: 'up',
    icon: Users,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30',
    glowColor: 'glow-cyan',
  },
  {
    title: 'Job Matches',
    shortTitle: 'Jobs',
    value: '45',
    change: '+8%',
    trend: 'up',
    icon: Briefcase,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30',
    glowColor: 'glow-purple',
  },
  {
    title: 'Notifications',
    shortTitle: 'Alerts',
    value: '12',
    change: 'New',
    trend: 'neutral',
    icon: Bell,
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950/30 dark:to-rose-900/30',
    glowColor: 'glow',
  },
];

export default function DashboardPage() {
  const { setCreatePostModalOpen } = useUIStore();
  const { data: feedPosts, isLoading: feedLoading } = useFeed(1, 10);
  const { data: profile } = useProfile();
  const { data: notifications } = useNotifications();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: connections } = useConnections();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Enhanced Gradient */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-5xl font-bold text-gradient mb-2 tracking-tight">
                Welcome back, {profile?.profile?.name?.split(' ')[0] || 'Professional'}!
              </h1>
              <p className="text-xl text-muted-foreground font-medium tracking-wide">
                Here&apos;s what&apos;s happening in your network
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setCreatePostModalOpen(true)}
                size="lg"
                className="premium-gradient hover:shadow-button-premium 
                           text-primary-foreground shadow-button-subtle 
                           transform hover:scale-105 transition-all duration-200 rounded-button"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Post
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="group"
            >
              <div className={`card-premium rounded-2xl border border-border/50 hover:border-primary/20 
                             hover:shadow-${stat.glowColor} transition-all duration-300 group-hover:scale-[1.02] stats-card`}>
                <CardContent className="p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between w-full">
                      <div className={cn(
                        'rounded-xl p-2.5 sm:p-3 shadow-inner transition-all duration-300 flex-shrink-0',
                        stat.bgColor,
                        'group-hover:scale-110'
                      )}>
                        <stat.icon className={cn('w-5 h-5 sm:w-6 sm:h-6', stat.color)} />
                      </div>
                      <span className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-full leading-none',
                        stat.trend === 'up' ? 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30' : 
                        stat.trend === 'down' ? 'text-rose-700 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/30' : 
                        'text-muted-foreground bg-muted font-medium'
                      )}>
                        {stat.change}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        <span className="hidden sm:inline lg:hidden xl:inline">{stat.title}</span>
                        <span className="sm:hidden lg:inline xl:hidden">{stat.shortTitle}</span>
                      </p>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground leading-none">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed with Glass Effect */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-effect rounded-card border border-border/50 overflow-hidden shadow-card-premium">
              <CardHeader className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
                <CardTitle className="text-2xl font-bold flex items-center tracking-tight">
                  <TrendingUp className="w-6 h-6 mr-3 text-primary drop-shadow-sm" />
                  <span className="text-gradient bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Your Feed</span>
                </CardTitle>
                <CardDescription className="text-base font-medium text-muted-foreground mt-2">
                  Latest updates from your network
                </CardDescription>
              </CardHeader>
            </div>

            {/* Enhanced Posts */}
            <AnimatePresence>
              {feedLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass-effect rounded-card border border-border/50 p-6 shadow-card-subtle"
                    >
                      <div className="animate-shimmer">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded-full shimmer shadow-inner" />
                          <div className="ml-4 space-y-2 flex-1">
                            <div className="h-4 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded-input w-1/3 shimmer" />
                            <div className="h-3 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded w-1/4 shimmer" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded w-full shimmer" />
                          <div className="h-4 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded w-4/5 shimmer" />
                          <div className="h-4 bg-gradient-to-r from-surface-muted/50 to-surface-muted/70 rounded w-3/5 shimmer" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : feedPosts?.items && feedPosts.items.length > 0 ? (
                <div className="space-y-6">
                  {feedPosts.items.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      layout
                      whileHover={{ y: -2 }}
                      className="group"
                    >
                      <div className="glass-effect rounded-card border border-border/50 hover:border-primary/20 
                                    hover:shadow-card-premium transition-all duration-300 group-hover:scale-[1.01] backdrop-blur-md shadow-card-subtle">
                        <PostCard post={post} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="glass-effect rounded-card border border-border/50 shadow-card-premium backdrop-blur-md">
                    <CardContent className="p-12">
                      <div className="text-primary/60 mb-6 drop-shadow-sm">
                        <Users className="w-16 h-16 mx-auto" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
                        No posts in your feed yet
                      </h3>
                      <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed font-medium">
                        Start following people or create your first post to see content here
                      </p>
                      <Button 
                        onClick={() => setCreatePostModalOpen(true)}
                        className="premium-gradient hover:shadow-button-premium transform hover:scale-105 transition-all duration-200 rounded-button shadow-button-subtle"
                      >
                        Create Your First Post
                      </Button>
                    </CardContent>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Enhanced Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions with Glass Effect */}
            <div className="glass-effect rounded-card border border-border/50 overflow-hidden shadow-card-premium backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border/50 hover:border-primary/20 hover:bg-primary/5 
                           hover:shadow-button-subtle transition-all duration-300 rounded-button group backdrop-blur-sm"
                  onClick={() => setCreatePostModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-3 group-hover:text-primary transition-colors group-hover:scale-110" />
                  Create Post
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border/50 hover:border-accent-emerald/20 hover:bg-emerald-500/5 
                           hover:shadow-button-subtle transition-all duration-300 rounded-button group backdrop-blur-sm"
                >
                  <Users className="w-4 h-4 mr-3 group-hover:text-accent-emerald transition-colors group-hover:scale-110" />
                  Find Connections
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start border-border/50 hover:border-accent-purple/20 hover:bg-purple-500/5 
                           hover:shadow-button-subtle transition-all duration-300 rounded-button group backdrop-blur-sm"
                >
                  <Briefcase className="w-4 h-4 mr-3 group-hover:text-accent-purple transition-colors group-hover:scale-110" />
                  Browse Jobs
                </Button>
              </CardContent>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="glass-effect rounded-card border border-border/50 overflow-hidden shadow-card-premium backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
                <CardTitle className="text-xl font-bold flex items-center tracking-tight">
                  <Bell className="w-5 h-5 mr-3 text-primary drop-shadow-sm" />
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">Recent Activity</span>
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground mt-1">
                  Your latest interactions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {notifications?.items && notifications.items.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.items.slice(0, 5).map((notification, index) => (
                      <motion.div 
                        key={notification.id} 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center space-x-3 p-3 rounded-button hover:bg-surface-muted/50 
                                 border border-transparent hover:border-border/30 transition-all duration-200 backdrop-blur-sm group"
                      >
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full flex-shrink-0 animate-pulse shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate font-semibold leading-tight">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium tracking-wide mt-0.5">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-muted-foreground/60 mb-3 drop-shadow-sm">
                      <Bell className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      No recent activity
                    </p>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Enhanced Connection Suggestions */}
            <div className="glass-effect rounded-card border border-border/50 overflow-hidden shadow-card-premium backdrop-blur-md">
              <CardHeader className="border-b border-border/50 bg-surface/50 backdrop-blur-sm">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Users className="w-4 h-4 mr-2 text-accent-emerald drop-shadow-sm" />
                  People You May Know
                </CardTitle>
                <CardDescription>
                  Expand your network
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between group">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 premium-gradient rounded-full flex items-center justify-center shadow-avatar group-hover:scale-110 transition-transform duration-200">
                          <span className="text-white text-sm font-medium">
                            {['JD', 'SM', 'AL'][index]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {['John Doe', 'Sarah Miller', 'Alex Lee'][index]}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {['Software Engineer', 'Product Manager', 'Designer'][index]}
                          </p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-border/50 hover:border-primary/20 hover:bg-primary/5 hover:shadow-button-subtle transition-all duration-200 rounded-button backdrop-blur-sm group-hover:scale-105"
                      >
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
