// API Types
export interface User {
  id: string;
  email: string;
  profile: {
    name: string;
    bio: string;
    location: string;
    avatar?: string;
    coverImage?: string;
    skills: string[];
    experience: Experience[];
    education: Education[];
    connections: number;
    followers: number;
    following: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    title?: string;
  };
  content: string;
  images?: string[];
  video?: string;
  document?: {
    name: string;
    url: string;
    type: string;
  };
  likes: {
    count: number;
    hasLiked: boolean;
    recentLikes: Array<{
      id: string;
      name: string;
      avatar?: string;
    }>;
  };
  comments: {
    count: number;
    items: Comment[];
  };
  shares: {
    count: number;
    hasShared: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  likes: number;
  hasLiked: boolean;
  replies: Comment[];
  createdAt: string;
}

export interface Connection {
  id: string;
  requester: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    company: string;
    location: string;
  };
  recipient: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    company: string;
    location: string;
  };
  user?: {
    id: string;
    name: string;
    avatar?: string;
    title: string;
    company: string;
    location: string;
  };
  status: 'pending' | 'accepted' | 'declined';
  requestedAt: string;
  acceptedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  company: {
    name: string;
    logo?: string;
    location: string;
  };
  description: string;
  requirements: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  type: 'full-time' | 'part-time' | 'contract' | 'freelance';
  level: 'entry' | 'mid' | 'senior' | 'executive';
  remote: boolean;
  tags: string[];
  postedAt: string;
  expiresAt: string;
  applicants: number;
  source: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'connection' | 'job' | 'mention';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface PostForm {
  content: string;
  images?: FileList;
  video?: File;
  document?: File;
  privacy: 'public' | 'connections' | 'private';
}

export interface ProfileForm {
  name: string;
  bio: string;
  location: string;
  skills: string[];
  website?: string;
  phone?: string;
}

// UI Component Props Types
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Socket Events
export interface SocketEvents {
  notification: (notification: Notification) => void;
  postLiked: (data: { postId: string; userId: string; userName: string }) => void;
  postCommented: (data: { postId: string; comment: Comment }) => void;
  connectionRequest: (data: { fromUser: User }) => void;
  connectionAccepted: (data: { user: User }) => void;
}
