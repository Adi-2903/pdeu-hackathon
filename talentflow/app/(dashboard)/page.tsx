"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Users, Briefcase, AlertCircle, TrendingUp, 
  RefreshCw, Mail, Database, Zap, ExternalLink,
  ChevronRight, Clock, CheckCircle2, XCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SourceBreakdownChart } from "@/components/dashboard/source-chart";
import Link from "next/link";
import { toast } from "sonner";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    newThisWeek: 0,
    pendingReview: 0,
    activeJobs: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      const { count: total } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('is_duplicate', false);
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newThisWeek } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).gte('created_at', oneWeekAgo);
      const { count: pendingReview } = await supabase.from('candidates').select('*', { count: 'exact', head: true }).eq('needs_review', true);
      const { count: activeJobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open');

      setStats({
        total: total || 0,
        newThisWeek: newThisWeek || 0,
        pendingReview: pendingReview || 0,
        activeJobs: activeJobsCount || 0
      });

      // 2. Chart Data (Group by source)
      const { data: sourceGroups } = await supabase.rpc('get_candidate_source_stats');
      if (!sourceGroups) {
          const { data: candidates } = await supabase.from('candidates').select('source');
          const counts = (candidates || []).reduce((acc: any, c: any) => {
              acc[c.source] = (acc[c.source] || 0) + 1;
              return acc;
          }, {});
          setChartData(Object.entries(counts).map(([name, count]) => ({ name, count: count as number })));
      } else {
          setChartData(sourceGroups);
      }

      // 3. Recent Activity
      const { data: logs } = await supabase
        .from('ingestion_logs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(10);
      setRecentLogs(logs || []);

      // 4. Active Jobs
      const { data: jobs } = await supabase
        .from('jobs')
        .select(`*, applications (count)`)
        .eq('status', 'open')
        .limit(5);
      
      setActiveJobs(jobs || []);

    } catch (err) {
      console.error("Dashboard Load Error:", err);
      toast.error("Failed to refresh dashboard stats. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleIngest = async (source: string, endpoint: string) => {
    setIngesting(source);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      if (!res.ok) throw new Error("Ingestion error");
      toast.success(`Started pulling from ${source}`);
      setTimeout(fetchDashboardData, 3000); 
    } catch (err) {
      toast.error(`Ingestion Engine Offline: Failed to trigger ${source}`);
    } finally {
      setIngesting(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Recruiter Dashboard</h1>
          <p className="text-slate-400 mt-2 text-lg">System status and talent pipeline overview.</p>
        </div>
        
        <div className="flex flex-wrap gap-2 lg:gap-3">
          <Button 
            onClick={() => handleIngest('Gmail', '/api/ingest/gmail')}
            disabled={!!ingesting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl h-12 px-6 transition-all hover:scale-105 active:scale-95"
          >
            {ingesting === 'Gmail' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Sync Gmail
          </Button>
          <Button 
            onClick={() => handleIngest('Zoho', '/api/ingest/apifly?source=zoho')}
            disabled={!!ingesting}
            variant="secondary"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl h-12 px-6 border border-white/5 transition-all hover:scale-105"
          >
            {ingesting === 'Zoho' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Sync Zoho
          </Button>
          <Link href="/shortlists">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl h-12 px-6 shadow-xl shadow-purple-900/20 transition-all hover:scale-105">
                <Zap className="h-4 w-4 mr-2" />
                Run AI Shortlist
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Talent Pool", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "7d Velocity", value: stats.total > 0 ? `+${stats.newThisWeek}` : stats.newThisWeek, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Manual Review", value: stats.pendingReview, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Active Jobs", value: stats.activeJobs, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden group hover:border-white/10 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</p>
                  {loading ? (
                    <div className="h-9 w-16 bg-white/5 rounded-lg animate-pulse mt-2" />
                  ) : (
                    <h3 className="text-3xl font-black text-white mt-1 group-hover:scale-110 transition-transform origin-left duration-300">{stat.value}</h3>
                  )}
                </div>
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6 lg:gap-8">
        {/* Main Chart Column */}
        <div className="space-y-6 lg:space-y-8 min-w-0">
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                        Source Distribution
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   {loading ? (
                       <div className="h-[300px] w-full bg-white/5 rounded-2xl animate-pulse" />
                   ) : chartData.length > 0 ? (
                       <SourceBreakdownChart data={chartData} />
                   ) : (
                       <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/5 rounded-2xl">
                           <Database className="h-8 w-8 mb-2 opacity-20" />
                           <p className="text-sm">No source data available yet.</p>
                       </div>
                   )}
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                        <Briefcase className="h-5 w-5 text-purple-400" />
                        High Priority Roles
                    </CardTitle>
                    <Link href="/jobs" className="text-xs font-bold text-indigo-400 hover:text-white transition-colors">VIEW ALL</Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
                    ) : activeJobs.length > 0 ? activeJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.08] transition-all group">
                            <div>
                                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 font-medium">{job.department} • {job.location}</p>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="text-right hidden sm:block">
                                    <p className="text-lg font-black text-indigo-400 truncate">{job.applications?.[0]?.count || 0}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Pipeline</p>
                                </div>
                                <Link href={`/shortlists?job_id=${job.id}`}>
                                    <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10 h-10 w-10 rounded-xl transition-all group-hover:translate-x-1">
                                        <ChevronRight className="h-6 w-6" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl text-slate-600 italic text-sm">
                            No active job postings found.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Activity Column */}
        <div className="space-y-8">
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
                        <Clock className="h-5 w-5 text-slate-400" />
                        System Activity
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="space-y-8">
                        {loading ? (
                            [1,2,3,4,5].map(i => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-4 w-4 rounded-full bg-white/5 animate-pulse shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                                        <div className="h-2 w-1/4 bg-white/5 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))
                        ) : recentLogs.length > 0 ? recentLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 items-start relative pb-8 last:pb-0 after:absolute after:left-[7.5px] after:top-[22px] after:bottom-[-8px] after:w-px after:bg-white/5 last:after:hidden">
                                <div className={`h-4 w-4 rounded-full mt-1.5 shrink-0 flex items-center justify-center ${
                                    log.status === 'completed' ? 'bg-emerald-500 text-white' :
                                    log.status === 'failed' ? 'bg-rose-500 text-white' : 'bg-slate-500 text-white'
                                } shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 p-0.5`}>
                                    {log.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : 
                                     log.status === 'failed' ? <XCircle className="h-3 w-3" /> :
                                     <RefreshCw className="h-3 w-3 animate-spin" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-300 leading-tight">
                                        Synced <span className="text-indigo-400 font-black">{log.total_inserted}</span> records from <span className="capitalize font-bold text-white px-1.5 py-0.5 bg-white/5 rounded-md ml-1">{log.source.replace("_", " ")}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                        {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 px-4 space-y-4">
                                <RefreshCw className="h-10 w-10 text-slate-800 mx-auto animate-spin-slow opacity-20" />
                                <p className="text-xs text-slate-600 italic">Listening for system events...</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
