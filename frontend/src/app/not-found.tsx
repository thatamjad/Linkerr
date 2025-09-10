'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div>
          {/* 404 Animation */}
          <div className="text-8xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            404
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Page Not Found
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium">
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Link>

              <button 
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-md font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </button>
            </div>

            <Link href="/dashboard" className="inline-flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
              <Search className="w-4 h-4 mr-2" />
              Browse Dashboard
            </Link>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full blur-xl" />
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full blur-xl" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-indigo-200 rounded-full blur-xl transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
