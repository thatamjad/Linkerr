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
  PlusCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  const { user, logout } = useAuthStore();
  const { setCreatePostModalOpen } = useUIStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { data: profile } = useProfile();
  const { data: unreadCount } = useUnreadNotificationCount();

  const currentUser = profile || user;

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border shadow-elegant"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="text-xl font-bold text-gradient hidden sm:block">
                  Linkerr
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <motion.div key={item.name} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href={item.href}
                      className={`
                        relative flex flex-col items-center px-4 py-2 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' 
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium mt-1">{item.name}</span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar-indicator"
                          className="absolute bottom-0 left-1/2 w-1 h-1 bg-blue-600 rounded-full"
                          style={{ transform: 'translateX(-50%)' }}
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search professionals, jobs, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-accent/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Create Post Button - Desktop */}
              <Button
                onClick={() => setCreatePostModalOpen(true)}
                size="sm"
                className="hidden lg:flex"
                variant="premium"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Create
              </Button>

              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </Button>
              </motion.div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="w-8 h-8 ring-2 ring-border">
                    <AvatarImage 
                      src={currentUser?.profilePicture || currentUser?.avatar} 
                      alt={currentUser?.name || 'User'}
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                      {generateInitials(currentUser?.name || 'User')}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-72 bg-card border border-border rounded-xl shadow-2xl py-2 z-50"
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage 
                              src={currentUser?.profilePicture || currentUser?.avatar} 
                              alt={currentUser?.name || 'User'}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                              {generateInitials(currentUser?.name || 'User')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{currentUser?.name || 'User'}</p>
                            <p className="text-sm text-muted-foreground">{currentUser?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="py-2">
                        <Link 
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-accent/50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Users className="w-4 h-4" />
                          <span>View Profile</span>
                        </Link>
                        <Link 
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-accent/50 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-border pt-2">
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-border bg-card/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 space-y-4">
                {/* Mobile Search */}
                <div className="md:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-accent/30 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Mobile Navigation */}
                <div className="grid grid-cols-2 gap-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setShowMobileMenu(false)}
                        className={`
                          flex items-center space-x-3 p-3 rounded-xl transition-colors
                          ${isActive 
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' 
                            : 'hover:bg-accent/50'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Create Post */}
                <Button
                  onClick={() => {
                    setCreatePostModalOpen(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full"
                  variant="premium"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Overlay for mobile menu and user dropdown */}
      <AnimatePresence>
        {(showMobileMenu || showUserMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => {
              setShowMobileMenu(false);
              setShowUserMenu(false);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              {/* Logo */}
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">L</span>
                </div>
                <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:block">
                  Linkerr
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex ml-10 space-x-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.name}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg mx-4 hidden sm:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for people, jobs, posts..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-4">
              {/* Create Post Button - Desktop */}
              <Button
                onClick={() => setCreatePostModalOpen(true)}
                className="hidden md:flex items-center space-x-2"
                size="sm"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Post</span>
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount && unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </motion.span>
                )}
              </Button>

              {/* Profile Menu */}
              <div className="relative">
                <Button variant="ghost" className="flex items-center space-x-2 p-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser?.profile?.avatar} />
                    <AvatarFallback>
                      {currentUser?.profile?.name ? generateInitials(currentUser.profile.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium">
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
