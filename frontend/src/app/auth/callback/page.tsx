'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refresh');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          router.push(`/login?error=${error}`);
          return;
        }

        if (!token || !refreshToken) {
          console.error('Missing tokens from OAuth callback');
          router.push('/login?error=missing_tokens');
          return;
        }

        // Verify the token and get user data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/oauth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, provider })
        });

        if (!response.ok) {
          throw new Error('Token verification failed');
        }

        const data = await response.json();
        
        // Store auth data
        setAuth(data.data.user, token, refreshToken);

        // Redirect to dashboard
        router.push('/dashboard');
      } catch (error) {
        console.error('OAuth callback error:', error);
        router.push('/login?error=callback_failed');
      }
    };

    handleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/50">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Completing Sign In
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we set up your account...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
