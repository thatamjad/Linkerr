'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg w-full"
          >
            <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 10
                  }}
                  className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4"
                >
                  <AlertTriangle className="text-white w-8 h-8" />
                </motion.div>
                
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Something went wrong!
                </CardTitle>
                
                <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                  We encountered an unexpected error. This has been logged and we&apos;re looking into it.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {process.env.NODE_ENV === 'development' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      Error Details (Development Only):
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400 font-mono">
                      {error.message}
                    </p>
                    {error.digest && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Error ID: {error.digest}
                      </p>
                    )}
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={reset}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = '/'}
                    >
                      <Home className="w-4 h-4 mr-2" />
                      Go Home
                    </Button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      If the problem persists, please contact our{' '}
                      <a 
                        href="mailto:support@linkerr.com" 
                        className="text-blue-600 hover:text-blue-500 underline"
                      >
                        support team
                      </a>
                    </p>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="absolute top-20 left-10 w-20 h-20 bg-red-200 rounded-full blur-xl" />
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-orange-200 rounded-full blur-xl" />
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-yellow-200 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
