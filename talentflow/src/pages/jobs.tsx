"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/frontend/lib/db/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { Button } from "@/frontend/components/ui/button";
import { 
  Briefcase, 
  MapPin, 
  Users, 
  Plus, 
  AlertCircle, 
  Search, 
  ListFilter, 
  MoreVertical,
  ArrowUpRight,
  Clock,
  Building2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const supabase = createClient();

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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "open": return <Badge className="bg-green-100 text-green-700 border-green-200">ACTIVE</Badge>;
      case "closed": return <Badge className="bg-gray-100 text-gray-500 border-gray-200">CLOSED</Badge>;
      case "draft": return <Badge className="bg-orange-50 text-[#F97316] border-orange-100">DRAFT</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-600 border-gray-200 uppercase">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-200 pb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans">Job Postings</h1>
          <p className="text-gray-500 font-medium text-lg">Build and manage your active candidate pipelines.</p>
        </div>
        <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl h-14 px-8 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-100 shrink-0">
          <Plus className="h-5 w-5 mr-2" />
          Create New Role
        </Button>
      </div>

      {error && (
        <Card className="bg-red-50 border-red-100 p-10 text-center space-y-6 rounded-3xl">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-red-900">Database Connection Error</h3>
            <p className="text-red-600 font-medium max-w-sm mx-auto">{error}</p>
          </div>
          <Button onClick={fetchJobs} variant="outline" className="border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-10 transition-all font-bold">Try Reconnect</Button>
        </Card>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-[2rem] animate-pulse p-8 space-y-6 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-gray-50 rounded-2xl" />
                <div className="h-6 w-16 bg-gray-50 rounded-full" />
              </div>
              <div className="space-y-3">
                <div className="h-7 w-3/4 bg-gray-50 rounded-lg" />
                <div className="h-4 w-1/2 bg-gray-50 rounded-lg" />
              </div>
              <div className="h-16 w-full bg-gray-50 rounded-2xl" />
              <div className="flex gap-3">
                <div className="h-11 flex-1 bg-gray-50 rounded-xl" />
                <div className="h-11 flex-1 bg-gray-50 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && jobs.length === 0 && (
        <div className="text-center py-40 bg-white border-2 border-dashed border-gray-200 rounded-[3rem] space-y-6 shadow-xs">
          <div className="bg-orange-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto ring-8 ring-orange-50/50">
            <Briefcase className="h-10 w-10 text-[#F97316]" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">No active job postings</h3>
            <p className="text-gray-500 max-w-xs mx-auto font-medium leading-relaxed">
              When you create your first role, it will appear here with automated candidate sourcing and AI matching.
            </p>
          </div>
          <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white font-bold rounded-xl px-8 h-12 mt-4 shadow-lg shadow-orange-100">
            Post Initial Job
          </Button>
        </div>
      )}

      {!loading && !error && jobs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="bg-white border-gray-200 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/[0.03] transition-all group overflow-hidden rounded-[2rem] flex flex-col">
              <CardHeader className="p-8 pb-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-orange-50 rounded-2xl group-hover:bg-[#F97316] transition-all duration-300">
                    <Briefcase className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" />
                  </div>
                  {getStatusBadge(job.status)}
                </div>
                <div className="mt-6 space-y-1">
                  <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-[#F97316] transition-colors font-sans truncate">
                    {job.title}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                    <span className="flex items-center gap-1.5"><Building2 className="h-3 w-3" /> {job.department || "General"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {job.location || "Remote"}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-8 pt-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="p-5 bg-gray-50 group-hover:bg-[#FFF7F2] rounded-3xl transition-colors duration-300 flex items-center justify-between border border-transparent group-hover:border-orange-50">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-xs">
                       <Users className="h-4 w-4 text-[#F97316]" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-900 leading-none">{job.applications?.[0]?.count || 0}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Applicants</p>
                    </div>
                  </div>
                  <Link href={`/shortlists`}>
                    <Button variant="ghost" size="sm" className="text-[#F97316] hover:text-[#EA6C0A] hover:bg-orange-50 font-bold p-0 px-2 h-auto text-xs">
                      View List <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link href={`/search?query=${encodeURIComponent(job.title)}`} className="w-full">
                    <Button className="w-full bg-[#F97316] hover:bg-[#EA6C0A] text-white text-xs font-bold h-12 rounded-2xl shadow-sm border-0 transition-all active:scale-95 flex items-center gap-2">
                      <Search className="h-3 w-3" /> AI Match
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:border-gray-300 text-xs font-bold h-12 rounded-2xl transition-all active:scale-95 flex items-center gap-2">
                    <ListFilter className="h-3 w-3" /> Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
