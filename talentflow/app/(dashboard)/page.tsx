import { createClient } from "@/lib/supabase/server";
import { 
  Users, 
  Briefcase, 
  AlertCircle, 
  TrendingUp, 
  Clock, 
  ArrowRight,
  Database,
  Mail,
  Globe,
  Linkedin,
  FileUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SourceBreakdownChart } from "@/components/dashboard/source-chart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();

  // 1. Fetch Stats
  const { count: totalCandidates } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("is_duplicate", false);

  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: newThisWeek } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .gte("created_at", oneWeekAgo);

  const { count: pendingReview } = await supabase
    .from("candidates")
    .select("*", { count: "exact", head: true })
    .eq("needs_review", true);

  const { count: activeJobsCount } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true })
    .eq("status", "open");

  // 2. Fetch Chart Data (Candidates by Source)
  const { data: candidates } = await supabase.from("candidates").select("source");
  const sourceCounts = (candidates || []).reduce((acc: any, c: any) => {
    const label = c.source.replace("_", " ").charAt(0).toUpperCase() + c.source.replace("_", " ").slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(sourceCounts).map(([name, count]) => ({ name, count: count as number }));

  // 3. Fetch Recent Activity
  const { data: recentLogs } = await supabase
    .from("ingestion_logs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(10);

  // 4. Fetch Active Jobs
  const { data: activeJobs } = await supabase
    .from("jobs")
    .select(`id, title, status, applications (count)`)
    .eq("status", "open")
    .limit(5);

  const stats = [
    { label: "Total Candidates", value: totalCandidates || 0, icon: Users },
    { label: "New This Week", value: newThisWeek || 0, icon: TrendingUp },
    { label: "Pending Review", value: pendingReview || 0, icon: AlertCircle },
    { label: "Active Jobs", value: activeJobsCount || 0, icon: Briefcase },
  ];

  const today = new Date().toLocaleDateString("en-US", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "gmail": return <Mail className="h-4 w-4" />;
      case "indeed": return <Linkedin className="h-4 w-4" />;
      case "zoho": return <Database className="h-4 w-4" />;
      case "merge":
      case "merge_ats": return <Globe className="h-4 w-4" />;
      case "linkedin": return <Linkedin className="h-4 w-4" />;
      default: return <FileUp className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Good morning, Recruiter 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s your recruitment overview</p>
        </div>
        <div className="text-sm text-gray-400 font-medium">
          {today}
        </div>
      </div>

:      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-white rounded-2xl border-gray-200 shadow-sm p-4 md:p-6 relative overflow-hidden group hover:shadow-md hover:-translate-y-0.5 hover:border-orange-200 transition-all duration-200">
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</span>
              <span className="text-xs md:text-sm text-gray-500 mt-1 font-bold uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-orange-50 rounded-xl group-hover:bg-[#F97316] transition-colors">
              <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-[#F97316] group-hover:text-white transition-colors" />
            </div>
          </Card>
        ))}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 3. SOURCE BREAKDOWN CHART */}
        <Card className="lg:col-span-2 bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Candidates by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <SourceBreakdownChart data={chartData} />
            ) : (
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                <Database className="h-8 w-8 mr-2 opacity-50" />
                <span>No ingestion source data available yet</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. RECENT ACTIVITY FEED */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F97316]" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-80">
            <div className="space-y-4">
              {recentLogs && recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm p-2 rounded-lg hover:bg-orange-50/50 transition-colors">
                  <div className="mt-1 w-2 h-2 rounded-full bg-[#F97316] shrink-0" />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 font-medium text-gray-800 capitalize">
                      <span className="text-[#F97316]">{getSourceIcon(log.source)}</span>
                      {log.source.replace("_", " ")}
                    </div>
                    <div className="text-gray-500">
                      Added <span className="font-bold text-gray-900">{log.total_inserted}</span> new candidates
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                      {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="py-12 text-center text-gray-400 italic">
                  No recent ingestion logs found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5. ACTIVE JOBS */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-50">
            <CardTitle className="text-base font-semibold text-gray-800">
              Active Job Postings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-50">
              {activeJobs && activeJobs.length > 0 ? activeJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    <span className="flex items-center justify-center bg-[#F97316] text-white rounded-full text-[10px] font-bold h-5 min-w-[20px] px-1.5">
                      {job.applications?.[0]?.count || 0}
                    </span>
                  </div>
                  <Link 
                    href={`/shortlists/${job.id}`} 
                    className="text-[#F97316] hover:text-[#EA6C0A] font-semibold text-sm flex items-center gap-1 group"
                  >
                    Shortlist 
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )) : (
                <div className="p-8 text-center text-gray-400 italic">
                  No active job postings found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 6. QUICK ACTIONS ROW */}
        <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-800">
              Sync Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-6">
              Manually trigger background ingestion jobs to pull the latest candidates into the platform.
            </p>
            <QuickActions />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
