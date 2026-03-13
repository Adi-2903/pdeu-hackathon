import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import CandidateComparison from '../components/ui/CandidateComparison';
import { ShimmerTable } from '../components/ui/Skeletons';
import { useToast } from '../context/ToastContext';
import { 
  Search, Upload, UserPlus, SlidersHorizontal, ChevronDown, 
  MapPin, Briefcase, Mail, Phone, Calendar, Download, 
  CheckCircle2, Sparkles, X, Star, FileText, ChevronRight,
  TrendingUp, Clock, AlertTriangle, Building, ShieldCheck,
  Filter, MoreHorizontal, AlertCircle, Link
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import axios from 'axios';
import ResumeUploadModal from '../components/ui/ResumeUploadModal';

// ... (Constants omitted for brevity, keeping existing implementation)
const STATUS_COLORS = {
  'New': 'bg-white text-gray-500 border-glass-border',
  'Screening': 'bg-transparent text-[#FF6B00] border-[#FF6B00]/40 border',
  'Shortlisted': 'bg-[#FF6B00] text-gray-900 border-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.3)]',
  'Interview': 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30',
  'Hired': 'bg-[#FF6B00]/80 text-gray-900 border-[#FF6B00]'
};


const MOCK_CANDIDATES = [
  { 
    id: 1, name: 'Alex Rivera', role: 'Sr. Frontend Engineer', company: 'Google', 
    email: 'alex@example.com', phone: '+1 (555) 123-4567',
    avatar: 'A', source: 'LinkedIn', experience: '8 yrs', score: 94, 
    location: 'San Francisco, CA', status: 'Offer', lastActive: '2h ago',
    skills: ['React', 'TypeScript', 'Next.js', 'UI/UX'],
    education: [{ degree: 'BS Computer Science', school: 'Stanford', year: '2018' }],
    timeline: [
      { date: 'Oct 12', event: 'Offer Accepted', type: 'success' },
      { date: 'Oct 10', event: 'Offer Extended', type: 'info' },
      { date: 'Oct 05', event: 'Final Round Interview', type: 'action' },
      { date: 'Sep 28', event: 'Resume parsed by AI', type: 'ai' }
    ],
    aiInsights: {
       strengths: ['Deep React ecosystem knowledge', 'Strong performance optimization skills', 'Led teams of 5+ engineers'],
       gaps: ['Limited backend Node.js experience', 'No recent cloud infrastructure hands-on'],
       summary: "Alex is a highly qualified frontend specialist with exceptional React knowledge. His background at top-tier tech companies ensures an understanding of scale. He is an immediate fit for the Senior React Developer role, with slightly less backend overlap than ideal.",
       questions: [
         "Can you walk me through the most complex React rendering optimization you've implemented?",
         "How do you approach mentoring junior developers when introducing new state management patterns?",
         "Describe a time you had to push back on a design requirement due to technical constraints."
       ],
       cultureFit: "Highly collaborative, values documentation, proven remote capability.",
       metrics: [
         { name: 'Skills Match', value: 92, reason: "Deep overlap in modern React patterns and performance tuning." }, 
         { name: 'Experience', value: 95, reason: "8 years at strictly top-tier engineering orgs (Google)." }, 
         { name: 'Education', value: 85, reason: "Solid foundational BS from Stanford, but no advanced degrees." }, 
         { name: 'Culture', value: 90, reason: "Strong indicator of remote success based on GitHub activity." },
         { name: 'Leadership', value: 88, reason: "Mentored 5+ engineers, leading frontend architecture." }
       ]
    }
  },
  { 
    id: 2, name: 'Sarah Chen', role: 'Product Manager', company: 'Stripe', 
    email: 'sarah.c@example.com', phone: '+1 (555) 987-6543',
    avatar: 'S', source: 'Upload', experience: '5 yrs', score: 88, 
    location: 'New York, NY', status: 'Interviewing', lastActive: '1d ago',
    skills: ['Agile', 'Jira', 'Data Analysis', 'Strategy'],
    education: [{ degree: 'MBA', school: 'NYU Stern', year: '2021' }],
    timeline: [], aiInsights: { strengths: [], gaps: [], metrics: [], summary: '', questions: [], cultureFit: '' }
  },
  { 
    id: 3, name: 'Michael Scott', role: 'Sales Director', company: 'Dunder Mifflin', 
    email: 'mscott@example.com', phone: '+1 (555) 555-0199',
    avatar: 'M', source: 'Referral', experience: '15 yrs', score: 76, 
    location: 'Scranton, PA', status: 'Shortlisted', lastActive: '3h ago',
    skills: ['B2B Sales', 'Leadership', 'Negotiation'],
    education: [], timeline: [], aiInsights: { strengths: [], gaps: [], metrics: [], summary: '', questions: [], cultureFit: '' }
  },
  { 
    id: 4, name: 'Emma Watson', role: 'UX Designer', company: 'Spotify', 
    email: 'emma.w@example.com', phone: '+1 (555) 234-5678',
    avatar: 'E', source: 'Gmail', experience: '4 yrs', score: 98, 
    location: 'Remote', status: 'New', lastActive: '5m ago',
    skills: ['Figma', 'Prototyping', 'User Research'],
    education: [], timeline: [], aiInsights: { strengths: [], gaps: [], metrics: [], summary: '', questions: [], cultureFit: '' }
  },
];

const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3 max-w-[200px] border border-[#FF6B00]/30 shadow-[0_4px_20px_rgba(255,107,0,0.15)] rounded-xl bg-white/95 backdrop-blur-md z-50">
        <p className="font-bold text-gray-900 mb-1 flex items-center justify-between border-b border-glass-border pb-1">
          {data.name} <span className="text-[#FF6B00]">{data.value}%</span>
        </p>
        <p className="text-xs text-gray-600 leading-tight mt-1">
          {data.reason || 'AI evaluated based on resume keywords and historical trajectory.'}
        </p>
      </div>
    );
  }
  return null;
};

