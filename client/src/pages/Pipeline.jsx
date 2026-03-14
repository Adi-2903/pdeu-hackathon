import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import OrangeButton from '../components/ui/OrangeButton';
import api from '../api';
import ComposeEmailModal from '../components/ui/ComposeEmailModal';
import { Mail, Calendar, StickyNote, MoreHorizontal, Filter, Search, Sparkles, Clock, Archive, RefreshCw, Users, AlertCircle } from 'lucide-react';

const CandidateCard = ({ candidate, isDragging, onOpenEmail }) => {
  const name = candidate.full_name || candidate.name;
  const role = candidate.current_role || candidate.role;
  const avatar = candidate.avatar || (name ? name.charAt(0) : 'U');
  const score = candidate.score || candidate.overall_score || candidate.match_score || 0;
  const daysInStage = candidate.days_in_stage || candidate.daysInStage || 0;
  const isGhost = candidate.ghost_status || (daysInStage > 7);

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isDragging
          ? 'bg-[#FF6B00]/10 border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.3)] opacity-80'
          : isGhost
            ? 'bg-red-50/50 border-red-200 hover:border-red-300'
            : 'bg-white/80 border-glass-border hover:border-[#FF6B00]/40 hover:shadow-[0_4px_12px_rgba(255,107,0,0.1)]'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
            {avatar}
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-sm leading-tight flex items-center gap-1">
              {name}
              {isGhost && <span className="text-[10px]">👻</span>}
            </h4>
            <p className="text-gray-500 text-xs font-medium">{role}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-900 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Badge className="!bg-[#FF6B00]/15 !text-[#FF6B00] !border-[#FF6B00]/30 !px-1.5 !py-0.5 !text-[10px] font-bold shadow-[inset_0_0_8px_rgba(255,107,0,0.1)] flex items-center">
          <Sparkles size={10} className="mr-1" /> {score}% Match
        </Badge>
        <div className={`flex items-center text-xs font-bold ${daysInStage > 5 ? 'text-red-500' : 'text-gray-400'}`}>
          <Clock size={12} className="mr-1" /> {daysInStage}d
        </div>
      </div>

      <div className="flex justify-between border-t border-glass-border pt-3">
        <button
          title="Send Email"
          onClick={() => onOpenEmail ? onOpenEmail(candidate) : null}
          className="text-gray-500 hover:text-[#FF6B00] transition-colors p-1">
          <Mail size={14} />
        </button>
        <button
          title="Schedule Interview (copy link)"
          onClick={() => { navigator.clipboard.writeText(`https://calendly.com/invite?candidate=${encodeURIComponent(name)}`).catch(() => {}); alert('Calendly link copied to clipboard!'); }}
          className="text-gray-500 hover:text-[#FF6B00] transition-colors p-1">
          <Calendar size={14} />
        </button>
        <button
          title="Add Note"
          onClick={async () => {
            const note = window.prompt(`Add note for ${name}:`);
            if (!note) return;
            try { await api.post(`/candidates/${candidate.id}/notes`, { author: 'Recruiter', content: note }); alert('Note saved!'); } catch { alert('Failed to save note'); }
          }}
          className="text-gray-500 hover:text-[#FF6B00] transition-colors p-1">
          <StickyNote size={14} />
        </button>
      </div>

    </div>
  );
};

const SortableCandidate = ({ candidate, onOpenEmail }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    data: { type: 'Candidate', candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab active:cursor-grabbing touch-none">
      <CandidateCard candidate={candidate} isDragging={isDragging} onOpenEmail={onOpenEmail} />
    </div>
  );
};

