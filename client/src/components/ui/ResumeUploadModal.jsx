import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileText, CheckCircle2, ChevronRight, Download, Camera } from 'lucide-react';
import Modal from './Modal';
import OrangeButton from './OrangeButton';
import GlassCard from './GlassCard';

const ResumeUploadModal = ({ isOpen, onClose, onUploadComplete }) => {
  const [file, setFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFields, setParsedFields] = useState([]);
  const [candidateResult, setCandidateResult] = useState(null);
  const [error, setError] = useState(null);

  // Parse events simulated for SSE
  const handleUpload = async (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsParsing(true);
    setParsedFields([]);
    setCandidateResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      // 1. We start the upload request (which returns the SSE session ID or triggers the parse on backend)
      // Since native SSE with fetch/FormData is complex, we will hit the stream endpoint, 
      // passing a query param so the server knows which connection to push to.
      
      const sessionId = Math.random().toString(36).substring(7);
      
      // Open SSE connection first
      const eventSource = new EventSource(`http://localhost:5000/api/upload/resume-stream?sessionId=${sessionId}`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'field') {
          setParsedFields(prev => [...prev, data]);
        } else if (data.type === 'complete') {
          setCandidateResult(data.data);
          eventSource.close();
          // Keep the parsing UI visible for 1.5s after completion before showing result card
          setTimeout(() => setIsParsing(false), 1500); 
        } else if (data.type === 'error') {
          setError(data.message);
          setIsParsing(false);
          eventSource.close();
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE Error:", err);
        eventSource.close();
      };

      // Now actually send the file with the same Session ID
      const response = await fetch(`http://localhost:5000/api/upload/resume?sessionId=${sessionId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

    } catch (err) {
      console.error(err);
      setError(err.message);
      setIsParsing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleUpload,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: isParsing || candidateResult
  });

  const handleSave = () => {
    if (onUploadComplete && candidateResult) {
      onUploadComplete(candidateResult);
    }
    onClose();
    // Reset state after close animation
    setTimeout(() => {
      setFile(null);
      setParsedFields([]);
      setCandidateResult(null);
      setIsParsing(false);
    }, 300);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Candidate via AI Parse">
      <div className="flex flex-col h-[480px]">
        {/* State 1: Upload Dropzone */}
        {!isParsing && !candidateResult && (
          <div 
            {...getRootProps()} 
            className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-colors cursor-pointer p-8 ${
              isDragActive ? 'border-[#FF6B00] bg-[#FF6B00]/5' : 'border-glass-border hover:border-[#FF6B00]/40 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="w-16 h-16 rounded-full bg-[#F5F5F7] text-gray-400 flex items-center justify-center mb-4 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {isDragActive ? 'Drop PDF here' : 'Drag & drop resume'}
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Supported formats: PDF only (Max 5MB)<br/>
              Our custom Neural Engine will extract all fields automatically.
            </p>
            <OrangeButton variant="outline">Browse Files</OrangeButton>
          </div>
        )}

        {/* State 2: Live Parsing Terminal */}
        {isParsing && (
          <div className="flex-1 flex flex-col bg-[#0F172A] rounded-2xl p-6 overflow-hidden relative shadow-[inset_0_0_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
               <div className="flex items-center text-white">
                 <FileText size={18} className="text-[#FF6B00] mr-3" />
                 <span className="font-semibold text-sm truncate max-w-[200px]">{file?.name}</span>
               </div>
               <div className="text-[#FF6B00] text-xs font-mono font-bold animate-pulse flex items-center">
                  <div className="w-2 h-2 rounded-full bg-[#FF6B00] mr-2"></div> Extracting Nodes...
               </div>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-sm space-y-4 custom-scrollbar pr-2 pb-8">
               {parsedFields.map((field, i) => (
                 <div key={i} className="flex items-start animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <span className="text-emerald-400 mr-3 mt-0.5">✓</span>
                    <div>
                      <span className="text-gray-400">[{field.category || 'DATA'}]</span>
                      <span className="text-white ml-2">Extracted {field.name}:</span>
                      <span className="text-[#FF6B00] ml-2 font-bold">{field.value}</span>
                    </div>
                 </div>
               ))}
               <div className="flex items-center text-gray-500 animate-pulse mt-4">
                 <ChevronRight size={14} className="mr-2" />
                 Processing next chunk...
               </div>
            </div>
            
            {/* Terminal Gradient Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#0F172A] to-transparent pointer-events-none"></div>
          </div>
        )}

        {/* State 3: Result Card */}
        {!isParsing && candidateResult && (
          <div className="flex flex-col h-full animate-in zoom-in-95 fade-in duration-500">
            <GlassCard className="flex-1 p-6 flex flex-col relative overflow-hidden bg-gradient-to-b from-white to-[#F5F5F7]">
               {/* Decorative background blurs */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FF6B00] opacity-[0.05] rounded-full blur-2xl"></div>
               
               <div className="flex items-start mb-6">
                 <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#E55A00] flex items-center justify-center text-gray-900 font-bold text-xl shadow-[0_4px_16px_rgba(255,107,0,0.3)] border-2 border-white">
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
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm font-bold text-gray-900">{candidateResult.experience || 'Not detected'}</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-glass-border shadow-sm">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-900">{candidateResult.location || 'Not specified'}</p>
                  </div>
               </div>

               <div className="mb-auto">
                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Extracted Skills</p>
                 <div className="flex flex-wrap gap-2">
                   {(candidateResult.skills || []).slice(0, 6).map((skill, i) => (
                     <span key={i} className="text-xs bg-[#F5F5F7] text-gray-600 border border-gray-200 px-2 py-1 rounded-md font-medium">
                       {skill}
                     </span>
                   ))}
                   {(candidateResult.skills || []).length > 6 && (
                     <span className="text-xs bg-transparent text-gray-400 border border-transparent px-1 py-1 font-bold">
                       +{(candidateResult.skills || []).length - 6} more
                     </span>
                   )}
                 </div>
               </div>

               <div className="mt-8 flex justify-end space-x-3 border-t border-glass-border pt-4">
                 <button onClick={() => {setCandidateResult(null); setFile(null);}} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                   Discard
                 </button>
                 <OrangeButton onClick={handleSave} className="shadow-[0_4px_12px_rgba(255,107,0,0.3)]">
                   Add to Database
                 </OrangeButton>
               </div>
            </GlassCard>
          </div>
        )}

        {/* Global Error State */}
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center">
            <CheckCircle2 className="mr-2" size={16}/> {error}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ResumeUploadModal;
