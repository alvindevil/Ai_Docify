'use client'
import * as React from 'react'
import { useRef, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send, Loader2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Doc {
    pageContent?: string;
    metadata?: {
        loc?: {
            pageNumber?: number;
        };
        source?: string;
    };
}

interface IMessage {
    id: string;
    role: 'assistant' | 'user';
    content?: string;
    document?: Doc[];
    timestamp: Date;
    isLoading?: boolean;
    error?: boolean;
}

export default function ChatComponent() {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input on initial load
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    };

    const handleSendChatMsg = async () => {
        if (!message.trim() || isLoading) return;
        
        const userMessageId = generateId();
        const assistantMessageId = generateId();
        
        // Add user message immediately
        setMessages((prev) => [
            ...prev, 
            { 
                id: userMessageId, 
                role: 'user', 
                content: message,
                timestamp: new Date()
            }
        ]);
        
        // Add assistant placeholder message with loading state
        setMessages((prev) => [
            ...prev, 
            { 
                id: assistantMessageId, 
                role: 'assistant', 
                content: '',
                timestamp: new Date(),
                isLoading: true
            }
        ]);
        
        setMessage(''); // Clear input
        setIsLoading(true);
        
        try {
            // Using URLSearchParams to properly encode the message
            const params = new URLSearchParams({ message: message.trim() });
            const res = await fetch(`http://localhost:8000/chat?${params.toString()}`);
            
            if (!res.ok) {
                throw new Error(`Server responded with status: ${res.status}`);
            }
            
            const data = await res.json();
            
            // Replace the placeholder with actual response
            setMessages((prev) => 
                prev.map(msg => 
                    msg.id === assistantMessageId 
                        ? {
                            ...msg,
                            content: data.message,
                            document: data.docs,
                            isLoading: false
                        }
                        : msg
                )
            );
        } catch (error) {
            console.error('Error sending message:', error);
            
            // Update the placeholder with error state
            setMessages((prev) => 
                prev.map(msg => 
                    msg.id === assistantMessageId 
                        ? {
                            ...msg,
                            content: 'Sorry, I encountered an error processing your request. Please try again.',
                            isLoading: false,
                            error: true
                        }
                        : msg
                )
            );
        } finally {
            setIsLoading(false);
            // Focus input after sending
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendChatMsg();
        }
    };

    const formatTimestamp = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Function to render message content with potential source citations
    const renderMessageContent = (message: IMessage) => {
        if (message.isLoading) {
            return (
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                    <span className="text-gray-500">Thinking...</span>
                </div>
            );
        }

        if (message.error) {
            return (
                <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <span>{message.content}</span>
                </div>
            );
        }

        return (
            <>
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {message.document && message.document.length > 0 && (
                    <div className="mt-2 border-t border-gray-200 pt-2">
                        <p className="text-xs font-medium text-gray-500">Sources:</p>
                        <ul className="mt-1 space-y-1">
                            {message.document.map((doc, idx) => (
                                <li key={idx} className="text-xs text-gray-500">
                                    {doc.metadata?.source || "Unknown source"}
                                    {doc.metadata?.loc?.pageNumber && ` (p. ${doc.metadata.loc.pageNumber})`}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 h-80 w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 py-3 px-4 shadow-sm">
                <h2 className="text-lg font-medium text-gray-800">Chat Assistant</h2>
            </div>
            
            {/* Messages Container */}
            <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        <div className="bg-gray-100 p-3 rounded-full mb-3">
                            <Send className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">Start a conversation</h3>
                        <p className="text-sm max-w-md">Ask a question or start a conversation to get assistance.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-white border border-gray-200 text-gray-800'
                                }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-xs font-medium ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-500'}`}>
                                        {msg.role === 'user' ? 'You' : 'Assistant'}
                                    </span>
                                    <span className={`text-xs ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {formatTimestamp(msg.timestamp)}
                                    </span>
                                </div>
                                <div className="text-sm">{renderMessageContent(msg)}</div>
                            </div>
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
            
            {/* Input Section */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-4xl mx-auto flex items-center gap-2">
                    <Input
                        ref={inputRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message here..."
                        disabled={isLoading}
                        className="flex-1 py-2 px-4 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                        onClick={handleSendChatMsg}
                        disabled={!message.trim() || isLoading}
                        className={`rounded-full w-10 h-10 flex items-center justify-center ${
                            !message.trim() || isLoading ? 'bg-gray-300' : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {isLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Send className="h-5 w-5" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}