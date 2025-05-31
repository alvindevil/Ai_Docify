'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(newDarkMode));
  };

  return (
    <div className={`min-h-screen w-screen flex flex-col items-center justify-center transition-colors duration-300 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-white' 
        : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-900'
    }`}>

      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-4 right-4 p-3 rounded-lg transition-colors duration-200 ${
          darkMode 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-white hover:bg-gray-100 text-gray-600'
        } shadow-lg`}
        title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {darkMode ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      <SignedOut>
        <div className={`flex flex-col items-center justify-center gap-6 p-8 border rounded-xl shadow-xl max-w-md w-full mx-4 backdrop-blur-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          {/* Logo/Brand */}
          <div className="text-center mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              AiDocify
            </h1>
            <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Sign in or sign up to start analyzing your PDFs with AI-powered insights
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <SignInButton mode="modal">
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                🔑 Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                ✨ Sign Up
              </button>
            </SignUpButton>
          </div>

          {/* Features Preview */}
          <div className={`text-center text-sm mt-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
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
            className={`text-sm underline mt-2 transition-colors duration-200 ${
              darkMode 
                ? 'text-gray-400 hover:text-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ← Back to Home
          </button>
        </div>
      </SignedOut>

      <SignedIn>
        <div className={`flex flex-col items-center justify-center gap-6 p-8 border rounded-xl shadow-xl max-w-md w-full mx-4 backdrop-blur-sm transition-colors duration-300 ${
          darkMode 
            ? 'bg-gray-800 border-gray-700 text-white' 
            : 'bg-white border-gray-200 text-gray-900'
        }`}>
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Welcome back!
            </h1>
            <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You are successfully signed in to AiDocify. Ready to analyze some documents?
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => router.push('/')}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🚀 Go to Dashboard
            </button>
            
            <SignOutButton>
              <button
                className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                onClick={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 200));
                  router.push('/');
                }}
              >
                👋 Sign Out
              </button>
            </SignOutButton>
          </div>

          <div className={`text-center text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>🎯 Start uploading PDFs to unlock AI insights!</p>
          </div>
        </div>
      </SignedIn>
    </div>
  );
}
