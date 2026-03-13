"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Users, Plus, AlertCircle } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('jobs')
        .select(`*, applications (count)`)
        .order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setJobs(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load job postings. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Open Roles</h1>
          <p className="text-slate-400 mt-2 text-lg">Manage your active job postings and candidate pipelines.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl h-12 px-6 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/20">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      {error && (
        <Card className="bg-rose-500/10 border-rose-500/20 p-8 text-center space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
          <p className="text-rose-400 font-bold">{error}</p>
          <Button onClick={fetchJobs} variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">Retry Fetch</Button>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse p-6 space-y-5">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-white/5 rounded-2xl" />
                <div className="h-5 w-16 bg-white/5 rounded-lg" />
              </div>
              <div className="h-6 w-2/3 bg-white/5 rounded" />
              <div className="h-4 w-1/2 bg-white/5 rounded" />
              <div className="h-14 w-full bg-white/5 rounded-2xl" />
              <div className="flex gap-2">
                <div className="h-10 flex-1 bg-white/5 rounded-xl" />
                <div className="h-10 flex-[2] bg-white/5 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem] space-y-6 bg-slate-900/20">
          <div className="bg-slate-800/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="h-10 w-10 text-slate-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-white">No open roles yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">
              Create your first job posting to start building your candidate pipeline and run AI-powered shortlists.
            </p>
          </div>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group overflow-hidden backdrop-blur-sm rounded-3xl">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                    <Briefcase className="h-6 w-6 text-indigo-400" />
                  </div>
                  <Badge variant="outline" className="border-white/10 text-slate-500 uppercase text-[10px] font-black tracking-widest">
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
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group-hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-bold text-white">{job.applications?.[0]?.count || 0}</span>
                    <span className="text-xs text-slate-500">Applicants</span>
                  </div>
                  <Link href={`/shortlists`}>
                    <Button size="sm" variant="ghost" className="text-indigo-400 hover:text-indigo-300 hover:bg-indigo-400/10 text-xs font-bold rounded-xl transition-all">
                      View Shortlist
                    </Button>
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20 text-xs py-5 rounded-xl transition-all">
                    Edit
                  </Button>
                  <Link href={`/search?query=${job.title}`} className="flex-[2]">
                    <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-5 rounded-xl border border-white/5 hover:border-white/10 transition-all hover:shadow-lg">
                      AI Search Match
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
