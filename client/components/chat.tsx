'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface IMessage {
    role: 'assistant' | 'user';
    content?: string;
}

// --- FIX: Component now accepts the ID of the currently selected PDF ---
interface ChatComponentProps {
    pdfIdentifier: string | null;
}

export default function ChatComponent({ pdfIdentifier }: ChatComponentProps) {
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    // Clear chat history when the selected PDF changes
    useEffect(() => {
        setMessages([]);
    }, [pdfIdentifier]);

    const handleSendChatMsg = async () => {
        if (!message.trim() || isLoading) return;

        setIsLoading(true);
        const userMessage: IMessage = { role: 'user', content: message };
        setMessages((prev) => [...prev, userMessage]);
        setMessage('');
        
        // --- FIX: API URL now includes pdfId to provide context to the backend ---
        const params = new URLSearchParams({ message });
        if (pdfIdentifier) {
            params.append('pdfId', pdfIdentifier);
        }

        const requestUrl = `${BACKEND_URL}/chat?${params.toString()}`;
        console.log(`[Chat] Sending request to: ${requestUrl}`);

        try {
            const res = await fetch(requestUrl);
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to get response from AI.');
            
            setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
        } catch (error) {
            console.error("[Chat] Error fetching response:", error);
            setMessages((prev) => [...prev, { role: 'assistant', content: error instanceof Error ? error.message : "Sorry, an error occurred." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSendChatMsg();
    };

    return (
        <div className="p-4 flex flex-col w-full h-full max-h-full overflow-hidden bg-white dark:bg-gray-800">
            <div className="flex-1 w-full min-h-0 overflow-y-auto mb-4 bg-gray-100 dark:bg-gray-900/50 p-4 rounded-lg shadow-inner">
                {messages.length === 0 && (
                    <div className="flex h-full items-center justify-center">
                        <p className="text-gray-500 dark:text-gray-400 text-center px-4">
                            {pdfIdentifier ? "Ask a question about the selected PDF." : "Please select a PDF to start chatting."}
                        </p>
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex my-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-3 rounded-lg w-fit max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex my-4 justify-start">
                        <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
                            <div className="flex items-center space-x-2"><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div><div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-300"></div></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center w-full mt-auto">
                <Input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder={pdfIdentifier ? "Ask a question..." : "Select a PDF first"} className="flex-1" disabled={!pdfIdentifier || isLoading} />
                <Button onClick={handleSendChatMsg} disabled={!message.trim() || isLoading} className="ml-2">
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
            </div>
        </div>
    );
}