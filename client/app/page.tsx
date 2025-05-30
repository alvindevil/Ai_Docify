'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
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

  // Check authentication status and redirect accordingly
  useEffect(() => {
    if (isSignedIn) {
      setCurrentView('main');
    } else {
      setCurrentView('landing');
    }
  }, [isSignedIn]);

  // Reset summary when PDF changes
  useEffect(() => {
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(false);
  }, [selectedPdf]);

  // Load last selected PDF from localStorage
  useEffect(() => {
    const lastOpened = localStorage.getItem("selectedPdf");
    if (lastOpened) {
      setSelectedPdf(lastOpened);
    }
  }, []);

  // Load uploaded files from localStorage
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // Save uploaded files to localStorage
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleFileUploaded = (fileName: string) => {
    setUploadedFiles((prev) => [...prev, fileName]);
  };

  const handleGetStarted = () => {
    router.push('/auth'); // Navigate to your Clerk auth page
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

  // Show landing page if not signed in or if explicitly requested
  if (!isSignedIn || currentView === 'landing') {
    return (
      <LandingPage 
        darkMode={darkMode} 
        toggleDarkMode={toggleDarkMode} 
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Main application view (after successful authentication)
  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-row gap-2 min-h-screen w-max-screen bg-white dark:bg-gray-900 text-black dark:text-white">

        {/* LEFT SIDEBAR */}
        <aside className="w-[20vw] p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📁 Upload</h2>
            {/* User info and back to landing */}
            <div className="flex flex-col items-end">
              {user && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}
                </div>
              )}
              <button
                onClick={handleBackToLanding}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                title="Back to Landing"
              >
                ← Landing
              </button>
            </div>
          </div>
          
          <FileUpload onFileUploaded={handleFileUploaded} />

          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2">🗂️ Uploaded PDFs</h3>
            <PdfQueuePanel
              files={uploadedFiles}
              onSelect={(file) => {
                setSelectedPdf(file);
                localStorage.setItem("selectedPdf", file);
              }}
              selectedFile={selectedPdf}
            />
            <Button
              variant="destructive"
              className="mt-10 w-full"
              onClick={() => {
                localStorage.removeItem('uploadedFiles');
                setUploadedFiles([]);
              }}
            >
              Clear All
            </Button>
          </div>
        </aside>

        {/* MAIN VIEWER AREA */}
        <main className="w-fit min-w-[50vw] p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AiDocify Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/auth')}
                className="text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
              >
                Account
              </button>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">📄 PDF Preview</h2>
            {selectedPdf ? (
              <PdfPreview pdfUrl={`${BACKEND_URL}/uploads/${encodeURIComponent(selectedPdf)}`} />
            ) : (
              <div className="w-full h-[80vh] border rounded flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">No PDF selected. Please upload or select a PDF from the list.</p>
                  <p className="text-sm text-gray-400">
                    Welcome to your AI-powered document assistant, {user?.firstName || 'User'}!
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">🧠 Summary</h2>
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

          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow"
            >
              📝 Take Notes
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow"
            >
              ❓ Ask Queries
            </button>
          </div>

          {showNotes && (
            <div className="mt-4">
              <h2 className="text-xl font-bold mb-2">📝 Notes</h2>
              <NotesPanel />
            </div>
          )}
        </main>

        {/* CHAT SIDEBAR */}
        {showChat && (
          <aside className="w-[45vw] min-w-[20vw] border-l p-4 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2">💬 Chat Assistant</h2>
            <ChatComponent />
          </aside>
        )}
      </div>
    </div>
  );
}