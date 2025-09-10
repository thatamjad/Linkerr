import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  authApi,
  userApi,
  postApi,
  connectionApi,
  jobApi,
  notificationApi,
  searchApi
} from '@/lib/api';
import { useAuthStore } from '@/stores';
import type {
  LoginForm,
  RegisterForm,
  PostForm,
  ProfileForm,
  Post,
  PaginatedResponse
} from '@/types';

// Auth Hooks
export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: LoginForm) => authApi.login(credentials),
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { user, token, refreshToken } = data.data;
        setAuth(user, token, refreshToken);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('Welcome back!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData: RegisterForm) => authApi.register(userData),
    onSuccess: (data) => {
      if (data.success && data.data) {
        const { user, token, refreshToken } = data.data;
        setAuth(user, token, refreshToken);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('Account created successfully!');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Registration failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
    onError: (error: Error) => {
      clearAuth();
      queryClient.clear();
      toast.error(error.message || 'Logout failed');
    },
  });
};

// User Hooks
export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['user', 'profile', userId || 'me'],
    queryFn: () => userApi.getProfile(userId),
    select: (data) => data.data,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (profileData: ProfileForm) => userApi.updateProfile(profileData),
    onSuccess: (data) => {
      if (data.success && data.data) {
        setUser(data.data);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        toast.success('Profile updated successfully');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userApi.uploadAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Avatar updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
};

export const useSearchUsers = (query: string, enabled = true) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => userApi.searchUsers(query, 1),
    enabled: enabled && query.length > 0,
    select: (data) => data.data,
  });
};

export const useUserSuggestions = () => {
  return useQuery({
    queryKey: ['users', 'suggestions'],
    queryFn: () => userApi.getSuggestions(),
    select: (data) => data.data,
  });
};

// Post Hooks
export const useFeed = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['posts', 'feed', page],
    queryFn: () => postApi.getFeed(page, limit),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postData: PostForm) => postApi.createPost(postData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] });
      toast.success('Post created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create post');
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) => 
      isLiked ? postApi.unlikePost(postId) : postApi.likePost(postId),
    onMutate: async ({ postId, isLiked }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousFeed = queryClient.getQueryData(['posts', 'feed']);

      // Optimistically update the like count and status
      queryClient.setQueryData(['posts', 'feed'], (oldData: PaginatedResponse<Post> | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          items: oldData.items.map((post: Post) => 
            post.id === postId 
              ? {
                  ...post,
                  likes: {
                    ...post.likes,
                    hasLiked: !isLiked,
                    count: isLiked ? post.likes.count - 1 : post.likes.count + 1,
                  }
                }
              : post
          )
        };
      });

      return { previousFeed };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFeed) {
        queryClient.setQueryData(['posts', 'feed'], context.previousFeed);
      }
      toast.error('Failed to update like');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useCommentOnPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, content, parentId }: { postId: string; content: string; parentId?: string }) => 
      postApi.commentOnPost(postId, content, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success('Comment added');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add comment');
    },
  });
};

// Connection Hooks
export const useConnections = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['connections', page],
    queryFn: () => connectionApi.getConnections(page, limit),
    select: (data) => data.data,
  });
};

export const useConnectionRequests = (type: 'received' | 'sent') => {
  return useQuery({
    queryKey: ['connections', 'requests', type],
    queryFn: () => connectionApi.getConnectionRequests(type),
    select: (data) => data.data,
  });
};

export const useSendConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, message }: { userId: string; message?: string }) => 
      connectionApi.sendConnectionRequest(userId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request sent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send connection request');
    },
  });
};

export const useAcceptConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionApi.acceptConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request accepted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept connection request');
    },
  });
};

export const useDeclineConnectionRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (connectionId: string) => connectionApi.declineConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      toast.success('Connection request declined');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to decline connection request');
    },
  });
};

export const useConnectionSuggestions = () => {
  return useQuery({
    queryKey: ['connections', 'suggestions'],
    queryFn: () => connectionApi.getSuggestions(),
    select: (data) => data.data,
  });
};

// Job Hooks
export const useJobSearch = (
  query?: string,
  location?: string,
  jobType?: string,
  experience?: string,
  page = 1,
  enabled = true
) => {
  return useQuery({
    queryKey: ['jobs', 'search', query, location, jobType, experience, page],
    queryFn: () => jobApi.searchJobs(query, location, jobType, experience, page),
    enabled,
    select: (data) => data.data,
  });
};

export const useJobRecommendations = () => {
  return useQuery({
    queryKey: ['jobs', 'recommendations'],
    queryFn: () => jobApi.getJobRecommendations(),
    select: (data) => data.data,
  });
};

export const useApplyToJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, coverLetter, resume }: { jobId: string; coverLetter?: string; resume?: File }) => 
      jobApi.applyToJob(jobId, coverLetter, resume),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Application submitted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, isSaved }: { jobId: string; isSaved: boolean }) => 
      isSaved ? jobApi.unsaveJob(jobId) : jobApi.saveJob(jobId),
    onSuccess: (_, { isSaved }) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success(isSaved ? 'Job unsaved' : 'Job saved');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update job');
    },
  });
};

export const useSavedJobs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['jobs', 'saved', page],
    queryFn: () => jobApi.getSavedJobs(page, limit),
    select: (data) => data.data,
  });
};

// Notification Hooks
export const useNotifications = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationApi.getNotifications(page, limit),
    select: (data) => data.data,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationApi.getUnreadCount(),
    select: (data) => data.data?.count || 0,
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });
};

// Search Hook
export const useGlobalSearch = (
  query: string,
  type: 'users' | 'posts' | 'jobs' | 'all' = 'all',
  enabled = true
) => {
  return useQuery({
    queryKey: ['search', query, type],
    queryFn: () => searchApi.globalSearch(query, type),
    enabled: enabled && query.length > 0,
    select: (data) => data.data,
  });
};
