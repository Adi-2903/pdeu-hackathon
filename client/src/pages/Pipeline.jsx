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
import api from '../api';
import { Mail, Calendar, StickyNote, MoreHorizontal, Filter, Search, Sparkles, Clock } from 'lucide-react';

const CandidateCard = ({ candidate, isDragging }) => {
  const name = candidate.full_name || candidate.name;
  const role = candidate.current_role || candidate.role;
  const company = candidate.current_company || candidate.company;
  const avatar = candidate.avatar || (name ? name.charAt(0) : 'U');
  const score = candidate.score || candidate.overall_score || candidate.match_score || 0;
  const daysInStage = candidate.days_in_stage || candidate.daysInStage || 0;

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isDragging
          ? 'bg-[#FF6B00]/10 border-[#FF6B00] shadow-[0_0_20px_rgba(255,107,0,0.3)] opacity-80'
          : 'bg-white/80 border-glass-border hover:border-[#FF6B00]/40 hover:shadow-[0_4px_12px_rgba(255,107,0,0.1)]'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
            {avatar}
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-sm leading-tight">{name}</h4>
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
        <div className={`flex items-center text-xs font-bold ${daysInStage > 5 ? 'text-[#FF6B00]' : 'text-gray-400'}`}>
          <Clock size={12} className="mr-1" /> {daysInStage}d
        </div>
      </div>

      <div className="flex justify-between border-t border-glass-border pt-3">
        <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
          <Mail size={14} />
        </button>
        <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
          <Calendar size={14} />
        </button>
        <button className="text-gray-500 hover:text-gray-900 transition-colors p-1">
          <StickyNote size={14} />
        </button>
      </div>
    </div>
  );
};

const SortableCandidate = ({ candidate }) => {
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
      <CandidateCard candidate={candidate} isDragging={isDragging} />
    </div>
  );
};

const PipelineColumn = ({ column }) => {
  const { setNodeRef } = useSortable({
    id: column.id,
    data: { type: 'Column', column },
  });

  return (
    <div className="flex flex-col flex-shrink-0 w-80 mr-6">
      <div className="glass-panel border-t-2 border-t-[#FF6B00] rounded-xl mb-4 p-3 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
        <h3 className="text-gray-900 font-bold text-sm tracking-widest">{column.title}</h3>
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
            <SortableCandidate key={cand.id} candidate={cand} />
          ))}
        </SortableContext>
        {(column.candidates || []).length === 0 && (
          <div className="m-auto text-gray-400 text-sm text-center font-medium italic p-4 rounded-xl border border-dashed border-glass-border w-full">
            No candidates yet
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

  useEffect(() => {
    loadJobs();
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

    if (!overStageId || candidate.stage_id === overStageId) return;

    try {
      await api.put(`/jobs/${selectedJobId}/applications/${candidate.id}/move`, { stage_id: overStageId });
      await loadPipeline(selectedJobId);
    } catch (err) {
      console.error('Failed to move candidate', err);
    }
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
  };

  const columns = stages.map((stage) => ({
    id: stage.id,
    title: stage.name,
    candidates: stage.candidates || [],
  }));

  return (
    <div className="p-8 h-full flex flex-col relative overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">Hiring Pipeline</h1>
          <p className="text-gray-500 font-medium mt-1">Drag and drop candidates between stages.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Job</label>
          <select
            value={selectedJobId || ''}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="border border-glass-border rounded-lg px-3 py-2 text-sm bg-white"
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search candidates..."
            className="bg-[#F5F5F7] border border-glass-border rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 placeholder-[#636366] focus:border-[#FF6B00]/50 outline-none w-60"
          />
        </div>
        <div className="text-sm text-gray-500">
          {isLoading ? 'Loading pipeline…' : `${columns.reduce((sum, c) => sum + c.candidates.length, 0)} candidates`}
        </div>
      </div>

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
                <PipelineColumn key={col.id} column={col} />
              ))}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeCandidate ? <CandidateCard candidate={activeCandidate} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>

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