const PipelineColumn = ({ column, onDropToReject, onOpenEmail }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  const isRejectedCol = column.title?.toLowerCase() === 'rejected';

  return (
    <div className="flex flex-col flex-shrink-0 w-80 mr-6">
      <div className={`glass-panel border-t-2 rounded-xl mb-4 p-3 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.04)] ${isRejectedCol ? 'border-t-red-400' : 'border-t-[#FF6B00]'}`}>
        <h3 className="text-gray-900 font-bold text-sm tracking-widest">{column.title?.toUpperCase()}</h3>
        <Badge className="bg-[#F5F7FF] text-[#FF6B00] border-glass-border font-bold">
          {(column.candidates || []).length}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className="glass-panel flex-1 rounded-2xl p-3 min-h-[500px] flex flex-col bg-[#F5F5F7]/40 border-dashed border-2 border-transparent focus-within:border-[#FF6B00]/30 transition-colors"
      >
        <SortableContext items={(column.candidates || []).map(c => c.id)} strategy={verticalListSortingStrategy}>
          {(column.candidates || []).map((cand) => (
            <SortableCandidate key={cand.id} candidate={cand} onOpenEmail={onOpenEmail} />
          ))}
        </SortableContext>
        {(column.candidates || []).length === 0 && (
          <div className="m-auto text-gray-400 text-sm text-center font-medium italic p-4 rounded-xl border border-dashed border-glass-border w-full">
            Drop candidates here
          </div>
        )}
      </div>
    </div>
  );
};

