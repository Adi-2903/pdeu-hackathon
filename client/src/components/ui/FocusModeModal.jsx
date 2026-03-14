import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import GlassCard from './GlassCard';
import OrangeButton from './OrangeButton';
import Badge from './Badge';
import api from '../../api';
import { Target, AlertTriangle, CheckCircle2, ChevronRight, Loader2, Calendar, Users, X, Clock, Mail, Phone, Briefcase } from 'lucide-react';

const FocusModeModal = ({ isOpen, onClose, onPlanGenerated }) => {
  const [step, setStep] = useState('config'); // 'config', 'generating'
  const [targetDate, setTargetDate] = useState('');
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJobIds, setSelectedJobIds] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  // Initialize modal state and fetch active jobs
  useEffect(() => {
    if (isOpen) {
      setStep('config');
      
      // Default target date to coming Friday, or at least 2 days ahead
      const d = new Date();
      d.setDate(d.getDate() + (5 + 7 - d.getDay()) % 7);
      if ((d - new Date()) / (1000 * 60 * 60 * 24) < 2) {
          d.setDate(d.getDate() + 7);
      }
      setTargetDate(d.toISOString().split('T')[0]);

      const fetchJobs = async () => {
        setIsLoadingJobs(true);
        try {
          const res = await api.get('/jobs?status=Active');
          const jobsData = res.data.data || [];
          setActiveJobs(jobsData);
          // By default, select all
          setSelectedJobIds(jobsData.map(j => j.id));
        } catch (err) {
          console.error("Failed to load active jobs:", err);
        } finally {
          setIsLoadingJobs(false);
        }
      };

      fetchJobs();
    }
  }, [isOpen]);

  const handleJobSelect = (e, id) => {
    if (e.target.checked) {
      setSelectedJobIds(prev => [...prev, id]);
    } else {
      setSelectedJobIds(prev => prev.filter(jId => jId !== id));
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobIds(activeJobs.map(j => j.id));
    } else {
      setSelectedJobIds([]);
    }
  };

  const handleGenerate = async () => {
    if (selectedJobIds.length === 0) return;
    setStep('generating');
    try {
      const response = await api.post('/hire-by-friday', {
        target_date: targetDate, 
        job_ids: selectedJobIds
      });
      
      const data = response.data;
      if (data.status === 'success') {
          // Pass data back to Dashboard to render the Focus Mode view
          onPlanGenerated(data.data);
          onClose(); // Close the modal
      } else {
        throw new Error('Failed to generate plan');
      }
    } catch (err) {
      console.error(err);
      // Fallback if API fails
      setTimeout(() => setStep('config'), 1500);
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

              <div className="bg-[#F5F5F7] p-4 rounded-xl border border-glass-border flex flex-col max-h-[220px]">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Roles</label>
                  {activeJobs.length > 0 && (
                     <label className="flex items-center space-x-2 text-xs text-gray-500 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={selectedJobIds.length === activeJobs.length}
                         onChange={handleSelectAll}
                         className="rounded text-[#FF6B00] focus:ring-[#FF6B00]/50 cursor-pointer"
                       />
                       <span>Select All</span>
                     </label>
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-1 space-y-2 bg-white border border-glass-border rounded-lg p-2">
                   {isLoadingJobs ? (
                      <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center">
                          <Loader2 size={16} className="animate-spin mr-2" /> Loading jobs...
                      </div>
                   ) : activeJobs.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">No active jobs found.</div>
                   ) : activeJobs.map(job => (
                      <label key={job.id} className={`flex items-start p-2 rounded-lg border border-transparent hover:bg-[#F5F5F7] cursor-pointer transition-colors ${selectedJobIds.includes(job.id) ? 'bg-[#FF6B00]/5 border-[#FF6B00]/20' : ''}`}>
                         <input 
                           type="checkbox" 
                           className="mt-1 rounded text-[#FF6B00] focus:ring-[#FF6B00]/50"
                           checked={selectedJobIds.includes(job.id)}
                           onChange={(e) => handleJobSelect(e, job.id)}
                         />
                         <div className="ml-3 flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
                            <div className="flex items-center text-[10px] text-gray-500">
                               <Briefcase size={10} className="mr-1" />
                               {job.department} <span className="mx-1.5">•</span> {job.location}
                            </div>
                         </div>
                      </label>
                   ))}
                </div>
                <div className="text-right text-[10px] text-gray-400 mt-2 font-semibold">
                   {selectedJobIds.length} of {activeJobs.length} selected
                </div>
              </div>
            </div>

            <OrangeButton 
              onClick={handleGenerate} 
              disabled={selectedJobIds.length === 0}
              className="w-full py-3 mt-auto shadow-[0_4px_16px_rgba(255,107,0,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
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

      </div>
    </Modal>
  );
};

export default FocusModeModal;

