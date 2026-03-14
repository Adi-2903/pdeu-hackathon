import React, { useState } from 'react';
import GlassCard from './GlassCard';
import OrangeButton from './OrangeButton';
import Badge from './Badge';
import { ShimmerCard } from './Skeletons';
import { Users, X, MapPin, Sparkles, Building, Briefcase } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CandidateComparison = ({ isOpen, onClose, candidates = [] }) => {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const exportPDF = async () => {
    setIsExporting(true);
    const element = document.getElementById('comparison-view-pdf');
    try {
      const canvas = await html2canvas(element, { backgroundColor: '#1C1C1E', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('HireX_Candidate_Comparison.pdf');
    } catch (e) {
      console.error(e);
    }
    setIsExporting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-6xl max-h-[90vh] glass-panel rounded-3xl shadow-[0_0_50px_rgba(255,107,0,0.1)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="border-b border-glass-border p-6 flex justify-between items-center bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compare Candidates</h2>
              <p className="text-gray-500 text-sm">Sr. Frontend Engineer Role</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <OrangeButton
              variant="outline"
              onClick={exportPDF}
              disabled={isExporting}
              className="font-bold py-2 shadow-sm"
            >
              {isExporting ? 'Generating PDF...' : 'Export as PDF'}
            </OrangeButton>
            <button onClick={onClose} className="p-2 glass-panel rounded-full text-gray-500 hover:text-gray-900 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* COMPARISON BODY TO EXPORT */}
        <div id="comparison-view-pdf" className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F5F5F7]">

          {/* AI RECOMMENDATION BAR */}
          <GlassCard className="mb-8 p-6 border-[#FF6B00]/30 shadow-[0_8px_32px_rgba(255,107,0,0.1)] bg-gradient-to-r from-transparent via-[#FF6B00]/10 to-transparent">
            <div className="flex items-start">
              <Sparkles className="text-[#FF6B00] mt-1 mr-4 flex-shrink-0" size={24} />
              <div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Claude AI Verdict</h3>
                <p className="text-gray-500 leading-relaxed font-medium">
                  <strong className="text-gray-900">Alex Rivera</strong> is the stronger technical fit for the <span className="text-[#FF6B00]">Sr. Frontend</span> role due to a significantly higher system design score (90 vs 75) and deeper architectural experience. However, if the role requires deep protoyping, <strong className="text-gray-900">Emma Watson</strong> provides a superior UX background (98 vs 80).
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">

            {/* VS Divider Graphic */}
            <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center justify-center pointer-events-none z-10">
              <div className="w-12 h-12 rounded-full border-4 border-[#F5F5F7] bg-[#FF6B00] text-gray-900 flex items-center justify-center font-black text-sm shadow-[0_0_20px_#FF6B00]">
                VS
              </div>
              <div className="absolute top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#FF6B00]/40 to-transparent -z-10"></div>
            </div>

            {candidates.map((cand, idx) => (
              <div key={cand.id} className="space-y-6">

                {/* Identity Card */}
                <GlassCard className={`p-6 border-t-4 ${idx === 0 ? 'border-t-[#FF6B00]' : 'border-t-white/30'}`}>
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-gray-900 font-bold text-2xl shadow-lg
                         ${idx === 0 ? 'bg-gradient-to-br from-[#FF6B00] to-[#E55A00]' : 'bg-gradient-to-br from-gray-600 to-gray-800'}`}>
                      {cand.avatar}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{cand.name}</h3>
                      <p className={`font-semibold ${idx === 0 ? 'text-[#FF6B00]' : 'text-gray-900'}`}>{cand.role}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-semibold flex items-center"><Building size={14} className="mr-2" /> Company</span>
                      <span className="text-gray-900 font-medium">{cand.company}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-semibold flex items-center"><Briefcase size={14} className="mr-2" /> Experience</span>
                      <span className="text-gray-900 font-medium">{cand.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 font-semibold flex items-center"><MapPin size={14} className="mr-2" /> Location</span>
                      <span className="text-gray-900 font-medium">{cand.location}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-glass-border flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-500">AI MATCH SCORE</span>
                    <Badge className={`${idx === 0 ? 'bg-[#FF6B00] text-gray-900 shadow-[0_0_15px_rgba(255,107,0,0.5)]' : 'bg-white'} border-none px-3 py-1 font-black text-lg`}>
                      {cand.score}%
                    </Badge>
                  </div>
                </GlassCard>

                {/* Radar Chart */}
                <GlassCard className="p-6 h-72 flex flex-col pointer-events-none">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">Competency Radar</h3>
                  <div className="flex-1 -mx-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={cand.metrics || cand.aiInsights?.metrics || []}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="name" tick={{ fill: '#AEAEB2', fontSize: 11, fontWeight: 'bold' }} />
                        <Radar name={cand.name} dataKey="value" stroke={idx === 0 ? "#FF6B00" : "#ffffff"} fill={idx === 0 ? "#FF6B00" : "#ffffff"} fillOpacity={idx === 0 ? 0.3 : 0.15} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CandidateComparison;
