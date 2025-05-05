'use client'
import * as React from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'

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
    role: 'assistant' | 'user';
    content?: string;
    document?: Doc[];
}

export default function ChatComponent() {
    const [message, setMessage] = React.useState<string>('');
    const [messages, setMessages] = React.useState<IMessage[]>([]);

    const handleSendChatMsg = async () => {
        if (!message.trim()) return; // Prevent sending empty messages
        setMessages((prev) => [...prev, { role: 'user', content: message }]);
        const res = await fetch(`http://localhost:8000/chat?message=${message}`);
        const data = await res.json();
        console.log('data', data);
        setMessages((prev) => [
            ...prev,
            {
                role: 'assistant',
                content: data.message,
                document: data.docs,
            },
        ]);
        setMessage(''); // Clear input after sending
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendChatMsg();
        }
    };

    return (
        <div className="p-4 flex flex-col h-screen">
            {/* Chat Messages */}
            <div className="flex-1 w-[50vw] overflow-y-auto mb-4 bg-gray-100 p-4 rounded-lg shadow-inner">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`mb-2 p-2 rounded-lg ${
                            message.role === 'user'
                                ? 'bg-blue-500 text-white self-end'
                                : 'bg-gray-300 text-black self-start'
                        }`}
                        style={{
                            maxWidth: '70%',
                            alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                        }}
                    >
                        {message.content}
                    </div>
                ))}
            </div>

            {/* Input Section */}
            <div className="flex items-center fixed bottom-4 w-[45vw] bg-white p-2 rounded-lg shadow-lg">
                <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown} // Add this line
                    placeholder="Type your message here"
                    className="flex-1"
                />
                <Button
                    onClick={handleSendChatMsg}
                    disabled={!message.trim()}
                    className="ml-2 cursor-pointer"
                >
                    Send
                </Button>
            </div>
        </div>
    );
}
