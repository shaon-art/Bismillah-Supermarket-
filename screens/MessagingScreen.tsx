
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, SystemSettings } from '../types';

interface MessagingScreenProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  onBack: () => void;
  lang: 'bn' | 'en';
  settings: SystemSettings;
}

const MessagingScreen: React.FC<MessagingScreenProps> = ({ 
  messages, 
  onSendMessage, 
  isTyping, 
  onBack, 
  lang,
  settings
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="animate-fadeIn h-full bg-gray-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg px-5 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center gap-4 sticky top-0 z-40 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 active:scale-90 transition-transform">
          <span className="text-xl">←</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-xl relative shadow-inner">
            🤖
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white leading-none">
              {lang === 'bn' ? 'এআই অ্যাসিস্ট্যান্ট' : 'AI Assistant'}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-3 pb-20">
            <span className="text-5xl">💬</span>
            <p className="text-sm font-bold text-gray-400 text-center px-10">
              {lang === 'bn' ? 'হ্যালো! আমি আপনার শপিং অ্যাসিস্ট্যান্ট। কিভাবে সাহায্য করতে পারি?' : 'Hello! I am your shopping assistant. How can I help you today?'}
            </p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-gradient-to-br from-green-600 to-green-500 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-slate-800'
            }`}>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
              <p className={`text-[8px] mt-1 font-bold uppercase opacity-60 ${msg.sender === 'user' ? 'text-right text-green-100' : 'text-left text-gray-400'}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur rounded-2xl px-4 py-3 border border-gray-100 dark:border-slate-800 rounded-tl-none">
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 rounded-2xl p-2 border border-gray-100 dark:border-slate-700 shadow-inner">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
            className="flex-1 bg-transparent border-none outline-none px-3 py-2 text-sm font-bold dark:text-white placeholder-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isTyping}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              !inputText.trim() || isTyping 
                ? 'bg-gray-200 dark:bg-slate-700 text-gray-400' 
                : 'bg-green-600 text-white shadow-lg active:scale-90'
            }`}
          >
            <span className="text-lg transform -rotate-45 -mt-1 ml-1">✈️</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagingScreen;
