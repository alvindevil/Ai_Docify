'use client'
import React, { useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Props {
  onFileUploaded: (fileName: string) => void;
}

export default function FileUpload({ onFileUploaded }: Props) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    const formdata = new FormData();
    formdata.append('pdf', file);
    
    try {
      const res = await fetch(`${BACKEND_URL}/upload/pdf`, {
        method: 'POST',
        body: formdata
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.fileName) {
          console.log("Success! Server returned Cloudinary public_id:", data.fileName);
          onFileUploaded(data.fileName);
        } else {
          console.error("Server response missing fileName:", data);
          alert("File uploaded, but server response was invalid.");
        }
      } else {
        const errorData = await res.json().catch(() => ({ message: 'An unknown server error occurred.'}));
        console.error("File upload failed. Status:", res.status, errorData.message);
        alert(`File upload failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("An error occurred during file upload:", error);
      alert("An error occurred during file upload. Check the console for details.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDivClick = () => {
    if (isUploading) return;
    // Create a new input element each time to ensure the 'change' event fires
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'application/pdf');
    fileInput.click();

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {  
        handleFileSelect(fileInput.files.item(0));
      }
    });
  };

  return (
    <div 
      onClick={handleDivClick} 
      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-all duration-200 group ${
        isUploading 
          ? 'border-gray-400 bg-gray-200 cursor-not-allowed'
          : 'border-gray-300 hover:bg-blue-100 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer'
      }`}
    >
      {isUploading ? (
        <>
          <Loader2 className="animate-spin h-8 w-8 text-gray-500" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
        </>
      ) : (
        <>
          <div className="group-hover:text-black scale-140 text-gray-500 dark:text-gray-400">
            <FileUp/>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Upload your PDF here</p>
        </>
      )}
    </div>
  );
}