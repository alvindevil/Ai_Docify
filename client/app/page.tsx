'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
import { ArrowLeft, Sun, Moon } from "lucide-react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

type AppState = 'landing' | 'main';

function PageContent() { 
  const { isSignedIn, user } = useUser(); 
  const router = useRouter(); 

  const [darkMode, setDarkMode] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentView, setCurrentView] = useState<AppState>('landing');
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      try { setDarkMode(JSON.parse(savedTheme)); }
      catch (e) { setDarkMode(false); }
    } else {
      setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('darkMode', JSON.stringify(darkMode));
      if (darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    }
  }, [darkMode, isInitialized]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const [showChat, setShowChat] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentView(isSignedIn ? 'main' : 'landing');
  }, [isSignedIn]);

  useEffect(() => {
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(false);
  }, [selectedPdf]);

  useEffect(() => {
    try {
      const savedFiles = localStorage.getItem('uploadedFiles');
      if (savedFiles) {
        const files: string[] = JSON.parse(savedFiles);
        setUploadedFiles(files);
        const lastOpened = localStorage.getItem("selectedPdf");
        if (lastOpened && files.includes(lastOpened)) {
          setSelectedPdf(lastOpened);
        }
      }
    } catch (e) { console.error("Failed to load files from localStorage", e); }
  }, []);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    } else if (isInitialized) { // Prevent overwriting on initial load
      localStorage.removeItem('uploadedFiles');
    }
  }, [uploadedFiles, isInitialized]);

  const handleFileUploaded = (fileName: string) => {
    if (!uploadedFiles.includes(fileName)) {
      setUploadedFiles((prev) => [fileName, ...prev]);
    }
    setSelectedPdf(fileName);
    localStorage.setItem("selectedPdf", fileName);
  };
  
  const handleSelectPdf = (fileName: string) => {
    setSelectedPdf(fileName);
    localStorage.setItem("selectedPdf", fileName);
  };

  const handleGetStarted = () => router.push('/auth');
  const handleBackToLanding = () => setCurrentView('landing');

  const handleGenerateSummary = async () => {
    if (!selectedPdf) return;
    setIsSummaryLoading(true);
    setSummaryText(null);
    setSummaryError(null);
    try {
      const requestUrl = `${BACKEND_URL}/api/summarize?fileName=${encodeURIComponent(selectedPdf)}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
        throw new Error(errorData.message);
      }
      const data = await response.json();
      setSummaryText(data.summary);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  const handleClearFiles = () => {
      localStorage.removeItem('uploadedFiles');
      localStorage.removeItem('selectedPdf');
      setUploadedFiles([]);
      setSelectedPdf(null);
  };

  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!isSignedIn || currentView === 'landing') {
    return <LandingPage darkMode={darkMode} toggleDarkMode={toggleDarkMode} onGetStarted={handleGetStarted} />;
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
        <header className={`w-full px-4 sm:px-6 py-4 border-b sticky top-0 z-10 ${darkMode ? 'border-gray-700 bg-gray-800/80 backdrop-blur-sm' : 'border-gray-200 bg-white/80 backdrop-blur-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button onClick={handleBackToLanding} title="Back to Landing"><ArrowLeft size={24} /></button>
              {user && <div className="font-semibold truncate">Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}</div>}
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mx-4">AiDocify</h1>
            <div className="flex items-center gap-3">
              <UserButton afterSignOutUrl="/" />
              <button onClick={toggleDarkMode} title="Toggle Dark Mode">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 73px)' }}>
          <aside className={`w-full lg:w-80 xl:w-96 p-4 border-b lg:border-r flex flex-col ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-4">📁 Upload PDF</h2>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
            <div className="flex-1 flex flex-col min-h-0">
              <h3 className="text-md font-semibold mb-3">🗂️ Uploaded Documents</h3>
              <div className="flex-1 overflow-y-auto pr-2">
                <PdfQueuePanel files={uploadedFiles} onSelect={handleSelectPdf} selectedFile={selectedPdf} />
              </div>
              <Button className="mt-4 w-full" variant="destructive" onClick={handleClearFiles}>Clear All</Button>
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-h-0 min-w-0 p-4 sm:p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">📄 Document Preview</h2>
              <div className="flex gap-3">
                <Button onClick={() => setShowNotes(!showNotes)} variant={showNotes ? "secondary" : "default"}>📝 Notes</Button>
                <Button onClick={() => setShowChat(!showChat)} variant={showChat ? "secondary" : "default"}>💬 Chat</Button>
              </div>
            </div>
            
            {/* --- FIX: Pass the correct identifier to the preview component --- */}
            <div className="mb-6">
                <PdfPreview pdfIdentifier={selectedPdf} />
            </div>

            <div className={`border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-bold">🧠 AI Summary</h2>
                <Button onClick={handleGenerateSummary} disabled={!selectedPdf || isSummaryLoading} size="sm">{isSummaryLoading ? "Generating..." : "Generate Summary"}</Button>
              </div>
              <SummaryPanel summary={summaryText} isLoading={isSummaryLoading} error={summaryError} />
            </div>

            {showNotes && (
              <div className={`mt-4 border-t pt-4 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className="text-xl font-bold mb-3">📝 Notes</h2>
                <NotesPanel />
              </div>
            )}
          </main>

          {showChat && (
            <aside className={`w-full lg:w-96 xl:w-[28rem] border-t lg:border-l flex flex-col ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">💬 Chat Assistant</h2>
              </div>
              {/* --- FIX: Pass the selected PDF ID down to the chat component --- */}
              <ChatComponent pdfIdentifier={selectedPdf} />
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

// Suspense wrapper is needed because PageContent may use hooks like useSearchParams
export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PageContent />
    </Suspense>
  );
}