import { Settings } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Settings</h1>
        <p className="text-slate-400 mt-2 text-lg">Configure your TalentFlow workspace preferences.</p>
      </div>
      <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem] space-y-6 bg-slate-900/20">
        <div className="bg-slate-800/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <Settings className="h-10 w-10 text-slate-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Settings coming soon</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">
            API keys, team management, and workspace configuration will be available here.
          </p>
        </div>
      </div>
    </div>
  );
}
