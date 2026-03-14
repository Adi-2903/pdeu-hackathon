import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { Bell, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, Video, Phone, Target, AlertTriangle, Clock, CheckCircle2, ChevronRight, Check, Loader2 } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import FocusModeModal from '../components/ui/FocusModeModal';
import api from '../api';

// --- MOCK DATA FALLBACK ---
const DEFAULT_PIPELINE_DATA = [
  { name: 'Applied', value: 1284, rate: '100%', fill: 'rgba(255, 107, 0, 1.0)' },
  { name: 'Screened', value: 876, rate: '68%', fill: 'rgba(255, 107, 0, 0.85)' },
  { name: 'Shortlist', value: 342, rate: '27%', fill: 'rgba(255, 107, 0, 0.70)' },
  { name: 'Interview', value: 89, rate: '7%', fill: 'rgba(255, 107, 0, 0.55)' },
  { name: 'Offer', value: 23, rate: '2%', fill: 'rgba(255, 107, 0, 0.40)' },
  { name: 'Hired', value: 12, rate: '1%', fill: 'rgba(255, 107, 0, 0.25)' },
];

const DEFAULT_SOURCES_DATA = [
  { name: 'Email (28%)', value: 360, fill: '#FF6B00' },
  { name: 'Resume (24%)', value: 308, fill: '#FF8C42' },
  { name: 'LinkedIn (22%)', value: 282, fill: '#FFA366' },
  { name: 'HRMS (16%)', value: 205, fill: '#FFB380' },
  { name: 'Referral (10%)', value: 129, fill: '#E55A00' },
];

const DEFAULT_SKILLS_DATA = [
  { name: 'Python', required: 85, available: 110 },
  { name: 'React', required: 70, available: 85 },
  { name: 'AWS', required: 65, available: 40 },
  { name: 'SQL', required: 50, available: 95 },
  { name: 'Node.js', required: 45, available: 60 },
  { name: 'ML/AI', required: 40, available: 15 },
];

// --- CUSTOM TOOLTIPS ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-orange/30 shadow-[0_4px_20px_rgba(255,107,0,0.15)] rounded-xl bg-white/90 backdrop-blur-md">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color || '#FF6B00' }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
            {entry.payload.rate && <span className="ml-2 text-xs text-gray-400">({entry.payload.rate})</span>}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// --- MAIN COMPONENT ---
