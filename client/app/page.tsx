'use client';

import React, { useState, useEffect } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import FileUpload from '@/components/file-upload';
import PdfQueuePanel from '@/components/PdfQueuePanel';
import PdfPreview from '@/components/PdfPreview';
import SummaryPanel from '@/components/SummaryPanel';
import NotesPanel from '@/components/NotesPanel';
import ChatComponent from '@/components/chat';
import { Button } from '@/components/ui/button';
import LandingPage from '@/LandingPage_comp/LandingPage/index';
import { useRouter } from 'next/navigation';

const BACKEND_URL = "http://localhost:8000";

type AppState = 'landing' | 'main';

export default function Home() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppState>('landing');
  
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
      <div className={`min-h-screen text-black dark:text-white ${darkMode ? 'bg-[#3a3a3a]' : 'bg-white'}`}>
        
        {/* TOP HEADER BAR */}
        <header className={`w-full px-6 py-4 border-b ${darkMode ? 'border-gray-600 bg-[#3a3a3a]' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            
            {/* Left side */}
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome, <span className="font-medium text-gray-800 dark:text-gray-200">{user.firstName || user.emailAddresses[0]?.emailAddress}</span>
                </div>
              )}
              <button
                onClick={handleBackToLanding}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline transition-colors"
              >
                ← Landing
              </button>
            </div>

            {/* Center */}
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AiDocify Dashboard
            </h1>

            {/* Right side - Updated Account Button */}
            <div className="flex items-center gap-3">
              <UserButton 
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: darkMode ? "bg-[#3a3a3a] border-gray-600" : "bg-white border-gray-200",
                    userButtonPopoverActionButton: darkMode ? "text-white hover:bg-gray-700" : "text-black hover:bg-gray-100"
                  }
                }}
              />
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <div className="flex h-[calc(100vh-80px)]">
          
          {/* Sidebar */}
          <aside className={`w-80 p-4 border-r flex flex-col ${darkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-200 bg-gray-50'}`}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                📁 Upload
              </h2>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>

            <div className="flex-1 flex flex-col">
              <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
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
                variant="destructive"
                className="mt-4 w-full"
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
          <main className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  📄 PDF Preview
                </h2>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`px-4 py-2 rounded-lg shadow transition-colors ${
                      showNotes 
                        ? 'bg-blue-700 hover:bg-blue-800 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    📝 Notes
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`px-4 py-2 rounded-lg shadow transition-colors ${
                      showChat 
                        ? 'bg-green-700 hover:bg-green-800 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    💬 Chat
                  </button>
                </div>
              </div>

              <div className="h-[60vh] mb-6">
                {selectedPdf ? (
                  <PdfPreview pdfUrl={`${BACKEND_URL}/uploads/${encodeURIComponent(selectedPdf)}`} />
                ) : (
                  <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center ${darkMode ? 'border-gray-500 bg-[#2a2a2a]' : 'border-gray-300 bg-gray-50'}`}>
                    <div className="text-center">
                      <p className="text-gray-500 mb-2">No PDF selected. Please upload or select a PDF from the list.</p>
                      <p className="text-sm text-gray-400">Welcome to your AI-powered document assistant!</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`border-t pt-4 p-4 rounded-lg ${darkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-xl font-bold flex items-center gap-2">🧠 Summary</h2>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
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

              {showNotes && (
                <div className={`border-t pt-4 mt-4 p-4 rounded-lg ${darkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-200 bg-gray-50'}`}>
                  <h2 className="text-xl font-bold mb-3 flex items-center gap-2">📝 Notes</h2>
                  <NotesPanel />
                </div>
              )}
            </div>
          </main>

          {showChat && (
            <aside className={`w-96 border-l flex flex-col ${darkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-200 bg-white'}`}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-600 bg-[#2a2a2a]' : 'border-gray-200 bg-white'}`}>
                <h2 className="text-lg font-semibold flex items-center gap-2">💬 Chat Assistant</h2>
              </div>
              <div className={`flex-1 p-4 ${darkMode ? 'bg-[#2a2a2a]' : 'bg-white'}`}>
                <ChatComponent />
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
