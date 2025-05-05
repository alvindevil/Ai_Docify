import React from "react";
import Image from "next/image";
import FileUpload from "@/components/file-upload";
import ChatComponent from "@/components/chat";




export default function Home() {
  return (
    <div className="min-h-screen w-screen flex ">
      <div className="flex justify-center items-center w-[30vw] min-h-screen p-4">
        <FileUpload />
      </div>
      <div className="w-[70vw] min-h-screen flex items-start border-l-2" > 
        <ChatComponent/> 
      </div>
      
    </div>
    
  );
}