const Dashboard = () => {
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  
  // Focus Mode State
  const [focusPlan, setFocusPlan] = useState(null);
  const [completedActionsCount, setCompletedActionsCount] = useState(0);
  const [animatingActionId, setAnimatingActionId] = useState(null);

  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalApplications: 0,
    hired: 0,
    inScreening: 0,
    inInterview: 0,
    offers: 0,
  });
  const [pipelineData, setPipelineData] = useState(DEFAULT_PIPELINE_DATA);
  const [sourcesData, setSourcesData] = useState(DEFAULT_SOURCES_DATA);
  const [skillsData, setSkillsData] = useState(DEFAULT_SKILLS_DATA);
  const [topCandidates, setTopCandidates] = useState([]);
  const [aiFeed, setAiFeed] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [weeklyTrends, setWeeklyTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const resp = await api.get('/analytics/dashboard');
        const data = resp.data.data || {};
        setStats(data.stats || {});

        if (data.pipelineOverview && data.pipelineOverview.length > 0) {
          setPipelineData(data.pipelineOverview.map((row) => ({
            name: row.name,
            value: row.count,
            fill: row.color || 'rgba(255, 107, 0, 0.8)',
          })));
        }

        if (data.sourceDistribution && data.sourceDistribution.length > 0) {
          const palette = ['#FF6B00', '#FF8C42', '#FFA366', '#FFB380', '#E55A00', '#FFD9B0'];
          setSourcesData(data.sourceDistribution.map((row, idx) => ({
            name: `${row.source} (${Math.round((row.count / (data.stats?.totalCandidates || 1)) * 100)}%)`,
            value: row.count,
            fill: palette[idx % palette.length],
          })));
        }

        if (data.topCandidates && data.topCandidates.length > 0) {
          setTopCandidates(data.topCandidates.map((c) => ({
            id: c.id,
            name: c.full_name,
            avatar: c.full_name?.charAt(0) || 'U',
            source: c.source || 'Unknown',
            skills: [],
            score: c.overall_score || 0,
            status: 'Shortlisted',
          })));
        }

        if (data.weeklyTrends) {
          setWeeklyTrends(data.weeklyTrends);
        }

        if (data.aiActivityFeed && data.aiActivityFeed.length > 0) {
          setAiFeed(data.aiActivityFeed.map(a => ({ time: a.time, text: a.text })));
        } else {
          setAiFeed([
            { time: 'Just now', text: '✦ System initialized and pipeline data loaded.' },
            { time: '2m ago', text: '✦ AI scored 12 new candidates from this week.' },
            { time: '5m ago', text: '✦ Ghost detection scan completed — 2 candidates flagged.' },
          ]);
        }

        if (data.upcomingInterviews && data.upcomingInterviews.length > 0) {
          setInterviews(data.upcomingInterviews);
        } else {
          setInterviews([
            { id: 1, name: 'Alex Rivera', avatar: 'A', role: 'Sr. Frontend Eng.', time: '10:00 AM', type: 'Video', interviewer: 'Sarah M.' },
            { id: 2, name: 'Emma Watson', avatar: 'E', role: 'UX Designer', time: '2:30 PM', type: 'Phone', interviewer: 'Mike K.' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load dashboard analytics', err);
        // Keep defaults on error
        setAiFeed([
          { time: 'Just now', text: '✦ System initialized — backend connecting.' },
          { time: '1m ago', text: '✦ AI engine ready. Waiting for pipeline data.' },
        ]);
        setInterviews([
          { id: 1, name: 'Alex Rivera', avatar: 'A', role: 'Sr. Frontend Eng.', time: '10:00 AM', type: 'Video', interviewer: 'Sarah M.' },
          { id: 2, name: 'Emma Watson', avatar: 'E', role: 'UX Designer', time: '2:30 PM', type: 'Phone', interviewer: 'Mike K.' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const totalApplied = stats.totalApplications || 0;
  const totalShortlisted = stats.inScreening || 0;
  const totalInterviews = stats.inInterview || 0;
  const totalTimeToHire = stats.hired ? Math.max(1, Math.floor(stats.hired / 2)) : 14;

  const handleFocusAction = async (action) => {
      setAnimatingActionId(action.id);
      
      try {
          if (action.action === 'move-stage' && action.candidate && action.job_id && action.suggestedStageId) {
             const appUrl = `/candidates?search=${encodeURIComponent(action.candidate.name)}`;
             const res = await api.get(appUrl);
             if (res.data.data && res.data.data.length > 0) {
                 const cand = res.data.data[0];
                 const apps = cand.applications || [];
                 const app = apps.find(a => a.job_id === action.job_id);
                 if (app) {
                     await api.put(`/jobs/${action.job_id}/applications/${app.id}/move`, { stage_id: action.suggestedStageId });
                 }
             }
          } else if (action.action === 'follow-up' || action.action === 'call' && action.candidate) {
               await api.post(`/candidates/${action.candidate.id}/notes`, {
                  author: 'System',
                  content: `Completed Focus Action: ${action.title}`
               });
          }
          // Assuming immediate UI optimistic update on success
          setTimeout(() => {
              setFocusPlan(prev => ({
                  ...prev,
                  actionItems: prev.actionItems.filter(a => a.id !== action.id),
                  summary: { ...prev.summary, actionItemsCount: prev.summary.actionItemsCount - 1 }
              }));
              setCompletedActionsCount(prev => prev + 1);
              setAnimatingActionId(null);
          }, 300); // Wait for CSS transition
          
      } catch (err) {
          console.error("Failed to execute action", err);
          setAnimatingActionId(null);
      }
  };

  const getUrgencyIcon = (urgency) => {
    switch(urgency) {
      case 'high': return <AlertTriangle size={16} className="text-red-500" />;
      case 'medium': return <Clock size={16} className="text-[#FF6B00]" />;
      default: return <CheckCircle2 size={16} className="text-emerald-500" />;
    }
  };

  if (focusPlan) {
    return (
        <div className="p-8 pb-20 min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                   <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center">
                       <Target size={24} className="mr-3 text-[#FF6B00]" />
                       Hire by Friday Focus
                   </h1>
                   <p className="text-sm text-gray-500 font-medium mt-1">Completing targeted actions for {focusPlan.summary.totalJobsSelected} roles by {new Date(focusPlan.summary.targetDate).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={() => { setFocusPlan(null); setCompletedActionsCount(0); }}
                  className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm hover:bg-gray-50 transition-all text-sm w-fit"
                >
                  Exit Focus Mode
                </button>
            </div>

            {/* Summary Bar */}
            <GlassCard className="mb-8 p-6 !border-[#FF6B00]/20 !shadow-[0_8px_30px_rgba(255,107,0,0.06)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FF6B00]/10 to-transparent rounded-bl-full pointer-events-none"></div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x divide-glass-border">
                   <div className="pl-4 lg:pl-0">
                       <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Days Remaining</div>
                       <div className="text-3xl font-extrabold text-[#FF6B00]">{focusPlan.summary.daysRemaining}</div>
                   </div>
                   <div className="pl-6">
                       <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1 flex items-center">
                           Roles On Track
                       </div>
                       <div className="text-3xl font-extrabold text-emerald-600 flex items-baseline">
                           {focusPlan.summary.rolesOnTrack}
                       </div>
                   </div>
                   <div className="pl-6">
                       <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1 flex items-center">
                           Roles At Risk
                       </div>
                       <div className="text-3xl font-extrabold text-red-600 flex items-baseline">
                           {focusPlan.summary.rolesAtRisk}
                           {focusPlan.summary.rolesAtRisk > 0 && <AlertTriangle size={18} className="ml-2 text-red-500 opacity-80" />}
                       </div>
                   </div>
                   <div className="pl-6">
                       <div className="text-xs font-bold text-gray-500 tracking-wider uppercase mb-1">Actions Completed</div>
                       <div className="text-3xl font-extrabold text-gray-900 flex items-center">
                           {completedActionsCount}
                           {completedActionsCount > 0 && <span className="ml-3 text-sm font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center"><Check size={14} className="mr-1"/> Great job</span>}
                       </div>
                   </div>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Action List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        Prioritized Action List
                        <Badge className="ml-3 bg-gray-100 text-gray-600 font-bold border-none">{focusPlan.summary.actionItemsCount} Remaining</Badge>
                    </h2>
                    
                    <div className="space-y-4">
                        {focusPlan.actionItems.length === 0 ? (
                            <GlassCard className="p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">All Focus Actions Completed!</h3>
                                <p className="text-gray-500">You've cleared your focus list. Your pipelines are looking good for Friday.</p>
                            </GlassCard>
                        ) : (
                            focusPlan.actionItems.map(action => (
                                <GlassCard 
                                   key={action.id} 
                                   className={`p-5 border-l-4 transition-all duration-300 ease-in-out ${
                                       action.urgency === 'high' ? 'border-l-red-500 hover:border-red-500' 
                                       : action.urgency === 'medium' ? 'border-l-[#FF6B00] hover:border-[#FF6B00]' 
                                       : 'border-l-emerald-500 hover:border-emerald-500'
                                   } ${animatingActionId === action.id ? 'opacity-0 scale-95 origin-center' : 'opacity-100 scale-100'}`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                {getUrgencyIcon(action.urgency)}
                                                <h3 className="text-base font-bold text-gray-900 ml-2">{action.title}</h3>
                                                <Badge className="ml-3 bg-gray-100 text-gray-500 font-semibold border-none !text-[10px] uppercase">
                                                    {action.job_title}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4 pr-4">{action.reason}</p>
                                            
                                            {action.candidate && (
                                                <div className="flex items-center bg-[#F5F5F7] p-2.5 rounded-xl border border-glass-border w-max max-w-full">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                                        {action.candidate.avatar}
                                                    </div>
                                                    <div className="ml-3 pr-4">
                                                        <a href="#" className="text-sm font-bold text-gray-900 hover:text-[#FF6B00] transition-colors">{action.candidate.name}</a>
                                                        <div className="text-xs text-gray-500">{action.candidate.role}</div>
                                                    </div>
                                                    {action.candidate.score && (
                                                        <div className="ml-2 pl-3 border-l border-gray-200">
                                                            <div className="text-[#FF6B00] font-bold text-sm bg-white px-2 py-0.5 rounded shadow-sm border border-glass-border">
                                                                {action.candidate.score}% Match
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="sm:pl-4 sm:border-l border-glass-border flex flex-col justify-center shrink-0">
                                            <button 
                                                onClick={() => handleFocusAction(action)}
                                                disabled={animatingActionId === action.id}
                                                className={`w-full sm:w-auto text-sm font-bold px-5 py-2.5 rounded-xl transition-all flex items-center justify-center
                                                    ${action.urgency === 'high' 
                                                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
                                                        : 'bg-[#FF6B00] text-white hover:bg-[#FF8C42] shadow-[0_4px_12px_rgba(255,107,0,0.25)]'
                                                    }
                                                `}
                                            >
                                                {animatingActionId === action.id ? <Loader2 size={18} className="animate-spin" /> : action.actionText}
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                </div>

                {/* Per-Job Status Section */}
                <div className="lg:col-span-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Pipeline Health</h2>
                    <GlassCard className="p-0 overflow-hidden">
                        <div className="divide-y divide-glass-border">
                            {focusPlan.jobStatuses.map(jStat => (
                                <div key={jStat.id} className="p-5 hover:bg-[#F5F5F7]/50 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-sm font-bold text-gray-900 pr-4">{jStat.title}</h4>
                                        <Badge className={`shrink-0 ${jStat.status === 'At Risk' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'} !text-[10px] font-bold uppercase`}>
                                            {jStat.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-gray-500 font-medium">Active Pipeline</span>
                                        <span className={`font-bold ${jStat.pipelineDepth < 3 ? 'text-red-500' : 'text-gray-900'}`}>{jStat.pipelineDepth} candidates</span>
                                    </div>
                                    
                                    {/* Progress Indicator */}
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden flex">
                                        <div className={`h-full ${jStat.status === 'On Track' ? 'bg-emerald-500' : jStat.pipelineDepth > 0 ? 'bg-[#FF6B00]' : 'bg-red-500'}`} style={{ width: `${Math.min(100, Math.max(10, jStat.pipelineDepth * 20))}%` }}></div>
                                    </div>
                                    
                                    {jStat.reasons && jStat.reasons.length > 0 && (
                                        <div className="mt-3 space-y-1">
                                            {jStat.reasons.map((r, i) => (
                                                <div key={i} className="text-[10px] text-gray-500 flex items-start">
                                                    <span className="text-red-400 mr-1.5">•</span> {r}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className="p-8 pb-20 min-h-screen">
      
      {/* ━━━ HEADER SECTION ━━━ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recruitment Overview</h1>
        <div className="flex items-center space-x-3">
           <button 
             onClick={() => setIsFocusModalOpen(true)}
             className="glass-panel text-gray-900 border border-[#FF6B00]/40 px-5 py-2.5 rounded-xl font-bold hover:bg-[#FF6B00]/5 hover:-translate-y-0.5 transition-all flex items-center text-sm w-fit"
           >
             <Target size={18} className="mr-2 text-[#FF6B00]" />
             Hire by Friday
           </button>
           <button className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#FF8C42] hover:-translate-y-0.5 transition-all flex items-center text-sm w-fit">
             <Plus size={18} className="mr-2" />
             Post New Job
           </button>
        </div>
      </div>

      {/* ━━━ TABS ROW ━━━ */}
      <div className="flex items-center overflow-x-auto hide-scrollbar space-x-2.5 mb-6 pb-1">
         {['Dashboard', 'Pipeline Analytics', 'Source Insights', 'Interview Scheduler'].map((tab, i) => (
            <button key={i} className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${i === 0 ? 'bg-[#FF6B00] text-white shadow-[0_4px_12px_rgba(255,107,0,0.25)]' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100 hover:border-gray-300'}`}>
               {tab}
            </button>
         ))}
      </div>

      {/* ━━━ KPI STATS ROW ━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{isLoading ? '—' : totalApplied.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Total Applied</span>
            </div>
          </div>
          <div className="flex items-center text-[#FF6B00] border border-[#FF6B00]/20 bg-[#FF6B00]/5 text-xs font-bold px-2 py-1 rounded-lg">
            +12%
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{isLoading ? '—' : totalShortlisted.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Shortlisted</span>
            </div>
          </div>
          <div className="flex items-center text-[#FF6B00] border border-[#FF6B00]/20 bg-[#FF6B00]/5 text-xs font-bold px-2 py-1 rounded-lg">
            +8%
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{isLoading ? '—' : totalInterviews.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Interviews</span>
            </div>
          </div>
          <Badge variant="orange" className="!bg-[#FF6B00] !text-white !border-none !px-2 py-1 rounded-lg text-[10px] shadow-sm">
             Today
          </Badge>
        </div>

        {/* Stat 4 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{isLoading ? '—' : `${totalTimeToHire}d`}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Time-to-Hire</span>
            </div>
          </div>
          <div className="flex items-center text-emerald-600 border border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold px-2 py-1 rounded-lg">
             -3 days
          </div>
        </div>
      </div>

      {/* ━━━ MAIN CONTENT GRID ━━━ */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column */}
        <div className="xl:col-span-3 flex flex-col gap-8">
          
          {/* CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* ━━━ PIPELINE FUNNEL ━━━ */}
            <GlassCard className="lg:col-span-2 flex flex-col p-6 h-[340px]">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Hiring Pipeline</h2>
              <div className="flex-1 w-full h-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={pipelineData}
                    margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#AEAEB2', fontSize: 13, fontWeight: 500 }}
                      width={90}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 8, 8, 0]} 
                      barSize={24}
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* ━━━ SOURCES PIE CHART ━━━ */}
            <GlassCard className="flex flex-col p-6 h-[340px]">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Sources</h2>
              <div className="flex-1 w-full relative min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourcesData}
                      cx="50%"
                      cy="45%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                    >
                      {sourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-[45%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-xl font-bold text-gray-900 leading-none">{sourcesData.reduce((s,d) => s+d.value, 0).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 font-semibold tracking-wider mt-1 uppercase">Total</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-auto">
                 {sourcesData.slice(0, 5).map((source, i) => (
                   <div key={i} className="flex items-center text-xs text-gray-500">
                     <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: source.fill }}></div>
                     <span className="truncate">{source.name.split(' ')[0]}</span>
                   </div>
                 ))}
              </div>
            </GlassCard>
          </div>

          {/* SECOND CHARTS ROW */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ━━━ SKILL DEMAND BAR CHART ━━━ */}
            <GlassCard className="p-6 h-[320px] flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Skill Demand</h2>
              <p className="text-xs text-gray-400 mb-6">Required vs Available</p>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#AEAEB2', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#636366', fontSize: 12 }}
                    />
                    <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                    <Bar dataKey="required" name="Required" fill="#FF6B00" radius={[4, 4, 0, 0]} barSize={12} />
                    <Bar dataKey="available" name="Available" fill="rgba(255,107,0,0.35)" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center mt-4 space-x-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#FF6B00] mr-2"></div>Required</div>
                <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[rgba(255,107,0,0.35)] mr-2"></div>Available</div>
              </div>
            </GlassCard>

            {/* ━━━ TODAY'S INTERVIEWS ━━━ */}
            <GlassCard className="p-6 h-[320px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-lg font-bold text-gray-900">Today's Interviews</h2>
                 <button className="text-[#FF6B00] text-sm font-medium hover:text-[#FF8C42] transition-colors">See Calendar</button>
              </div>
              <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
                {interviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                    <Calendar size={32} className="mb-3 opacity-30" />
                    No interviews scheduled today.
                  </div>
                ) : interviews.map((interview) => (
                  <div key={interview.id} className="glass-panel p-4 rounded-xl border border-glass-border hover:border-[#FF6B00]/30 transition-colors flex items-center justify-between group">
                     <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[rgba(255,107,0,0.2)] flex items-center justify-center text-gray-900 font-bold shadow-[0_0_10px_rgba(255,107,0,0.2)]">
                          {interview.avatar}
                        </div>
                        <div>
                           <div className="font-bold text-gray-900 text-sm">{interview.name}</div>
                           <div className="text-xs text-gray-500">{interview.role}</div>
                        </div>
                     </div>
                     <div className="flex flex-col items-end">
                        <Badge variant="orange" className="!bg-[#FF6B00]/10 !text-[#FF6B00] !border-[#FF6B00]/20 mb-1">
                          {interview.time}
                        </Badge>
                        <div className="flex items-center text-[10px] text-gray-400 font-medium">
                          {interview.type === 'Video' ? <Video size={10} className="mr-1"/> : <Phone size={10} className="mr-1"/>}
                          with {interview.interviewer}
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            </GlassCard>
            
          </div>

          {/* ━━━ RECENT CANDIDATES TABLE ━━━ */}
          <GlassCard className="p-6 overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">Recent Top Matches</h2>
                <button className="text-[#FF6B00] text-sm font-medium hover:text-[#FF8C42] transition-colors flex items-center">
                  View full database <ArrowUpRight size={14} className="ml-1" />
                </button>
             </div>
             {topCandidates.length === 0 ? (
               <div className="text-center text-gray-400 py-8 text-sm">No candidate data yet. Add candidates to see matches here.</div>
             ) : (
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-glass-border">
                     <th className="pb-4 pt-2 pl-4">Candidate</th>
                     <th className="pb-4 pt-2">Source</th>
                     <th className="pb-4 pt-2">Core Skills</th>
                     <th className="pb-4 pt-2 w-1/4">AI Match</th>
                     <th className="pb-4 pt-2">Status</th>
                     <th className="pb-4 pt-2"></th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-glass-border/50 text-sm">
                   {topCandidates.map((cand) => (
                     <tr key={cand.id} className="hover:bg-[rgba(255,107,0,0.08)] transition-colors group cursor-pointer">
                       <td className="py-4 pl-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-glass-border flex items-center justify-center text-[#FF6B00] font-bold text-xs mr-3">
                             {cand.avatar}
                           </div>
                           <span className="font-semibold text-gray-900 group-hover:text-[#FF6B00] transition-colors">{cand.name}</span>
                         </div>
                       </td>
                       <td className="py-4 whitespace-nowrap">
                         <span className="text-gray-500 text-xs font-medium bg-white px-2 py-1 rounded-md border border-glass-border">{cand.source}</span>
                       </td>
                       <td className="py-4 whitespace-nowrap">
                         <div className="flex space-x-1.5">
                           {cand.skills.map((s, i) => (
                             <span key={i} className="text-xs text-[#FF6B00] border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-2 py-0.5 rounded">{s}</span>
                           ))}
                         </div>
                       </td>
                       <td className="py-4 whitespace-nowrap pr-6">
                         <div className="flex items-center space-x-3">
                           <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-glass-border">
                             <div className="h-full bg-[#FF6B00]" style={{ width: `${cand.score}%` }}></div>
                           </div>
                           <span className="font-bold text-[#FF6B00] text-xs w-6">{cand.score}%</span>
                         </div>
                       </td>
                       <td className="py-4 whitespace-nowrap">
                         <Badge variant={cand.status === 'Offer' ? 'success' : cand.status === 'Interview' ? 'orange' : 'default'}>
                           {cand.status}
                         </Badge>
                       </td>
                       <td className="py-4 pr-4 text-right">
                         <button className="text-gray-400 hover:text-[#FF6B00] transition-colors p-1 opacity-0 group-hover:opacity-100">
                           <MoreHorizontal size={18} />
                         </button>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
             )}
          </GlassCard>

        </div>

        {/* ━━━ RIGHT COLUMN: AI ACTIVITY FEED ━━━ */}
        <div className="xl:col-span-1 h-full">
          <GlassCard className="h-full flex flex-col p-6 sticky top-8">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-glass-border">
               <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <span className="relative flex h-3 w-3 mr-3 mt-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6B00] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FF6B00]"></span>
                    </span>
                    Live AI Feed
                  </h2>
                  <p className="text-xs text-gray-400 ml-6 mt-0.5 font-medium">System activity & intelligence</p>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar relative">
              {/* Vertical connecting line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gradient-to-b from-[#FF6B00]/40 via-glass-border to-transparent -z-10"></div>
              
              {aiFeed.map((item, index) => (
                <div key={index} className="relative flex items-start group">
                  <div className="absolute left-0 top-1">
                     <div className="text-[#FF6B00] text-sm leading-none bg-[#F5F5F7] rounded-sm shadow-[0_0_8px_rgba(255,107,0,0.5)]">✦</div>
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="text-gray-800 text-[13px] leading-relaxed font-medium mb-1.5 group-hover:text-[#FF8C42] transition-colors">
                      {item.text.replace('✦ ', '')}
                    </div>
                    <div className="text-[10px] font-bold tracking-wider uppercase text-gray-400 flex items-center">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 mr-1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {item.time}
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-8 pb-4 text-center">
                 <div className="inline-block p-2 rounded-full border border-glass-border bg-gray-50">
                   <svg className="w-4 h-4 text-gray-400 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                 </div>
                 <p className="text-[10px] text-gray-400 font-semibold tracking-wider mt-2 uppercase">Listening for events...</p>
              </div>
            </div>
          </GlassCard>
        </div>

      </div>
      
      {/* Hire by Friday Modal */}
      <FocusModeModal 
        isOpen={isFocusModalOpen} 
        onClose={() => setIsFocusModalOpen(false)} 
        onPlanGenerated={(data) => setFocusPlan(data)}
      />
    </div>
  );
};

export default Dashboard;
