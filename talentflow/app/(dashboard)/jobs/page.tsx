"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users, Plus, LayoutGrid } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data } = await supabase
        .from('jobs')
        .select(`*, applications (count)`)
        .order('created_at', { ascending: false });
      setJobs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Open Roles</h1>
          <p className="text-slate-400">Manage your active job postings and candidate pipelines.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             [1,2,3].map(i => <div key={i} className="h-48 bg-slate-900/40 rounded-3xl animate-pulse" />)
        ) : jobs.map((job) => (
          <Card key={job.id} className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all group overflow-hidden backdrop-blur-sm">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <Briefcase className="h-6 w-6 text-indigo-400" />
                    </div>
                    <Badge variant="outline" className="border-white/10 text-slate-500 uppercase text-[10px] font-black">
                        {job.status}
                    </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors mt-4">
                    {job.title}
                </CardTitle>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span>{job.department}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {job.location}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-bold text-white">{job.applications?.[0]?.count || 0}</span>
                        <span className="text-xs text-slate-500">Applicants</span>
                    </div>
                    <Link href={`/shortlists`}>
                        <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/5 text-xs font-bold">
                            View Shortlist
                        </Button>
                    </Link>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent border-white/10 text-slate-400 text-xs py-5 rounded-xl">
                        Edit
                    </Button>
                    <Link href={`/search?query=${job.title}`} className="flex-[2]">
                        <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-5 rounded-xl border border-white/5">
                            AI Search Match
                        </Button>
                    </Link>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
