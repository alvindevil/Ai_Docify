'use client';
import React from 'react';

interface Props {
  files: string[];
}

export default function PdfQueuePanel({ files }: Props) {
  return (
    <div className="flex flex-col w-max-[100%] gap-2 overflow-hidden p-2 border rounded bg-gray-100 ">
      {files.length === 0 ? (
        <p className="text-sm text-gray-500">No files uploaded yet</p>
      ) : (
        files.map((file, index) => (
          <div
            key={index}
            className="px-4 py-2 w-[100%] overflow-auto bg-white rounded shadow text-sm whitespace-nowrap hover:bg-blue-200 cursor-pointer scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
              display: none;
              }
            `}</style>

            {file}
          </div>
        ))
      )}
    </div>
  );
}
