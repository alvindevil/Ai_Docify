'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface PdfPreviewProps {
  // --- FIX: It now accepts an identifier, not a direct URL ---
  pdfIdentifier: string | null; 
}

export default function PdfPreview({ pdfIdentifier }: PdfPreviewProps) {
  const [actualPdfUrl, setActualPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- FIX: This block of code now runs whenever you select a new PDF ---
  useEffect(() => {
    if (pdfIdentifier) {
      setIsLoading(true);
      setError(null);
      setActualPdfUrl(null);

      // This log is crucial for debugging. Check your browser console for this.
      console.log(`[PdfPreview] Fetching preview URL for identifier: ${pdfIdentifier}`);
      
      // It calls your backend to get the secure Cloudinary URL
      fetch(`${BACKEND_URL}/api/get-pdf-preview-url?publicId=${encodeURIComponent(pdfIdentifier)}`)
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({ message: `Server error: ${res.status}` }));
            throw new Error(errData.message);
          }
          return res.json();
        })
        .then(data => {
          if (data.previewUrl) {
            setActualPdfUrl(data.previewUrl);
          } else {
            throw new Error("Preview URL not found in API response.");
          }
        })
        .catch(err => {
          console.error("[PdfPreview] Error fetching PDF preview URL:", err);
          setError(err.message || "Failed to load PDF preview.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setActualPdfUrl(null);
      setError(null);
      setIsLoading(false);
    }
  }, [pdfIdentifier]);

  if (isLoading) {
    return (
      <div className="h-[65vh] w-full bg-gray-100 dark:bg-gray-800 border rounded flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[65vh] w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded flex items-center justify-center p-4">
        <p className="text-red-700 dark:text-red-300 text-center font-medium">Error loading PDF: <br/> {error}</p>
      </div>
    );
  }
  
  if (!actualPdfUrl) {
    return (
      <div className="h-[65vh] w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded flex items-center justify-center p-4">
        <div className="text-center">
          <p className="font-semibold text-gray-600 dark:text-gray-400 mb-1">No PDF Selected</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Your document preview will appear here.</p>
        </div>
      </div>
    );
  }

  // This iframe will now only render when it has a valid Cloudinary URL
  return (
    <div className="h-[65vh] w-full bg-black border rounded overflow-hidden shadow-inner dark:border-gray-700">
      <iframe src={actualPdfUrl} title="PDF Viewer" width="100%" height="100%" className="border-none" />
    </div>
  );
}