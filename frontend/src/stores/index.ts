import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setAuth: (user, token, refreshToken) =>
        set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      setUser: (user) => set({ user }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  
  // Modal states
  createPostModalOpen: boolean;
  profileModalOpen: boolean;
  connectionModalOpen: boolean;
  
  // Actions
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setNotifications: (enabled: boolean) => void;
  setCreatePostModalOpen: (open: boolean) => void;
  setProfileModalOpen: (open: boolean) => void;
  setConnectionModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      notifications: true,
      createPostModalOpen: false,
      profileModalOpen: false,
      connectionModalOpen: false,

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setNotifications: (enabled) => set({ notifications: enabled }),
      setCreatePostModalOpen: (open) => set({ createPostModalOpen: open }),
      setProfileModalOpen: (open) => set({ profileModalOpen: open }),
      setConnectionModalOpen: (open) => set({ connectionModalOpen: open }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

// Search State Store
interface SearchState {
  query: string;
  filters: {
    type: 'all' | 'users' | 'posts' | 'jobs';
    location?: string;
    industry?: string;
    experience?: string;
  };
  recentSearches: string[];
  
  // Actions
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchState['filters']>) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      filters: {
        type: 'all',
      },
      recentSearches: [],

      setQuery: (query) => set({ query }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      addRecentSearch: (query) =>
        set((state) => {
          const filtered = state.recentSearches.filter(search => search !== query);
          return {
            recentSearches: [query, ...filtered].slice(0, 10), // Keep only last 10 searches
          };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'search-storage',
    }
  )
);

// Connection State Store
interface ConnectionState {
  pendingRequests: number;
  
  // Actions
  setPendingRequests: (count: number) => void;
  incrementPendingRequests: () => void;
  decrementPendingRequests: () => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  pendingRequests: 0,

  setPendingRequests: (count) => set({ pendingRequests: count }),
  incrementPendingRequests: () => set((state) => ({ pendingRequests: state.pendingRequests + 1 })),
  decrementPendingRequests: () => set((state) => ({ pendingRequests: Math.max(0, state.pendingRequests - 1) })),
}));
