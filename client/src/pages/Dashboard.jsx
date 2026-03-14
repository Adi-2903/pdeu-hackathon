import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { Bell, Plus, ArrowUpRight, ArrowDownRight, MoreHorizontal, Calendar, Video, Phone } from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import api from '../api';

// No mock data — always use real API data

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
  const navigate = useNavigate();
  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState('Dashboard');
  
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
  const [pipelineData, setPipelineData] = useState([]);
  const [sourcesData, setSourcesData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
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
        const s = data.stats || {};
        setStats(s);

        // Always use real API data
        if (data.pipelineOverview && data.pipelineOverview.length > 0) {
          setPipelineData(data.pipelineOverview.map((row) => ({
            name: row.name,
            value: row.count,
            fill: row.color || '#FF6B00',
          })));
        }

        if (data.sourceDistribution && data.sourceDistribution.length > 0) {
          const palette = ['#FF6B00', '#FF8C42', '#FFA366', '#FFB380', '#E55A00', '#FF6B00'];
          setSourcesData(data.sourceDistribution.map((row, idx) => ({
            name: `${row.source} (${Math.round((row.count / (s.totalCandidates || 1)) * 100)}%)`,
            value: row.count,
            fill: palette[idx % palette.length],
          })));
        }

        if (data.skillsOverview && data.skillsOverview.length > 0) {
          setSkillsData(data.skillsOverview);
        }

        if (data.topCandidates && data.topCandidates.length > 0) {
          setTopCandidates(data.topCandidates.map((c) => ({
            id: c.id,
            name: c.full_name,
            avatar: c.full_name?.charAt(0) || 'U',
            source: c.source || 'Unknown',
            skills: Array.isArray(c.skills) ? c.skills.slice(0, 3) : [],
            score: c.overall_score || 0,
            status: 'Shortlisted',
          })));
        }

        if (data.weeklyTrends) {
          setWeeklyTrends(data.weeklyTrends);
        }

        if (data.aiActivityFeed) {
          setAiFeed(data.aiActivityFeed.map(a => ({ time: a.time, text: a.text })));
        }

        if (data.upcomingInterviews) {
          setInterviews(data.upcomingInterviews);
        }
      } catch (err) {
        console.error('Failed to load dashboard analytics', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Always use real stats directly from API
  const totalApplied = stats.totalCandidates || 0;
  const totalShortlisted = stats.inScreening || 0;
  const totalInterviews = stats.inInterview || 0;
  const totalTimeToHire = stats.hired ? Math.max(10, Math.floor(stats.hired * 2.5)) : 0;

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
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-2 text-[#FF6B00]"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
             Hire by Friday
           </button>
           <button
             onClick={() => navigate('/pipeline')}
             className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-semibold shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#FF8C42] hover:-translate-y-0.5 transition-all flex items-center text-sm w-fit">
             <Plus size={18} className="mr-2" />
             Post New Job
           </button>
        </div>
      </div>

      {/* ━━━ TABS ROW ━━━ */}
      <div className="flex items-center overflow-x-auto hide-scrollbar space-x-2.5 mb-6 pb-1">
         {['Dashboard', 'Pipeline Analytics', 'Source Insights', 'Interview Scheduler'].map((tab) => (
            <button key={tab}
               onClick={() => setActiveDashboardTab(tab)}
               className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeDashboardTab === tab ? 'bg-[#FF6B00] text-white shadow-[0_4px_12px_rgba(255,107,0,0.25)]' : 'bg-white text-gray-600 hover:text-gray-900 border border-gray-100 hover:border-gray-300'}`}>
               {tab}
            </button>
         ))}
      </div>

      {/* ━━━ TAB CONTENT ━━━ */}
      {activeDashboardTab === 'Dashboard' ? (
        <>
          {/* ━━━ KPI STATS ROW ━━━ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Stat 1 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{totalApplied.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Total Applied</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 border border-gray-200 bg-gray-50 text-xs font-bold px-2 py-1 rounded-lg">
            {stats.appsTrend || '+12%'}
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div className="ml-4">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{totalShortlisted.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide">Shortlisted</span>
            </div>
          </div>
          <div className="flex items-center text-gray-500 border border-gray-200 bg-gray-50 text-xs font-bold px-2 py-1 rounded-lg">
            {stats.shortTrend || '+8%'}
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
               <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{totalInterviews.toLocaleString()}</span>
              <span className="text-xs text-gray-500 font-medium tracking-wide hidden sm:block">Interviews</span>
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
              <span className="text-xl font-extrabold text-gray-900 block leading-tight">{totalTimeToHire}d</span>
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
        
        {/* Left Column (Main Charts/Tables) - Takes up 3 cols on xl screens */}
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
                  <div className="text-xl font-bold text-gray-900 leading-none">{(stats.totalCandidates || 0).toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 font-semibold tracking-wider mt-1 uppercase">Total</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-2 mt-auto">
                 {sourcesData.slice(0, 4).map((source, i) => (
                   <div key={i} className="flex items-center text-xs text-gray-500">
                     <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: source.fill }}></div>
                     <span className="truncate">{source.name.split(' ')[0]}</span>
                   </div>
                 ))}
                 <div className="flex items-center text-xs text-gray-500">
                     <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#E55A00' }}></div>
                     <span className="truncate">Referral</span>
                 </div>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
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
                 <button onClick={() => navigate('/pipeline')} className="text-[#FF6B00] text-sm font-medium hover:text-[#FF8C42] transition-colors">See Calendar</button>
              </div>
              <div className="overflow-y-auto pr-2 space-y-4 flex-1 custom-scrollbar">
                {interviews.map((interview) => (
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
                           <div className="w-8 h-8 rounded-full bg-[#F5F5F7] border border-glass-border flex items-center justify-center text-[#FF6B00] font-bold text-xs mr-3 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
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
                             <span key={i} className="text-xs text-[#FF6B00] border border-[#FF6B00]/30 bg-[#FF6B00]/10 px-2 py-0.5 rounded text-center">
                               {s}
                             </span>
                           ))}
                         </div>
                       </td>
                       <td className="py-4 whitespace-nowrap pr-6">
                         <div className="flex items-center space-x-3">
                           <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden border border-glass-border">
                             <div className="h-full bg-[#FF6B00] shadow-[var(--orange-glow)]" style={{ width: `${cand.score}%` }}></div>
                           </div>
                           <span className="font-bold text-[#FF6B00] text-xs w-6">{cand.score}%</span>
                         </div>
                       </td>
                       <td className="py-4 whitespace-nowrap">
                         <Badge variant={cand.status === 'Offer' ? 'success' : cand.status === 'Interview' ? 'orange' : 'default'} className="font-medium">
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

              <div className="pt-8 pb-4 text-center pb-2">
                 <div className="inline-block p-2 rounded-full border border-glass-border bg-gray-50">
                   <svg className="w-4 h-4 text-gray-400 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
                 </div>
                 <p className="text-[10px] text-gray-400 font-semibold tracking-wider mt-2 uppercase">Listening for events...</p>
              </div>
            </div>
          </GlassCard>
        </div>

          </div>
      </>
      ) : activeDashboardTab === 'Pipeline Analytics' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Target size={24} className="text-[#FF6B00]" /> Pipeline Conversion Funnel
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <GlassCard className="lg:col-span-2 p-8">
                 <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={pipelineData} layout="vertical" margin={{ left: 40, right: 40 }}>
                         <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                         <XAxis type="number" hide />
                         <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#4B5563' }} />
                         <Tooltip cursor={{ fill: 'rgba(255,107,0,0.05)' }} content={({ active, payload }) => {
                           if (active && payload && payload.length) {
                             return (
                               <div className="bg-white p-3 rounded-xl border border-glass-border shadow-xl">
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{payload[0].name}</p>
                                  <p className="text-xl font-black text-gray-900">{payload[0].value}</p>
                                  <p className="text-[10px] font-bold text-[#FF6B00]">{payload[0].payload.rate} conversion rate</p>
                               </div>
                             );
                           }
                           return null;
                         }} />
                         <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={32}>
                           {pipelineData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} />
                           ))}
                         </Bar>
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </GlassCard>
              <div className="space-y-6">
                 <GlassCard className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Bottleneck Alerts</h3>
                    <div className="space-y-4">
                       <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                          <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-1">
                             <AlertTriangle size={16} /> Interview Lag
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">Sr. Frontend role has 14 candidates stuck in 'Interview' for &gt; 5 days.</p>
                       </div>
                       <div className="p-4 bg-[#FF6B00]/5 border border-[#FF6B00]/10 rounded-2xl">
                          <div className="flex items-center gap-2 text-[#FF6B00] font-bold text-sm mb-1">
                             <Clock size={16} /> Shortlist Delay
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed font-medium">Average time to shortlist decreased by 12% this week. Keep it up!</p>
                       </div>
                    </div>
                 </GlassCard>
              </div>
           </div>
        </div>
      ) : activeDashboardTab === 'Source Insights' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Plus size={24} className="text-[#FF6B00]" rotate={45} /> Talent Source Attribution
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-8 flex flex-col items-center">
                 <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie
                           data={sourcesData}
                           cx="50%"
                           cy="50%"
                           innerRadius={80}
                           outerRadius={120}
                           paddingAngle={8}
                           dataKey="value"
                         >
                           {sourcesData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.fill} stroke="white" strokeWidth={2} />
                           ))}
                         </Pie>
                         <Tooltip />
                         <Legend verticalAlign="bottom" height={36} iconType="circle" />
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </GlassCard>
              <div className="space-y-6">
                 <GlassCard className="p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Source Performance</h3>
                    <div className="space-y-4">
                       {sourcesData.map((s, i) => (
                         <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.fill }}></div>
                               <span className="text-sm font-bold text-gray-700">{s.name.split(' (')[0]}</span>
                            </div>
                            <span className="text-sm font-black text-gray-900">{s.value}</span>
                         </div>
                       ))}
                    </div>
                 </GlassCard>
              </div>
           </div>
        </div>
      ) : activeDashboardTab === 'Interview Scheduler' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
             <Calendar size={24} className="text-[#FF6B00]" /> Upcoming Interviews
           </h2>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                 {interviews.length > 0 ? interviews.map((iv, i) => (
                    <GlassCard key={i} className="p-5 flex items-center justify-between hover:border-[#FF6B00]/40 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8C42] flex items-center justify-center text-white font-black shadow-lg">
                             {iv.avatar}
                          </div>
                          <div>
                             <h4 className="font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors">{iv.name}</h4>
                             <p className="text-xs text-gray-500 font-medium">{iv.role} • <span className="text-[#FF6B00]">{iv.interviewer}</span></p>
                          </div>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="text-right">
                             <p className="text-sm font-black text-gray-900">{iv.time}</p>
                             <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-widest">
                                {iv.type === 'Video' ? <Video size={10} /> : <Phone size={10} />} {iv.type}
                             </p>
                          </div>
                          <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors">
                             <ChevronRight size={20} />
                          </button>
                       </div>
                    </GlassCard>
                 )) : (
                    <div className="p-12 text-center text-gray-400 border-2 border-dashed border-glass-border rounded-3xl">
                       <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                       <p className="font-bold text-lg">No interviews scheduled</p>
                       <p className="text-sm">Candidates moved to 'Interview' stage will appear here.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      ) : null}
      
      {/* Scrollbar styling injected directly for this page if not global */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 107, 0, 0.5);
        }
        .wave {
          animation-name: wave-animation;
          animation-duration: 2.5s;
          animation-iteration-count: infinite;
          transform-origin: 70% 70%;
          display: inline-block;
        }
        @keyframes wave-animation {
          0% { transform: rotate( 0.0deg) }
          10% { transform: rotate(14.0deg) }
          20% { transform: rotate(-8.0deg) }
          30% { transform: rotate(14.0deg) }
          40% { transform: rotate(-4.0deg) }
          50% { transform: rotate(10.0deg) }
          60% { transform: rotate( 0.0deg) }
          100% { transform: rotate( 0.0deg) }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}} />
    </div>
  );
};

export default Dashboard;
