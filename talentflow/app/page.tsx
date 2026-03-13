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
      // If RPC doesn't exist yet, we'll fallback to a manual fetch for the demo
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
      setTimeout(fetchDashboardData, 2000); // Wait for logs to update
    } catch (err) {
      toast.error(`Failed to trigger ${source} ingestion`);
    } finally {
      setIngesting(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Recruiter Command Center</h1>
          <p className="text-slate-400 mt-1">Real-time intelligence across your talent pipeline.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => handleIngest('Gmail', '/api/ingest/gmail')}
            disabled={!!ingesting}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl"
          >
            {ingesting === 'Gmail' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
            Sync Gmail
          </Button>
          <Button 
            onClick={() => handleIngest('Zoho', '/api/ingest/apifly?source=zoho')}
            disabled={!!ingesting}
            variant="secondary"
            className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-white/5"
          >
            {ingesting === 'Zoho' ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Pull Zoho
          </Button>
          <Link href="/shortlists">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-900/20">
                <Zap className="h-4 w-4 mr-2" />
                Run Shortlist
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Candidates", value: stats.total, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "New (7d)", value: stats.total > 0 ? `+${stats.newThisWeek}` : stats.newThisWeek, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Need Review", value: stats.pendingReview, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Active Roles", value: stats.activeJobs, icon: Briefcase, color: "text-purple-400", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-white mt-1 group-hover:scale-110 transition-transform origin-left duration-300">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
        {/* Main Chart Column */}
        <div className="space-y-8">
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-indigo-400" />
                        Source Breakdown
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   <SourceBreakdownChart data={chartData} />
                </CardContent>
            </Card>

            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-purple-400" />
                        Active Postings
                    </CardTitle>
                    <Link href="/jobs" className="text-xs text-indigo-400 hover:underline">View All</Link>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activeJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
                            <div>
                                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                                <p className="text-xs text-slate-500">{job.department} • {job.location}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-indigo-400">{job.applications?.[0]?.count || 0}</p>
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Applicants</p>
                                </div>
                                <Link href={`/shortlists?job_id=${job.id}`}>
                                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-full">
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>

        {/* Sidebar Activity Column */}
        <div className="space-y-8">
            <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md h-full">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        Recent Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="flex gap-4 items-start relative pb-6 last:pb-0 after:absolute after:left-2 before:left-2 after:top-6 after:bottom-0 after:w-px after:bg-white/5 last:after:hidden">
                                <div className={`h-4 w-4 rounded-full mt-1 shrink-0 flex items-center justify-center ${
                                    log.status === 'completed' ? 'bg-emerald-500/20 text-emerald-500' :
                                    log.status === 'failed' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-500/20 text-slate-500'
                                } shadow-[0_0_10px_rgba(0,0,0,0.5)]`}>
                                    {log.status === 'completed' ? <CheckCircle2 className="h-2.5 w-2.5" /> : 
                                     log.status === 'failed' ? <XCircle className="h-2.5 w-2.5" /> :
                                     <RefreshCw className="h-2.5 w-2.5 animate-spin" />}
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-slate-300 leading-tight">
                                        Pulled <span className="text-indigo-400 font-bold">{log.total_inserted}</span> from <span className="capitalize font-bold">{log.source.replace("_", " ")}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-medium">
                                        {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentLogs.length === 0 && (
                            <p className="text-xs text-slate-600 text-center py-10 italic">No recent activity detected.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
