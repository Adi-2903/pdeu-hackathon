import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleKeyDown = useCallback((e) => {
    // CMD/CTRL + K -> AI Search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      navigate('/ai-search');
      addToast('Quick Jump: AI Search', 'ai', 2000);
    }
    
    // CMD/CTRL + N -> New Candidate (Candidates Page)
    if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
      e.preventDefault();
      navigate('/candidates');
      addToast('Quick Action: Add Candidate', 'info', 2000);
    }
    
    // CMD/CTRL + P -> Pipeline
    if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
      e.preventDefault();
      navigate('/pipeline');
      addToast('Quick Jump: Pipeline', 'info', 2000);
    }
  }, [navigate, addToast]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
