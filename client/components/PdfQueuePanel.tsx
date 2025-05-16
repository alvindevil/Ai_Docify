'use client'
import React from 'react'

interface PdfFile {
  name: string;
  id: string; // unique identifier
}

interface PdfQueuePanelProps {
  files: PdfFile[];
  activeId: string;
  onSelect: (id: string) => void;
}

export default function PdfQueuePanel({ files, activeId, onSelect }: PdfQueuePanelProps) {
  return (
    <div className="w-full h-[400px] p-2 bg-gray-100 shadow-md overflow-x-auto">
      <div className="flex flex-col justify-center gap-2">
        {files.map((file) => (
          <div
            key={file.id}
            onClick={() => onSelect(file.id)}
            className={`px-4 py-2 rounded-lg cursor-pointer border 
              ${file.id === activeId 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-800 hover:bg-gray-200'}`}
          >
            {file.name.length > 15 ? file.name.slice(0, 12) + '...' : file.name}
          </div>
        ))}
      </div>
    </div>
  )
}
