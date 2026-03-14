import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import OrangeButton from '../components/ui/OrangeButton';
import { 
  Cpu, Webhook, Users, Bell, Palette, Shield, Download, Trash2, Key, ChevronRight 
} from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('ai');
  const [sensitivity, setSensitivity] = useState(85);

  const TABS = [
    { id: 'ai', icon: <Cpu size={18}/>, label: 'AI Configuration' },
    { id: 'integrations', icon: <Webhook size={18}/>, label: 'Integrations' },
    { id: 'team', icon: <Users size={18}/>, label: 'Team Members' },
    { id: 'notifications', icon: <Bell size={18}/>, label: 'Notifications' },
    { id: 'branding', icon: <Palette size={18}/>, label: 'Branding' },
    { id: 'privacy', icon: <Shield size={18}/>, label: 'Data & Privacy' }
  ];

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto custom-scrollbar">
      
      {/* ━━━ HEADER ━━━ */}
      <div className="mb-8 border-b border-glass-border pb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-gray-500 font-medium mt-1">Configure TalentOS workspace parameters.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        
        {/* SETTINGS SIDEBAR MENU */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                activeTab === tab.id 
                  ? 'bg-[#FF6B00]/20 text-[#FF6B00] shadow-[inset_0_0_10px_rgba(255,107,0,0.1)] border border-[#FF6B00]/30' 
                  : 'text-gray-500 hover:bg-white hover:text-gray-900 border border-transparent'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">{tab.icon}</span> {tab.label}
              </div>
              {activeTab === tab.id && <ChevronRight size={16} />}
            </button>
          ))}
        </div>

        {/* SETTINGS CONTENT AREA */}
        <div className="flex-1 max-w-3xl">
          
          {/* AI CONFIGURATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">AI Configuration</h2>
              
              <GlassCard className="p-6">
                 <h3 className="text-sm font-bold text-[#FF6B00] tracking-wider uppercase mb-4 flex items-center">
                   <Key size={16} className="mr-2"/> Anthropic API Connection
                 </h3>
                 <p className="text-gray-500 text-sm mb-4">
                   TalentOS requires a Claude API key to power semantic search and automated resume parsing.
                 </p>
                 <div className="flex space-x-3 mb-2">
                   <input type="password" value="sk-ant-api03-***************************************" readOnly className="flex-1 bg-[#F5F5F7] border border-glass-border rounded-xl px-4 py-3 text-gray-500 font-mono focus:outline-none" />
                   <OrangeButton className="font-bold">Update Key</OrangeButton>
                 </div>
                 <p className="text-xs text-gray-400">Using model: claude-3-sonnet-20240229</p>
              </GlassCard>

              <GlassCard className="p-6">
                 <h3 className="text-sm font-bold text-gray-900 mb-2">Semantic Match Sensitivity</h3>
                 <p className="text-gray-500 text-sm mb-6">Adjust how strictly the AI requires exact skill matches versus conceptual overlap.</p>
                 
                 <div className="mb-4">
                   <div className="flex justify-between text-sm font-bold text-gray-900 mb-3">
                      <span>Broad Conceptual</span>
                      <span className="text-[#FF6B00]">{sensitivity}% Strictness</span>
                   </div>
                   <input 
                     type="range" min="0" max="100" 
                     value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}
                     className="w-full h-2 bg-[#F5F5F7] rounded-lg appearance-none cursor-pointer accent-[#FF6B00]" 
                   />
                 </div>
                 <div className="flex justify-between text-xs text-gray-400">
                    <span>Focuses on potential & capability</span>
                    <span>Requires exact keyword combinations</span>
                 </div>
              </GlassCard>
            </div>
          )}

          {/* INTEGRATIONS */}
          {activeTab === 'integrations' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Connected Sources</h2>
              <GlassCard className="p-6">
                 <div className="grid grid-cols-1 gap-4">
                   {['Gmail', 'LinkedIn', 'Greenhouse'].map(Integration => (
                     <div key={Integration} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-glass-border">
                       <div>
                         <h4 className="text-gray-900 font-bold">{Integration}</h4>
                         <p className="text-gray-500 text-xs mt-1">Status: <span className="text-green-500">Connected</span></p>
                       </div>
                       <OrangeButton variant="outline" className="text-xs py-1.5 border-[#636366] text-gray-500 hover:text-gray-900 hover:border-[#FF6B00]">Configure</OrangeButton>
                     </div>
                   ))}
                 </div>
                 <div className="mt-4 pt-4 border-t border-glass-border">
                   <OrangeButton variant="ghost" className="w-full py-2 border border-dashed border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10">
                     + Add New Integration
                   </OrangeButton>
                 </div>
              </GlassCard>
            </div>
          )}

          {/* TEAM MEMBERS */}
          {activeTab === 'team' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex justify-between items-center mb-6">
                 <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                 <OrangeButton className="text-sm py-2">Invite Member</OrangeButton>
               </div>
               <GlassCard noPadding className="overflow-hidden">
                 <table className="w-full text-left">
                   <thead className="bg-white/80 border-b border-glass-border">
                     <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                       <th className="px-6 py-4">User</th>
                       <th className="px-6 py-4">Role</th>
                       <th className="px-6 py-4">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-glass-border/40 text-sm">
                     <tr className="hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 text-gray-900 font-bold">Sarah Admin <p className="text-gray-500 text-xs font-normal">sarah@talentos.ai</p></td>
                       <td className="px-6 py-4"><Badge className="bg-[#FF6B00]/20 text-[#FF6B00] border-none">Workspace Owner</Badge></td>
                       <td className="px-6 py-4 text-gray-400">—</td>
                     </tr>
                     <tr className="hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 text-gray-900 font-bold">David Recruiter <p className="text-gray-500 text-xs font-normal">david@talentos.ai</p></td>
                       <td className="px-6 py-4 text-gray-500">Recruiter</td>
                       <td className="px-6 py-4 text-[#FF6B00] hover:text-gray-900 cursor-pointer font-medium">Edit</td>
                     </tr>
                   </tbody>
                 </table>
               </GlassCard>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h2>
               <GlassCard className="p-6 space-y-6">
                 {[
                   { title: 'New Candidate Applications', desc: 'Alert when a new resume is parsed.' },
                   { title: 'High AI Matches (90%+)', desc: 'Notify immediately when a top-tier candidate applies.' },
                   { title: 'Pipeline Stagnation', desc: 'Alert if candidate hasn\'t moved in 5 days.' },
                   { title: 'Daily Digest', desc: 'Morning summary of all hiring activity.' }
                 ].map((Pref, i) => (
                   <div key={i} className="flex justify-between items-center">
                     <div>
                       <h4 className="text-gray-900 font-bold text-sm">{Pref.title}</h4>
                       <p className="text-gray-500 text-xs mt-1">{Pref.desc}</p>
                     </div>
                     <div className="w-10 h-5 bg-[#F5F5F7] border border-glass-border rounded-full relative cursor-pointer" onClick={(e) => {
                       const el = e.currentTarget;
                       if (el.classList.contains('bg-[#FF6B00]')) {
                         el.classList.remove('bg-[#FF6B00]', 'border-[#FF6B00]', 'shadow-[0_0_8px_rgba(255,107,0,0.4)]');
                         el.classList.add('bg-[#F5F5F7]', 'border-glass-border');
                         el.children[0].classList.remove('right-0.5', 'bg-white');
                         el.children[0].classList.add('left-0.5', 'bg-[#636366]');
                       } else {
                         el.classList.remove('bg-[#F5F5F7]', 'border-glass-border');
                         el.classList.add('bg-[#FF6B00]', 'border-[#FF6B00]', 'shadow-[0_0_8px_rgba(255,107,0,0.4)]');
                         el.children[0].classList.remove('left-0.5', 'bg-[#636366]');
                         el.children[0].classList.add('right-0.5', 'bg-white');
                       }
                     }}>
                       <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 transition-all shadow-sm"></div>
                     </div>
                   </div>
                 ))}
               </GlassCard>
            </div>
          )}

          {/* DATA & PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h2 className="text-xl font-bold text-gray-900 mb-6">Data & Privacy</h2>
               
               <GlassCard className="p-6 mb-6">
                 <h3 className="text-gray-900 font-bold mb-2">Data Export</h3>
                 <p className="text-gray-500 text-sm mb-4">Download a copy of all workspace candidate data, metrics, and settings in JSON/CSV format.</p>
                 <button className="glass-panel text-gray-900 font-semibold py-2 px-4 rounded-xl flex items-center hover:bg-white/10 transition-colors">
                   <Download size={16} className="mr-2"/> Export Workspace Data
                 </button>
               </GlassCard>

               <GlassCard className="p-6 border-red-500/30 bg-red-500/5">
                 <h3 className="text-red-500 font-bold mb-2">Danger Zone</h3>
                 <p className="text-gray-500 text-sm mb-4">Irreversibly delete this workspace and all associated candidate data.</p>
                 <button className="bg-red-500 text-gray-900 font-bold py-2 px-4 rounded-xl flex items-center shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:bg-red-600 transition-colors">
                   <Trash2 size={16} className="mr-2"/> Delete Workspace
                 </button>
               </GlassCard>
            </div>
          )}

        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.2); border-radius: 10px; }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255, 107, 0, 0.5); }
      `}} />
    </div>
  );
};

export default Settings;
