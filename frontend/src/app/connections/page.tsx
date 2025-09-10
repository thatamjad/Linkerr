'use client';

// Force dynamic rendering to avoid pre-rendering errors with React Query
export const dynamic = 'force-dynamic';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  UserPlus, 
  Users, 
  MessageCircle, 
  MoreHorizontal,
  Check,
  X,
  Filter,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useConnections, useConnectionRequests, useConnectionSuggestions, useSearchUsers, useSendConnectionRequest, useAcceptConnectionRequest, useDeclineConnectionRequest } from '@/hooks/api';
import { formatDate, cn } from '@/lib/utils';
import type { Connection } from '@/types';

type TabType = 'connections' | 'requests' | 'suggestions' | 'search';

interface ConnectionUser {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  company?: string;
  location?: string;
  email?: string;
  profile?: {
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    connections?: number;
    skills?: string[];
    [key: string]: unknown;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface ConnectionCardProps {
  user: ConnectionUser;
  connection?: Connection;
  type: 'connection' | 'request' | 'suggestion' | 'search';
  onConnect?: (userId: string) => void;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onMessage?: (userId: string) => void;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  user,
  connection,
  type,
  onConnect,
  onAccept,
  onDecline,
  onMessage
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (!onConnect) return;
    setIsConnecting(true);
    try {
      await onConnect(user.id);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.profile?.avatar} alt={user.profile?.name} />
                <AvatarFallback className="text-lg">
                  {user.profile?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.profile?.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {user.profile?.bio}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {user.profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.profile.location}
                    </div>
                  )}
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {user.profile?.connections || 0} connections
                  </div>
                </div>
                {user.profile?.skills && user.profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {user.profile.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {user.profile.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.profile.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2">
              {type === 'connection' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onMessage?.(user.id)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="ghost" size="sm" className="px-2">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </>
              )}

              {type === 'request' && connection && (
                <>
                  <Button
                    size="sm"
                    onClick={() => onAccept?.(connection.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDecline?.(connection.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </>
              )}

              {(type === 'suggestion' || type === 'search') && (
                <Button
                  size="sm"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  loading={isConnecting}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              )}
            </div>
          </div>

          {connection && (
            <div className="mt-4 pt-4 border-t text-sm text-gray-500">
              Connected {formatDate(connection.acceptedAt || connection.requestedAt)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('connections');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Helper function to convert User to ConnectionUser
  const convertToConnectionUser = useCallback((user: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
    title?: string;
    company?: string;
    location?: string;
    profile?: {
      name?: string;
      avatar?: string;
      title?: string;
      company?: string;
      location?: string;
      bio?: string;
      skills?: string[];
      connections?: number;
      [key: string]: unknown;
    };
    createdAt?: string;
    updatedAt?: string;
  }): ConnectionUser => {
    return {
      id: user.id,
      name: user.profile?.name || user.name || '',
      avatar: user.profile?.avatar || user.avatar,
      title: user.profile?.title || user.title,
      company: user.profile?.company || user.company,
      location: user.profile?.location || user.location,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }, []);

  // API calls
  const { data: connections, isLoading: connectionsLoading } = useConnections(1, 20);
  const { data: requests, isLoading: requestsLoading } = useConnectionRequests('received');
  const { data: suggestions, isLoading: suggestionsLoading } = useConnectionSuggestions();
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchQuery, searchQuery.length > 0);
  
  // Mutations
  const sendConnectionRequest = useSendConnectionRequest();
  const acceptConnectionRequest = useAcceptConnectionRequest();
  const declineConnectionRequest = useDeclineConnectionRequest();

  const handleConnect = async (userId: string) => {
    try {
      await sendConnectionRequest.mutateAsync({ userId });
    } catch (error) {
      console.error('Failed to send connection request:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await acceptConnectionRequest.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to accept connection request:', error);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await declineConnectionRequest.mutateAsync(requestId);
    } catch (error) {
      console.error('Failed to decline connection request:', error);
    }
  };

  const handleMessage = (userId: string) => {
    // TODO: Implement messaging
    console.log('Message user:', userId);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveTab('search');
  };

  const tabs = [
    { id: 'connections', label: 'My Connections', count: connections?.connections?.length || 0 },
    { id: 'requests', label: 'Requests', count: requests?.requests?.length || 0 },
    { id: 'suggestions', label: 'Discover', count: suggestions?.suggestions?.length || 0 },
    { id: 'search', label: 'Search', count: 0 },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Network
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Grow and manage your professional connections
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search people by name, company, or role"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Location"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" className="flex-1">
                      <Search className="w-4 h-4 mr-2" />
                      Search People
                    </Button>
                    <Button type="button" variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={cn(
                    'py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  )}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Connections Tab */}
            {activeTab === 'connections' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Your Connections ({connections?.connections?.length || 0})
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Invite via Email
                    </Button>
                    <Button variant="outline" size="sm">
                      <Briefcase className="w-4 h-4 mr-2" />
                      Import Contacts
                    </Button>
                  </div>
                </div>

                {connectionsLoading ? (
                  <div className="grid grid-cols-1 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-1/3" />
                              <div className="h-4 bg-gray-200 rounded w-full" />
                              <div className="h-3 bg-gray-200 rounded w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : connections?.connections && connections.connections.length > 0 ? (
                  <div className="space-y-4">
                    {connections.connections.map((connection: any) => (
                      <ConnectionCard
                        key={connection.id}
                        user={connection.user || connection.requester || connection.recipient}
                        connection={connection}
                        type="connection"
                        onMessage={handleMessage}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No connections yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start building your network by connecting with colleagues and professionals
                      </p>
                      <Button onClick={() => setActiveTab('suggestions')}>
                        Discover People
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Connection Requests ({requests?.pagination?.total || 0})
                </h2>

                {requestsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-1/3" />
                              <div className="h-4 bg-gray-200 rounded w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : requests?.requests && requests.requests.length > 0 ? (
                  <div className="space-y-4">
                    {requests.requests.map((request: any) => (
                      <ConnectionCard
                        key={request.id}
                        user={request.requester}
                        connection={request}
                        type="request"
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No pending requests
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        You&apos;ll see connection requests here when people want to connect with you
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  People You May Know
                </h2>

                {suggestionsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <div className="h-5 bg-gray-200 rounded w-1/3" />
                              <div className="h-4 bg-gray-200 rounded w-full" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : suggestions?.suggestions && suggestions.suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.suggestions.map((user: any) => (
                      <ConnectionCard
                        key={user.id}
                        user={convertToConnectionUser(user)}
                        type="suggestion"
                        onConnect={handleConnect}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No suggestions available
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        We&apos;ll suggest people based on your profile and connections
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Search Results
                  {searchQuery && ` for "${searchQuery}"`}
                </h2>

                {searchQuery ? (
                  searchLoading ? (
                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-full" />
                              <div className="flex-1 space-y-2">
                                <div className="h-5 bg-gray-200 rounded w-1/3" />
                                <div className="h-4 bg-gray-200 rounded w-full" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : searchResults?.users && searchResults.users.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.users.map((user: any) => (
                        <ConnectionCard
                          key={user.id}
                          user={convertToConnectionUser(user)}
                          type="search"
                          onConnect={handleConnect}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No results found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Try different keywords or browse suggested connections
                        </p>
                      </CardContent>
                    </Card>
                  )
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Search for People
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Use the search bar above to find professionals by name, company, or skills
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}
