import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './components/ui/Sidebar';
import TopHeader from './components/layout/TopHeader';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import AISearch from './pages/AISearch';
import Pipeline from './pages/Pipeline';
import Sources from './pages/Sources';
import Settings from './pages/Settings';
import { ToastProvider, useToast } from './context/ToastContext';
import AIChatAssistant from './components/ui/AIChatAssistant';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent = () => {
  useKeyboardShortcuts();
  const { addToast } = useToast();

  useEffect(() => {
    setTimeout(() => {
      addToast("Welcome to HireX. Keyboard shortcuts are active (Cmd+K).", "ai", 5000);
    }, 4500);
  }, [addToast]);

  return (
    <div className="flex h-screen text-gray-900 font-sans overflow-hidden p-0 md:p-4 md:gap-6 bg-[var(--color-dark-bg)]">
      <Sidebar />
      <main className="flex-1 overflow-hidden w-full flex flex-col pt-4 md:pt-0 pb-20 md:pb-0 pr-4 md:pr-0">
        <TopHeader />
        <div className="flex-1 overflow-x-hidden overflow-y-auto w-full custom-scrollbar rounded-3xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/ai-search" element={<AISearch />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
      <AIChatAssistant />
    </div>
  );
};

// SPLASH SCREEN
const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ToastProvider>
        <AnimatePresence mode="wait">
          {showSplash ? (
            <motion.div
              key="splash"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="fixed inset-0 z-[999] bg-white flex flex-col items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative"
              >
                <div className="absolute inset-0 bg-[#FF6B00] blur-[120px] opacity-15 rounded-full animate-pulse"></div>

                <div className="flex items-center text-gray-900 text-7xl font-black tracking-tighter z-10 relative">
                  <div className="w-16 h-16 mr-6 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] shadow-[0_8px_32px_rgba(255,107,0,0.35)] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/20 blur-md transform -skew-x-12 translate-x-[-150%] animate-[shimmer_2s_infinite]"></div>
                    <span className="text-gray-900 text-4xl mr-1">✦</span>
                  </div>
                  Talent<span className="text-[#FF6B00]">OS</span>
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-8 text-gray-400 font-medium tracking-widest uppercase text-sm"
              >
                Initializing Core Neural Engine
              </motion.p>

              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 250 }}
                transition={{ delay: 1, duration: 1.5, ease: 'easeInOut' }}
                className="h-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] rounded-full mt-6 shadow-[0_0_12px_rgba(255,107,0,0.3)]"
              ></motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.5 }}
              className="h-full w-full"
            >
              <AppContent />
            </motion.div>
          )}
        </AnimatePresence>
      </ToastProvider>
      <style>{`
        @keyframes shimmer {
          100% { transform: skewX(-12deg) translateX(150%); }
        }
      `}</style>
    </Router>
  );
};

export default App;
