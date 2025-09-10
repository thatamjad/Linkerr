'use client';

// Export statements for Next.js build configuration
export const dynamic = 'force-dynamic';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, Users, Briefcase, Bell, Sparkles, ArrowUp } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePostModal, PostCard } from '@/components/features';
import { useFeed, useProfile, useNotifications, useConnections } from '@/hooks/api';
import { useUIStore } from '@/stores';
import { cn } from '@/lib/utils';

const statsCards = [
  {
    title: 'Profile Views',
    value: '1,234',
    change: '+12%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-blue-600',
    bgColor: 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    title: 'Connections',
    value: '892',
    change: '+5%',
    trend: 'up',
    icon: Users,
    color: 'text-emerald-600',
    bgColor: 'bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    title: 'Job Matches',
    value: '45',
    change: '+8%',
    trend: 'up',
    icon: Briefcase,
    color: 'text-purple-600',
    bgColor: 'bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    title: 'Notifications',
    value: '12',
    change: 'New',
    trend: 'neutral',
    icon: Bell,
    color: 'text-orange-600',
    bgColor: 'bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
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
      <div className="min-h-screen pt-20">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-background via-primary/5 to-secondary/10">
          <div className="absolute inset-0 bg-grid-pattern opacity-5" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  Welcome back, <span className="text-gradient">{profile?.profile?.name?.split(' ')[0] || 'Professional'}</span>!
                </h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Your professional network is thriving. Here&apos;s what&apos;s happening in your world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Button
                  onClick={() => setCreatePostModalOpen(true)}
                  size="xl"
                  variant="premium"
                  className="shadow-2xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Share Your Thoughts
                </Button>
                <Button
                  variant="elegant"
                  size="xl"
                  className="backdrop-blur-md"
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Analytics
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statsCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className={cn(
                  "overflow-hidden transition-all duration-300 hover:shadow-2xl border-2",
                  stat.borderColor,
                  "hover:scale-105"
                )}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-3xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <div className={cn(
                            'flex items-center text-sm font-medium px-2 py-1 rounded-full',
                            stat.trend === 'up' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 
                            stat.trend === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-950/30' : 
                            'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          )}>
                            {stat.trend === 'up' && <ArrowUp className="w-3 h-3 mr-1" />}
                            {stat.change}
                          </div>
                        </div>
                      </div>
                      <div className={cn(
                        'rounded-2xl p-4 transition-all duration-300 group-hover:scale-110',
                        stat.bgColor
                      )}>
                        <stat.icon className={cn('w-8 h-8', stat.color)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Feed */}
            <div className="lg:col-span-2 space-y-8">
              <Card variant="glass" className="backdrop-blur-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center">
                        <Sparkles className="w-6 h-6 mr-2 text-blue-600" />
                        Your Feed
                      </CardTitle>
                      <CardDescription className="text-lg">
                        Latest updates from your professional network
                      </CardDescription>
                    </div>
                    <Button 
                      onClick={() => setCreatePostModalOpen(true)}
                      variant="premium"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Posts */}
              <AnimatePresence mode="popLayout">
                {feedLoading ? (
                  <div className="space-y-8">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-8">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 bg-muted rounded-full" />
                            <div className="ml-4 space-y-2">
                              <div className="h-5 bg-muted rounded w-32" />
                              <div className="h-4 bg-muted rounded w-24" />
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-5 bg-muted rounded w-full" />
                            <div className="h-5 bg-muted rounded w-3/4" />
                            <div className="h-5 bg-muted rounded w-1/2" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : feedPosts?.items && feedPosts.items.length > 0 ? (
                  <div className="space-y-8">
                    {feedPosts.items.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        layout
                      >
                        <PostCard post={post} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Card variant="glass" className="backdrop-blur-xl">
                      <CardContent className="p-16">
                        <div className="text-muted-foreground mb-6">
                          <Users className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground mb-4">
                          Your feed is waiting for content
                        </h3>
                        <p className="text-muted-foreground mb-8 text-lg">
                          Start building your network or create your first post to see amazing content here
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          <Button 
                            onClick={() => setCreatePostModalOpen(true)}
                            variant="premium"
                            size="lg"
                          >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Your First Post
                          </Button>
                          <Button variant="elegant" size="lg">
                            <Users className="w-5 h-5 mr-2" />
                            Find People
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Enhanced Right Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card variant="elevated" className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <CardTitle className="text-xl font-bold flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Button 
                    variant="elegant" 
                    className="w-full justify-start text-left h-auto p-4"
                    onClick={() => setCreatePostModalOpen(true)}
                  >
                    <Plus className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-semibold">Share an Update</p>
                      <p className="text-sm text-muted-foreground">Tell your network what's new</p>
                    </div>
                  </Button>
                  <Button variant="elegant" className="w-full justify-start text-left h-auto p-4">
                    <Users className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-semibold">Grow Network</p>
                      <p className="text-sm text-muted-foreground">Connect with professionals</p>
                    </div>
                  </Button>
                  <Button variant="elegant" className="w-full justify-start text-left h-auto p-4">
                    <Briefcase className="w-5 h-5 mr-3" />
                    <div>
                      <p className="font-semibold">Explore Jobs</p>
                      <p className="text-sm text-muted-foreground">Find your next opportunity</p>
                    </div>
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card variant="glass" className="backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-orange-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>
                    Your latest interactions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {notifications?.items && notifications.items.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.items.slice(0, 5).map((notification, index) => (
                        <motion.div 
                          key={notification.id} 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start space-x-3 p-3 rounded-xl hover:bg-accent/30 transition-colors"
                        >
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground font-medium">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recent activity to show
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* People You May Know */}
              <Card variant="premium" className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                  <CardTitle className="text-lg font-bold flex items-center">
                    <Users className="w-5 h-5 mr-2 text-purple-600" />
                    People You May Know
                  </CardTitle>
                  <CardDescription>
                    Expand your professional network
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white text-sm font-bold">
                              {['JD', 'SM', 'AL'][index]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {['John Doe', 'Sarah Miller', 'Alex Lee'][index]}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {['Software Engineer at Tech Corp', 'Product Manager at StartupCo', 'UI/UX Designer at Creative Ltd'][index]}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="ml-2">
                          Connect
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal />
    </MainLayout>
  );
}
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
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
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {profile?.profile?.name?.split(' ')[0] || 'Professional'}!
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
                Here&apos;s what&apos;s happening in your network
              </p>
            </div>
            <Button
              onClick={() => setCreatePostModalOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Post
            </Button>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={cn('rounded-full p-3', stat.bgColor)}>
                      <stat.icon className={cn('w-6 h-6', stat.color)} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <div className="flex items-center">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <span className={cn(
                          'ml-2 text-sm font-medium',
                          stat.trend === 'up' ? 'text-green-600' : 
                          stat.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Your Feed</CardTitle>
                <CardDescription>
                  Latest updates from your network
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Posts */}
            <AnimatePresence>
              {feedLoading ? (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gray-200 rounded-full" />
                          <div className="ml-3 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-32" />
                            <div className="h-3 bg-gray-200 rounded w-24" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full" />
                          <div className="h-4 bg-gray-200 rounded w-3/4" />
                          <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
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
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Card>
                    <CardContent className="p-12">
                      <div className="text-gray-400 dark:text-gray-600 mb-4">
                        <Users className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No posts in your feed yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start following people or create your first post to see content here
                      </p>
                      <Button onClick={() => setCreatePostModalOpen(true)}>
                        Create Your First Post
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setCreatePostModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Find Connections
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                <CardDescription>
                  Your latest interactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {notifications?.items && notifications.items.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.items.slice(0, 5).map((notification) => (
                      <div key={notification.id} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 dark:text-white truncate">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No recent activity
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Connection Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">People You May Know</CardTitle>
                <CardDescription>
                  Expand your network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {['JD', 'SM', 'AL'][index]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {['John Doe', 'Sarah Miller', 'Alex Lee'][index]}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {['Software Engineer', 'Product Manager', 'Designer'][index]}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Connect
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal />
    </MainLayout>
  );
}
