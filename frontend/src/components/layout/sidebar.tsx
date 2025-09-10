'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  FileText,
  Hash,
  TrendingUp,
  Users,
  BookmarkPlus,
  Star
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores';
import { useProfile } from '@/hooks/api';
import { generateInitials } from '@/lib/utils';

const sidebarItems = [
  { icon: Calendar, label: 'Events', href: '/events' },
  { icon: Hash, label: 'Hashtags', href: '/hashtags' },
  { icon: FileText, label: 'Articles', href: '/articles' },
  { icon: TrendingUp, label: 'Trending', href: '/trending' },
];

const quickActions = [
  { icon: BookmarkPlus, label: 'Save for later', action: 'save' },
  { icon: Star, label: 'Your favorites', action: 'favorites' },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user } = useAuthStore();
  const { data: profile } = useProfile();

  const currentUser = profile || user;

  if (!currentUser) return null;

  return (
    <div className={`w-64 space-y-4 ${className}`}>
      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={currentUser.profile?.avatar} />
              <AvatarFallback className="text-lg">
                {generateInitials(currentUser.profile?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center space-y-1">
              <h3 className="font-semibold text-lg">
                {currentUser.profile?.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentUser.profile?.bio || 'Professional'}
              </p>
            </div>

            <div className="flex justify-between w-full text-sm">
              <div className="text-center">
                <div className="font-semibold">
                  {currentUser.profile?.connections || 0}
                </div>
                <div className="text-gray-500">Connections</div>
              </div>
              <div className="text-center">
                <div className="font-semibold">
                  {currentUser.profile?.followers || 0}
                </div>
                <div className="text-gray-500">Followers</div>
              </div>
            </div>

            <Link href="/profile" className="w-full">
              <Button variant="outline" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <item.icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
              onClick={() => {
                // Handle quick actions
                console.log(`Quick action: ${action.action}`);
              }}
            >
              <action.icon className="h-4 w-4 text-gray-500" />
              <span className="text-sm">{action.label}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Trending Today</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { topic: '#ReactJS', posts: '2.4k posts' },
            { topic: '#RemoteWork', posts: '1.8k posts' },
            { topic: '#AI', posts: '3.1k posts' },
            { topic: '#Startup', posts: '1.2k posts' },
          ].map((trend, index) => (
            <motion.div
              key={trend.topic}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer"
            >
              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {trend.topic}
              </div>
              <div className="text-xs text-gray-500">
                {trend.posts}
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Network Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Users className="h-4 w-4 mr-2" />
            People you may know
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: 'John Doe', title: 'Software Engineer at Tech Corp', avatar: '' },
            { name: 'Jane Smith', title: 'Product Manager at StartupXYZ', avatar: '' },
            { name: 'Mike Johnson', title: 'Designer at Creative Co', avatar: '' },
          ].map((person, index) => (
            <motion.div
              key={person.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={person.avatar} />
                <AvatarFallback className="text-xs">
                  {generateInitials(person.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {person.name}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {person.title}
                </div>
              </div>
              <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                Connect
              </Button>
            </motion.div>
          ))}
          
          <Link href="/network/suggestions">
            <Button variant="ghost" size="sm" className="w-full mt-2">
              See all suggestions
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
