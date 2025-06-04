'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { useUser, UserButton } from '@clerk/nextjs';
import FileUpload from '@/components/file-upload';
import PdfQueuePanel from '@/components/PdfQueuePanel';
import PdfPreview from '@/components/PdfPreview';
import SummaryPanel from '@/components/SummaryPanel';
import NotesPanel from '@/components/NotesPanel';
import ChatComponent from '@/components/chat';
import { Button } from '@/components/ui/button';
import LandingPage from '@/LandingPage_comp/LandingPage/index';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ArrowLeft } from "lucide-react";
import { Sun, Moon } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type AppState = 'landing' | 'main';

// Create a new component to contain the logic that uses useSearchParams
function PageContent() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams(); // This hook causes the issue without Suspense

  
  // Initialize dark mode state properly
  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<AppState>('landing');
  
  // Initialize dark mode from localStorage and system preference
  useEffect(() => {
    const initializeDarkMode = () => {
      try {
        // Check localStorage first
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme !== null) {
          setDarkMode(JSON.parse(savedTheme));
        } else {
          // Fall back to system preference
          const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(systemPrefersDark);
        }
      } catch (error) {
        console.error('Error initializing dark mode:', error);
        setDarkMode(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeDarkMode();
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
      } catch (error) {
        console.error('Error saving dark mode preference:', error);
      }
    }
  }, [darkMode, isInitialized]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setCurrentView('main');
    } else {
      setCurrentView('landing');
    }
  }, [isSignedIn]);

  // This useEffect uses searchParams and is a likely cause for the build error
  useEffect(() => {
    if (pathname === '/' && searchParams?.get('view') === 'main' && isSignedIn) {
      // Logic to switch to main view if applicable (already handled by currentView state)
      return;
    }

    if (pathname === '/' && searchParams?.get('scrollToUpload') === 'true') {
      setTimeout(() => {
        const possibleIds = ['uploadSection', 'upload-section', 'upload', 'file-upload'];
        let uploadSection = null;
        
        for (const id of possibleIds) {
          uploadSection = document.getElementById(id);
          if (uploadSection) break;
        }
        
        if (uploadSection) {
          uploadSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, searchParams, isSignedIn]);


  useEffect(() => {
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(false);
  }, [selectedPdf]);

  useEffect(() => {
    const lastOpened = localStorage.getItem("selectedPdf");
    if (lastOpened) {
      setSelectedPdf(lastOpened);
    }
  }, []);

  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleFileUploaded = (fileName: string) => {
    setUploadedFiles((prev) => [...prev, fileName]);
  };

  const handleGetStarted = () => {
    router.push('/auth');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const handleGenerateSummary = async () => {
    if (!selectedPdf) {
      alert("Please select a PDF to summarize.");
      return;
    }

    setIsSummaryLoading(true);
    setSummaryText(null);
    setSummaryError(null);

    try {
      const requestUrl = `${BACKEND_URL}/api/summarize?fileName=${encodeURIComponent(selectedPdf)}`;
      const response = await fetch(requestUrl);

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`Server error: ${response.status}. Response was not valid JSON. Preview: ${errorText.substring(0, 100)}`);
        }
      }

      const data = await response.json();
      setSummaryText(data.summary);

    } catch (error) {
      console.error("Client: Error fetching summary:", error);
      setSummaryError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Show loading state until dark mode is initialized to prevent flash
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || currentView === 'landing') {
    return (
      <LandingPage 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onGetStarted={handleGetStarted}
      />
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-200 ${
        darkMode 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        
        {/* TOP HEADER BAR */}
        <header className={`w-full px-4 sm:px-6 py-4 border-b transition-colors duration-200 ${
          darkMode 
            ? 'border-gray-700 bg-gray-800/80 backdrop-blur-sm' 
            : 'border-gray-200 bg-white/80 backdrop-blur-sm'
        }`}>
          <div className="flex items-center justify-between max-w-full">
            
            {/* Left side */}
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <button
                onClick={handleBackToLanding}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                title="Back to Landing"
              >
                <ArrowLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>

              {user && (
                <div className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200 truncate">
                  Welcome,{" "}
                  <span className="font-bold">
                    {user.firstName || user.emailAddresses[0]?.emailAddress}
                  </span>
                </div>
              )}
            </div>

            {/* Center */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center flex-shrink-0 mx-2">
              AiDocify
            </h1>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-7 h-7 sm:w-8 sm:h-8",
                    userButtonPopoverCard: darkMode 
                      ? "bg-gray-800 border-gray-600 text-gray-100" 
                      : "bg-white border-gray-200 text-gray-900",
                    userButtonPopoverActionButton: darkMode 
                      ? "text-gray-100 hover:bg-gray-700" 
                      : "text-gray-900 hover:bg-gray-100"
                  }
                }}
              />
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-xl transition-colors shadow-md ${
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
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
          
          {/* Sidebar */}
          <aside className={`w-full lg:w-80 xl:w-96 p-4 border-b lg:border-b-0 lg:border-r flex flex-col transition-colors duration-200 ${
            darkMode 
              ? 'border-gray-700 bg-gray-800' 
              : 'border-gray-200 bg-white'
          }`}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-900 dark:text-gray-100">
                📁 Upload
              </h2>
              <FileUpload onFileUploaded={handleFileUploaded}  />
            </div>

            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                🗂️ Uploaded PDFs
              </h3>
              <div className="flex-1 overflow-y-auto">
                <PdfQueuePanel
                  files={uploadedFiles}
                  onSelect={(file) => {
                    setSelectedPdf(file);
                    localStorage.setItem("selectedPdf", file);
                  }}
                  selectedFile={selectedPdf}
                
                />
              </div>
             <Button
  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
  onClick={() => {
    localStorage.removeItem('uploadedFiles');
    setUploadedFiles([]);
  }}
>
  Clear All
</Button>

            </div>
          </aside>

          {/* Main Viewer */}
          <main className="flex-1 flex flex-col min-h-0 min-w-0">
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  📄 PDF Preview
                </h2>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`px-3 sm:px-4 py-2 rounded-lg shadow transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
                      showNotes 
                        ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`px-3 sm:px-4 py-2 rounded-lg shadow transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
                      showChat 
                        ? 'bg-green-700 hover:bg-green-800 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>

              <div className="h-48 sm:h-64 lg:h-[50vh] mb-6 rounded-lg overflow-hidden">
                {selectedPdf ? (
                  <PdfPreview pdfUrl={`${BACKEND_URL}/uploads/${encodeURIComponent(selectedPdf)}`} />
                ) : (
                  <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center transition-colors duration-200 ${
                    darkMode 
                      ? 'border-gray-600 bg-gray-800/50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="text-center p-4">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        No PDF selected. Please upload or select a PDF from the list.
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Welcome to your AI-powered document assistant!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Section */}
              <div className={`border-t pt-4 p-4 rounded-lg transition-colors duration-200 ${
                darkMode 
                  ? 'border-gray-700 bg-gray-800/50' 
                  : 'border-gray-200 bg-white'
              }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-3">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    🧠 Summary
                  </h2>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors w-full sm:w-auto"
                    onClick={handleGenerateSummary}
                    disabled={!selectedPdf || isSummaryLoading}
                    size="sm"
                  >
                    {isSummaryLoading ? "Generating..." : "Generate Summary"}
                  </Button>
                </div>
                <SummaryPanel
                  summary={summaryText}
                  isLoading={isSummaryLoading}
                  error={summaryError}
                />
              </div>

              {/* Notes Section */}
              {showNotes && (
                <div className={`border-t pt-4 mt-4 p-4 rounded-lg transition-colors duration-200 ${
                  darkMode 
                    ? 'border-gray-700 bg-gray-800/50' 
                    : 'border-gray-200 bg-white'
                }`}>
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    📝 Notes
                  </h2>
                  <NotesPanel />
                </div>
              )}
            </div>
          </main>

          {/* Chat Sidebar */}
          {showChat && (
            <aside className={`w-full lg:w-96 xl:w-[28rem] border-t lg:border-t-0 lg:border-l flex flex-col transition-colors duration-200 ${
              darkMode 
                ? 'border-gray-700 bg-gray-800' 
                : 'border-gray-200 bg-white'
            }`}>
              <div className={`p-4 border-b transition-colors duration-200 ${
                darkMode 
                  ? 'border-gray-700 bg-gray-800' 
                  : 'border-gray-200 bg-white'
              }`}>
                <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  💬 Chat Assistant
                </h2>
              </div>
              <div className={`flex-1 p-4 transition-colors duration-200 ${
                darkMode 
                  ? 'bg-gray-800' 
                  : 'bg-white'
              }`}>
                <ChatComponent />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
export default function Home() {
  return (

    <Suspense fallback={<div>Loading...</div>}> {/* Or any loading spinner/skeleton component */}
    
      <PageContent />
    </Suspense>
  );
}