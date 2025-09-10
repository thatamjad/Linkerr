'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { CreatePostModal } from '@/components/features/create-post-modal';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Premium Background Effects */}
        <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <Navbar />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 py-6">
              {/* Sidebar - Hidden on mobile, visible on desktop */}
              <div className="hidden lg:block">
                <div className="sticky top-24">
                  <Sidebar />
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">
                <div className="animate-fade-in">
                  {children}
                </div>
              </div>

              {/* Right Sidebar - Enhanced with glass morphism */}
              <div className="hidden xl:block w-80">
                <div className="sticky top-24">
                  <div className="glass-effect rounded-2xl p-6 border border-border/50">
                    <h3 className="font-semibold text-lg mb-4 gradient-text">Promoted</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-surface border border-border/50 hover:border-primary/20 transition-colors">
                        <div className="text-sm text-muted-foreground leading-relaxed">
                          Discover trending opportunities and connect with industry leaders.
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
                        <div className="text-sm font-medium text-accent-foreground mb-2">
                          🚀 Premium Features
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Unlock advanced networking tools
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreatePostModal />
        
        {/* Enhanced Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            className: 'glass-effect',
            style: {
              background: 'hsl(var(--surface))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--primary-foreground))',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: 'hsl(var(--destructive))',
                secondary: 'hsl(var(--destructive-foreground))',
              },
            },
          }}
        />
      </div>

      {/* React Query Devtools - Only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
