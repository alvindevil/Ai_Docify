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

// Add this interface after your imports
interface UploadedFile {
    name: string;      // The original filename for display
    publicId: string;  // The unique ID from Cloudinary
    fileUrl: string;   // The secure URL from Cloudinary
}

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
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<UploadedFile | null>(null);
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

  // Effects to load file state from localStorage on initial render
  useEffect(() => {
    // Load the list of all uploaded files
    const savedFilesJson = localStorage.getItem('uploadedFiles');
    if (savedFilesJson) {
      try {
        const files: UploadedFile[] = JSON.parse(savedFilesJson);
        setUploadedFiles(files);

        // Then, check for the last selected file
        const lastOpenedJson = localStorage.getItem("selectedPdf");
        if (lastOpenedJson) {
          const lastOpenedFile: UploadedFile = JSON.parse(lastOpenedJson);
          // Ensure the last selected file is still in the main list before setting it
          if (files.some(f => f.publicId === lastOpenedFile.publicId)) {
            setSelectedPdf(lastOpenedFile);
          }
        }
      } catch (e) {
        console.error("Failed to parse file data from localStorage", e);
        // Clear corrupted data
        localStorage.removeItem('uploadedFiles');
        localStorage.removeItem('selectedPdf');
      }
    }
  }, []); // Runs only once on mount

  // Effect to save file list to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) { // Only run after initial load
        if (uploadedFiles.length > 0) {
            localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
        } else {
            localStorage.removeItem('uploadedFiles');
        }
    }
  }, [uploadedFiles, isInitialized]);

  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    } else if (isInitialized) { // Prevent overwriting on initial load
      localStorage.removeItem('uploadedFiles');
    }
  }, [uploadedFiles, isInitialized]);

  // Updated handler to work with the response object from the new backend
  const handleFileUploaded = (responseData: { fileName: string; publicId: string; fileUrl: string; }) => {
    const newFile: UploadedFile = {
      name: responseData.fileName,      // Original filename
      publicId: responseData.publicId,
      fileUrl: responseData.fileUrl,
    };
    // Add file only if it's not already in the list (based on publicId)
    if (!uploadedFiles.some(f => f.publicId === newFile.publicId)) {
        setUploadedFiles((prev) => [newFile, ...prev]);
    }
    setSelectedPdf(newFile);
    localStorage.setItem("selectedPdf", JSON.stringify(newFile));
  };

  const handleSelectPdf = (fileName: string) => {
    const fileToSelect = uploadedFiles.find(f => f.name === fileName);
    if (fileToSelect) {
      setSelectedPdf(fileToSelect);
      localStorage.setItem("selectedPdf", JSON.stringify(fileToSelect));
    }
  };

  // Add this helper function to fix the PDF preview
  const getInlinePdfUrl = (cloudinaryUrl: string | null): string => {
      if (!cloudinaryUrl) return '';
      const urlParts = cloudinaryUrl.split('/upload/');
      if (urlParts.length !== 2) return cloudinaryUrl; // Return original if structure is unexpected
      return `${urlParts[0]}/upload/fl_inline/${urlParts[1]}`;
  };

  const handleGetStarted = () => router.push('/auth');
  const handleBackToLanding = () => setCurrentView('landing');

  const handleGenerateSummary = async () => {
    if (!selectedPdf) {
      alert("Please select a PDF to summarize.");
      return;
    }
    setIsSummaryLoading(true);
    setSummaryText(null);
    setSummaryError(null);
    try {
      // Use the unique publicId to request the summary
      const requestUrl = `${BACKEND_URL}/api/summarize?publicId=${encodeURIComponent(selectedPdf.publicId)}`;
      const response = await fetch(requestUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown server error occurred.' }));
        throw new Error(errorData.message);
      }
      const data = await response.json();
      setSummaryText(data.summary);
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : "Failed to fetch summary.");
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
                    <PdfQueuePanel
                      files={uploadedFiles.map(file => file.name)} // Pass only names for display
                      onSelect={handleSelectPdf} // This handler now finds the full object
                      selectedFile={selectedPdf ? selectedPdf.name : null} // Pass the name of the selected file
                    />
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
            <div className="h-[60vh] mb-6 flex-shrink-0">
                    {selectedPdf ? (
                      // Use the helper to construct the correct, inline URL
                      <PdfPreview pdfIdentifier={selectedPdf?.publicId || null} />
                    ) : (
                      // Your placeholder JSX for when no PDF is selected
                      <div className={`w-full h-full border-2 border-dashed rounded-lg flex items-center justify-center ${darkMode ? 'border-gray-500 bg-[#2a2a2a]' : 'border-gray-300 bg-gray-50'}`}>
                        <div className="text-center">
                          <p className="text-gray-500 mb-2">No PDF selected.</p>
                          <p className="text-sm text-gray-400">Upload or select a document to get started!</p>
                        </div>
                      </div>
                    )}
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
              <ChatComponent pdfIdentifier={selectedPdf?.publicId || null} />
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