const CandidateModal = ({ candidate, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isReengageOpen, setIsReengageOpen] = useState(false);
  const { addToast } = useToast();
  if (!candidate) return null;

  const isGhost = candidate.id === 2 || (candidate.status === 'Interviewing' || candidate.status === 'Offer') && (candidate.lastActive && candidate.lastActive.includes('d') && parseInt(candidate.lastActive) >= 1);

  const handleReengage = () => {
    setIsReengageOpen(false);
    addToast('Re-engagement sequence started', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-7xl h-[90vh] glass-panel rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-300 pointer-events-auto">
        
        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 glass-panel rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/10 transition-colors">
          <X size={20} />
        </button>

        {/* LEFT PANEL: PROFILE SUMMARY */}
        <div className="w-full md:w-1/3 bg-white/50 border-r border-glass-border p-8 overflow-y-auto flex flex-col custom-scrollbar">
           
           <div className="flex flex-col items-center text-center mb-6">
             <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold text-4xl shadow-[0_8px_24px_rgba(255,107,0,0.3)] border-4 border-[#F5F5F7]">
                  {candidate.avatar}
                </div>
                <div className="absolute bottom-0 right-0 p-1.5 glass-panel rounded-full bg-[#F5F5F7] text-[#FF6B00]">
                  {candidate.source === 'LinkedIn' ? <Building size={14}/> : <Mail size={14}/>}
                </div>
             </div>
             <h2 className="text-2xl font-extrabold text-gray-900">{candidate.name}</h2>
             <p className="text-[#FF6B00] font-medium mt-1 uppercase tracking-wider text-xs">{candidate.role}</p>
             <p className="text-gray-500 text-sm mt-1">{candidate.company}</p>
           </div>

           <div className="flex justify-center items-center space-x-2 mb-8">
             <div className="flex items-center text-xs text-gray-500 glass-panel px-3 py-1.5 rounded-full">
               <MapPin size={12} className="mr-1.5 text-[#FF6B00]" /> {candidate.location}
             </div>
             <div className="flex items-center text-xs text-gray-500 glass-panel px-3 py-1.5 rounded-full">
               <Briefcase size={12} className="mr-1.5 text-[#FF6B00]" /> {candidate.experience}
             </div>
           </div>

           {/* AI Score */}
           <div className="glass-panel p-5 rounded-2xl mb-8 flex items-center shadow-[inset_0_0_20px_rgba(255,107,0,0.05)] border-[#FF6B00]/20">
              <div className="relative w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                   <path className="text-dark-bg stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                   <path className="text-[#FF6B00] stroke-current" strokeWidth="3" strokeDasharray={`${candidate.score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                 </svg>
                 <div className="absolute flex flex-col items-center">
                   <span className="text-gray-900 font-bold text-lg leading-none">{candidate.score}</span>
                 </div>
              </div>
              <div>
                <h4 className="text-gray-900 font-bold text-sm mb-1 flex items-center">
                   <Sparkles size={14} className="text-[#FF6B00] mr-1.5"/> AI Match Score
                </h4>
                <p className="text-gray-400 text-xs">Based on required skills, experience, and cultural fit markers.</p>
              </div>
           </div>

           {/* Contact & Tags */}
           <div className="space-y-4 mb-8">
             <div className="flex items-center text-sm text-gray-500">
               <Mail size={16} className="mr-3 text-gray-400" /> {candidate.email}
             </div>
             <div className="flex items-center text-sm text-gray-500">
               <Phone size={16} className="mr-3 text-gray-400" /> {candidate.phone}
             </div>
           </div>

           <div className="mb-8">
             <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Core Skills</h4>
             <div className="flex flex-wrap gap-2">
               {candidate.skills.map((s, i) => (
                 <span key={i} className="text-xs bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2.5 py-1 rounded-md font-medium">
                   {s}
                 </span>
               ))}
             </div>
           </div>

           {/* Quick Actions */}
           <div className="mt-auto space-y-3 pt-4 border-t border-glass-border">
             {isGhost ? (
               <OrangeButton onClick={() => setIsReengageOpen(true)} className="w-full py-3 shadow-[0_4px_16px_rgba(255,107,0,0.3)] !bg-red-500 hover:!bg-red-600 !shadow-red-500/30">
                 <Sparkles size={16} className="mr-2" /> AI Re-engage
               </OrangeButton>
             ) : (
               <OrangeButton className="w-full py-3 shadow-[0_4px_16px_rgba(255,107,0,0.3)]">Shortlist Candidate</OrangeButton>
             )}
             <div className="grid grid-cols-2 gap-3">
               <button className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center">
                 <Calendar size={14} className="mr-1.5"/> Schedule
               </button>
               <button className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center">
                 <Download size={14} className="mr-1.5"/> Resume
               </button>
             </div>
           </div>
        </div>

        {/* RIGHT PANEL: CONTENT TABS */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-[#F5F5F7]">
          
          {/* Tabs Header */}
          <div className="flex space-x-8 px-8 pt-6 border-b border-glass-border">
            {['Overview', 'Resume', 'AI Analysis', 'Timeline', 'Notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                className={`pb-4 text-sm font-bold transition-all relative ${
                  activeTab === tab.toLowerCase().replace(' ', '-') 
                    ? 'text-[#FF6B00]' 
                    : 'text-gray-400 hover:text-gray-500'
                }`}
              >
                {tab}
                {activeTab === tab.toLowerCase().replace(' ', '-') && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF6B00] shadow-[0_0_8px_#FF6B00] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Experience</h3>
                  <div className="relative border-l border-glass-border ml-3 space-y-6">
                    <div className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-[#FF6B00] rounded-full -left-1.5 top-1.5 ring-4 ring-dark-bg shadow-[0_0_10px_#FF6B00]"></div>
                      <h4 className="text-gray-900 font-bold">{candidate.role}</h4>
                      <p className="text-[#FF6B00] text-sm font-medium mb-1">{candidate.company} • 2020 - Present</p>
                      <p className="text-sm text-gray-500 leading-relaxed">Led frontend architecture for enterprise SaaS platform. Managed team of 5 engineers and improved rendering performance by 40%.</p>
                    </div>
                    <div className="relative pl-6">
                      <div className="absolute w-3 h-3 bg-white border-2 border-glass-border rounded-full -left-1.5 top-1.5 ring-4 ring-dark-bg"></div>
                      <h4 className="text-gray-900 font-bold">Frontend Developer</h4>
                      <p className="text-gray-400 text-sm font-medium mb-1">Facebook • 2018 - 2020</p>
                      <p className="text-sm text-gray-500 leading-relaxed">Developed core UI components for internal dashboard tools utilizing React and Redux.</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-4 mt-8">Education</h3>
                  {candidate.education.map((edu, i) => (
                    <GlassCard key={i} className="p-4 flex items-center">
                      <div className="p-3 bg-white rounded-xl mr-4 border border-glass-border text-gray-400">
                        🎓
                      </div>
                      <div>
                        <h4 className="text-gray-900 font-bold text-sm">{edu.degree}</h4>
                        <p className="text-gray-500 text-xs">{edu.school} • Class of {edu.year}</p>
                      </div>
                    </GlassCard>
                  ))}
                </div>

                <div>
                   <h3 className="text-lg font-bold text-gray-900 mb-4">Competency Radar</h3>
                   <GlassCard className="h-64 flex items-center justify-center p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={candidate.aiInsights?.metrics || []}>
                          <PolarGrid stroke="rgba(0,0,0,0.05)" />
                          <PolarAngleAxis dataKey="name" tick={{fill: '#636366', fontSize: 11, fontWeight: 600}} />
                          <Tooltip content={<CustomRadarTooltip />} cursor={{ stroke: 'rgba(255,107,0,0.2)', strokeWidth: 1 }} />
                          <Radar name="Candidate" dataKey="value" stroke="#FF6B00" strokeWidth={2} fill="url(#colorOrange)" fillOpacity={0.5} activeDot={{ r: 4, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }} />
                          <defs>
                            <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                        </RadarChart>
                     </ResponsiveContainer>
                   </GlassCard>
                </div>
              </div>
            )}

            {/* AI ANALYSIS TAB */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-6">
                
                <GlassCard className="p-6 border-[#FF6B00]/30 shadow-[0_8px_32px_rgba(255,107,0,0.05)] bg-gradient-to-br from-[#FF6B00]/5 to-transparent">
                  <div className="flex items-center mb-4">
                    <Sparkles className="text-[#FF6B00] mr-2" size={20} />
                    <h3 className="text-gray-900 font-bold text-lg">AI Executive Summary</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {candidate.aiInsights?.summary || "AI analysis pending extraction."}
                  </p>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6">
                    <h3 className="text-gray-900 font-bold flex items-center mb-4 text-sm uppercase tracking-wider">
                      <CheckCircle2 className="text-green-500 mr-2" size={16} /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {candidate.aiInsights?.strengths?.map((str, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-500">
                          <span className="text-[#FF6B00] mr-2 mt-0.5 font-bold">✓</span> {str}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h3 className="text-gray-900 font-bold flex items-center mb-4 text-sm uppercase tracking-wider">
                      <AlertTriangle className="text-yellow-500 mr-2" size={16} /> Potential Gaps
                    </h3>
                    <ul className="space-y-3">
                      {candidate.aiInsights?.gaps?.map((gap, i) => (
                        <li key={i} className="flex items-start text-sm text-gray-500">
                          <span className="text-gray-400 mr-2 mt-0.5 font-bold">-</span> {gap}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>
                </div>

                <GlassCard className="p-6">
                  <h3 className="text-gray-900 font-bold flex items-center mb-4 text-sm uppercase tracking-wider">
                     <ShieldCheck className="text-blue-400 mr-2" size={16} /> Recommended Interview Questions
                  </h3>
                  <div className="space-y-4">
                     {candidate.aiInsights?.questions?.map((q, i) => (
                        <div key={i} className="bg-white/50 p-4 rounded-xl border border-glass-border flex gap-3 inset-shadow">
                           <div className="text-[#FF6B00] font-bold">Q{i+1}.</div>
                           <p className="text-gray-500 text-sm">{q}</p>
                        </div>
                     ))}
                  </div>
                </GlassCard>

              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="max-w-xl mx-auto py-4">
                <div className="relative border-l-2 border-glass-border ml-4 space-y-8">
                  {candidate.timeline?.map((t, i) => {
                    const isSuccess = t.type === 'success';
                    const isAI = t.type === 'ai';
                    return (
                      <div key={i} className="relative pl-8">
                        <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-dark-bg shadow-lg flex items-center justify-center
                          ${isSuccess ? 'bg-green-500' : isAI ? 'bg-[#FF6B00]' : 'bg-white border-2 border-[#AEAEB2]'}`}>
                            {isAI && <Sparkles size={8} className="text-gray-900"/>}
                        </div>
                        <GlassCard className="p-4 hover:border-[#FF6B00]/30 transition-colors">
                          <p className="text-gray-900 font-bold text-sm mb-1">{t.event}</p>
                          <p className="text-gray-400 text-xs font-semibold">{t.date}</p>
                        </GlassCard>
                      </div>
                    );
                  })}
                  {(!candidate.timeline || candidate.timeline.length === 0) && (
                    <div className="text-center text-gray-400 italic pb-8 pt-4">No activity history.</div>
                  )}
                </div>
              </div>
            )}

            {/* RESUME TAB */}
            {activeTab === 'resume' && (
              <div className="h-[600px] flex items-center justify-center flex-col glass-panel rounded-2xl border-dashed">
                 <FileText size={48} className="text-gray-400 mb-4" />
                 <p className="text-gray-500 font-medium mb-6">Resume rendering requires PDF.js worker in production.</p>
                 <OrangeButton variant="secondary" icon={<Download size={16}/>}>Download Raw PDF</OrangeButton>
              </div>
            )}
            
            {/* NOTES TAB */}
             {activeTab === 'notes' && (
              <div className="flex items-center justify-center h-full text-gray-400 italic">
                 Collaborative notes feature coming soon.
              </div>
            )}

          </div>
        </div>
      </div>
      
      {/* RE-ENGAGE MODAL */}
      <Modal isOpen={isReengageOpen} onClose={() => setIsReengageOpen(false)} title="🤖 AI Re-engagement">
        <div className="p-4 bg-[#F5F5F7] rounded-xl border border-glass-border mb-6">
          <p className="text-sm text-gray-900 font-bold mb-2">Drafted Message (Auto-generated)</p>
          <div className="bg-white p-4 rounded-lg border border-glass-border text-sm text-gray-600 font-mono shadow-sm">
            Hi {candidate.name.split(' ')[0]},<br/><br/>
            I noticed we haven't heard back since your last {candidate.status.toLowerCase()} step for the {candidate.role} role.<br/><br/>
            Are you still exploring opportunities? We'd love to keep the conversation going if so.<br/><br/>
            Best,<br/>TalentOS Team
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setIsReengageOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <OrangeButton onClick={handleReengage}>Send Sequence</OrangeButton>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.5); }
      `}} />
    </div>
  );
};


const Candidates = () => {
  const { addToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const filters = ['All', 'New', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', '👻 Ghosts'];

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/candidates');
      setCandidates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates(MOCK_CANDIDATES);
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const handleSelectCandidate = (id) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(candId => candId !== id) : [...prev, id]
    );
  };

  const openCompare = () => {
    if (selectedCandidateIds.length < 2) {
      addToast('Select at least 2 candidates to compare', 'warning');
      return;
    }
    if (selectedCandidateIds.length > 3) {
      addToast('Maximum 3 candidates can be compared at once', 'warning');
      return;
    }
    setIsCompareOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer': return <Badge className="bg-[#FF6B00] text-gray-900 border-none font-bold shadow-[0_0_10px_rgba(255,107,0,0.4)]">Offer Extended</Badge>;
      case 'Interviewing': return <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/40 font-semibold">Interviewing</Badge>;
      case 'Shortlisted': return <Badge className="bg-transparent text-[#FF6B00] border border-[#FF6B00] font-semibold">Shortlisted</Badge>;
      default: return <Badge className="bg-white text-gray-500 border-glass-border">New</Badge>;
    }
  };

  return (
    <div className="p-8 h-full flex flex-col relative">
      
      {/* ━━━ HEADER ━━━ */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Database</h1>
            <span className="ml-4 bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1 rounded-full text-sm font-bold border border-[#FF6B00]/30 shadow-[0_0_10px_rgba(255,107,0,0.1)]">
              {MOCK_CANDIDATES.length} Total
            </span>
          </div>
          <p className="text-gray-500 font-medium">Manage, analyze, and track your talent pool.</p>
        </div>
        <div className="flex space-x-3">
          <button 
             onClick={() => setIsUploadModalOpen(true)}
             className="glass-panel text-gray-900 font-semibold flex items-center px-4 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
          >
            <Upload size={18} className="mr-2" /> Bulk Upload
          </button>
          <OrangeButton icon={<UserPlus size={18} />} className="shadow-[0_4px_16px_rgba(255,107,0,0.3)] font-bold px-5">
            Add Candidate
          </OrangeButton>
        </div>
      </div>

      {/* TOOLBAR */}
          <GlassCard className="mb-6 p-4 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center w-full md:w-auto space-x-4">
              <div className="relative w-full md:w-80">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, role, skills..." 
                  className="w-full bg-white border border-glass-border rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50 transition-colors"
                />
              </div>
              <OrangeButton variant="outline" className="px-3" onClick={() => setIsUploadModalOpen(true)}>
                <Upload size={18} />
              </OrangeButton>
            </div>
            
            <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {filters.map(filter => (
                <button 
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
                    selectedFilter === filter 
                      ? filter === '👻 Ghosts'
                        ? 'bg-red-500/10 text-red-600 border-red-500/30'
                        : 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30 shadow-[inset_0_0_10px_rgba(255,107,0,0.1)]' 
                      : 'bg-white text-gray-500 border-glass-border hover:text-gray-900 hover:border-[#FF6B00]/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
              
              <div className="w-px h-6 bg-glass-border mx-2"></div>
              
              <button 
                onClick={openCompare}
                disabled={selectedCandidateIds.length < 2}
                className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  selectedCandidateIds.length >= 2
                    ? 'bg-[#FF6B00] text-gray-900 border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.4)] hover:scale-105'
                    : 'bg-white text-gray-400 border-glass-border cursor-not-allowed'
                }`}
              >
                <SlidersHorizontal size={14} className="mr-2" />
                Compare ({selectedCandidateIds.length})
              </button>
            </div>
          </GlassCard>

          {/* TABLE AREA */}
          <GlassCard noPadding className="overflow-hidden flex-1 flex flex-col">
            {isLoading ? (
               <ShimmerTable rows={8} />
            ) : (
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="sticky top-0 bg-white/95 backdrop-blur z-10">
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-glass-border shadow-sm">
                <th className="px-6 py-4 w-10">
                   <div className="w-4 h-4 rounded border border-[#636366] hover:border-[#FF6B00] transition-colors cursor-pointer"></div>
                </th>
                <th className="px-4 py-4">Candidate</th>
                <th className="px-4 py-4 w-24">AI Match</th>
                <th className="px-4 py-4 w-64">Top Skills</th>
                <th className="px-4 py-4">Experience & Loc</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border/40 text-sm">
              {candidates.filter(c => {
                 if (selectedFilter === 'All') return true;
                 if (selectedFilter === '👻 Ghosts') {
                   // Ghost logic: In Interview/Offer + Last active > 5 days ago (Mock check: handles 'd' layout)
                   const isGhostableStage = c.status === 'Interviewing' || c.status === 'Offer';
                   const isStale = c.lastActive && (c.lastActive.includes('d ago') && parseInt(c.lastActive) > 2);
                   // Hardcode Alex (id:1) as Offer but not ghost, and Sarah (id:2) as ghost for demo purposes
                   if (c.id === 2) return true;
                   return isGhostableStage && isStale;
                 }
                 // Simple mapping for mock statuses
                 const map = { 'Screening': 'Screening', 'Interview': 'Interviewing', 'Offer': 'Offer' };
                 return c.status === (map[selectedFilter] || selectedFilter);
              }).map((cand) => {
                 const isGhost = cand.id === 2 || (cand.status === 'Interviewing' || cand.status === 'Offer') && (cand.lastActive && cand.lastActive.includes('d') && parseInt(cand.lastActive) >= 1);
                 return (
                <tr 
                  key={cand.id} 
                  className={`hover:bg-[rgba(255,107,0,0.05)] transition-colors group ${isGhost ? 'bg-red-50/30' : ''}`}
                >
                  <td className="px-6 py-4">
                     <div className="w-4 h-4 rounded border border-glass-border group-hover:border-[#FF6B00]/50 transition-colors cursor-pointer bg-white/50"></div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div 
                      className="flex items-center cursor-pointer"
                      onClick={() => setSelectedCandidate(cand)}
                    >
                      <div className="relative mr-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00]/80 to-[#E55A00]/80 flex items-center justify-center text-gray-900 font-bold text-sm shadow-[0_2px_8px_rgba(255,107,0,0.2)]">
                          {cand.avatar}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-glass-border flex items-center justify-center ${isGhost ? 'bg-red-100 text-red-600' : 'bg-[#F5F5F7] text-[#FF6B00]'}`}>
                           {isGhost ? <AlertCircle size={10} /> : cand.source === 'LinkedIn' ? <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg> : cand.source === 'Upload' ? <Upload size={10} /> : <Mail size={10} />}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors flex items-center">
                          {cand.name}
                          {isGhost && <Badge className="ml-2 !bg-red-500/10 !text-red-600 !border-red-500/30 !px-1.5 !py-0 !text-[10px]">Ghost Risk</Badge>}
                        </span>
                        <p className="text-gray-500 text-xs font-medium mt-0.5">{cand.role} • <span className="text-gray-400">{cand.company}</span></p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <Badge className="!bg-[#FF6B00]/10 !text-[#FF6B00] !border-[#FF6B00]/30 font-bold px-2 py-1 shadow-[inset_0_0_8px_rgba(255,107,0,0.1)]">
                      <Sparkles size={12} className="inline mr-1 -mt-0.5" /> {cand.score}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                      {cand.skills.slice(0,3).map((s, i) => (
                        <span key={i} className="text-[10px] bg-[#F5F5F7] text-gray-500 border border-glass-border px-2 py-0.5 rounded uppercase font-semibold">
                          {s}
                        </span>
                      ))}
                      {cand.skills.length > 3 && (
                        <span className="text-[10px] bg-transparent text-gray-400 px-1 py-0.5 font-bold">+{cand.skills.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <p className="font-semibold text-gray-900 text-sm">{cand.experience}</p>
                    <p className="text-gray-500 text-xs flex items-center mt-0.5">
                       <MapPin size={10} className="mr-1 text-[#FF6B00]" /> {cand.location}
                    </p>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                     {getStatusBadge(cand.status)}
                     <p className={`text-[10px] mt-1 font-semibold ${isGhost ? 'text-red-500 flex items-center' : 'text-gray-400'}`}>
                       {isGhost && <Clock size={10} className="mr-1" />} Last active {cand.lastActive}
                     </p>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button className="text-gray-400 hover:text-[#FF6B00] p-1.5 rounded-lg hover:bg-[#FF6B00]/10 transition-colors mr-1">
                      <Mail size={16} />
                    </button>
                    <button className="text-gray-400 hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
            )}
            
            {/* Pagination Placeholder */}
            {!isLoading && (
              <div className="border-t border-glass-border p-4 flex justify-between items-center bg-gray-50">
                <span className="text-gray-500 text-sm">Showing 1 to {candidates.length} of {candidates.length} entries</span>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 glass-panel rounded-lg text-gray-500 text-sm hover:text-gray-900 transition-colors">Prev</button>
                  <button className="px-3 py-1 bg-[#FF6B00] text-gray-900 shadow-[0_2px_8px_rgba(255,107,0,0.3)] rounded-lg text-sm font-bold">1</button>
                  <button className="px-3 py-1 glass-panel rounded-lg text-gray-500 text-sm hover:text-gray-900 transition-colors">Next</button>
                </div>
              </div>
            )}
          </GlassCard>

      {/* RENDER MODAL */}
      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} />

      {/* CANDIDATE COMPARISON MODAL */}
      <CandidateComparison 
        isOpen={isCompareOpen} 
        onClose={() => setIsCompareOpen(false)} 
        candidateIds={selectedCandidateIds} 
      />

      {/* RESUME UPLOAD MODAL */}
      <ResumeUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={(newCand) => {
          setCandidates(prev => [newCand, ...prev]);
          addToast("Candidate added successfully!", "success");
        }}
      />
    </div>
  );
};

export default Candidates;
