import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, Users, Zap, Shield, AlertTriangle, 
  ChevronRight, ChevronLeft, Save, Flag, 
  MessageSquare, Layout, Activity, Clock,
  FileText, Briefcase, GraduationCap, Award,
  CheckCircle2, XCircle, Info, Download, ArrowLeft,
  Search, Filter, Play, Pause, RotateCw
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import api from '../api';

const InterviewPanel = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // ━━━ STATE ━━━
  const [candidate, setCandidate] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState(['CS', 'Electrical', 'Behavioral', 'Logic']);
  const [activeCategory, setActiveCategory] = useState('CS');
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  
  const [totalTime, setTotalTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const [scores, setScores] = useState({
    p1: { technical: 5, clarity: 5, soft_skills: 5 },
    p2: { technical: 5, clarity: 5, soft_skills: 5 }
  });
  const [notes, setNotes] = useState('');
  const [redFlags, setRedFlags] = useState([]);
  const [greenFlags, setGreenFlags] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ━━━ FETCH DATA ━━━
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [candRes, qRes] = await Promise.all([
          api.get(`/candidates/${id || '0eef202c-d9f2-4d68-b2e5-9592848ec751'}`), // Fallback for dev
          api.get('/candidates/questions')
        ]);
        setCandidate(candRes.data);
        setQuestions(qRes.data);
        setIsLoading(false);
      } catch (err) {
        addToast('Error loading interview data', 'error');
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, addToast]);

  // ━━━ TIMERS ━━━
  useEffect(() => {
    let interval;
    if (!isPaused && !showReport) {
      interval = setInterval(() => {
        setTotalTime(t => t + 1);
        setQuestionTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, showReport]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ━━━ LOGIC ━━━
  const filteredQuestions = questions.filter(q => q.category === activeCategory);
  const currentQuestion = filteredQuestions[currentQuestionIdx] || { text: 'No questions available for this category.', rubric: 'N/A' };

  const handleNext = () => {
    if (currentQuestionIdx < filteredQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setQuestionTime(0);
    } else {
      addToast('End of current track.', 'info');
    }
  };

  const toggleFlag = (type, flag) => {
    if (type === 'red') {
      setRedFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
    } else {
      setGreenFlags(prev => prev.includes(flag) ? prev.filter(f => f !== flag) : [...prev, flag]);
    }
  };

  const calculateOverall = () => {
    const p1Avg = (scores.p1.technical + scores.p1.clarity + scores.p1.soft_skills) / 3;
    const p2Avg = (scores.p2.technical + scores.p2.clarity + scores.p2.soft_skills) / 3;
    return ((p1Avg + p2Avg) / 2).toFixed(1);
  };

  const handleFinish = async () => {
    try {
      addToast('📡 Syncing Panel Report...', 'ai');
      await api.post(`/candidates/${candidate.id}/interview-sync`, {
        scores,
        notes,
        red_flags: redFlags,
        green_flags: greenFlags,
        duration: totalTime,
        report_status: 'Ready'
      });
      setShowReport(true);
      addToast('✅ Report Stored Successfully', 'success');
    } catch (err) {
      addToast('Error syncing report', 'error');
    }
  };

  if (isLoading) return <div className="h-full flex items-center justify-center bg-slate-950 text-white">Loading Command Center...</div>;

  return (
    <div className="h-full flex flex-col bg-[#0F1115] text-[#E2E8F0] font-sans selection:bg-[#FF6B00]/30">
      
      {/* ━━━ GLOBAL HEADER ━━━ */}
      <header className="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#16191F]/50 backdrop-blur-xl">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-slate-400" />
          </button>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] flex items-center justify-center shadow-[0_8px_20px_rgba(255,107,0,0.25)]">
              <Users size={24} className="text-[#0F1115]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight flex items-center">
                {candidate.full_name} 
                <Badge className="ml-3 bg-[#FF6B00]/10 text-[#FF6B00] border-none text-[10px] py-0.5">ID: {candidate.id.slice(0,8)}</Badge>
              </h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{candidate.current_role} • {candidate.location}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl px-5 py-2.5 space-x-6">
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-500 uppercase">Elapsed Total</span>
              <span className="text-lg font-mono font-bold text-white leading-none">{formatTime(totalTime)}</span>
            </div>
            <div className="w-[1px] h-6 bg-white/10"></div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-[#FF6B00] uppercase">Question Counter</span>
              <span className="text-lg font-mono font-bold text-[#FF6B00] leading-none">{formatTime(questionTime)}</span>
            </div>
          </div>
          <div className="flex space-x-2">
             <button onClick={() => setIsPaused(!isPaused)} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                {isPaused ? <Play size={20} /> : <Pause size={20} />}
             </button>
             <button onClick={() => { setTotalTime(0); setQuestionTime(0); }} className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                <RotateCw size={20} />
             </button>
          </div>
          <OrangeButton onClick={handleFinish} className="px-8 py-3.5 rounded-2xl font-black shadow-[0_8px_32px_rgba(255,107,0,0.3)]">
            GENERATE REPORT
          </OrangeButton>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        {/* ━━━ LEFT SIDEBAR: CANDIDATE INTEL (A-Z Info) ━━━ */}
        <aside className="w-80 border-r border-white/5 bg-[#16191F]/30 p-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center">
            <Info size={14} className="mr-2" /> Candidate Dossier
          </h3>
          
          <div className="space-y-8">
            <section>
              <h4 className="text-[11px] font-bold text-[#FF6B00] mb-3 flex items-center">
                <Briefcase size={12} className="mr-2" /> PROFESSIONAL SUMMARY
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-slate-800 pl-4 py-1">
                "{candidate.summary || 'No summary provided.'}"
              </p>
            </section>

            <section>
              <h4 className="text-[11px] font-bold text-[#FF6B00] mb-3 flex items-center">
                <Award size={12} className="mr-2" /> TECH STACK & SKILLS
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(candidate.skills || []).map(s => (
                  <span key={s} className="px-2.5 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-semibold text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h4 className="text-[11px] font-bold text-[#FF6B00] mb-3 flex items-center">
                <Clock size={12} className="mr-2" /> EXPERIENCE & RADAR
              </h4>
              <div className="bg-[#1A1D24] rounded-xl p-4 border border-white/5">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold">Overall Fit</span>
                  <span className="text-[#FF6B00] font-black">{candidate.overall_score || 0}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#FF6B00]" style={{ width: `${candidate.overall_score || 0}%` }}></div>
                </div>
                <p className="mt-3 text-[10px] text-slate-500">
                  {candidate.years_of_experience} years in software engineering. Current role: {candidate.current_role}.
                </p>
              </div>
            </section>

            <section>
              <h4 className="text-[11px] font-bold text-[#FF6B00] mb-3 flex items-center">
                <GraduationCap size={12} className="mr-2" /> EDUCATION
              </h4>
              <div className="space-y-3">
                 {[1, 2].map(i => (
                   <div key={i} className="relative pl-4 border-l border-white/10">
                      <div className="text-xs font-bold">Computer Science, B.S.</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Stanford University • 2020</div>
                   </div>
                 ))}
              </div>
            </section>
          </div>
        </aside>

        {/* ━━━ MAIN WORKSPACE ━━━ */}
        <main className="flex-1 flex flex-col p-8 space-y-8 overflow-y-auto custom-scrollbar">
          
          <AnimatePresence mode="wait">
            {!showReport ? (
              <motion.div 
                key="interview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* QUESTION ENGINE */}
                <div className="space-y-6">
                  <div className="flex space-x-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setCurrentQuestionIdx(0); }}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black tracking-widest transition-all ${
                          activeCategory === cat 
                            ? 'bg-[#FF6B00] text-[#0F1115] shadow-[0_4px_15px_rgba(255,107,0,0.3)]' 
                            : 'bg-[#16191F] text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <GlassCard className="p-10 border-white/5 bg-[#16191F]/40 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Shield size={120} className="text-[#FF6B00]" />
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-8">
                       <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-none font-black px-4 py-1.5 uppercase tracking-widest">
                         {currentQuestion.topic || 'General'}
                       </Badge>
                       <span className="text-xs font-bold text-slate-600">Question {currentQuestionIdx + 1} of {filteredQuestions.length || 0}</span>
                    </div>

                    <h2 className="text-4xl font-black leading-[1.2] text-white tracking-tight italic mb-12 max-w-4xl">
                      "{currentQuestion.text}"
                    </h2>

                    <div className="bg-black/30 border border-white/5 rounded-2xl p-6 flex flex-col space-y-3 mb-10">
                      <span className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">Panel Scoring Rubric</span>
                      <p className="text-sm text-slate-400 leading-relaxed font-medium">
                        {currentQuestion.rubric}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                          className="w-14 h-14 bg-[#1A1D24] border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white hover:border-[#FF6B00]/50 transition-all"
                        >
                          <ChevronLeft size={28} />
                        </button>
                        <button 
                          onClick={handleNext}
                          className="px-12 h-14 bg-[#FF6B00] text-[#0F1115] rounded-2xl font-black flex items-center shadow-[0_8px_32px_rgba(255,107,0,0.4)] hover:scale-[1.03] transition-all active:scale-[0.97]"
                        >
                          CONTINUE TRACK <ChevronRight size={22} className="ml-2" />
                        </button>
                      </div>
                      
                      <div className="flex space-x-6">
                        <div className="text-center">
                          <div className="text-[9px] font-black text-slate-600 uppercase mb-2">Technical Rigor</div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`w-6 h-1 rounded-full ${i <= 4 ? 'bg-[#FF6B00]' : 'bg-slate-800'}`}></div>
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[9px] font-black text-slate-600 uppercase mb-2">Clarity level</div>
                          <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`w-6 h-1 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-slate-800'}`}></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* LIVE NOTES & INPUT */}
                <div className="grid grid-cols-3 gap-8 h-64">
                   <div className="col-span-2 relative">
                      <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Type live panel observations, code architecture reviews, and follow-up answers..."
                        className="w-full h-full bg-[#16191F] border border-white/5 rounded-3xl p-8 text-slate-300 placeholder-slate-700 focus:outline-none focus:border-[#FF6B00]/40 transition-all resize-none font-medium leading-relaxed"
                      ></textarea>
                      <div className="absolute bottom-6 right-8 flex items-center space-x-2">
                        <span className="w-2 h-2 bg-[#FF6B00] rounded-full animate-pulse"></span>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Panel Sync Active</span>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <div className="bg-[#16191F] border border-white/5 rounded-3xl p-6 h-full flex flex-col">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Topic Flow Notes</h3>
                        <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar text-xs">
                          <div className="flex items-start space-x-3 opacity-50">
                            <CheckCircle2 size={14} className="text-green-500 mt-0.5" />
                            <p>Explained Time Complexity accurately for HashMaps.</p>
                          </div>
                          <div className="flex items-start space-x-3">
                            <Activity size={14} className="text-[#FF6B00] mt-0.5" />
                            <p>Currently deep-diving into Networking DNS lifecycle.</p>
                          </div>
                          <div className="flex items-start space-x-3 opacity-30 italic">
                            <Clock size={14} className="text-slate-600 mt-0.5" />
                            <p>Next: Behavioral Integrity track scheduled.</p>
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="report"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto w-full bg-[#16191F] border border-[#FF6B00]/20 rounded-[3rem] p-16 relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
              >
                <div className="absolute top-0 right-0 p-16 opacity-5">
                   <FileText size={200} className="text-[#FF6B00]" />
                </div>

                <div className="flex justify-between items-start mb-16">
                  <div>
                    <Badge className="bg-[#FF6B00] text-[#0F1115] border-none font-black px-4 py-1 mb-4">INTERVIEW REPORT READY</Badge>
                    <h1 className="text-5xl font-black tracking-tight">{candidate.full_name}</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest mt-2">Executive Summary & High-Stakes Evaluation</p>
                  </div>
                  <div className="text-right">
                    <div className="text-7xl font-black text-[#FF6B00] tabular-nums italic">{calculateOverall()}</div>
                    <div className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Aggregate Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-16 mb-16">
                   <div className="space-y-8">
                      <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                          <CheckCircle2 size={16} className="text-emerald-500 mr-2" /> GREEN FLAGS (Strengths)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {greenFlags.map(f => <span key={f} className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-xl text-[10px] font-black border border-emerald-500/20">{f.toUpperCase()}</span>)}
                           {greenFlags.length === 0 && <span className="text-slate-600 text-sm italic">No specific green flags flagged.</span>}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                          <XCircle size={16} className="text-red-500 mr-2" /> RED FLAGS (Concerns)
                        </h3>
                        <div className="flex flex-wrap gap-2">
                           {redFlags.map(f => <span key={f} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-xl text-[10px] font-black border border-red-500/20">{f.toUpperCase()}</span>)}
                           {redFlags.length === 0 && <span className="text-green-500/40 text-sm italic">Clean session — no red flags detected.</span>}
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-black/20 rounded-[2rem] p-10 border border-white/5">
                      <h3 className="text-xs font-black text-[#FF6B00] uppercase tracking-widest mb-6">Panel Alignment</h3>
                      <div className="space-y-8">
                         {['Technical', 'Clarity', 'Soft Skills'].map(skill => (
                           <div key={skill}>
                             <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-3">
                               <span>{skill}</span>
                               <span className="text-white">P1: {scores.p1[skill.toLowerCase().replace(' ', '_')]} | P2: {scores.p2[skill.toLowerCase().replace(' ', '_')]}</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                               <div className="h-full bg-slate-400" style={{ width: `${scores.p1[skill.toLowerCase().replace(' ', '_')] * 10}%` }}></div>
                               <div className="h-full bg-[#FF6B00]" style={{ width: `${scores.p2[skill.toLowerCase().replace(' ', '_')] * 10}%` }}></div>
                             </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-6 mb-16">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Final Panel Remarks</h3>
                  <div className="text-slate-300 text-lg leading-relaxed font-medium bg-white/5 p-8 rounded-3xl italic">
                    "{notes || 'No final remarks provided.'}"
                  </div>
                </div>

                <div className="flex space-x-4">
                   <OrangeButton className="flex-1 py-6 rounded-3xl font-black text-lg">
                      <Download size={24} className="mr-3" /> EXPORT FULL SCORECARD (PDF)
                   </OrangeButton>
                   <button 
                     onClick={() => setShowReport(false)}
                     className="px-10 py-6 bg-white/5 border border-white/10 rounded-3xl font-black text-slate-400 hover:text-white transition-all uppercase text-sm tracking-widest"
                   >
                     CLOSE & PERSIST
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* ━━━ RIGHT SIDEBAR: LIVE SCORING & FLAGS ━━━ */}
        {!showReport && (
          <aside className="w-96 border-l border-white/5 bg-[#16191F]/30 p-8 flex flex-col space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* PANEL SYNC */}
            <section className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Multi-Panel Scores</h3>
                <div className="flex -space-x-3">
                   <div className="w-10 h-10 rounded-full bg-[#1A1D24] border-2 border-[#0F1115] flex items-center justify-center text-[10px] font-black text-slate-300 shadow-xl">P1</div>
                   <div className="w-10 h-10 rounded-full bg-[#FF6B00] border-2 border-[#0F1115] flex items-center justify-center text-[10px] font-black text-[#0F1115] shadow-xl">P2</div>
                </div>
              </div>

              {Object.keys(scores.p1).map(skill => (
                <div key={skill} className="bg-black/20 p-5 rounded-2xl border border-white/5">
                  <div className="flex justify-between text-[11px] font-black uppercase mb-4">
                    <span className="text-slate-400">{skill.replace('_', ' ')}</span>
                    <span className="text-[#FF6B00]">{scores.p1[skill]} / 10</span>
                  </div>
                  <input 
                    type="range" min="0" max="10" 
                    value={scores.p1[skill]}
                    onChange={(e) => setScores(v => ({...v, p1: {...v.p1, [skill]: parseInt(e.target.value)}}))}
                    className="w-full h-8 accent-[#FF6B00] bg-transparent cursor-pointer appearance-none"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] font-black text-slate-700">LOW</span>
                    <span className="text-[8px] font-black text-slate-700">EXCEPTIONAL</span>
                  </div>
                </div>
              ))}
            </section>

            {/* TAGGING ENGINE */}
            <div className="grid grid-cols-1 gap-6">
                <section>
                  <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center">
                    <Flag size={14} className="mr-2" /> RED FLAGS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['Evasive', 'Integrity', 'No Depth', 'Arrogant', 'Over-Engineered'].map(flag => (
                      <button
                        key={flag}
                        onClick={() => toggleFlag('red', flag)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                          redFlags.includes(flag) 
                            ? 'bg-red-500 text-white border-red-400 shadow-[0_4px_15px_rgba(239,68,68,0.3)]' 
                            : 'bg-[#1A1D24] text-red-500/50 border-white/5 hover:border-red-500/20'
                        }`}
                      >
                        {flag.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center">
                    <Zap size={14} className="mr-2" /> GREEN FLAGS
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {['First Principles', 'System-Level', 'Humble', 'Fast Solver', 'Passionate'].map(flag => (
                      <button
                        key={flag}
                        onClick={() => toggleFlag('green', flag)}
                        className={`px-4 py-2.5 rounded-xl text-[10px] font-black border transition-all ${
                          greenFlags.includes(flag) 
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-[0_4px_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-[#1A1D24] text-emerald-500/50 border-white/5 hover:border-emerald-500/20'
                        }`}
                      >
                        {flag.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </section>
            </div>
            
            <div className="mt-auto">
               <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/20 rounded-2xl p-6 text-center">
                  <span className="text-[9px] font-black text-[#FF6B00] uppercase block mb-1">AGGREGATE INTENSITY</span>
                  <div className="text-4xl font-black italic tabular-nums">{calculateOverall()}</div>
               </div>
            </div>
          </aside>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        input[type=range] {
          -webkit-appearance: none;
        }
        input[type=range]:focus {
          outline: none;
        }
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        input[type=range]::-webkit-slider-thumb {
          height: 18px;
          width: 18px;
          border-radius: 6px;
          background: #FF6B00;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -7px;
          box-shadow: 0 4px 10px rgba(255, 107, 0, 0.4);
        }
      `}} />
    </div>
  );
};

export default InterviewPanel;
