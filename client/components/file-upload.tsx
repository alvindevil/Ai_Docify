'use client'
import React, { useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Define a type for the data structure the backend now returns
// This should match the response from your /upload/pdf endpoint
interface UploadResponse {
  fileName: string; // The original filename for display
  publicId: string; // The unique ID from Cloudinary
  fileUrl: string;  // The secure URL from Cloudinary
}

// Update the Props interface to expect a function that accepts the new UploadResponse object
interface Props {
  onFileUploaded: (data: UploadResponse) => void;
}

export default function FileUpload({ onFileUploaded }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    setError(null); // Clear previous errors
    const formdata = new FormData();
    formdata.append('pdf', file);
    
    try {
      const res = await fetch(`${BACKEND_URL}/upload/pdf`, {
        method: 'POST',
        body: formdata
      });

      const data = await res.json(); // Always try to get JSON response

      if (res.ok) {
        if (data && data.publicId && data.fileUrl) {
          console.log("Success! Server returned Cloudinary data:", data);
          // Call the parent component's handler with the full response object
          onFileUploaded(data);
        } else {
          console.error("Server response was OK but missing required data:", data);
          setError("File uploaded, but server response was invalid.");
          alert("File uploaded, but the server returned an invalid response.");
        }
      } else {
        const errorMessage = data.message || 'An unknown server error occurred.';
        console.error("File upload failed. Status:", res.status, errorMessage);
        setError(errorMessage);
        alert(`File upload failed: ${errorMessage}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during file upload.";
      console.error("An error occurred during file upload:", err);
      setError(errorMessage);
      alert(`${errorMessage} Check the console for details.`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDivClick = () => {
    if (isUploading) return;
    
    const fileInput = document.createElement('input');
    fileInput.setAttribute('type', 'file');
    fileInput.setAttribute('accept', 'application/pdf');
    fileInput.style.display = 'none'; // Hide the element
    document.body.appendChild(fileInput); // Append to body to ensure it's interactable
    
    fileInput.click();

    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {  
        handleFileSelect(fileInput.files.item(0));
      }
      document.body.removeChild(fileInput); // Clean up the input element
    });
  };

  return (
    <div 
      onClick={handleDivClick} 
      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg transition-all duration-200 group ${
        isUploading 
          ? 'border-gray-400 bg-gray-200 dark:bg-gray-800 cursor-not-allowed'
          : error
          ? 'border-red-500 bg-red-100 dark:bg-red-900/30 dark:border-red-700 cursor-pointer'
          : 'border-gray-300 hover:bg-blue-100 dark:border-gray-600 dark:hover:bg-gray-700 cursor-pointer'
      }`}
    >
      {isUploading ? (
        <>
          <Loader2 className="animate-spin h-8 w-8 text-gray-500 dark:text-gray-300" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
        </>
      ) : error ? (
        <>
          <div className="text-red-500 dark:text-red-400">
            <FileUp/>
          </div>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 text-center px-2">
            Upload Failed. Click to try again.
          </p>
        </>
      ) : (
        <>
          <div className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            <FileUp size={32}/>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upload your PDF here</p>
        </>
      )}
    </div>
  );
}