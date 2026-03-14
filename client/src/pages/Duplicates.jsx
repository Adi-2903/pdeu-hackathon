import React, { useState, useEffect } from 'react';
import { CheckCircle, MapPin, Loader2, GitMerge, AlertCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DuplicatePairCard = ({ item, onResolve }) => {
  const [loading, setLoading] = useState(null);
  const { candidate, potentialMatch, score, rawId } = item;

  const handleAction = async (action) => {
    setLoading(action);
    try {
      const res = await fetch(`http://localhost:5000/api/v1/candidates/duplicates/${rawId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        onResolve(rawId, action);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  const getScoreBadgeClass = (s) => {
    if (s > 0.8) return 'bg-amber-100 text-amber-700';
    return 'bg-orange-100 text-orange-700';
  };

  const isDiff = (a, b) => {
    if (!a || !b) return true;
    return a.toLowerCase() !== b.toLowerCase();
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <GitMerge size={20} className="text-[#F97316]" />
          Review Potential Duplicate
        </h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBadgeClass(score)}`}>
          Match confidence: {Math.round(score * 100)}%
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* EXISTING RECORD */}
        <div className="bg-gray-50 rounded-lg p-4 border border-transparent">
          <p className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3 text-center">Existing Record</p>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-lg mb-3">
              {potentialMatch?.name?.[0] || 'U'}
            </div>
            <h4 className={`font-semibold text-base ${isDiff(candidate?.name, potentialMatch?.name) ? 'text-amber-600' : 'text-gray-900'}`}>
              {potentialMatch?.name}
            </h4>
            <p className={`text-sm ${isDiff(candidate?.email, potentialMatch?.email) ? 'text-amber-600' : 'text-gray-500'}`}>
              {potentialMatch?.email || 'No email'}
            </p>
            <p className="text-sm text-gray-500">{potentialMatch?.phone || 'No phone'}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 justify-center">
              <MapPin size={12} />
              {potentialMatch?.location || 'Unknown location'}
            </div>
            
            {/* Show top skills */}
            <div className="flex flex-wrap gap-1 justify-center mt-3">
              {potentialMatch?.skills?.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] rounded-md font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* NEW RECORD */}
        <div className="bg-orange-50 rounded-lg p-4 border border-[#F97316]/20">
          <p className="text-[10px] font-bold text-[#F97316]/60 tracking-wider uppercase mb-3 text-center">New / Flagged Record</p>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#F97316] flex items-center justify-center font-bold text-lg mb-3">
              {candidate?.name?.[0] || 'U'}
            </div>
            <h4 className={`font-semibold text-base ${isDiff(candidate?.name, potentialMatch?.name) ? 'text-amber-600' : 'text-gray-900'}`}>
              {candidate?.name}
            </h4>
            <p className={`text-sm ${isDiff(candidate?.email, potentialMatch?.email) ? 'text-amber-600' : 'text-gray-500'}`}>
              {candidate?.email || 'No email'}
            </p>
            <p className="text-sm text-gray-500">{candidate?.phone || 'No phone'}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 justify-center">
              <MapPin size={12} />
              {candidate?.location || 'Unknown location'}
            </div>

            {/* Show top skills */}
            <div className="flex flex-wrap gap-1 justify-center mt-3">
              {candidate?.skills?.slice(0, 3).map(s => (
                <span key={s} className="px-2 py-0.5 bg-orange-100 text-[#F97316]/80 text-[10px] rounded-md font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
        <button
          onClick={() => handleAction('merge')}
          disabled={!!loading}
          className="flex-[2] bg-[#F97316] hover:bg-[#EA580C] text-white font-bold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading === 'merge' ? <Loader2 size={18} className="animate-spin" /> : <GitMerge size={18} />}
          Merge into existing
        </button>
        <button
          onClick={() => handleAction('keep_separate')}
          disabled={!!loading}
          className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 font-bold rounded-lg px-6 py-3 transition-colors flex items-center justify-center gap-2"
        >
          {loading === 'keep_separate' ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
          Keep separate
        </button>
      </div>
    </motion.div>
  );
};

const Duplicates = () => {
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const fetchDuplicates = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/candidates/duplicates');
      const data = await res.json();
      setDuplicates(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = (id, action) => {
    setDuplicates(prev => prev.filter(d => d.rawId !== id));
    // Toast logic could go here if global toast is available
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-[#F97316]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Possible Duplicates</h1>
          <p className="text-gray-500 font-medium">Candidates flagged for manual review</p>
        </div>
        {duplicates.length > 0 && (
          <div className="bg-[#F97316] text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-md">
            {duplicates.length} flagged
          </div>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {duplicates.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={48} className="text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Clean record!</h3>
            <p className="text-gray-500 font-medium text-center max-w-xs">
              No duplicates currently need your attention. Happy recruiting!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {duplicates.map((item) => (
              <DuplicatePairCard 
                key={item.rawId} 
                item={item} 
                onResolve={handleResolve} 
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Duplicates;
