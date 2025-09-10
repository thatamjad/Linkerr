'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  BookOpen,
  Briefcase,
  Home,
  MessageSquare,
  Search,
  Users,
  Menu,
  X,
  PlusCircle
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore, useUIStore } from '@/stores';
import { useProfile, useUnreadNotificationCount } from '@/hooks/api';
import { generateInitials } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'My Network', href: '/network', icon: Users },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Learning', href: '/learning', icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { setCreatePostModalOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const { data: profile } = useProfile();
  const { data: unreadCount } = useUnreadNotificationCount();

  const currentUser = profile || user;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect backdrop-blur-xl border-b border-border/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 min-w-0">
            <div className="flex items-center space-x-6 min-w-0 flex-shrink">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden flex-shrink-0"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-3 flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-premium">
                  <span className="text-white font-black text-lg">L</span>
                </div>
                <span className="font-black text-2xl text-gradient tracking-tight hidden sm:block">
                  Linkerr
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex space-x-3">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 relative group ${
                        isActive
                          ? 'text-primary bg-primary/10 shadow-glow border border-primary/20'
                          : 'text-muted-foreground hover:text-primary hover:bg-surface-muted/50 border border-transparent hover:border-border/50'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-3" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="flex-1 max-w-xl mx-6 hidden md:block">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for people, jobs, posts..."
                  className="w-full pl-12 pr-6 py-2.5 border-2 border-border rounded-2xl bg-surface/50 text-sm font-medium placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 focus:bg-surface transition-all duration-300 hover:border-border/80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Enhanced Right side items */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Create Post Button - Desktop */}
              <Button
                onClick={() => setCreatePostModalOpen(true)}
                className="hidden lg:flex items-center space-x-2"
                size="sm"
                variant="default"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="font-semibold">Post</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative rounded-xl hover:bg-surface-muted border border-transparent hover:border-border/50 transition-all duration-300 flex-shrink-0">
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-destructive to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-premium"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>

              {/* Enhanced Profile Menu */}
              <div className="relative flex-shrink-0">
                <Button variant="ghost" className="flex items-center space-x-3 p-2 rounded-2xl hover:bg-surface-muted/60 border border-transparent hover:border-border/50 transition-all duration-300 min-w-0">
                  <Avatar className="h-8 w-8 ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300 flex-shrink-0">
                    <AvatarImage src={currentUser?.profile?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-bold">
                      {currentUser?.profile?.name ? generateInitials(currentUser.profile.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-semibold text-foreground truncate">
                    Me
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white dark:bg-gray-900">
                {/* Mobile Search */}
                <div className="px-3 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* Mobile Navigation Items */}
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                          : 'text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}

                {/* Mobile Create Post Button */}
                <Button
                  onClick={() => {
                    setCreatePostModalOpen(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full mt-4 mx-3"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
