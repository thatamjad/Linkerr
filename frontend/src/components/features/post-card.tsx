'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatRelativeTime, generateInitials } from '@/lib/utils';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useLikePost, useCommentOnPost } from '@/hooks/api';
import { Post } from '@/types';
import { Textarea } from '@/components/ui/textarea';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const likePostMutation = useLikePost();
  const commentMutation = useCommentOnPost();

  const handleLike = () => {
    likePostMutation.mutate({
      postId: post.id,
      isLiked: post.likes.hasLiked,
    });
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await commentMutation.mutateAsync({
        postId: post.id,
        content: commentText,
      });
      setCommentText('');
      if (!showComments) setShowComments(true);
    } catch (error) {
      console.error('Failed to comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share post:', post.id);
  };

  // const PrivacyIcon = privacyIcons[post.privacy] || Globe;

  return (
    <Card className="mb-4 dark:glass-morphism dark:hover:shadow-glow transition-all duration-300">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.author.avatar} />
              <AvatarFallback>
                {generateInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {post.author.name}
              </h3>
              {post.author.title && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {post.author.title}
                </p>
              )}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{formatRelativeTime(post.createdAt)}</span>
                {/* <PrivacyIcon className="h-3 w-3" /> */}
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Media Content */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 3 ? 'grid-cols-2' : 'grid-cols-2'
            }`}>
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className={`relative ${
                    (post.images && post.images.length === 3 && index === 0) ? 'row-span-2' : ''
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover"
                  />
                  {post.images && post.images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        +{post.images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {post.video && (
          <div className="mb-4">
            <video
              src={post.video}
              controls
              className="w-full rounded-lg"
              preload="metadata"
            />
          </div>
        )}

        {post.document && (
          <div className="mb-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {post.document.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </span>
              </div>
              <div>
                <div className="font-medium text-sm">{post.document.name}</div>
                <div className="text-xs text-gray-500">Document</div>
              </div>
            </div>
          </div>
        )}

        {/* Engagement Stats */}
        {(post.likes.count > 0 || post.comments.count > 0 || post.shares.count > 0) && (
          <div className="flex items-center justify-between py-2 mb-2 text-sm text-gray-500 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-4">
              {post.likes.count > 0 && (
                <span className="flex items-center space-x-1">
                  <span>{post.likes.count} like{post.likes.count !== 1 ? 's' : ''}</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {post.comments.count > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="hover:underline"
                >
                  {post.comments.count} comment{post.comments.count !== 1 ? 's' : ''}
                </button>
              )}
              {post.shares.count > 0 && (
                <span>{post.shares.count} share{post.shares.count !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`flex items-center space-x-2 transition-all duration-300 ${
              post.likes.hasLiked 
                ? 'text-red-500 dark:text-red-400 dark:hover:shadow-glow-destructive' 
                : 'text-gray-600 dark:text-gray-400 dark:hover:text-red-400 dark:hover:shadow-glow-destructive'
            }`}
            disabled={likePostMutation.isPending}
          >
            <motion.div
              animate={post.likes.hasLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart className={`h-4 w-4 ${post.likes.hasLiked ? 'fill-current' : ''}`} />
            </motion.div>
            <span>Like</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 dark:hover:text-primary dark:hover:shadow-glow-sm transition-all duration-300"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Comment</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 dark:hover:text-accent dark:hover:shadow-glow-accent transition-all duration-300"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 border-t border-gray-100 dark:border-gray-800/50 pt-4"
          >
            {/* Comment Input */}
            <div className="flex space-x-3 mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback>Me</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[40px] resize-none"
                  rows={1}
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleComment}
                    disabled={!commentText.trim() || isCommenting}
                    loading={isCommenting}
                  >
                    Post
                  </Button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3">
              {post.comments.items.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>
                      {generateInitials(comment.author.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 dark:bg-gray-800/60 dark:backdrop-blur-sm rounded-lg px-3 py-2 transition-colors duration-200">
                      <div className="font-semibold text-sm mb-1">
                        {comment.author.name}
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{formatRelativeTime(comment.createdAt)}</span>
                      <button className="hover:underline">Like</button>
                      <button className="hover:underline">Reply</button>
                      {comment.likes > 0 && (
                        <span>{comment.likes} like{comment.likes !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
