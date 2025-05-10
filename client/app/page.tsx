"use client";
import React, { use } from "react";
import Image from "next/image";
import FileUpload from "@/components/file-upload";
import ChatComponent from "@/components/chat";
import PdfQueuePanel from "@/components/PdfQueuePanel";



export default function Home() {
  const [activeFileId, setActiveFileId] = React.useState<string>("1");

  return (
    <div className="min-h-screen w-screen flex ">
      <div className="flex justify-center items-center w-[30vw] min-h-screen p-4">
        <FileUpload />
      </div>
      <div className="w-[70vw] min-h-screen flex items-start border-l-2" > 
        <ChatComponent/> 
      </div>
      <div>
        <PdfQueuePanel
          files={[
            { name: "sample1.pdf", id: "1" },
            { name: "report.pdf", id: "2" },
          ]}
          activeId={activeFileId}
          onSelect={(id) => setActiveFileId(id)}
        />
      </div>
      
      
    
    </div>
    
  );
}
