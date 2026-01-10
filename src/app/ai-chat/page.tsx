'use client';

import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI productivity assistant. I can help you analyze your habits, provide insights, and answer questions about your productivity patterns. How can I help you today?',
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setMessages([...messages, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'This is a demo response. In the full version, I would provide personalized insights based on your data and use AI to help you improve your productivity!',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col">
      {/* Header */}
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <MessageSquare className="text-purple-600" size={28} />
          AI Chatbot
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Get personalized productivity advice
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 bg-white dark:bg-[#252540] rounded-2xl p-4 shadow-sm">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot size={18} className="text-white" />
              </div>
            )}
            <div
              className={`max-w-2xl p-3.5 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-50 dark:bg-[#1A1A2E]'
              }`}
            >
              <p className={`text-sm ${message.role === 'user' ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {message.content}
              </p>
            </div>
            {message.role === 'user' && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                <User size={18} className="text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="pt-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask me anything about your productivity..."
            className="flex-1 px-4 py-3 bg-white dark:bg-[#252540] border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white text-sm shadow-sm"
          />
          <button
            onClick={sendMessage}
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
