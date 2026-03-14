import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, ChevronRight, Download, X } from 'lucide-react';
import Modal from './Modal';
import OrangeButton from './OrangeButton';
import GlassCard from './GlassCard';

// Use the Vite proxy — this resolves to localhost:3001 in dev
const API_BASE = '/api/v1';

const ResumeUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFields, setParsedFields] = useState([]);
  const [candidateResult, setCandidateResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsParsing(true);
    setParsedFields([]);
    setCandidateResult(null);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const sessionId = Math.random().toString(36).substring(7);
      
      // Open SSE connection first
      const eventSource = new EventSource(`${API_BASE}/upload/resume-stream?sessionId=${sessionId}`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'connected') {
            // SSE connected, do nothing special yet
          } else if (data.type === 'field') {
            setParsedFields(prev => [...prev, data]);
            setProgress(prev => Math.min(prev + 15, 85));
          } else if (data.type === 'complete') {
            setProgress(100);
            setTimeout(() => {
              setCandidateResult(data.data);
              setIsParsing(false);
            }, 800);
            eventSource.close();
          } else if (data.type === 'error') {
            setError(data.message || 'Parsing failed');
            setIsParsing(false);
            eventSource.close();
          }
        } catch (e) {
          // Non-JSON event, ignore
        }
      };

      eventSource.onerror = (err) => {
        console.warn('SSE connection issue:', err);
        // Don't close — the POST call may still succeed
      };

      // Send the file with the same Session ID
      const response = await fetch(`${API_BASE}/upload/resume?sessionId=${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Upload failed: ${response.status}`);
      }

      // If SSE never fired a 'complete', fallback to HTTP response
      const httpData = await response.json();
      if (httpData.status === 'success' && httpData.data && !candidateResult) {
        setTimeout(() => {
          setCandidateResult(httpData.data);
          setIsParsing(false);
          eventSource.close();
        }, 500);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setIsParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    disabled: isParsing || !!candidateResult
  });

  const handleSave = () => {
    if (onUploadComplete && candidateResult) {
      onUploadComplete(candidateResult);
    }
    onClose();
    setTimeout(() => {
      setFile(null);
      setParsedFields([]);
      setCandidateResult(null);
      setIsParsing(false);
      setError(null);
      setProgress(0);
    }, 300);
  };

  const handleDiscard = () => {
    setCandidateResult(null);
    setFile(null);
    setParsedFields([]);
    setProgress(0);
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Candidate via AI Parse">
      <div className="flex flex-col h-[480px]">
        
        {/* ─── STATE 1: Upload Dropzone ─── */}
        {!isParsing && !candidateResult && (
          <div 
            {...getRootProps()} 
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer p-8 ${
              isDragActive ? 'border-[#FF6B00] bg-[#FF6B00]/5 scale-[1.01]' : 'border-glass-border hover:border-[#FF6B00]/40 hover:bg-gray-50/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-5 transition-all ${isDragActive ? 'bg-[#FF6B00]/10' : 'bg-[#F5F5F7]'}`}>
              <UploadCloud size={36} className={isDragActive ? 'text-[#FF6B00]' : 'text-gray-400'} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isDragActive ? 'Drop it!' : 'Drag & drop your resume'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
              Supported: <span className="font-semibold text-gray-700">PDF only</span> (Max 5MB)<br/>
              Our AI Neural Engine extracts all fields automatically.
            </p>
            <OrangeButton variant="outline" className="px-6">Browse Files</OrangeButton>
          </div>
        )}

        {/* ─── STATE 2: Live Parsing Terminal ─── */}
        {isParsing && (
          <div className="flex-1 flex flex-col bg-[#0D1117] rounded-2xl overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.6)]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#161B22]">
               <div className="flex items-center space-x-1.5">
                 <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
                 <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                 <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
               </div>
               <div className="flex items-center text-white/60 text-xs font-mono">
                 <FileText size={12} className="text-[#FF6B00] mr-2" />
                 <span className="truncate max-w-[200px]">{file?.name}</span>
               </div>
               <div className="text-[#FF6B00] text-xs font-mono font-bold animate-pulse flex items-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] mr-1.5 animate-pulse"></div>
                  parsing...
               </div>
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C42] transition-all duration-500 shadow-[0_0_10px_rgba(255,107,0,0.5)]"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Terminal output */}
            <div className="flex-1 overflow-y-auto font-mono text-sm p-5 space-y-3 custom-scrollbar-dark pb-8">
               <div className="text-gray-500 text-xs mb-4">$ talentos-ai --parse-resume "{file?.name}"</div>
               
               {parsedFields.map((field, i) => (
                 <div key={i} className="flex items-start group animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <span className="text-emerald-400 mr-3 mt-0.5 shrink-0">✓</span>
                    <div>
                      <span className="text-gray-500 text-xs">[{field.category || 'DATA'}]</span>
                      <span className="text-gray-300 ml-2">Extracted <span className="text-white font-semibold">{field.name}</span>:</span>
                      <span className="text-[#FF6B00] ml-2 font-bold">{field.value || '—'}</span>
                    </div>
                 </div>
               ))}
               
               {parsedFields.length === 0 && (
                 <div className="text-gray-500 animate-pulse text-xs">Initializing Neural Parse Engine...</div>
               )}
               
               <div className="flex items-center text-gray-600 animate-pulse mt-2">
                 <ChevronRight size={12} className="mr-1 text-[#FF6B00]" />
                 <span className="text-xs">Processing document nodes...</span>
               </div>
            </div>
            
            {/* Terminal gradient overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0D1117] to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* ─── STATE 3: Result Card ─── */}
        {!isParsing && candidateResult && (
          <div className="flex flex-col h-full animate-in zoom-in-95 fade-in duration-400">
            <GlassCard className="flex-1 p-6 flex flex-col relative overflow-hidden bg-gradient-to-b from-white to-[#F5F5F7]">
               {/* Decorative glow */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6B00] opacity-[0.06] rounded-full blur-2xl"></div>
               
               {/* Candidate Header */}
               <div className="flex items-start mb-6">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold text-2xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] border-2 border-white">
                      {candidateResult.avatar || candidateResult.name?.charAt(0) || 'U'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                       <CheckCircle2 size={12} className="text-white" />
                    </div>
                 </div>
                 <div className="ml-4 flex-1">
                   <h2 className="text-xl font-extrabold text-gray-900 leading-tight">{candidateResult.name}</h2>
                   <p className="text-[#FF6B00] font-semibold text-sm">{candidateResult.role || 'Unspecified Role'}</p>
                   {candidateResult.company && <p className="text-gray-500 text-sm mt-0.5">{candidateResult.company}</p>}
                 </div>
                 <div className="text-right">
                   <div className="text-2xl font-black text-[#FF6B00]">{candidateResult.score || 0}%</div>
                   <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">AI Match</div>
                 </div>
               </div>

               {/* Details Grid */}
               <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-bold text-gray-900">{candidateResult.experience || 'Not detected'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-900">{candidateResult.location || 'Not specified'}</p>
                  </div>
                  {candidateResult.email && (
                    <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm col-span-2">
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-bold text-gray-900">{candidateResult.email}</p>
                    </div>
                  )}
               </div>

               {/* Skills */}
               <div className="mb-auto">
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Extracted Skills</p>
                 <div className="flex flex-wrap gap-2">
                   {(candidateResult.skills || []).slice(0, 8).map((skill, i) => (
                     <span key={i} className="text-xs bg-[#F5F5F7] text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg font-medium">
                       {skill}
                     </span>
                   ))}
                   {(candidateResult.skills || []).length === 0 && (
                     <span className="text-xs text-gray-400 italic">No skills extracted.</span>
                   )}
                   {(candidateResult.skills || []).length > 8 && (
                     <span className="text-xs text-gray-400 border border-transparent px-1 py-1 font-bold">
                       +{(candidateResult.skills || []).length - 8} more
                     </span>
                   )}
                 </div>
               </div>

               {/* Action buttons */}
               <div className="mt-6 flex justify-between items-center border-t border-glass-border pt-4">
                 <button onClick={handleDiscard} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors flex items-center">
                   <X size={14} className="mr-1.5" /> Discard
                 </button>
                 <OrangeButton onClick={handleSave} className="shadow-[0_4px_12px_rgba(255,107,0,0.3)] px-6">
                   <CheckCircle2 size={16} className="mr-2" /> Add to Database
                 </OrangeButton>
               </div>
            </GlassCard>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center justify-between">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 ml-3">
              <X size={14} />
            </button>
          </div>
        )}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.3); border-radius: 4px; }
      `}} />
    </Modal>
  );
};

export default ResumeUploadModal;
