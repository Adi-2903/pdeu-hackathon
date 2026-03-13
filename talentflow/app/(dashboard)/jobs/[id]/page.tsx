import { ArrowLeft, HardDrive } from "lucide-react";
import Link from "next/link";

export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Link href="/jobs" className="text-slate-500 hover:text-white flex items-center gap-2 transition-colors group">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Open Roles
      </Link>
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Job Details</h1>
        <p className="text-slate-400 mt-2 text-lg">Viewing job: <span className="text-white font-bold font-mono">{params.id}</span></p>
      </div>
      <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] space-y-6 bg-slate-900/20">
        <div className="bg-slate-800/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <HardDrive className="h-10 w-10 text-slate-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Job detail view coming soon</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">
            Matching candidates and pipeline management will be implemented in Phase 5.
          </p>
        </div>
      </div>
    </div>
  );
}
