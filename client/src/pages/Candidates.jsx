import React, { useState, useEffect, useCallback } from 'react';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import CandidateComparison from '../components/ui/CandidateComparison';
import { ShimmerTable } from '../components/ui/Skeletons';
import { useToast } from '../context/ToastContext';
import ResumeUploadModal from '../components/ui/ResumeUploadModal';
import {
  Search, Upload, UserPlus, SlidersHorizontal, ChevronDown,
  MapPin, Briefcase, Mail, Phone, Calendar, Download,
  CheckCircle2, Sparkles, X, Star, FileText, ChevronRight,
  TrendingUp, Clock, AlertTriangle, Building, ShieldCheck,
  Filter, MoreHorizontal, AlertCircle, Link
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api';

const DEFAULT_PAGE_SIZE = 20;

const STATUS_COLORS = {
  'New': 'bg-white text-gray-500 border-glass-border',
  'Screening': 'bg-transparent text-[#FF6B00] border-[#FF6B00]/40 border',
  'Shortlisted': 'bg-[#FF6B00] text-gray-900 border-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.3)]',
  'Interview': 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30',
  'Hired': 'bg-[#FF6B00]/80 text-gray-900 border-[#FF6B00]'
};

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

const CandidateModal = ({ candidate, onClose, onOpenEmail }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isReengageOpen, setIsReengageOpen] = useState(false);
  const { addToast } = useToast();
  if (!candidate) return null;

  const isGhost = candidate.ghost_status || 
    ((candidate.status === 'Interviewing' || candidate.status === 'Offer') && 
     candidate.lastActive && candidate.lastActive.includes('d') && parseInt(candidate.lastActive) >= 3);

  const handleReengage = () => {
    setIsReengageOpen(false);
    addToast('Re-engagement sequence started for ' + candidate.name, 'success');
  };

  // Build 6-axis radar data from aiInsights.metrics
  const radarData = candidate.aiInsights?.metrics?.length >= 6 
    ? candidate.aiInsights.metrics 
    : [
        { name: 'Skills Match', value: candidate.score || 75, reason: 'Technical skill overlap with job requirements.' },
        { name: 'Experience', value: Math.min(100, (parseInt(candidate.experience) || 3) * 12), reason: 'Seniority and depth of relevant experience.' },
        { name: 'Communication', value: 78, reason: 'Based on profile completeness and response history.' },
        { name: 'Leadership', value: 65, reason: 'Management and mentoring signals from resume.' },
        { name: 'Culture Fit', value: 82, reason: 'Alignment with company values indicators.' },
        { name: 'Adaptability', value: 71, reason: 'Career trajectory and tech stack diversity.' },
      ];

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
              {isGhost && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-lg">
                  👻 Ghost
                </div>
              )}
              <div className="absolute bottom-0 right-0 p-1.5 glass-panel rounded-full bg-[#F5F5F7] text-[#FF6B00]">
                {candidate.source === 'LinkedIn' ? <Building size={14} /> : <Mail size={14} />}
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900">{candidate.name}</h2>
            <p className="text-[#FF6B00] font-medium mt-1 uppercase tracking-wider text-xs">{candidate.role}</p>
            <p className="text-gray-500 text-sm mt-1">{candidate.company}</p>
          </div>

          <div className="flex justify-center items-center space-x-2 mb-8">
            <div className="flex items-center text-xs text-gray-500 glass-panel px-3 py-1.5 rounded-full">
              <MapPin size={12} className="mr-1.5 text-[#FF6B00]" /> {candidate.location || 'Unknown'}
            </div>
            <div className="flex items-center text-xs text-gray-500 glass-panel px-3 py-1.5 rounded-full">
              <Briefcase size={12} className="mr-1.5 text-[#FF6B00]" /> {candidate.experience}
            </div>
          </div>

          {/* AI Score */}
          <div className="glass-panel p-5 rounded-2xl mb-8 flex items-center shadow-[inset_0_0_20px_rgba(255,107,0,0.05)] border border-[#FF6B00]/20">
            <div className="relative w-16 h-16 flex items-center justify-center mr-4 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-gray-100 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-[#FF6B00] stroke-current" strokeWidth="3" strokeDasharray={`${candidate.score}, 100`} fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-gray-900 font-bold text-lg leading-none">{candidate.score}</span>
              </div>
            </div>
            <div>
              <h4 className="text-gray-900 font-bold text-sm mb-1 flex items-center">
                <Sparkles size={14} className="text-[#FF6B00] mr-1.5" /> AI Match Score
              </h4>
              <p className="text-gray-400 text-xs">Based on required skills, experience, and cultural fit markers.</p>
            </div>
          </div>

          {/* Ghost Warning Banner */}
          {isGhost && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 font-bold text-sm">Ghost Risk Detected</p>
                <p className="text-red-600 text-xs mt-1">Last active {candidate.lastActive}. No response to outreach detected.</p>
              </div>
            </div>
          )}

          {/* Contact & Tags */}
          <div className="space-y-4 mb-8">
            {candidate.email && (
              <div className="flex items-center text-sm text-gray-500">
                <Mail size={16} className="mr-3 text-gray-400" /> {candidate.email}
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center text-sm text-gray-500">
                <Phone size={16} className="mr-3 text-gray-400" /> {candidate.phone}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Core Skills</h4>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills || []).map((s, i) => (
                <span key={i} className="text-xs bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20 px-2.5 py-1 rounded-md font-medium">
                  {s}
                </span>
              ))}
              {(!candidate.skills || candidate.skills.length === 0) && (
                <span className="text-xs text-gray-400 italic">No skills extracted yet.</span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-auto space-y-3 pt-4 border-t border-glass-border">
            {isGhost ? (
              <OrangeButton onClick={() => setIsReengageOpen(true)} className="w-full py-3 !bg-red-500 hover:!bg-red-600 !shadow-red-500/30">
                <Sparkles size={16} className="mr-2" /> AI Re-engage Ghost
              </OrangeButton>
            ) : (
              <OrangeButton className="w-full py-3 shadow-[0_4px_16px_rgba(255,107,0,0.3)]">Shortlist Candidate</OrangeButton>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onOpenEmail(candidate, 'outreach')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <Mail size={13} className="mr-1.5" /> Email
              </button>
              <button
                onClick={() => onOpenEmail(candidate, 'offer')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <FileText size={13} className="mr-1.5" /> Send Offer
              </button>
              <button
                onClick={() => window.open(`/api/v1/company/offer-letter/${candidate.id}`, '_blank')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <FileText size={13} className="mr-1.5" /> Offer Letter
              </button>
              <button
                onClick={() => window.open(`/api/v1/candidates/${candidate.id}/resume`, '_blank')}
                className="glass-panel text-gray-900 text-xs font-semibold hover:bg-white/10 py-2.5 rounded-xl transition-all flex items-center justify-center"
              >
                <Download size={13} className="mr-1.5" /> Resume
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: CONTENT TABS */}
        <div className="w-full md:w-2/3 flex flex-col h-full bg-[#F5F5F7]">

          {/* Tabs Header */}
          <div className="flex space-x-8 px-8 pt-6 border-b border-glass-border bg-white">
            {['Overview', 'Resume', 'AI Analysis', 'Timeline', 'Notes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
                className={`pb-4 text-sm font-bold transition-all relative ${activeTab === tab.toLowerCase().replace(' ', '-')
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
                      <div className="absolute w-3 h-3 bg-[#FF6B00] rounded-full -left-1.5 top-1.5 ring-4 ring-[#F5F5F7] shadow-[0_0_10px_#FF6B00]"></div>
                      <h4 className="text-gray-900 font-bold">{candidate.role}</h4>
                      <p className="text-[#FF6B00] text-sm font-medium mb-1">{candidate.company} • Current</p>
                      <p className="text-sm text-gray-500 leading-relaxed">Leading technical initiatives at {candidate.company}. {candidate.experience} of hands-on experience driving impactful results.</p>
                    </div>
                    {(candidate.education || []).map((edu, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-white border-2 border-glass-border rounded-full -left-1.5 top-1.5 ring-4 ring-[#F5F5F7]"></div>
                        <GlassCard className="p-4 flex items-center">
                          <div className="p-3 bg-white rounded-xl mr-4 border border-glass-border text-gray-400">🎓</div>
                          <div>
                            <h4 className="text-gray-900 font-bold text-sm">{edu.degree}</h4>
                            <p className="text-gray-500 text-xs">{edu.school} • Class of {edu.year}</p>
                          </div>
                        </GlassCard>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ━━━ COMPETENCY RADAR CHART (6-axis) ━━━ */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Competency Radar</h3>
                  <GlassCard className="h-72 flex items-center justify-center p-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                        <PolarGrid stroke="rgba(0,0,0,0.05)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#636366', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Tooltip content={<CustomRadarTooltip />} cursor={{ stroke: 'rgba(255,107,0,0.2)', strokeWidth: 1 }} />
                        <Radar name="Candidate" dataKey="value" stroke="#FF6B00" strokeWidth={2} fill="url(#colorOrange)" fillOpacity={0.5} activeDot={{ r: 4, fill: '#FF6B00', stroke: '#fff', strokeWidth: 2 }} />
                        <defs>
                          <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FF6B00" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                      </RadarChart>
                    </ResponsiveContainer>
                  </GlassCard>
                  {/* Radar axis legend */}
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {radarData.map((d, i) => (
                      <div key={i} className="flex items-center text-xs text-gray-500 bg-white px-2 py-1.5 rounded-lg border border-glass-border">
                        <div className="w-2 h-2 rounded-full bg-[#FF6B00] mr-1.5 shrink-0 opacity-70"></div>
                        <span className="truncate font-medium">{d.name}</span>
                        <span className="ml-auto text-[#FF6B00] font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI ANALYSIS TAB */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-6">

                <GlassCard className="p-6 border border-[#FF6B00]/30 shadow-[0_8px_32px_rgba(255,107,0,0.05)] bg-gradient-to-br from-[#FF6B00]/5 to-transparent">
                  <div className="flex items-center mb-4">
                    <Sparkles className="text-[#FF6B00] mr-2" size={20} />
                    <h3 className="text-gray-900 font-bold text-lg">AI Executive Summary</h3>
                  </div>
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {candidate.aiInsights?.summary || `${candidate.name} brings ${candidate.experience} of relevant experience with a strong skill profile in ${(candidate.skills || []).slice(0, 3).join(', ')}. AI analysis indicates a ${candidate.score}% match for open roles, with notable strengths in core technical competencies and team collaboration.`}
                  </p>
                </GlassCard>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GlassCard className="p-6">
                    <h3 className="text-gray-900 font-bold flex items-center mb-4 text-sm uppercase tracking-wider">
                      <CheckCircle2 className="text-green-500 mr-2" size={16} /> Key Strengths
                    </h3>
                    <ul className="space-y-3">
                      {(candidate.aiInsights?.strengths || [
                        'Strong communication and collaboration skills.',
                        'Consistent delivery of high-quality work.',
                        'Fast learner with a growth mindset.'
                      ]).map((str, i) => (
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
                      {(candidate.aiInsights?.gaps || [
                        'Limited experience with large distributed systems.',
                        'Needs more backend/DevOps exposure.',
                      ]).map((gap, i) => (
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
                    {(candidate.aiInsights?.questions || [
                      'Describe a complex problem you solved recently and your approach.',
                      'How do you stay up to date with rapidly evolving technology?',
                      'How do you balance speed vs. quality when under delivery pressure?',
                    ]).map((q, i) => (
                      <div key={i} className="bg-white/50 p-4 rounded-xl border border-glass-border flex gap-3">
                        <div className="text-[#FF6B00] font-bold shrink-0">Q{i + 1}.</div>
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
                  {(candidate.timeline || []).map((t, i) => {
                    const isSuccess = t.type === 'success';
                    const isAI = t.type === 'ai';
                    return (
                      <div key={i} className="relative pl-8">
                        <div className={`absolute w-4 h-4 rounded-full -left-[9px] top-1 ring-4 ring-[#F5F5F7] shadow-lg flex items-center justify-center
                          ${isSuccess ? 'bg-green-500' : isAI ? 'bg-[#FF6B00]' : 'bg-white border-2 border-[#AEAEB2]'}`}>
                          {isAI && <Sparkles size={8} className="text-gray-900" />}
                        </div>
                        <GlassCard className="p-4 hover:border-[#FF6B00]/30 transition-colors">
                          <p className="text-gray-900 font-bold text-sm mb-1">{t.event}</p>
                          <p className="text-gray-400 text-xs font-semibold">{t.date}</p>
                        </GlassCard>
                      </div>
                    );
                  })}
                  {(!candidate.timeline || candidate.timeline.length === 0) && (
                    <div className="text-center text-gray-400 italic pb-8 pt-4 pl-8">
                      No activity history recorded yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* RESUME TAB */}
            {activeTab === 'resume' && (
              <div className="h-[500px] flex items-center justify-center flex-col glass-panel rounded-2xl border-dashed border-2 border-glass-border">
                <FileText size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-900 font-bold mb-2">Resume Preview</p>
                <p className="text-gray-500 font-medium mb-6 text-sm text-center max-w-xs">PDF rendering requires a PDF viewer worker in production. Download to view.</p>
                <OrangeButton variant="secondary" icon={<Download size={16} />}>Download Raw PDF</OrangeButton>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-glass-border">
                  <FileText size={28} className="text-gray-300" />
                </div>
                <p className="text-gray-400 font-medium">Collaborative notes</p>
                <p className="text-gray-300 text-sm mt-1">Note-taking feature coming soon.</p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* RE-ENGAGE MODAL */}
      <Modal isOpen={isReengageOpen} onClose={() => setIsReengageOpen(false)} title="🤖 AI Re-engagement">
        <div className="p-4 bg-[#F5F5F7] rounded-xl border border-glass-border mb-6">
          <p className="text-sm text-gray-900 font-bold mb-2">Drafted Message (Auto-generated)</p>
          <div className="bg-white p-4 rounded-lg border border-glass-border text-sm text-gray-600 font-mono shadow-sm leading-relaxed">
            Hi {candidate.name.split(' ')[0]},<br /><br />
            I noticed we haven't heard back since your {candidate.status?.toLowerCase() || 'screening'} step for the {candidate.role} role.<br /><br />
            Are you still exploring opportunities? We'd love to keep the conversation going.<br /><br />
            Best regards,<br />TalentOS Team
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setIsReengageOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
          <OrangeButton onClick={handleReengage}>Send Re-engagement</OrangeButton>
        </div>
      </Modal>

      <style dangerouslySetInnerHTML={{
        __html: `
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
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

// Email Modal State
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailConfig, setEmailConfig] = useState({ to: '', subject: '', body: '', type: '', includeAttachment: false });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailType, setEmailType] = useState('outreach');


  const handleOpenEmailModal = (candidate, type = 'outreach') => {
    setEmailType(type);
    setSelectedCandidate(candidate); // Ensure state is synced
    setEmailConfig(prev => ({ ...prev, candidateId: candidate.id, type }));
    setIsEmailModalOpen(true);
  };

  useEffect(() => {
    if (isEmailModalOpen && selectedCandidate) {
      const loadTemplate = async () => {
        try {
          const response = await api.get(`/company/email-compose/${selectedCandidate.id}`, { params: { type: emailType } });
          const d = response.data;
          if (d.data) {
            setEmailConfig({
              candidateId: selectedCandidate.id,
              to: d.data.to,
              subject: d.data.subject,
              body: d.data.body,
              type: emailType,
              role: selectedCandidate.role || selectedCandidate.current_role,
              includeAttachment: emailType === 'offer',
              salary: '120,000',
              startDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString()
            });
          }
        } catch (err) {
          addToast('Failed to load email template', 'error');
        }
      };
      loadTemplate();
    }
  }, [isEmailModalOpen, emailType, selectedCandidate]);

  const handleSendEmail = async () => {
    const candidateName = selectedCandidate?.name || 'Candidate';
    setIsSendingEmail(true);
    try {
      if (emailConfig.includeAttachment) {
        addToast('Generating Premium PDF...', 'info');
        const res = await api.post('/company/generate-offer-pdf', emailConfig, { responseType: 'blob' });
        
        // Validate if it's actually a PDF
        if (res.data.type !== 'application/pdf') {
          // It might be a JSON error hidden in a blob
          const text = await res.data.text();
          const error = JSON.parse(text);
          throw new Error(error.error?.message || 'Server failed to generate PDF');
        }

        const blob = res.data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Offer_Letter_${candidateName.replace(/\s+/g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);

        addToast('PDF ready! Please attach it to the Gmail draft.', 'success');
      }

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(emailConfig.to)}&su=${encodeURIComponent(emailConfig.subject)}&body=${encodeURIComponent(emailConfig.body)}`;
      window.open(gmailUrl, '_blank');

      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to prepare email', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  
  const filters = ['All', 'New', 'Screening', 'Shortlisted', 'Interview', 'Offer', 'Hired', '👻 Ghosts'];

  const fetchCandidates = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        search: searchTerm || undefined,
        page: 1,
        limit: DEFAULT_PAGE_SIZE,
      };
      
      if (selectedFilter !== 'All' && selectedFilter !== '👻 Ghosts') {
        params.status = selectedFilter;
      }
      if (selectedFilter === '👻 Ghosts') {
        params.ghost = 'true';
      }

      const response = await api.get('/candidates', { params });
      setCandidates(response.data.data || []);
      setTotalCandidates(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching candidates:', error);
      setCandidates([]);
      setTotalCandidates(0);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  }, [searchTerm, selectedFilter]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSelectCandidate = (id, e) => {
    e?.stopPropagation();
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

  const selectedCandidates = candidates.filter(c => selectedCandidateIds.includes(c.id));

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Offer': return <Badge className="bg-[#FF6B00] text-gray-900 border-none font-bold shadow-[0_0_10px_rgba(255,107,0,0.4)]">Offer Extended</Badge>;
      case 'Interviewing':
      case 'Interview': return <Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/40 font-semibold">Interviewing</Badge>;
      case 'Shortlisted': return <Badge className="bg-transparent text-[#FF6B00] border border-[#FF6B00] font-semibold">Shortlisted</Badge>;
      case 'Hired': return <Badge className="bg-green-500/20 text-green-600 border border-green-500/30 font-semibold">Hired</Badge>;
      case 'Screening': return <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 font-semibold">Screening</Badge>;
      default: return <Badge className="bg-white text-gray-500 border border-glass-border">New</Badge>;
    }
  };

  // Client-side ghost detection for candidates not filtered by server
  const isGhost = (cand) => {
    if (cand.ghost_status) return true;
    const ghostableStage = cand.status === 'Interviewing' || cand.status === 'Interview' || cand.status === 'Offer';
    if (!ghostableStage) return false;
    if (!cand.lastActive) return false;
    // lastActive format: "3d ago" or "1d ago"
    if (cand.lastActive.includes('d') && parseInt(cand.lastActive) >= 3) return true;
    return false;
  };

  return (
    <div className="p-8 h-full flex flex-col relative">

      {/* ━━━ HEADER ━━━ */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Candidate Database</h1>
            <span className="ml-4 bg-[#FF6B00]/20 text-[#FF6B00] px-3 py-1 rounded-full text-sm font-bold border border-[#FF6B00]/30 shadow-[0_0_10px_rgba(255,107,0,0.1)]">
              {isLoading ? '...' : totalCandidates} Total
            </span>
          </div>
          <p className="text-gray-500 font-medium">Manage, analyze, and track your talent pool.</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="glass-panel text-gray-900 font-semibold flex items-center px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-glass-border"
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
          <OrangeButton variant="outline" className="px-3 shrink-0" onClick={() => setIsUploadModalOpen(true)}>
            <Upload size={18} />
          </OrangeButton>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${selectedFilter === filter
                  ? filter === '👻 Ghosts'
                    ? 'bg-red-500/10 text-red-600 border-red-500/30 shadow-[inset_0_0_10px_rgba(239,68,68,0.05)]'
                    : 'bg-[#FF6B00]/20 text-[#FF6B00] border-[#FF6B00]/30 shadow-[inset_0_0_10px_rgba(255,107,0,0.1)]'
                  : 'bg-white text-gray-500 border-glass-border hover:text-gray-900 hover:border-[#FF6B00]/50'
                }`}
            >
              {filter}
            </button>
          ))}

          <div className="w-px h-6 bg-glass-border mx-2 shrink-0"></div>

          <button
            onClick={openCompare}
            disabled={selectedCandidateIds.length < 2}
            className={`flex items-center px-4 py-1.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border shrink-0 ${selectedCandidateIds.length >= 2
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
        ) : candidates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400">
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 border border-glass-border">
              <Search size={36} className="text-gray-300" />
            </div>
            <p className="text-gray-700 font-bold text-lg mb-2">
              {selectedFilter === '👻 Ghosts' ? 'No ghost candidates detected' : 'No candidates found'}
            </p>
            <p className="text-gray-400 text-sm text-center max-w-xs">
              {selectedFilter === '👻 Ghosts' 
                ? 'All active candidates have been responsive. Great job!' 
                : searchTerm 
                  ? `No results for "${searchTerm}". Try a different search term.`
                  : 'Upload resumes or add candidates manually to get started.'}
            </p>
            {selectedFilter !== 'All' && (
              <button onClick={() => setSelectedFilter('All')} className="mt-4 text-[#FF6B00] text-sm font-semibold hover:underline">
                Clear filter
              </button>
            )}
          </div>
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
                  <th className="px-4 py-4">Experience &amp; Loc</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/40 text-sm">
                {candidates.map((cand) => {
                  const ghost = isGhost(cand);
                  const isSelected = selectedCandidateIds.includes(cand.id);
                  return (
                    <tr
                      key={cand.id}
                      className={`hover:bg-[rgba(255,107,0,0.05)] transition-colors group ${ghost ? 'bg-red-50/50' : ''} ${isSelected ? 'bg-[#FF6B00]/5' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div 
                          onClick={(e) => handleSelectCandidate(cand.id, e)}
                          className={`w-4 h-4 rounded border transition-colors cursor-pointer flex items-center justify-center ${
                            isSelected ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-glass-border group-hover:border-[#FF6B00]/50 bg-white/50'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-sm"></div>}
                        </div>
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
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border border-glass-border flex items-center justify-center ${ghost ? 'bg-red-100 text-red-600' : 'bg-[#F5F5F7] text-[#FF6B00]'}`}>
                              {ghost ? <AlertCircle size={10} /> : cand.source === 'LinkedIn' ? <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg> : <Mail size={10} />}
                            </div>
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 group-hover:text-[#FF6B00] transition-colors flex items-center flex-wrap gap-1">
                              {cand.name}
                              {ghost && <Badge className="!bg-red-500/10 !text-red-600 !border-red-500/30 !px-1.5 !py-0 !text-[10px]">👻 Ghost Risk</Badge>}
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
                          {(cand.skills || []).slice(0, 3).map((s, i) => (
                            <span key={i} className="text-[10px] bg-[#F5F5F7] text-gray-500 border border-glass-border px-2 py-0.5 rounded uppercase font-semibold">
                              {s}
                            </span>
                          ))}
                          {(cand.skills || []).length > 3 && (
                            <span className="text-[10px] bg-transparent text-gray-400 px-1 py-0.5 font-bold">+{cand.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-900 text-sm">{cand.experience}</p>
                        <p className="text-gray-500 text-xs flex items-center mt-0.5">
                          <MapPin size={10} className="mr-1 text-[#FF6B00]" /> {cand.location || 'Remote'}
                        </p>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(cand.status)}
                        <p className={`text-[10px] mt-1 font-semibold ${ghost ? 'text-red-500 flex items-center' : 'text-gray-400'}`}>
                          {ghost && <Clock size={10} className="mr-1" />} Last active {cand.lastActive || 'Unknown'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button 
                          onClick={() => handleOpenEmailModal(cand, 'outreach')}
                          className="text-gray-400 hover:text-[#FF6B00] p-1.5 rounded-lg hover:bg-[#FF6B00]/10 transition-colors mr-1"
                        >
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

        {/* Pagination */}
        {!isLoading && candidates.length > 0 && (
          <div className="border-t border-glass-border p-4 flex justify-between items-center bg-gray-50/50">
            <span className="text-gray-500 text-sm">Showing 1 to {candidates.length} of {totalCandidates} entries</span>
            <div className="flex space-x-2">
              <button className="px-3 py-1 glass-panel rounded-lg text-gray-500 text-sm hover:text-gray-900 transition-colors border border-glass-border">Prev</button>
              <button className="px-3 py-1 bg-[#FF6B00] text-gray-900 shadow-[0_2px_8px_rgba(255,107,0,0.3)] rounded-lg text-sm font-bold">1</button>
              <button className="px-3 py-1 glass-panel rounded-lg text-gray-500 text-sm hover:text-gray-900 transition-colors border border-glass-border">Next</button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* CANDIDATE DETAIL MODAL */}
      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} onOpenEmail={handleOpenEmailModal} />

      {/* EMAIL MODAL */}
      <Modal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} title="📧 Draft Communication">
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4 overflow-x-auto hide-scrollbar">
            {['outreach', 'interview', 'offer', 'rejection'].map(type => (
              <button
                key={type}
                onClick={() => setEmailType(type)}
                className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${emailType === type ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">To</label>
              <input 
                type="text" 
                value={emailConfig.to}
                onChange={(e) => setEmailConfig({...emailConfig, to: e.target.value})}
                className="w-full bg-gray-50 border border-glass-border rounded-xl px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:border-[#FF6B00]/50"
              />
            </div>
            {emailType === 'offer' && (
              <>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Salary (USD)</label>
                  <input 
                    type="text" 
                    value={emailConfig.salary}
                    onChange={(e) => setEmailConfig({...emailConfig, salary: e.target.value})}
                    className="w-full bg-white border border-glass-border rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Start Date</label>
                  <input 
                    type="text" 
                    value={emailConfig.startDate}
                    onChange={(e) => setEmailConfig({...emailConfig, startDate: e.target.value})}
                    className="w-full bg-white border border-glass-border rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50"
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Subject</label>
            <input 
              type="text" 
              value={emailConfig.subject}
              onChange={(e) => setEmailConfig({...emailConfig, subject: e.target.value})}
              className="w-full bg-white border border-glass-border rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Message Body</label>
            <textarea 
              rows={emailType === 'offer' ? 5 : 8}
              value={emailConfig.body}
              onChange={(e) => setEmailConfig({...emailConfig, body: e.target.value})}
              className="w-full bg-white border border-glass-border rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#FF6B00]/50 resize-none custom-scrollbar"
            />
          </div>

          {emailConfig.includeAttachment && (
            <div className="bg-[#FF6B00]/5 border border-[#FF6B00]/20 p-3 rounded-xl flex items-center">
              <div className="p-2 bg-[#FF6B00]/10 text-[#FF6B00] rounded-lg mr-3">
                <FileText size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Premium Offer Letter PDF</p>
                <p className="text-xs text-gray-500">Will be generated with official HireX letterhead.</p>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00]/30 border-t-[#FF6B00] animate-spin hidden"></div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-glass-border">
            <button onClick={() => setIsEmailModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">Discard</button>
            <OrangeButton onClick={handleSendEmail} isLoading={isSendingEmail}>
              {emailType === 'offer' ? 'Generate PDF & Draft' : 'Draft in Gmail'}
            </OrangeButton>
          </div>
        </div>
      </Modal>

      {/* CANDIDATE COMPARISON MODAL */}
      <CandidateComparison
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        candidates={selectedCandidates}
      />

      {/* RESUME UPLOAD MODAL */}
      <ResumeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={(newCand) => {
          setCandidates(prev => [newCand, ...prev]);
          setTotalCandidates(prev => prev + 1);
          addToast(`${newCand.name || 'Candidate'} added successfully!`, 'success');
        }}
      />
    </div>
  );
};

export default Candidates;
