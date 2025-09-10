import { apiClient } from './api-client';
import type {
  ApiResponse,
  LoginForm,
  RegisterForm,
  PostForm,
  ProfileForm,
  User,
  Post,
  Connection,
  Job,
  Notification,
  PaginatedResponse
} from '@/types';

// Auth APIs
export const authApi = {
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    try {
      const response = await apiClient.post('/api/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        error: error.response?.status === 401 ? 'Invalid credentials' : 'Login failed'
      };
    }
  },

  async register(userData: RegisterForm): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        error: error.response?.status === 409 ? 'User already exists' : 'Registration failed'
      };
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post('/api/auth/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Logout failed',
        error: 'Logout failed'
      };
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const response = await apiClient.post('/api/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Token refresh failed',
        error: 'Token refresh failed'
      };
    }
  }
};

// User APIs
export const userApi = {
  async getProfile(userId?: string): Promise<ApiResponse<User>> {
    try {
      const endpoint = userId ? `/api/users/profile/${userId}` : '/api/users/profile';
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch profile',
        error: error.response?.status === 404 ? 'Profile not found' : 'Failed to fetch profile'
      };
    }
  },

  async updateProfile(profileData: ProfileForm): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.put('/api/users/profile', profileData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Profile update failed',
        error: 'Profile update failed'
      };
    }
  },

  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await apiClient.post('/api/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Avatar upload failed',
        error: 'Avatar upload failed'
      };
    }
  },

  async searchUsers(query: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const response = await apiClient.get(`/api/users/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'User search failed',
        error: 'User search failed'
      };
    }
  }
};

// Post APIs
export const postApi = {
  async createPost(postData: PostForm): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.post('/api/posts', postData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create post',
        error: 'Failed to create post'
      };
    }
  },

  async getFeed(page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Post>>> {
    try {
      const response = await apiClient.get(`/api/posts/feed?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch posts',
        error: 'Failed to fetch posts'
      };
    }
  },

  async getPost(postId: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.get(`/api/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch post',
        error: error.response?.status === 404 ? 'Post not found' : 'Failed to fetch post'
      };
    }
  },

  async likePost(postId: string): Promise<ApiResponse<{ likesCount: number; isLiked: boolean }>> {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/like`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to like post',
        error: 'Failed to like post'
      };
    }
  },

  async commentOnPost(postId: string, content: string): Promise<ApiResponse<{ comment: any; commentsCount: number }>> {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/comment`, { content });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add comment',
        error: 'Failed to add comment'
      };
    }
  },

  async sharePost(postId: string, message?: string): Promise<ApiResponse<Post>> {
    try {
      const response = await apiClient.post(`/api/posts/${postId}/share`, { message });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to share post',
        error: 'Failed to share post'
      };
    }
  },

  async deletePost(postId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/posts/${postId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete post',
        error: error.response?.status === 403 ? 'Not authorized to delete post' : 'Failed to delete post'
      };
    }
  }
};

// Connection APIs
export const connectionApi = {
  async sendConnectionRequest(userId: string, message?: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`/api/connections/send/${userId}`, { message });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send connection request',
        error: 'Failed to send connection request'
      };
    }
  },

  async respondToConnectionRequest(connectionId: string, action: 'accept' | 'decline'): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`/api/connections/respond/${connectionId}`, { action });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to respond to connection request',
        error: 'Failed to respond to connection request'
      };
    }
  },

  async getConnections(status?: 'pending' | 'accepted' | 'declined', type?: 'sent' | 'received'): Promise<ApiResponse<{ connections: Connection[] }>> {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (type) params.append('type', type);
      
      const response = await apiClient.get(`/api/connections?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch connections',
        error: 'Failed to fetch connections'
      };
    }
  },

  async getMutualConnections(userId: string): Promise<ApiResponse<{ mutualConnections: User[] }>> {
    try {
      const response = await apiClient.get(`/api/connections/mutual/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch mutual connections',
        error: 'Failed to fetch mutual connections'
      };
    }
  },

  async removeConnection(connectionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/connections/${connectionId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to remove connection',
        error: 'Failed to remove connection'
      };
    }
  }
};

// Job APIs
export const jobApi = {
  async searchJobs(filters: Record<string, any>): Promise<ApiResponse<PaginatedResponse<Job>>> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
      
      const response = await apiClient.get(`/api/jobs?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search jobs',
        error: 'Failed to search jobs'
      };
    }
  },

  async getRecommendedJobs(): Promise<ApiResponse<{ jobs: Job[] }>> {
    try {
      const response = await apiClient.get('/api/jobs/recommended');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch recommended jobs',
        error: 'Failed to fetch recommended jobs'
      };
    }
  },

  async saveJob(jobId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post(`/api/jobs/${jobId}/save`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to save job',
        error: 'Failed to save job'
      };
    }
  },

  async getSavedJobs(): Promise<ApiResponse<{ jobs: Job[] }>> {
    try {
      const response = await apiClient.get('/api/jobs/saved');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch saved jobs',
        error: 'Failed to fetch saved jobs'
      };
    }
  }
};

// Notification APIs
export const notificationApi = {
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<PaginatedResponse<Notification>>> {
    try {
      const response = await apiClient.get(`/api/notifications?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch notifications',
        error: 'Failed to fetch notifications'
      };
    }
  },

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put(`/api/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark notification as read',
        error: 'Failed to mark notification as read'
      };
    }
  },

  async markAllAsRead(): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.put('/api/notifications/read-all');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to mark all notifications as read',
        error: 'Failed to mark all notifications as read'
      };
    }
  },

  async deleteNotification(notificationId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/api/notifications/${notificationId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete notification',
        error: 'Failed to delete notification'
      };
    }
  }
};

// Search APIs
export const searchApi = {
  async searchUsers(query: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<User>>> {
    try {
      const response = await apiClient.get(`/api/search/users?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search users',
        error: 'Failed to search users'
      };
    }
  },

  async searchPosts(query: string, page = 1, limit = 10): Promise<ApiResponse<PaginatedResponse<Post>>> {
    try {
      const response = await apiClient.get(`/api/search/posts?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to search posts',
        error: 'Failed to search posts'
      };
    }
  },

  async globalSearch(query: string): Promise<ApiResponse<{ users: User[]; posts: Post[]; jobs: Job[] }>> {
    try {
      const response = await apiClient.get(`/api/search/global?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to perform global search',
        error: 'Failed to perform global search'
      };
    }
  }
};
