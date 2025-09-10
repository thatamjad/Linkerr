'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle,
  Search,
  Phone,
  Video,
  MoreHorizontal,
  Send,
  Smile,
  Paperclip,
  Star,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
    isOnline: boolean;
  }[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
}

const ConversationItem: React.FC<{ 
  conversation: Conversation; 
  isSelected: boolean; 
  onClick: () => void 
}> = ({ conversation, isSelected, onClick }) => {
  const otherParticipant = conversation.participants[0]; // For now, assume 1-on-1 conversations
  
  return (
    <motion.div
      whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
      onClick={onClick}
      className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-800 ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-r-4 border-r-blue-500' : ''
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={otherParticipant.avatar} alt={otherParticipant.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {otherParticipant.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          {otherParticipant.isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
          )}
          
          {conversation.isPinned && (
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="h-2 w-2 text-white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {otherParticipant.name}
            </h3>
            
            <div className="flex items-center space-x-2">
              {conversation.lastMessage && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {conversation.lastMessage.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              )}
              
              {conversation.unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs flex items-center justify-center">
                  {conversation.unreadCount}
                </Badge>
              )}
            </div>
          </div>
          
          {otherParticipant.title && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {otherParticipant.title}
            </p>
          )}
          
          {conversation.lastMessage && (
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mt-1">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MessageBubble: React.FC<{ message: Message; isOwn: boolean }> = ({ message, isOwn }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
        }`}
      >
        <p className="text-sm">{message.content}</p>
        
        <div className={`flex items-center mt-1 text-xs ${
          isOwn ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          
          {isOwn && (
            <CheckCircle2 className={`h-3 w-3 ml-1 ${
              message.isRead ? 'text-blue-200' : 'text-blue-300'
            }`} />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');

  // Mock data
  const [conversations] = useState<Conversation[]>([
    {
      id: '1',
      participants: [
        {
          id: '2',
          name: 'Sarah Johnson',
          title: 'Senior Product Manager at TechCorp',
          isOnline: true
        }
      ],
      lastMessage: {
        id: '1',
        senderId: '2',
        content: 'Thanks for connecting! I&apos;d love to discuss potential collaboration opportunities.',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        isRead: false
      },
      unreadCount: 2,
      isPinned: true
    },
    {
      id: '2',
      participants: [
        {
          id: '3',
          name: 'Michael Chen',
          title: 'Full Stack Developer at StartupXYZ',
          isOnline: false
        }
      ],
      lastMessage: {
        id: '2',
        senderId: '1',
        content: 'Great meeting you at the conference!',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        isRead: true
      },
      unreadCount: 0,
      isPinned: false
    },
    {
      id: '3',
      participants: [
        {
          id: '4',
          name: 'Emily Rodriguez',
          title: 'UX Designer at DesignStudio',
          isOnline: true
        }
      ],
      lastMessage: {
        id: '3',
        senderId: '4',
        content: 'I have some ideas for your project that might be helpful.',
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isRead: false
      },
      unreadCount: 1,
      isPinned: false
    }
  ]);

  const [messages] = useState<Message[]>([
    {
      id: '1',
      senderId: '2',
      content: 'Hi! Thanks for connecting. I saw your recent post about React optimization.',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true
    },
    {
      id: '2',
      senderId: '1',
      content: 'Hi Sarah! Thank you for reaching out. Yes, performance optimization is one of my favorite topics.',
      timestamp: new Date(Date.now() - 1500000),
      isRead: true
    },
    {
      id: '3',
      senderId: '2',
      content: 'Perfect! I&apos;d love to discuss potential collaboration opportunities. Are you available for a quick call this week?',
      timestamp: new Date(Date.now() - 300000),
      isRead: false
    }
  ]);

  const filteredConversations = conversations.filter(conv =>
    conv.participants.some(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const selectedConv = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)
    : null;

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      // Add message logic here
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Messages
                </h1>
                
                <Button size="icon" variant="ghost">
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence>
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversation === conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                  />
                ))}
              </AnimatePresence>
              
              {filteredConversations.length === 0 && (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-300">
                    No conversations found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage 
                            src={selectedConv.participants[0].avatar} 
                            alt={selectedConv.participants[0].name} 
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {selectedConv.participants[0].name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        {selectedConv.participants[0].isOnline && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {selectedConv.participants[0].name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedConv.participants[0].isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button size="icon" variant="ghost">
                        <Phone className="h-5 w-5" />
                      </Button>
                      
                      <Button size="icon" variant="ghost">
                        <Video className="h-5 w-5" />
                      </Button>
                      
                      <Button size="icon" variant="ghost">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === '1'} // Current user ID
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-end space-x-2">
                    <Button size="icon" variant="ghost">
                      <Paperclip className="h-5 w-5" />
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="pr-10"
                      />
                      
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              /* No Conversation Selected */
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Choose a conversation from the sidebar to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
