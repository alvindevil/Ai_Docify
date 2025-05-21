'use client';
import React from 'react';

interface Props {
  files: string[];
  onSelect: (fileName: string) => void;
  selectedFile: string | null;
}

export default function PdfQueuePanel({ files, onSelect, selectedFile }: Props) {
  return (
    <div className="flex flex-col w-max-[100%] gap-2 overflow-hidden p-2 border rounded bg-gray-100 ">
      {files.length === 0 ? (
        <p className="text-sm text-gray-500">No files uploaded yet</p>
      ) : (
        files.map((file, index) => (
          <div
          key={index}
          onClick={() => {
            onSelect(file);
            localStorage.setItem("selectedPdf", file); // Persist selected file
          }}
          className={`cursor-pointer p-2 rounded-md text-sm ${
            selectedFile === file ? 'bg-blue-200 font-semibold' : 'hover:bg-gray-100'
          }`}
        >
          {file}
        </div>
        ))
      )}
    </div>
  );
}
