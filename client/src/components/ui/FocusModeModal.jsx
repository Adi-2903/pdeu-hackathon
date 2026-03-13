import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import GlassCard from './GlassCard';
import OrangeButton from './OrangeButton';
import Badge from './Badge';
import { Target, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Calendar, Users, X, Clock, Mail, Phone } from 'lucide-react';

const FocusModeModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('config'); // 'config', 'generating', 'results'
  const [targetDate, setTargetDate] = useState('');
  const [planData, setPlanData] = useState(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('config');
      setTargetDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]); // Default to 7 days from now
      setPlanData(null);
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    setStep('generating');
    try {
      const response = await fetch('/api/focus/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_date: targetDate, job_ids: [] }), // In real app, pass selected jobs
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setPlanData(data.data);
        setStep('results');
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (err) {
      console.error(err);
      // Fallback if API fails (e.g. server restarts)
      setTimeout(() => setStep('config'), 1500);
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <Clock size={16} className="text-[#FF6B00]" />;
      default: return <CheckCircle2 size={16} className="text-emerald-500" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🎯 Hire by Friday">
      <div className="flex flex-col min-h-[400px]">
        
        {/* STEP 1: CONFIGURATION */}
        {step === 'config' && (
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95">
            <div className="text-center mb-8 pt-4">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#FF6B00]/20 shadow-[0_0_20px_rgba(255,107,0,0.15)]">
                <Target size={32} className="text-[#FF6B00]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Focus Action Plan</h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                Set a target date and our AI will analyze your pipelines to generate an aggressive, prioritized hit-list of actions to close roles on time.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-[#F5F5F7] p-4 rounded-xl border border-glass-border">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Hire Date</label>
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-white border border-glass-border rounded-lg pl-10 pr-4 py-2 text-gray-900 focus:outline-none focus:border-[#FF6B00]/50"
                  />
                </div>
              </div>

              <div className="bg-[#F5F5F7] p-4 rounded-xl border border-glass-border">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Target Roles</label>
                <div className="flex items-center justify-between bg-white border border-glass-border rounded-lg px-4 py-2">
                  <span className="text-gray-900 text-sm font-medium">All Open Roles</span>
                  <Badge className="bg-gray-100 text-gray-500 border-none font-bold">12 Active</Badge>
                </div>
              </div>
            </div>

            <OrangeButton onClick={handleGenerate} className="w-full py-3 mt-auto shadow-[0_4px_16px_rgba(255,107,0,0.3)]">
              Generate AI Plan <ChevronRight size={18} className="ml-2" />
            </OrangeButton>
          </div>
        )}

        {/* STEP 2: GENERATING SPINNER */}
        {step === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in">
             <div className="relative w-24 h-24 flex items-center justify-center mb-6">
               <div className="absolute inset-0 border-4 border-[#FF6B00]/20 rounded-full"></div>
               <div className="absolute inset-0 border-4 border-[#FF6B00] rounded-full border-t-transparent animate-spin"></div>
               <Target size={32} className="text-[#FF6B00]" />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">Analyzing Pipelines</h3>
             <div className="text-sm text-[#FF6B00] font-mono font-bold animate-pulse">Running risk assessment models...</div>
          </div>
        )}

        {/* STEP 3: RESULTS PLAN */}
        {step === 'results' && planData && (
          <div className="flex-1 flex flex-col -mx-6 -mb-6 pb-6 pt-2 h-[500px] overflow-hidden">
             
             {/* Header Stats */}
             <div className="px-6 pb-4 border-b border-glass-border flex justify-between items-center">
                <div>
                   <h3 className="text-lg font-bold text-gray-900 leading-tight">Your Focus Plan</h3>
                   <p className="text-xs text-gray-500 font-medium">{planData.summary.actionItemsCount} urgent actions generated.</p>
                </div>
                <div className="flex space-x-2">
                   <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-center">
                      <span className="block text-emerald-600 font-bold text-sm leading-none">{planData.summary.rolesOnTrack}</span>
                      <span className="text-[9px] uppercase tracking-wider text-emerald-600/70 font-bold leading-none">On Track</span>
                   </div>
                   <div className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg text-center shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]">
                      <span className="block text-red-600 font-bold text-sm leading-none">{planData.summary.rolesAtRisk}</span>
                      <span className="text-[9px] uppercase tracking-wider text-red-600/70 font-bold leading-none">At Risk</span>
                   </div>
                </div>
             </div>

             {/* Action List */}
             <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                {planData.actionItems.map((action, i) => (
                  <GlassCard key={action.id} className="p-4 border hover:border-[#FF6B00]/40 transition-colors shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                       <div className="flex items-center">
                          {getUrgencyIcon(action.urgency)}
                          <h4 className="text-sm font-bold text-gray-900 ml-2">{action.title}</h4>
                       </div>
                       <Badge className={`${action.urgency === 'high' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-orange-50 text-orange-600 border-orange-200'} !text-[10px] uppercase font-bold`}>
                         {action.type.replace(/_/g, ' ')}
                       </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 leading-relaxed mb-4">
                      {action.description}
                    </p>

                    {action.candidate && (
                      <div className="flex items-center bg-[#F5F5F7] p-2 rounded-xl mb-4 border border-glass-border">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                           {action.candidate.avatar}
                         </div>
                         <div className="ml-3 flex-1">
                           <div className="text-xs font-bold text-gray-900">{action.candidate.name}</div>
                           <div className="text-[10px] text-gray-500">{action.candidate.role}</div>
                         </div>
                         {action.candidate.score && (
                           <div className="text-[#FF6B00] font-bold text-xs bg-white px-2 py-1 rounded shadow-sm border border-glass-border">
                             {action.candidate.score}%
                           </div>
                         )}
                      </div>
                    )}

                    <div className="flex justify-end pt-3 border-t border-glass-border border-dashed">
                      <button className="text-[#FF6B00] text-xs font-bold hover:bg-[#FF6B00]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                        {action.actionText} <ChevronRight size={14} className="ml-1" />
                      </button>
                    </div>
                  </GlassCard>
                ))}
             </div>
          </div>
        )}

      </div>
    </Modal>
  );
};

export default FocusModeModal;
