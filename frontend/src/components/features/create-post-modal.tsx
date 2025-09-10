'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Image as ImageIcon,
  Video,
  FileText,
  X,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUIStore, useAuthStore } from '@/stores';
import { useCreatePost } from '@/hooks/api';
import { generateInitials } from '@/lib/utils';

const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(3000, 'Content too long'),
  privacy: z.enum(['public', 'connections', 'private']),
});

type CreatePostForm = z.infer<typeof createPostSchema>;

const privacyOptions = [
  { value: 'public', icon: Globe, label: 'Public', description: 'Anyone can see' },
  { value: 'connections', icon: Users, label: 'Connections', description: 'Only connections' },
  { value: 'private', icon: Lock, label: 'Private', description: 'Only you' },
];

export function CreatePostModal() {
  const { createPostModalOpen, setCreatePostModalOpen } = useUIStore();
  const { user } = useAuthStore();
  const createPostMutation = useCreatePost();
  
  const [selectedFiles, setSelectedFiles] = useState<{
    images: File[];
    video: File | null;
    document: File | null;
  }>({
    images: [],
    video: null,
    document: null,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<CreatePostForm>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      privacy: 'public',
    },
    mode: 'onChange',
  });

  const content = watch('content');
  const privacy = watch('privacy');

  const handleClose = () => {
    setCreatePostModalOpen(false);
    reset();
    setSelectedFiles({ images: [], video: null, document: null });
  };

  const handleFileSelect = (type: 'images' | 'video' | 'document', files: FileList | null) => {
    if (!files) return;

    if (type === 'images') {
      const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => ({ ...prev, images: [...prev.images, ...imageFiles].slice(0, 4) }));
    } else if (type === 'video') {
      const videoFile = Array.from(files).find(file => file.type.startsWith('video/'));
      if (videoFile) {
        setSelectedFiles(prev => ({ ...prev, video: videoFile }));
      }
    } else if (type === 'document') {
      const documentFile = files[0];
      if (documentFile) {
        setSelectedFiles(prev => ({ ...prev, document: documentFile }));
      }
    }
  };

  const removeFile = (type: 'images' | 'video' | 'document', index?: number) => {
    if (type === 'images' && typeof index === 'number') {
      setSelectedFiles(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      setSelectedFiles(prev => ({ ...prev, [type]: null }));
    }
  };

  const onSubmit = async (data: CreatePostForm) => {
    try {
      await createPostMutation.mutateAsync({
        content: data.content,
        privacy: data.privacy,
        images: selectedFiles.images.length > 0 ? selectedFiles.images as unknown as FileList : undefined,
        video: selectedFiles.video || undefined,
        document: selectedFiles.document || undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const selectedPrivacy = privacyOptions.find(option => option.value === privacy);

  return (
    <Dialog open={createPostModalOpen} onOpenChange={setCreatePostModalOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a post</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.profile?.avatar} />
              <AvatarFallback>
                {generateInitials(user?.profile?.name || 'User')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user?.profile?.name}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {selectedPrivacy && (
                  <>
                    <selectedPrivacy.icon className="h-3 w-3" />
                    <span>{selectedPrivacy.label}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <Textarea
              {...register('content')}
              placeholder="What do you want to talk about?"
              className="min-h-32 resize-none border-none text-lg placeholder:text-gray-400 focus:ring-0"
              error={errors.content?.message}
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{content?.length || 0}/3000</span>
              {content && content.length > 2900 && (
                <span className="text-orange-500">
                  {3000 - content.length} characters remaining
                </span>
              )}
            </div>
          </div>

          {/* File Previews */}
          <AnimatePresence>
            {(selectedFiles.images.length > 0 || selectedFiles.video || selectedFiles.document) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border rounded-lg p-4 space-y-3"
              >
                {/* Image previews */}
                {selectedFiles.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedFiles.images.map((file, index) => (
                      <div key={index} className="relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile('images', index)}
                          className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Video preview */}
                {selectedFiles.video && (
                  <div className="relative group">
                    <video
                      src={URL.createObjectURL(selectedFiles.video)}
                      className="w-full h-48 rounded-lg"
                      controls
                    />
                    <button
                      type="button"
                      onClick={() => removeFile('video')}
                      className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Document preview */}
                {selectedFiles.document && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <span className="text-sm font-medium">{selectedFiles.document.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile('document')}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload Options & Privacy */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect('images', e.target.files)}
                />
                <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect('video', e.target.files)}
                />
                <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <Video className="h-5 w-5 text-gray-500" />
                </div>
              </label>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  className="hidden"
                  onChange={(e) => handleFileSelect('document', e.target.files)}
                />
                <div className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <FileText className="h-5 w-5 text-gray-500" />
                </div>
              </label>
            </div>

            {/* Privacy Selector */}
            <select
              {...register('privacy')}
              className="px-3 py-2 border rounded-md text-sm bg-white dark:bg-gray-800"
            >
              {privacyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isValid || createPostMutation.isPending}
              loading={createPostMutation.isPending}
            >
              Post
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
