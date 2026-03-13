import React, { useState, useMemo } from 'react';
import { 
  DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, defaultDropAnimationSideEffects 
} from '@dnd-kit/core';
import { 
  SortableContext, arrayMove, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import OrangeButton from '../components/ui/OrangeButton';
import { Mail, Calendar, StickyNote, MoreHorizontal, Filter, Search, Sparkles, Clock, Archive, RefreshCw } from 'lucide-react';

const COLUMNS = [
  { id: 'applied', title: 'APPLIED' },
  { id: 'screening', title: 'SCREENING' },
  { id: 'shortlisted', title: 'SHORTLISTED' },
  { id: 'interview', title: 'INTERVIEW' },
  { id: 'offer', title: 'OFFER' },
  { id: 'hired', title: 'HIRED' },
  { id: 'rejected', title: 'REJECTED' }
];

const INITIAL_CANDIDATES = [
  { id: 'c1', name: 'Alex Rivera', role: 'Sr. Frontend', avatar: 'A', score: 94, daysInStage: 2, stage: 'applied' },
  { id: 'c2', name: 'Sarah Chen', role: 'Product Manager', avatar: 'S', score: 88, daysInStage: 6, stage: 'screening' },
  { id: 'c3', name: 'Michael Scott', role: 'Sales Director', avatar: 'M', score: 76, daysInStage: 1, stage: 'shortlisted' },
  { id: 'c4', name: 'Emma Watson', role: 'UX Designer', avatar: 'E', score: 98, daysInStage: 8, stage: 'interview' },
  { id: 'c5', name: 'David Lee', role: 'Sr. Frontend', avatar: 'D', score: 91, daysInStage: 3, stage: 'offer' },
];

const PASSIVE_POOL = [
  { id: 'p1', name: 'Nina Williams', role: 'Frontend Eng.', score: 89, reason: 'Great cultural fit, runner-up for previous role.' },
  { id: 'p2', name: 'James Holden', role: 'React Developer', score: 85, reason: 'Strong technical skills, previously too junior but now aged.' }
];

const CandidateCard = ({ candidate, isDragging }) => {
  return (
    <div className={`p-4 rounded-xl border transition-all ${isDragging ? 'bg-[#FF6B00]/10 border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.3)] opacity-80' : 'bg-white/80 border-glass-border hover:border-[#FF6B00]/40 hover:shadow-[0_4px_12px_rgba(255,107,0,0.1)]'}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
            {candidate.avatar}
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-sm leading-tight">{candidate.name}</h4>
            <p className="text-gray-500 text-xs font-medium">{candidate.role}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-900 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Badge className="!bg-[#FF6B00]/15 !text-[#FF6B00] !border-[#FF6B00]/30 !px-1.5 !py-0.5 !text-[10px] font-bold shadow-[inset_0_0_8px_rgba(255,107,0,0.1)] flex items-center">
          <Sparkles size={10} className="mr-1" /> {candidate.score}% Match
        </Badge>
        <div className={`flex items-center text-xs font-bold ${candidate.daysInStage > 5 ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
          <Clock size={12} className="mr-1" /> {candidate.daysInStage}d
        </div>
      </div>

      <div className="flex justify-between border-t border-glass-border pt-3">
         <button className="text-gray-500 hover:text-gray-900 transition-colors p-1"><Mail size={14}/></button>
         <button className="text-gray-500 hover:text-gray-900 transition-colors p-1"><Calendar size={14}/></button>
         <button className="text-gray-500 hover:text-gray-900 transition-colors p-1"><StickyNote size={14}/></button>
      </div>
    </div>
  );
};

const SortableCandidate = ({ candidate }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
    data: { type: 'Candidate', candidate }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-3 cursor-grab active:cursor-grabbing touch-none">
      <CandidateCard candidate={candidate} isDragging={isDragging} />
    </div>
  );
};

const PipelineColumn = ({ column, candidates }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column }
  });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 mr-6">
      <div className="glass-panel border-t-2 border-t-[#FF6B00] rounded-xl mb-4 p-3 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        <h3 className="text-gray-900 font-bold text-sm tracking-widest">{column.title}</h3>
        <Badge className="bg-[#F5F5F7] text-[#FF6B00] border-glass-border font-bold">
          {candidates.length}
        </Badge>
      </div>
      
      <div 
        ref={setNodeRef}
        className="glass-panel flex-1 rounded-2xl p-3 min-h-[500px] flex flex-col bg-[#F5F5F7]/40 border-dashed border-2 border-transparent focus-within:border-[#FF6B00]/30 transition-colors"
      >
        <SortableContext items={candidates.map(c => c.id)} strategy={verticalListSortingStrategy}>
          {candidates.map(cand => (
            <SortableCandidate key={cand.id} candidate={cand} />
          ))}
        </SortableContext>
        {candidates.length === 0 && (
          <div className="m-auto text-gray-400 text-sm text-center font-medium italic p-4 rounded-xl border border-dashed border-glass-border w-full">
            Drop candidate here
          </div>
        )}
      </div>
    </div>
  );
};

