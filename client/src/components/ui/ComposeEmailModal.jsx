import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Wand2, Paperclip, ChevronDown } from 'lucide-react';
import GlassCard from './GlassCard';
import OrangeButton from './OrangeButton';
import api from '../../api';
import { useToast } from '../../context/ToastContext';

const ComposeEmailModal = ({ isOpen, onClose, candidate, initialType = 'outreach' }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [template, setTemplate] = useState('none');
  const [templates, setTemplates] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen && candidate) {
      loadTemplates();
      // Set default subject
      const defaultSub = initialType === 'offer' 
        ? `Offer Letter - ${candidate.name}`
        : `Opportunity at HireX - ${candidate.name}`;
      setSubject(defaultSub);
    }
  }, [isOpen, candidate, initialType]);

  const loadTemplates = async () => {
    try {
      const res = await api.get(`/candidates/${candidate.id}/email-templates`);
      setTemplates(res.data.data || []);
    } catch (err) {
      console.error('Failed to load templates', err);
      // Fallback local templates
      setTemplates([
        { id: 'outreach', name: 'Initial Outreach', subject: 'Exciting Opportunity', body: "Hi [Name],\n\nI came across your profile and was impressed by your experience in [Role]..." },
        { id: 'offer', name: 'Offer Letter', subject: 'Official Offer', body: "Dear [Name],\n\nWe are thrilled to offer you the position of [Role] at HireX..." }
      ]);
    }
  };

  const handleTemplateSelect = (e) => {
    const tId = e.target.value;
    setTemplate(tId);
    const selected = templates.find(t => t.id === tId);
    if (selected) {
      setSubject(selected.subject.replace('[Name]', candidate.name));
      setMessage(selected.body.replace('[Name]', candidate.name).replace('[Role]', candidate.role || candidate.current_role || 'Position'));
    }
  };

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      const res = await api.post(`/candidates/${candidate.id}/email-suggest`, { type: initialType });
      if (res.data.data?.body) {
        setMessage(res.data.data.body);
        if (res.data.data.subject) setSubject(res.data.data.subject);
      }
    } catch (err) {
      addToast('AI suggestion failed. Try manual templates.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    setIsSending(true);
    try {
      await api.post(`/candidates/${candidate.id}/send-email`, {
        subject,
        body: message,
        to: candidate.email
      });
      addToast(`Email sent to ${candidate.name}!`, 'success');
      onClose();
    } catch (err) {
      addToast('Failed to send email. Check SMTP settings.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !candidate) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <GlassCard className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-glass-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00]">
              <Send size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Compose Email</h2>
              <p className="text-xs text-gray-500 font-medium tracking-tight">To: {candidate.name} ({candidate.email || 'No email'})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Subject</label>
              <input 
                type="text" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-[#F5F5F7] border border-glass-border rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-[#FF6B00]/50"
                placeholder="Email Subject"
              />
            </div>
            <div className="w-full sm:w-48">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">Template</label>
              <div className="relative">
                <select 
                  value={template}
                  onChange={handleTemplateSelect}
                  className="w-full bg-[#F5F5F7] border border-glass-border rounded-xl px-4 py-2.5 text-xs font-bold appearance-none focus:outline-none cursor-pointer"
                >
                  <option value="none">Choose Template...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Message</label>
              <button 
                onClick={handleAiSuggest}
                disabled={isGenerating}
                className="text-[10px] font-extrabold text-[#FF6B00] flex items-center bg-[#FF6B00]/5 px-2 py-1 rounded-lg border border-[#FF6B00]/20 hover:bg-[#FF6B00]/10 transition-colors uppercase tracking-widest"
              >
                {isGenerating ? <Sparkles size={10} className="mr-1 animate-spin" /> : <Wand2 size={10} className="mr-1" />}
                AI Rewrite
              </button>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={10}
              placeholder="Start typing your message..."
              className="w-full bg-[#F5F5F7] border border-glass-border rounded-2xl px-4 py-4 text-sm font-medium focus:outline-none focus:border-[#FF6B00]/50 resize-none custom-scrollbar"
            />
          </div>
        </div>

        <div className="p-6 bg-[#F5F5F7]/50 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
             <button className="p-2 text-gray-400 hover:text-gray-900 transition-colors rounded-lg">
                <Paperclip size={18} />
             </button>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No attachments</span>
          </div>
          <div className="flex items-center space-x-3 w-full sm:w-auto">
             <button 
                onClick={onClose}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
             >
                Discard
             </button>
             <OrangeButton 
                onClick={handleSend}
                disabled={isSending || !message.trim()}
                className="flex-1 sm:flex-none px-8 py-2.5 shadow-[0_4px_16px_rgba(255,107,0,0.3)]"
             >
                {isSending ? 'Sending...' : 'Send Message'}
             </OrangeButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default ComposeEmailModal;
