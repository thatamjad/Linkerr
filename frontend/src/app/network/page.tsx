'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  MapPin,
  Building,
  Star,
  MessageCircle,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NetworkUser {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  company?: string;
  location?: string;
  mutualConnections?: number;
  skills?: string[];
  connectionStatus?: 'connected' | 'pending' | 'none';
}

const NetworkUserCard: React.FC<{ user: NetworkUser; onAction: (userId: string, action: string) => void }> = ({ 
  user, 
  onAction 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 ring-2 ring-blue-100">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-semibold">
                {user.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
                {user.name}
              </h3>
              
              {user.title && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {user.title}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                {user.company && (
                  <div className="flex items-center space-x-1">
                    <Building className="h-4 w-4" />
                    <span>{user.company}</span>
                  </div>
                )}
                
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
              </div>
              
              {user.mutualConnections && user.mutualConnections > 0 && (
                <div className="flex items-center space-x-1 mt-2 text-sm text-blue-600 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                  <span>{user.mutualConnections} mutual connections</span>
                </div>
              )}
              
              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {user.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {user.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{user.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex space-x-2">
              {user.connectionStatus === 'none' && (
                <Button
                  size="sm"
                  onClick={() => onAction(user.id, 'connect')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect
                </Button>
              )}
              
              {user.connectionStatus === 'pending' && (
                <Button size="sm" variant="outline" disabled>
                  <Clock className="h-4 w-4 mr-2" />
                  Pending
                </Button>
              )}
              
              {user.connectionStatus === 'connected' && (
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
              )}
            </div>
            
            <Button size="sm" variant="ghost" className="text-gray-500">
              <Star className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState('suggestions');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with actual API calls
  const [suggestions] = useState<NetworkUser[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      title: 'Senior Product Manager',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      mutualConnections: 12,
      skills: ['Product Management', 'Strategy', 'Analytics'],
      connectionStatus: 'none'
    },
    {
      id: '2',
      name: 'Michael Chen',
      title: 'Full Stack Developer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      mutualConnections: 8,
      skills: ['React', 'Node.js', 'Python'],
      connectionStatus: 'none'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      title: 'UX Designer',
      company: 'DesignStudio',
      location: 'Austin, TX',
      mutualConnections: 15,
      skills: ['UI/UX', 'Figma', 'User Research'],
      connectionStatus: 'pending'
    }
  ]);

  const [connections] = useState<NetworkUser[]>([
    {
      id: '4',
      name: 'David Kim',
      title: 'Engineering Manager',
      company: 'BigTech',
      location: 'Seattle, WA',
      skills: ['Leadership', 'Engineering', 'Team Management'],
      connectionStatus: 'connected'
    },
    {
      id: '5',
      name: 'Lisa Wang',
      title: 'Data Scientist',
      company: 'DataCorp',
      location: 'Boston, MA',
      skills: ['Machine Learning', 'Python', 'Statistics'],
      connectionStatus: 'connected'
    }
  ]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      console.log(`${action} action for user ${userId}`);
      // Implement actual API calls here
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const filteredSuggestions = suggestions.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConnections = connections.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                My Network
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Grow your professional network and discover opportunities
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search people..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Network Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Connections</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {connections.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Profile Views</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">New This Week</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
              <TabsTrigger value="connections">Connections</TabsTrigger>
              <TabsTrigger value="invitations">Invitations</TabsTrigger>
            </TabsList>

            <TabsContent value="suggestions" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredSuggestions.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NetworkUserCard
                        user={user}
                        onAction={handleUserAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredSuggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No suggestions found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search criteria
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="connections" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {filteredConnections.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <NetworkUserCard
                        user={user}
                        onAction={handleUserAction}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {filteredConnections.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No connections found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Start building your network by connecting with people
                  </p>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="invitations" className="mt-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No pending invitations
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  When people send you connection requests, they&apos;ll appear here
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
