'use client';

import React, { useState } from "react";
import FileUpload from "@/components/file-upload";
import PdfQueuePanel from "@/components/PdfQueuePanel"; // assumed
import PdfPreview from "@/components/PdfPreview"; // assumed
import SummaryPanel from "@/components/SummaryPanel"; // assumed
import NotesPanel from "@/components/NotesPanel"; // assumed
import ChatComponent from "@/components/chat";

export default function Home() {

  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  

   const handleFileUploaded = (fileName: string) => {
    setUploadedFiles((prev) => [...prev, fileName]);
  }

  return (
    <div className="flex flex-row gap-2 min-h-screen w-screen bg-white">
      
      {/* LEFT SIDEBAR */}
      <aside className="w-[18vw] bg-white  p-4 flex flex-col gap-4">

        <h2 className="text-lg font-semibold text-center mb-2">📁 Upload</h2>
        <FileUpload onFileUploaded={handleFileUploaded} />

        <div className="mt-4">
          <h3 className="text-md font-semibold mb-2">🗂️ Uploaded PDFs</h3>
          <PdfQueuePanel files={uploadedFiles} />
        </div>
      </aside>


      {/* MAIN VIEWER AREA */}
      <main className="w-[55vw] p-6 flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">📄 PDF Preview</h2>
          <PdfPreview pdfUrl={null} />
        </div>

        <div>
          <h2 className="text-xl font-bold mb-2">🧠 Summary</h2>
          <SummaryPanel />
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
        <aside className="w-[27vw] border-l p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">💬 Chat Assistant</h2>
          <ChatComponent />
        </aside>
      )}
    </div>
  );
}
