import { Database, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Sources</h1>
        <p className="text-slate-400 mt-2 text-lg">Manage your candidate data sources and integrations.</p>
      </div>
      <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem] space-y-6 bg-slate-900/20">
        <div className="bg-slate-800/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
          <Database className="h-10 w-10 text-slate-600" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Source management coming soon</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">
            In the meantime, use the Ingestion page to sync from Gmail, Indeed, and upload resumes.
          </p>
        </div>
        <Link href="/ingestion">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl h-12 px-6 transition-all hover:scale-105 active:scale-95 mt-4">
            Go to Ingestion
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
