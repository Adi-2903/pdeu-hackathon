import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={20} />;
      case 'error': return <AlertCircle className="text-red-500" size={20} />;
      case 'ai': return <Sparkles className="text-[#FF6B00]" size={20} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={20} />;
      default: return <Bell className="text-[#FF6B00]" size={20} />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 left-6 z-[100] flex flex-col space-y-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: -50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`pointer-events-auto flex items-start p-4 rounded-xl border bg-[rgba(255,255,255,0.06)] backdrop-blur-xl shadow-lg
                ${toast.type === 'ai' ? 'border-l-4 border-l-[#FF6B00] border-t-glass-border border-r-glass-border border-b-glass-border' 
                : toast.type === 'error' ? 'border-l-4 border-l-red-500 border-t-glass-border border-r-glass-border border-b-glass-border'
                : 'border-l-4 border-l-[#FF6B00] border-t-glass-border border-r-glass-border border-b-glass-border'}
              `}
            >
              <div className="flex-shrink-0 mr-3 mt-0.5">
                {getIcon(toast.type)}
              </div>
              <div className="flex-1 mr-4">
                <p className="text-sm font-medium text-gray-900 shadow-sm leading-snug">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