const Pipeline = () => {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [activeCandidate, setActiveCandidate] = useState(null);
  
  // Passive Pool state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [pendingRejectCandidate, setPendingRejectCandidate] = useState(null);
  const [passivePool, setPassivePool] = useState(PASSIVE_POOL);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    if (active.data.current?.type === 'Candidate') {
      setActiveCandidate(active.data.current.candidate);
    }
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveCandidate = active.data.current?.type === 'Candidate';
    const isOverCandidate = over.data.current?.type === 'Candidate';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveCandidate) return;

    // Dropping a candidate over another candidate
    if (isActiveCandidate && isOverCandidate) {
      setCandidates(cands => {
        const activeIndex = cands.findIndex(c => c.id === activeId);
        const overIndex = cands.findIndex(c => c.id === overId);
        const newCands = [...cands];
        
        if (cands[activeIndex].stage !== cands[overIndex].stage) {
           newCands[activeIndex].stage = cands[overIndex].stage;
           return arrayMove(newCands, activeIndex, overIndex);
        }
        return arrayMove(cands, activeIndex, overIndex);
      });
    }

    // Dropping a candidate over an empty column
    if (isActiveCandidate && isOverColumn) {
      setCandidates(cands => {
        const activeIndex = cands.findIndex(c => c.id === activeId);
        const newCands = [...cands];
        newCands[activeIndex].stage = overId;
        return arrayMove(newCands, activeIndex, activeIndex); // Triggers re-render in new column
      });
    }
  };

  const handleDragEnd = (event) => {
    setActiveCandidate(null);
    const { active, over } = event;
    if (!over) return;
    
    const isOverColumn = over.data.current?.type === 'Column';
    const isOverCandidate = over.data.current?.type === 'Candidate';
    
    // Determine the actual destination column ID
    let destColumnId = null;
    if (isOverColumn) destColumnId = over.id;
    else if (isOverCandidate) destColumnId = over.data.current.candidate.stage;

    // We check if the destination is 'rejected' and the original wasn't (so they just got dropped in rejected)
    if (destColumnId === 'rejected' && active.data.current?.candidate?.stage !== 'rejected') {
       // Intercept the drop! Revert the candidate back to previous state visually (by forcing a re-render or letting the modal handle confirmation).
       // Actually, react-dnd already mutated state in handleDragOver for smoothness.
       // So we just pop the modal now.
       setPendingRejectCandidate(active.data.current.candidate);
       setIsRejectModalOpen(true);
    }
  };

  const handleConfirmReject = (action) => {
    if (!pendingRejectCandidate) return;

    if (action === 'pool') {
       // Add to passive pool
       setPassivePool(prev => [{
         id: pendingRejectCandidate.id,
         name: pendingRejectCandidate.name,
         role: pendingRejectCandidate.role,
         score: pendingRejectCandidate.score,
         reason: 'Automatically moved from Pipeline by recruiter.'
       }, ...prev]);
       
       // Remove from candidates (since they are no longer actively tracking in the kanban)
       setCandidates(prev => prev.filter(c => c.id !== pendingRejectCandidate.id));
    } else {
       // Just let them stay in the rejected column (default behavior already applied in handleDragOver)
       console.log("Archived entirely.");
    }
    
    setIsRejectModalOpen(false);
    setPendingRejectCandidate(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      
      {/* ━━━ HEADER & FILTERS ━━━ */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Hiring Pipeline</h1>
          <p className="text-gray-500 font-medium mt-1">Drag and drop candidates across stages.</p>
        </div>
        
        <GlassCard className="p-2 flex items-center space-x-2">
           <div className="relative">
             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Search..." className="bg-[#F5F5F7] border border-glass-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-900 placeholder-[#636366] focus:border-[#FF6B00]/50 outline-none w-48" />
           </div>
           <div className="w-px h-6 bg-glass-border mx-1"></div>
           <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors">
             <Filter size={14} className="mr-2"/> Role
           </button>
           <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors">
             <Calendar size={14} className="mr-2"/> Date
           </button>
        </GlassCard>
      </div>

      {/* ━━━ PASSIVE TALENT POOL SUGGESTIONS ━━━ */}
      {passivePool.length > 0 && (
         <div className="mb-6 animate-in slide-in-from-top-4 fade-in duration-500">
           <h3 className="text-gray-900 font-bold mb-3 flex items-center text-sm">
             <Sparkles size={16} className="text-[#FF6B00] mr-2" /> AI Suggested from Passive Pool
             <span className="ml-2 text-xs font-normal text-gray-500 bg-white px-2 py-0.5 rounded-full border border-glass-border">Matches for open roles</span>
           </h3>
           <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
             {passivePool.map((p, i) => (
                <GlassCard key={i} className="min-w-[300px] max-w-[300px] p-4 flex flex-col justify-between border-[#FF6B00]/20 hover:border-[#FF6B00] transition-colors relative group">
                   <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                        <p className="text-[#FF6B00] text-xs font-semibold">{p.role}</p>
                      </div>
                      <Badge className="!bg-[#FF6B00]/10 !text-[#FF6B00] font-bold shadow-none !border-[#FF6B00]/20">
                        {p.score}%
                      </Badge>
                   </div>
                   <p className="text-gray-500 text-xs italic mb-4 leading-relaxed line-clamp-2">"{p.reason}"</p>
                   <button className="flex items-center justify-center w-full py-1.5 glass-panel text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white font-bold text-xs rounded-lg transition-all border border-[#FF6B00]/30 shadow-none hover:shadow-[0_4px_10px_rgba(255,107,0,0.3)]">
                     <RefreshCw size={12} className="mr-1.5" /> Re-activate Candidate
                   </button>
                </GlassCard>
             ))}
           </div>
         </div>
      )}

      {/* ━━━ KANBAN BOARD ━━━ */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCorners} 
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full">
            <SortableContext items={COLUMNS.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {COLUMNS.map(col => (
                <PipelineColumn 
                  key={col.id} 
                  column={col} 
                  candidates={candidates.filter(c => c.stage === col.id)} 
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCandidate ? <CandidateCard candidate={activeCandidate} isDragging={true} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      {/* ━━━ REJECT ACTION MODAL ━━━ */}
      <Modal isOpen={isRejectModalOpen} onClose={() => handleConfirmReject('archive')} title="Review Rejection">
         <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/5 flex items-center justify-center rounded-2xl mb-4 border border-[#FF6B00]/20">
               <Archive size={32} className="text-[#FF6B00]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Move to Talent Pool?</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
               You just rejected <span className="font-bold text-gray-900">{pendingRejectCandidate?.name}</span>. 
               Would you like to archive them entirely, or move them to the AI Passive Talent Pool for future matching?
            </p>
            <div className="flex flex-col space-y-3">
               <OrangeButton onClick={() => handleConfirmReject('pool')} className="w-full py-3">
                 <Sparkles size={16} className="mr-2" /> Move to AI Talent Pool
               </OrangeButton>
               <button onClick={() => handleConfirmReject('archive')} className="w-full py-3 glass-panel text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-colors font-bold rounded-xl text-sm">
                 Archive Entirely
               </button>
            </div>
         </div>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 4px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.4); }
      `}} />
    </div>
  );
};

export default Pipeline;
