'use client';

import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import PdfQueuePanel from "@/components/PdfQueuePanel"; // assumed
import PdfPreview from "@/components/PdfPreview"; // assumed
import SummaryPanel from "@/components/SummaryPanel"; // assumed
import NotesPanel from "@/components/NotesPanel"; // assumed
import ChatComponent from "@/components/chat";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {

  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [selectedPdf, setSelectedPdf] = React.useState<string | null>(null);
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

useEffect(() => {
    setSummaryText(null);
    setSummaryError(null);
    setIsSummaryLoading(false); // Reset loading state too
  }, [selectedPdf]);



  
  // Restore last selected PDF from localStorage
React.useEffect(() => {
  const lastOpened = localStorage.getItem("selectedPdf");
  if (lastOpened) {
    setSelectedPdf(lastOpened);
  }
}, []);



  // ✅ Load from localStorage when component mounts
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      setUploadedFiles(JSON.parse(savedFiles));
    }
  }, []);

  // ✅  Save to localStorage every time files update
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  const handleFileUploaded = (fileName: string) => {
    setUploadedFiles((prev) => [...prev, fileName]);
  }

  const handleGenerateSummary = async () => {
    if (!selectedPdf) {
      alert("Please select a PDF to summarize.");
      return;
    }

    setIsSummaryLoading(true);
    setSummaryText(null);
    setSummaryError(null);

    try {
      // Construct the request URL using the BACKEND_URL variable
      const requestUrl = `<span class="math-inline">\{BACKEND\_URL\}/api/summarize?fileName\=</span>{encodeURIComponent(selectedPdf)}`;
      // console.log("Client: Requesting summary from URL:", requestUrl);

      const response = await fetch(requestUrl); // This is where the HTML might be coming from

      // Check if the response is OK (status in the range 200-299)
      if (!response.ok) {
        // If not OK, try to parse as text first to see if it's HTML
        const errorText = await response.text();
        console.error("Client: Server responded with an error. Status:", response.status);
        console.error("Client: Server error response text:", errorText);
        // Try to parse as JSON only if it's likely to be JSON based on content-type,
        // or just assume a generic error message if parsing text as JSON fails.
        try {
            const errorData = JSON.parse(errorText); //  where the "<!DOCTYPE" error happens
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (jsonParseError) {
            // If it's not JSON (e.g., it's an HTML 404 page), use the raw text or a generic message
            throw new Error(`Server error: ${response.status}. Response was not valid JSON. Preview: ${errorText.substring(0,100)}`);
        }
      }

      // If response.ok is true, then we expect JSON
      const data = await response.json();
      setSummaryText(data.summary);
      // console.log("Client: Summary received:", data.summary.substring(0,100) + "...");

    } catch (error) {
      console.error("Client: Error fetching summary:", error);
      setSummaryError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setIsSummaryLoading(false);
    }
  };


  return (
    <div className="flex flex-row gap-2 min-h-screen  w-max-screen bg-white">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[20vw] bg-white  p-4 flex flex-col gap-4">

        <h2 className="text-lg font-semibold text-center mb-2">📁 Upload</h2>
        <FileUpload onFileUploaded={handleFileUploaded} />

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">🗂️ Uploaded PDFs</h3>
          <PdfQueuePanel
            files={uploadedFiles}
            onSelect={(file) => setSelectedPdf(file)}
            selectedFile={selectedPdf}
          />
          <Button
            variant="destructive"
            className="mt-10 w-full"
            onClick={() => {
              localStorage.removeItem('uploadedFiles'); // 🗑️ Clear localStorage
              setUploadedFiles([]);                     // 🧼 Clear state/UI
            }}
          >
            Clear All
          </Button>

        </div>
      </aside>


      {/* MAIN VIEWER AREA */}
      <main className="w-fit min-w-[50vw]  p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">📄 PDF Preview</h2>
          {(() => {
            console.log("Selected PDF for preview:", selectedPdf); // <<< ADD THIS LOG
            if (selectedPdf) {
                  const pdfUrl = `${BACKEND_URL}/uploads/${encodeURIComponent(selectedPdf)}`;
                  console.log(`Attempting to load PDF from URL: ${pdfUrl}`); // Corrected console log
                  return <PdfPreview pdfUrl={pdfUrl} />;
                }
            else {
              return (
                <div className="w-full h-[80vh] border rounded flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500">No PDF selected. Please upload or select a PDF from the list.</p>
                </div>
              );
            }
          })()}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">🧠 Summary</h2>
            <Button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-5  py-5 rounded-lg shadow cursor-pointer"
              onClick={handleGenerateSummary}
              disabled={!selectedPdf || isSummaryLoading}
              size="sm" // Using shadcn Button
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

        {/* ACTION BUTTONS */}
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

        {/* Notes section */}
        {showNotes && (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-2">📝 Notes</h2>
            <NotesPanel />
          </div>
        )}
      </main>



      {/* CHAT SIDEBAR */}
      {showChat && (
        <aside className="w-[45vw] min-w-[20vw] border-l p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">💬 Chat Assistant</h2>
          <ChatComponent />
        </aside>
      )}
    </div>
  );
}
