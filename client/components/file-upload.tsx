'use client'
import React from 'react'
import { FileUp } from 'lucide-react';

interface Props {
  onFileUploaded: (fileName: string) => void;
}

 
export default function FileUpload({ onFileUploaded }: Props) {
  
  const handleFileUpload = () =>{
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.click();

    el.addEventListener('change', async () => {
      if (el.files && el.files.length > 0) {  
        const file = el.files.item(0);
        if (file){
          const formdata = new FormData();
          formdata.append('pdf', file);
          
          const res = await fetch('http://localhost:8000/upload/pdf',  {
            method: 'POST',
            body: formdata
          });

          if (res.ok) {
            console.log(file.name);
            onFileUploaded(file.name);
          }


        }
      }
    })

    
  }

  return (
        <div onClick={handleFileUpload} 
        className="flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-blue-100 hover:shadow-md transition-all duration-200 cursor-pointer group">
          <div className="group-hover:text-black scale-140">
            <FileUp/>
          </div>
          <p className="mt-2 text-sm text-gray-500">Upload your PDF here</p>
        </div>

  )
}
