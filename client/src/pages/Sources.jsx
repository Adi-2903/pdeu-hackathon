<<<<<<< HEAD
import React, { useState, useRef } from 'react';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
=======
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import Badge from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
>>>>>>> origin/god
import api from '../api';
import {
  Mail, Upload, Linkedin, Database, Users, Settings,
  CheckCircle2, RefreshCw, AlertCircle, Link, FileText, Download, Loader2
} from 'lucide-react';

<<<<<<< HEAD
=======
// Configure pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).href;

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
>>>>>>> origin/god

const LOADING_MESSAGES = [
  'Reading file...',
  'Scanning resume...',
  'Extracting candidate info...',
  'Analyzing skills & experience...',
  'Adding to candidates...',
];

const Sources = () => {
  const { addToast } = useToast();
  const [isGmailConnected, setGmailConnected] = useState(true);
  const [isOutlookConnected, setOutlookConnected] = useState(false);

  // Resume upload state
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle | loading | success | error
  const [uploadError, setUploadError] = useState('');
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const loadingIntervalRef = useRef(null);

  const fileInputRef = useRef(null);

  // LinkedIn / AI generation state
  const [linkedinDomain, setLinkedinDomain] = useState('');
  const [linkedinCount, setLinkedinCount] = useState(50);
  const [linkedinStatus, setLinkedinStatus] = useState('idle');
  const [linkedinResult, setLinkedinResult] = useState(null);
  const [linkedinError, setLinkedinError] = useState('');
  const [uploadedName, setUploadedName] = useState('');
  
  // Toggle states
  const [gmailAutoParse, setGmailAutoParse] = useState(true);
  const [outlookAutoParse, setOutlookAutoParse] = useState(false);

  // Rotate loading messages
  useEffect(() => {
    if (uploadStatus === 'loading') {
      setLoadingMsgIndex(0);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    };
  }, [uploadStatus]);

  /** Extract text from a PDF file using pdfjs-dist */
  const extractTextFromPDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  };

  /** Parse experience string to get numeric years */
  const parseYearsFromExp = (exp) => {
    if (!exp) return 0;
    const match = exp.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  /** Main upload handler */
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      setUploadStatus('error');
      setUploadError('Only PDF files are supported. Please upload a .pdf file.');
      return;
    }

    setUploadStatus('loading');
    setUploadError('');

    try {
      // Step 1: Extract text from PDF
      const resumeText = await extractTextFromPDF(file);

      if (!resumeText || resumeText.length < 20) {
        throw new Error('Could not extract text from this PDF. It may be a scanned image — please try a text-based PDF.');
      }

      // Step 2: Send to backend for Groq AI parsing
      const parseRes = await api.post('/candidates/parse-resume', { resumeText });
      const parsed = parseRes.data.data;

      if (!parsed || !parsed.name) {
        throw new Error('AI could not extract candidate information. Please try a different resume.');
      }

      // Step 3: Create candidate in the database
      await api.post('/candidates', {
        full_name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        location: parsed.location,
        current_role: parsed.currentRole,
        current_company: '',
        years_of_experience: parseYearsFromExp(parsed.experience),
        summary: parsed.summary,
        source: 'Upload',
        linkedin_url: parsed.linkedIn,
        skills: parsed.skills.map(s => ({ skill_name: s, category: 'Other', proficiency: 3 })),
        education: parsed.education ? [{ degree: parsed.education, institution: '', end_year: '' }] : [],
      });

      setUploadStatus('success');
      addToast('✅ Candidate added successfully', 'success', 4000);

      // Reset after 3s
      setTimeout(() => setUploadStatus('idle'), 3000);

    } catch (err) {
      console.error('Resume upload error:', err);
      setUploadStatus('error');
      setUploadError(err.response?.data?.error?.message || err.message || 'Failed to parse resume. Please try again.');
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleLinkedinGenerate = async () => {
    setLinkedinStatus('generating');
    setLinkedinError('');
    setLinkedinResult(null);
    try {
      const res = await api.post('/linkedin/generate', {
        count: linkedinCount,
        domain: linkedinDomain || undefined,
      }, { timeout: 300000 });
<<<<<<< HEAD
=======

>>>>>>> origin/god
      setLinkedinStatus('done');
      setLinkedinResult(res.data);
    } catch (err) {
      setLinkedinStatus('error');
      setLinkedinError(err.response?.data?.message || err.message || 'Failed to generate candidates');
    }
  };

<<<<<<< HEAD
  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploadProgress(10);
    setUploadedName(file.name);
    const formData = new FormData();
    formData.append('resume', file);
    try {
      setUploadProgress(40);
      await api.post('/upload/resume', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 2500);
    } catch (err) {
      console.error('Upload failed', err);
      setUploadProgress(0);
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDropZoneClick = () => fileInputRef.current?.click();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

=======
>>>>>>> origin/god
  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">

      {/* ━━━ HEADER ━━━ */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Data Sources & Integrations</h1>
        <p className="text-gray-500 font-medium mt-1">Configure and monitor all candidate data ingestion points.</p>
      </div>

      {/* ━━━ SOURCES GRID (2x3) ━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">

        {/* 1. GMAIL INTEGRATION */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-red-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gmail Integration</h2>
                  <div className="flex items-center text-sm font-medium mt-1">
                    {isGmailConnected ? (
                      <span className="text-green-500 flex items-center"><CheckCircle2 size={14} className="mr-1" /> Connected</span>
                    ) : (
                      <span className="text-gray-400 flex items-center"><AlertCircle size={14} className="mr-1" /> Disconnected</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <Settings size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm border-b border-glass-border pb-2">
                <span className="text-gray-500">Last sync</span>
                <span className="text-gray-900 font-medium flex items-center"><RefreshCw size={12} className="mr-1.5 text-[#FF6B00]" /> 2 minutes ago</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-glass-border pb-2">
                <span className="text-gray-500">Candidates ingested</span>
                <span className="text-gray-900 font-bold">284</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Auto-parse resumes</span>
                <div 
                   onClick={() => setGmailAutoParse(!gmailAutoParse)}
                   className={`w-10 h-5 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(255,107,0,0.4)] transition-all ${gmailAutoParse ? 'bg-[#FF6B00]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${gmailAutoParse ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <OrangeButton
            variant={isGmailConnected ? 'outline' : 'primary'}
            className="w-full font-bold shadow-[0_4px_16px_rgba(255,107,0,0.1)] py-3"
            onClick={() => setGmailConnected(!isGmailConnected)}
          >
            {isGmailConnected ? 'Disconnect Gmail' : 'Connect Gmail'}
          </OrangeButton>
        </GlassCard>

        {/* 2. OUTLOOK INTEGRATION */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-500">
                  <Mail size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Outlook Integration</h2>
                  <div className="flex items-center text-sm font-medium mt-1">
                    {isOutlookConnected ? (
                      <span className="text-green-500 flex items-center"><CheckCircle2 size={14} className="mr-1" /> Connected</span>
                    ) : (
                      <span className="text-gray-400 flex items-center"><AlertCircle size={14} className="mr-1" /> Disconnected</span>
                    )}
                  </div>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-900 transition-colors p-2">
                <Settings size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm border-b border-glass-border pb-2">
                <span className="text-gray-500">Last sync</span>
                <span className="text-gray-400 font-medium">—</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-glass-border pb-2">
                <span className="text-gray-500">Candidates ingested</span>
                <span className="text-gray-400 font-bold">0</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Auto-parse resumes</span>
                <div 
                   onClick={() => setOutlookAutoParse(!outlookAutoParse)}
                   className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${outlookAutoParse ? 'bg-[#FF6B00]' : 'bg-[#F5F5F7] border border-glass-border'}`}>
                  <div className={`w-4 h-4 rounded-full absolute top-0.5 transition-all ${outlookAutoParse ? 'bg-white right-0.5' : 'bg-[#636366] left-0.5'}`}></div>
                </div>
              </div>
            </div>
          </div>

          <OrangeButton
            variant={isOutlookConnected ? 'outline' : 'primary'}
            className="w-full font-bold shadow-none py-3"
            onClick={() => setOutlookConnected(!isOutlookConnected)}
          >
            {isOutlookConnected ? 'Disconnect Outlook' : 'Connect Outlook'}
          </OrangeButton>
        </GlassCard>

        {/* 3. HRMS (WORKDAY/GREENHOUSE) */}
        <GlassCard className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500">
                <Database size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">HRMS Sync</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Workday, Greenhouse, Lever</p>
              </div>
            </div>
            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/30 font-bold px-2 py-0.5 shadow-[inset_0_0_8px_rgba(255,107,0,0.1)]">
              Active
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">HRMS Platform</label>
              <select className="w-full bg-[#F5F5F7] border border-glass-border rounded-xl px-4 py-3 text-gray-900 appearance-none focus:outline-none focus:border-[#FF6B00]/50 transition-colors cursor-pointer text-sm font-medium">
                <option>Greenhouse</option>
                <option>Workday</option>
                <option>Lever</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">API Key</label>
              <input type="password" value="************************" readOnly className="w-full bg-gray-50 border border-glass-border rounded-xl px-4 py-3 text-gray-500 text-sm font-mono tracking-widest focus:outline-none" />
            </div>
            <div className="pt-2">
              <button 
                onClick={() => alert('Field Mapping configuration interface opened.')}
                className="text-sm text-[#FF6B00] font-bold hover:text-gray-900 transition-colors flex items-center mb-6">
                Configure Field Mapping <Link size={14} className="ml-1" />
              </button>
            </div>
          </div>

          <div className="border-t border-glass-border pt-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Last Sync Activity</h3>
             <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-gray-700">Candidates Sync</span>
                   </div>
                   <span className="text-gray-400">2h ago</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="font-bold text-gray-700">Job Templates</span>
                   </div>
                   <span className="text-gray-400">5h ago</span>
                </div>
             </div>
          </div>
        </GlassCard>

        {/* 4. LINKEDIN AI EXTRACTION */}
        <GlassCard className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-blue-600/10 rounded-xl border border-blue-600/20 text-blue-500">
              <Linkedin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">LinkedIn Extraction</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">
                {linkedinStatus === 'idle' ? 'Gemini AI + FAISS Powered' :
                  linkedinStatus === 'generating' ? 'Generating candidates...' :
                    linkedinStatus === 'embedding' ? 'Building search index...' :
                      linkedinStatus === 'done' ? `✓ ${linkedinResult?.generated || 0} candidates indexed` :
                        'Error occurred'}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Industry / Domain (optional)</label>
              <input
                type="text"
                value={linkedinDomain}
                onChange={e => setLinkedinDomain(e.target.value)}
                placeholder="e.g. fintech, healthcare, AI/ML, cybersecurity..."
                className="w-full bg-[#F5F5F7] border border-glass-border rounded-xl px-4 py-3 text-gray-900 placeholder-[#636366] text-sm focus:outline-none focus:border-[#FF6B00]/50"
                disabled={linkedinStatus === 'generating' || linkedinStatus === 'embedding'}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Number of Candidates</label>
              <div className="flex space-x-2">
                {[25, 50, 100, 200].map(n => (
                  <button
                    key={n}
                    onClick={() => setLinkedinCount(n)}
                    disabled={linkedinStatus === 'generating' || linkedinStatus === 'embedding'}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${linkedinCount === n
                      ? 'bg-[#FF6B00] text-white shadow-[0_4px_12px_rgba(255,107,0,0.3)]'
                      : 'bg-[#F5F5F7] text-gray-600 hover:bg-gray-200 border border-glass-border'
                      }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {linkedinStatus === 'generating' || linkedinStatus === 'embedding' ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RefreshCw size={16} className="text-[#FF6B00] animate-spin" />
                <span className="text-sm font-bold text-gray-900">
                  {linkedinStatus === 'generating' ? 'Gemini is generating candidate profiles...' : 'Building FAISS search index...'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-[#F5F5F7] rounded-full overflow-hidden">
                <div className="h-full bg-[#FF6B00] rounded-full shadow-[0_0_10px_#FF6B00] animate-pulse" style={{ width: linkedinStatus === 'generating' ? '60%' : '90%' }}></div>
              </div>
            </div>
          ) : linkedinStatus === 'done' && linkedinResult ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-green-600">{linkedinResult.generated}</p>
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">Generated</p>
                </div>
                <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-xl p-3 text-center">
                  <p className="text-xl font-black text-[#FF6B00]">{linkedinResult.total_vectors}</p>
                  <p className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest mt-1">Indexed</p>
                </div>
              </div>
              <OrangeButton
                className="w-full font-bold py-3"
                onClick={handleLinkedinGenerate}
              >
                Generate More
              </OrangeButton>
            </div>
          ) : (
            <OrangeButton
              className="w-full font-bold shadow-[0_4px_16px_rgba(255,107,0,0.3)] py-3"
              onClick={handleLinkedinGenerate}
            >
              🚀 Generate {linkedinCount} Candidates
            </OrangeButton>
          )}

          {linkedinError && (
            <p className="text-xs text-red-500 mt-2 font-medium">{linkedinError}</p>
          )}

          <div className="mt-8 pt-6 border-t border-glass-border">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Recent Extractions</h3>
             <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-transparent hover:border-[#FF6B00]/20 transition-all">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-black text-[10px]">JD</div>
                      <div>
                         <p className="text-xs font-bold text-gray-900">Java Developer</p>
                         <p className="text-[10px] text-gray-500">25 profiles • 1d ago</p>
                      </div>
                   </div>
                   <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
                <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-transparent hover:border-[#FF6B00]/20 transition-all">
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-black text-[10px]">UX</div>
                      <div>
                         <p className="text-xs font-bold text-gray-900">UX Design Lead</p>
                         <p className="text-[10px] text-gray-500">12 profiles • 3d ago</p>
                      </div>
                   </div>
                   <CheckCircle2 size={16} className="text-emerald-500" />
                </div>
             </div>
          </div>
        </GlassCard>

        {/* 5. RESUME UPLOAD (DRAG & DROP) */}
        <GlassCard className="p-6 flex flex-col h-full bg-gradient-to-br from-[#FF6B00]/5 to-transparent relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B00]/10 blur-[50px] pointer-events-none rounded-full"></div>

          <div className="flex items-center space-x-4 mb-6 relative z-10">
            <div className="p-3 bg-[#FF6B00]/20 rounded-xl border border-[#FF6B00]/30 text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.2)]">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Direct Resume Upload</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Auto-parsed by Groq AI</p>
            </div>
          </div>

<<<<<<< HEAD
          <div
            className="flex-1 min-h-[160px] border-2 border-dashed border-[#FF6B00]/40 rounded-xl flex flex-col items-center justify-center p-6 bg-[#F5F5F7]/30 hover:bg-[#FF6B00]/5 hover:border-[#FF6B00] transition-all cursor-pointer group relative z-10"
            onClick={handleDropZoneClick}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.zip" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0])} />
            <Upload size={32} className="text-[#FF6B00] mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
            <p className="text-gray-900 font-bold mb-1">Drag & drop files here</p>
            <p className="text-xs text-gray-500 font-medium">Supports PDF, DOCX, bulk ZIP</p>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <p className="text-xs text-[#FF6B00] font-semibold mt-2">Uploading {uploadedName}...</p>
            )}
=======
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileInputChange}
          />
>>>>>>> origin/god

          <div
            className={`flex-1 min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all relative z-10
              ${uploadStatus === 'error' ? 'border-red-400 bg-red-50/50' :
                uploadStatus === 'success' ? 'border-green-400 bg-green-50/50' :
                isDragOver ? 'border-[#FF6B00] bg-[#FF6B00]/10 scale-[1.02]' :
                'border-[#FF6B00]/40 bg-[#F5F5F7]/30 hover:bg-[#FF6B00]/5 hover:border-[#FF6B00] cursor-pointer group'
              }`}
            onClick={() => uploadStatus === 'idle' && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* IDLE STATE */}
            {uploadStatus === 'idle' && (
              <>
                <Upload size={32} className="text-[#FF6B00] mb-3 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(255,107,0,0.5)]" />
                <p className="text-gray-900 font-bold mb-1">Drag & drop files here</p>
                <p className="text-xs text-gray-500 font-medium">Supports PDF files</p>
              </>
            )}

            {/* LOADING STATE */}
            {uploadStatus === 'loading' && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-12 h-12 border-3 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin"></div>
                  <Loader2 size={20} className="text-[#FF6B00] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <p className="text-gray-900 font-bold text-sm mb-1">{LOADING_MESSAGES[loadingMsgIndex]}</p>
                <div className="h-1.5 w-48 bg-white rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-[#FF6B00] rounded-full shadow-[0_0_10px_#FF6B00] animate-pulse" style={{ width: `${Math.min(20 + loadingMsgIndex * 20, 95)}%`, transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>
            )}

            {/* SUCCESS STATE */}
            {uploadStatus === 'success' && (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={36} className="text-green-500 mb-3" />
                <p className="text-green-600 font-bold text-sm">Candidate added successfully!</p>
                <p className="text-xs text-gray-400 mt-1">Visible on the Candidates page</p>
              </div>
            )}

            {/* ERROR STATE */}
            {uploadStatus === 'error' && (
              <div className="flex flex-col items-center text-center px-4">
                <AlertCircle size={36} className="text-red-500 mb-3" />
                <p className="text-red-600 font-bold text-sm mb-1">Upload Failed</p>
                <p className="text-xs text-red-500/80 mb-3 max-w-xs">{uploadError}</p>
                <button
                  onClick={(e) => { e.stopPropagation(); setUploadStatus('idle'); setUploadError(''); }}
                  className="text-xs text-[#FF6B00] font-bold hover:underline"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* 6. EMPLOYEE REFERRALS */}
        <GlassCard className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
                <Users size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Employee Referrals</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">Track internal submissions</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Referral Link Generator</label>
                <div className="flex bg-[#F5F5F7] border border-glass-border rounded-xl overflow-hidden p-1">
                  <span className="text-gray-400 text-xs font-mono py-2 pl-3 flex-1 flex items-center">talentos.app/ref/generate...</span>
                  <button
                    onClick={() => {
                      const link = 'https://talentos.app/ref/your-company';
                      navigator.clipboard.writeText(link).then(() => alert('Referral link copied to clipboard!')).catch(() => alert('Copy failed. Link: ' + link));
                    }}
                    className="bg-white hover:bg-white/10 text-gray-900 text-xs font-bold px-4 rounded-lg transition-colors border border-glass-border text-center"
                  >Copy</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F5F5F7] border border-glass-border rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-gray-900">142</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Submitted</p>
                </div>
                <div className="bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-black text-[#FF6B00]">28</p>
                  <p className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-widest mt-1 shadow-[0_0_8px_rgba(255,107,0,0.1)]">Hired</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-glass-border rounded-xl overflow-hidden">
            <div className="bg-[#F5F5F7] px-4 py-2 text-xs font-bold text-gray-500 flex items-center justify-between border-b border-glass-border">
              <span>Top Referrer Leaderboard</span>
            </div>
            <div className="px-4 py-2 bg-white/50 flex items-center justify-between text-sm">
              <span className="font-bold text-gray-900 flex items-center"><span className="text-[#FF6B00] mr-2">1.</span> David Kim</span>
              <span className="text-gray-500 font-semibold">12 hired</span>
            </div>
            <div className="px-4 py-2 flex items-center justify-between text-sm">
              <span className="font-bold text-gray-900 flex items-center"><span className="text-gray-500 mr-2">2.</span> Sarah Jenkins</span>
              <span className="text-gray-500 font-semibold">8 hired</span>
            </div>
          </div>
        </GlassCard>

      </div>

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

export default Sources;
