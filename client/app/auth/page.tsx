'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthPage() {
  const router = useRouter();

  // Auto redirect to main app if already signed in
  useEffect(() => {
    // Small delay to allow Clerk to initialize
    const timer = setTimeout(() => {
      // This will be handled by the SignedIn component, but we can add logic here if needed
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <SignedOut>
        <div className="flex flex-col items-center justify-center gap-6 p-8 border rounded-xl shadow-xl bg-white dark:bg-gray-800 max-w-md w-full mx-4 backdrop-blur-sm">
          {/* Logo/Brand */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              AiDocify
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Sign in or sign up to start analyzing your PDFs with AI-powered insights
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <SignInButton 
              mode="modal"
            >
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                🔑 Sign In
              </button>
            </SignInButton>
            
            <SignUpButton 
              mode="modal"
            >
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform">
                ✨ Sign Up
              </button>
            </SignUpButton>
          </div>

          {/* Features Preview */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            <p className="mb-2">🚀 Get instant access to:</p>
            <ul className="text-xs space-y-1">
              <li>• AI-powered PDF summaries</li>
              <li>• Interactive document chat</li>
              <li>• Smart note-taking</li>
              <li>• Document analysis tools</li>
            </ul>
          </div>

          {/* Back to Home */}
          <button
            onClick={() => router.push('/')}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline mt-2 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="flex flex-col items-center justify-center gap-6 p-8 border rounded-xl shadow-xl bg-white dark:bg-gray-800 max-w-md w-full mx-4 backdrop-blur-sm">
          {/* Success State */}
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back!</h1>
            <p className="text-gray-600 dark:text-gray-300 text-center">
              You're successfully signed in to AiDocify. Ready to analyze some documents?
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform"
            >
              🚀 Go to Dashboard
            </button>
            
            <SignOutButton>
              <button
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium shadow-lg hover:shadow-xl"
                onClick={async () => {
                  // Wait for sign out, then redirect
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  router.push('/');
                }}
              >
                👋 Sign Out
              </button>
            </SignOutButton>
          </div>

          {/* User Stats or Quick Actions could go here */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <p>🎯 Start uploading PDFs to unlock AI insights!</p>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}