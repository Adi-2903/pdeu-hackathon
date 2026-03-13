import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Minimize2, Send, Bot, User, Copy, CheckCircle2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi Sarah! I am your TalentOS AI Assistant. How can I help you find or manage candidates today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);
  const location = useLocation();

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('/api/chat', { 
        message: userMessage,
        context: { path: location.pathname } 
      });
      
      // Simulate typewriter effect
      setIsTyping(false);
      const reply = response.data.reply;
      
      setMessages(prev => [...prev, { role: 'assistant', text: '', isTyping: true }]);
      
      // Typewriter simulation for pure visual wow
      let currentText = '';
      const chars = reply.split('');
      
      for (let i = 0; i < chars.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 15));
        currentText += chars[i];
        setMessages(prev => {
          const newMsg = [...prev];
          newMsg[newMsg.length - 1] = { role: 'assistant', text: currentText, isTyping: true };
          return newMsg;
        });
      }
      
      setMessages(prev => {
        const newMsg = [...prev];
        newMsg[newMsg.length - 1].isTyping = false;
        return newMsg;
      });

    } catch (error) {
       console.error(error);
       setIsTyping(false);
       setMessages(prev => [...prev, { role: 'assistant', text: "I'm having trouble connecting to the backend right now." }]);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#FF6B00] text-gray-900 shadow-[0_4px_24px_rgba(255,107,0,0.5)] flex items-center justify-center hover:bg-[#FF8C42] transition-colors border-2 border-transparent hover:border-white/20"
          >
            <Sparkles size={24} className="animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] max-h-[85vh] glass-panel rounded-2xl shadow-2xl flex flex-col overflow-hidden border-[#FF6B00]/30 custom-scrollbar-chat"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF6B00]/10 blur-[80px] pointer-events-none rounded-full"></div>
            
            {/* Header */}
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-white/80 backdrop-blur z-10">
              <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 rounded-full bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] border border-[#FF6B00]/30 shadow-[0_0_10px_rgba(255,107,0,0.2)]">
                   <Bot size={18} />
                 </div>
                 <div>
                   <h3 className="text-gray-900 font-bold text-sm">TalentOS AI</h3>
                   <div className="flex items-center text-[#FF6B00] text-[10px] font-bold tracking-wider">
                     <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mr-1.5 animate-pulse"></div> CLAUDE-SONNET
                   </div>
                 </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-900 p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Minimize2 size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar-chat">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm group relative ${
                    msg.role === 'user' 
                      ? 'bg-[#FF6B00] text-gray-900 rounded-br-sm shadow-[0_4px_12px_rgba(255,107,0,0.2)]'
                      : 'bg-white border border-glass-border text-gray-500 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' && !msg.isTyping ? (
                       <>
                         <div dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}} />
                         <button 
                           onClick={() => handleCopy(msg.text, idx)}
                           className="absolute -right-8 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-[#FF6B00] bg-white border border-glass-border rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                         >
                           {copiedId === idx ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Copy size={14} />}
                         </button>
                       </>
                    ) : (
                       msg.text
                    )}
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                   <div className="bg-white border border-glass-border rounded-2xl rounded-bl-sm px-4 py-3 flex space-x-1 items-center h-10">
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></motion.div>
                     <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#FF6B00] rounded-full"></motion.div>
                   </div>
                 </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white/90 border-t border-glass-border z-10">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Claude anything..."
                  className="w-full bg-white border border-glass-border rounded-full pl-5 pr-12 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 p-2 bg-[#FF6B00] text-gray-900 rounded-full hover:bg-[#FF8C42] disabled:opacity-50 disabled:bg-white disabled:text-gray-400 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar-chat::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-chat::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-chat::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 4px; }
      `}} />
    </>
  );
};

export default AIChatAssistant;