const Pipeline = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [stages, setStages] = useState([]);
  const [activeCandidate, setActiveCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Passive Pool state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [pendingRejectCandidate, setPendingRejectCandidate] = useState(null);
  const [passivePool, setPassivePool] = useState([]);
  const [isLoadingPool, setIsLoadingPool] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [emailModal, setEmailModal] = useState({ isOpen: false, candidate: null, type: 'outreach' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadJobs = async () => {
    try {
      const resp = await api.get('/jobs');
      const jobList = resp.data.data || [];
      setJobs(jobList);
      if (jobList.length) {
        setSelectedJobId(jobList[0].id);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
      setIsLoading(false);
    }
  };

  const loadPipeline = async (jobId) => {
    if (!jobId) return;
    setIsLoading(true);
    try {
      const resp = await api.get(`/jobs/${jobId}`);
      setStages(resp.data.data?.pipeline || []);
    } catch (err) {
      console.error('Failed to load pipeline', err);
      setStages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPassivePool = async () => {
    setIsLoadingPool(true);
    try {
      const resp = await api.get('/candidates/passive-pool');
      setPassivePool(resp.data.data || []);
    } catch (err) {
      console.error('Failed to load passive pool', err);
      setPassivePool([]);
    } finally {
      setIsLoadingPool(false);
    }
  };

  useEffect(() => {
    loadJobs();
    loadPassivePool();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadPipeline(selectedJobId);
    }
  }, [selectedJobId]);

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'Candidate') {
      setActiveCandidate(active.data.current.candidate);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveCandidate(null);

    if (!over || !active.data.current?.candidate) return;

    const candidate = active.data.current.candidate;
    const overStageId = over.data.current?.type === 'Column' ? over.id : over.data.current?.candidate?.stage_id;
    const overStage = stages.find(s => s.id === overStageId);

    if (!overStageId || candidate.stage_id === overStageId) return;

    // If dragging to Rejected — intercept
    if (overStage?.name?.toLowerCase() === 'rejected') {
      setPendingRejectCandidate(candidate);
      setIsRejectModalOpen(true);
      return;
    }

    try {
      await api.put(`/jobs/${selectedJobId}/applications/${candidate.id}/move`, { stage_id: overStageId });
      await loadPipeline(selectedJobId);
    } catch (err) {
      console.error('Failed to move candidate', err);
    }
  };

  const handleConfirmReject = async (action) => {
    if (!pendingRejectCandidate) return;

    if (action === 'pool') {
      // Add to passive pool via API
      try {
        await api.post(`/candidates/${pendingRejectCandidate.id}/passive-pool`, {
          reason: 'Strong candidate, rejected for current role but retained for future opportunities.'
        });
        await loadPassivePool();
      } catch (err) {
        // Fallback: add locally
        setPassivePool(prev => [{
          id: pendingRejectCandidate.id,
          name: pendingRejectCandidate.full_name || pendingRejectCandidate.name,
          role: pendingRejectCandidate.current_role || pendingRejectCandidate.role,
          score: pendingRejectCandidate.score || 80,
          reason: 'Automatically moved from Pipeline by recruiter.'
        }, ...prev]);
      }
    }

    // Move to rejected stage in pipeline
    const rejectedStage = stages.find(s => s.name?.toLowerCase() === 'rejected');
    if (rejectedStage) {
      try {
        await api.put(`/jobs/${selectedJobId}/applications/${pendingRejectCandidate.id}/move`, { stage_id: rejectedStage.id });
        await loadPipeline(selectedJobId);
      } catch (err) {
        console.error('Failed to move to rejected', err);
      }
    }

    setIsRejectModalOpen(false);
    setPendingRejectCandidate(null);
  };

  const handleReactivate = async (poolCandidate) => {
    try {
      const newStage = stages.find(s => s.name?.toLowerCase() === 'new');
      if (newStage && selectedJobId) {
        await api.post(`/jobs/${selectedJobId}/applications`, {
          candidate_id: poolCandidate.id,
          stage_id: newStage.id,
          match_score: poolCandidate.score || Math.floor(Math.random() * 20 + 75)
        });
      }
      await api.delete(`/candidates/${poolCandidate.id}/passive-pool`);
      setPassivePool(prev => prev.filter(p => p.id !== poolCandidate.id));
      if (selectedJobId) await loadPipeline(selectedJobId);
    } catch (err) {
      setPassivePool(prev => prev.filter(p => p.id !== poolCandidate.id));
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  // Build columns from stages
  const columns = stages.map((stage) => ({
    id: stage.id,
    title: stage.name,
    candidates: (stage.candidates || []).filter(c => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (c.full_name || c.name || '').toLowerCase().includes(q) || (c.current_role || c.role || '').toLowerCase().includes(q);
    }),
  }));

  const totalCandidatesInPipeline = columns.reduce((sum, c) => sum + c.candidates.length, 0);

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Hiring Pipeline</h1>
          <p className="text-gray-500 font-medium mt-1">Drag and drop candidates between stages.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500 font-medium">Job</label>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="border border-glass-border rounded-xl px-4 py-2.5 text-sm bg-white text-gray-900 focus:outline-none focus:border-[#FF6B00]/50 shadow-sm min-w-[200px]"
          >
            {jobs.length === 0 && <option value="">No jobs available</option>}
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ━━━ SEARCH & STATS BAR ━━━ */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates..."
            className="bg-white border border-glass-border rounded-xl pl-9 pr-3 py-2 text-sm text-gray-900 focus:border-[#FF6B00]/50 outline-none w-64 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {passivePool.length > 0 && (
            <div className="flex items-center text-[#FF6B00] font-semibold bg-[#FF6B00]/10 px-3 py-1.5 rounded-full border border-[#FF6B00]/20">
              <Users size={14} className="mr-1.5" /> {passivePool.length} in Passive Pool
            </div>
          )}
          <span>{isLoading ? 'Loading…' : `${totalCandidatesInPipeline} candidates`}</span>
        </div>
      </div>

      {/* ━━━ PASSIVE TALENT POOL SUGGESTIONS ━━━ */}
      {passivePool.length > 0 && (
         <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
           <h3 className="text-gray-900 font-bold mb-3 flex items-center text-sm">
             <Sparkles size={16} className="text-[#FF6B00] mr-2" /> AI Suggested from Passive Pool
             <span className="ml-2 text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-glass-border">{passivePool.length} matches for open roles</span>
           </h3>
           <div className="flex space-x-4 overflow-x-auto pb-3 custom-scrollbar">
             {passivePool.map((p, i) => (
                <GlassCard key={p.id || i} className="min-w-[300px] max-w-[300px] p-4 flex flex-col justify-between border border-[#FF6B00]/20 hover:border-[#FF6B00] transition-colors relative group shrink-0">
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold text-sm shadow-sm">
                         {(p.name || 'U').charAt(0)}
                       </div>
                       <div>
                         <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                         <p className="text-[#FF6B00] text-xs font-semibold">{p.role}</p>
                       </div>
                     </div>
                     <Badge className="!bg-[#FF6B00]/10 !text-[#FF6B00] font-bold shadow-none !border-[#FF6B00]/20">
                       {p.score || 0}%
                     </Badge>
                   </div>
                   <p className="text-gray-500 text-xs italic mb-4 leading-relaxed line-clamp-2">"{p.reason || 'Strong historical match for similar roles.'}"</p>
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleReactivate(p)}
                       className="flex-1 flex items-center justify-center py-1.5 glass-panel text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-bold text-xs rounded-lg transition-all border border-[#FF6B00]/30 hover:shadow-[0_4px_10px_rgba(255,107,0,0.3)]"
                     >
                       <RefreshCw size={12} className="mr-1.5" /> Re-activate
                     </button>
                   </div>
                </GlassCard>
             ))}
           </div>
         </div>
      )}

      {/* ━━━ KANBAN BOARD ━━━ */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Loading pipeline...</p>
          </div>
        </div>
      ) : columns.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <GlassCard className="max-w-md w-full p-10 text-center border-dashed border-2 border-glass-border bg-[#F5F5F7]/20">
            <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B00]/10 to-[#FF6B00]/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#FF6B00]/20">
               <Users size={40} className="text-[#FF6B00] opacity-40" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No active pipeline</h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed font-medium">
               Select a job from the dropdown above to view its candidate pipeline and stages. 
               You can also create a new job to start receiving applications.
            </p>
            <OrangeButton onClick={() => navigate('/pipeline')} className="w-full py-3 shadow-[0_4px_16px_rgba(255,107,0,0.3)]">
               <Plus size={18} className="mr-2" /> Create New Job Post
            </OrangeButton>
          </GlassCard>
        </div>
      ) : (
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full">
            <SortableContext items={columns.map((c) => c.id)} strategy={verticalListSortingStrategy}>
              {columns.map((col) => (
                <PipelineColumn key={col.id} column={col} onOpenEmail={(cand) => setEmailModal({ isOpen: true, candidate: cand, type: 'outreach' })} />
              ))}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCandidate ? <CandidateCard candidate={activeCandidate} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      )}
      
      {/* ━━━ REJECT → PASSIVE POOL MODAL ━━━ */}
      <Modal isOpen={isRejectModalOpen} onClose={() => { setIsRejectModalOpen(false); setPendingRejectCandidate(null); }} title="Review Rejection">
         <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center rounded-2xl mb-4 border border-[#FF6B00]/20">
               <Archive size={32} className="text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Save to Passive Pool?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
               You're rejecting <span className="font-bold text-gray-900">{pendingRejectCandidate?.full_name || pendingRejectCandidate?.name}</span>. 
               Would you like to archive them entirely, or save them to the <span className="text-[#FF6B00] font-bold">AI Passive Talent Pool</span> for future role matching?
            </p>
            <div className="flex flex-col space-y-3">
               <OrangeButton onClick={() => handleConfirmReject('pool')} className="w-full py-3 shadow-[0_4px_16px_rgba(255,107,0,0.3)]">
                 <Sparkles size={16} className="mr-2" /> Move to AI Talent Pool
               </OrangeButton>
               <button onClick={() => handleConfirmReject('archive')} className="w-full py-3 glass-panel text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-colors font-bold rounded-xl text-sm border border-glass-border">
                 <Archive size={16} className="inline mr-2" /> Archive Entirely
               </button>
            </div>
         </div>
      </Modal>

      {emailModal.isOpen && (
        <ComposeEmailModal 
          isOpen={emailModal.isOpen}
          candidate={emailModal.candidate}
          initialType={emailModal.type}
          onClose={() => setEmailModal({ ...emailModal, isOpen: false })}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.4); }
      `,
      }} />
    </div>
  );
};

export default Pipeline;
