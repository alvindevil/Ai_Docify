'use client'
import React from 'react'

interface PdfPreviewProps {
  pdfUrl: string | null;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({ pdfUrl }) => {
  return (
    <div className="w-full h-[70vh] border rounded-lg shadow-sm bg-white flex items-center justify-center">
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          className="w-full h-full rounded"
          title="PDF Preview"
        />
      ) : (
        <p className="text-gray-500">No PDF selected. Please upload one to preview.</p>
      )}
    </div>
  );
};

export default PdfPreview;
