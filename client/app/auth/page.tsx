'use client';

import { SignInButton, SignUpButton, SignedIn, SignedOut, SignOutButton } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';


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
  className={`absolute top-4 right-4 p-2 rounded-xl transition-colors shadow-md ${
    darkMode
      ? 'bg-gray-700 hover:bg-gray-600 text-yellow-300'
      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
  }`}
  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
>
  {darkMode ? (
    <Sun className="w-5 h-5" />
  ) : (
    <Moon className="w-5 h-5" />
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
              <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
                🔑 Sign In
              </button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105 cursor-pointer">
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
