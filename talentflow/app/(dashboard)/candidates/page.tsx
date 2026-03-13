"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Briefcase, Filter, ChevronRight, User, AlertCircle, Users } from "lucide-react";
import Link from "next/link";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Candidate {
  id: string;
  full_name: string;
  headline: string;
  location: string;
  skills: string[];
  experience_years: number;
  source: string;
  sources?: string[];
  created_at: string;
}

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [expRange, setExpRange] = useState([0, 20]);
  const [error, setError] = useState<string | null>(null);
  
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchCandidates();
  }, [page, sources, expRange]);

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("candidates")
        .select("*", { count: "exact" })
        .eq("is_duplicate", false)
        .gte("experience_years", expRange[0])
        .lte("experience_years", expRange[1]);

      if (sources.length > 0) {
        query = query.in("source", sources);
      }

      const { data, count, error } = await query
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (error) throw error;
      setCandidates(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Failed to load candidates. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (source: string) => {
    setSources(prev => 
      prev.includes(source) ? prev.filter(s => s !== source) : [...prev, source]
    );
    setPage(1);
  };

  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case "gmail":
      case "indeed":
        return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "merge_ats":
      case "zoho":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "resume_upload":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "linkedin":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter">Candidate Pool</h1>
          <p className="text-slate-400 mt-2 text-lg">Managing <span className="text-white font-bold">{totalCount}</span> specialized candidates across your pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/search">
                <Button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl h-12 px-6 shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95">
                    <Search className="h-4 w-4 mr-2" />
                    AI Talent Search
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md sticky top-6 lg:top-10">
            <CardContent className="p-6 space-y-8">
              <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-400" />
                    Filter by Source
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {["gmail", "indeed", "resume_upload", "linkedin", "merge_ats", "zoho"].map(src => (
                    <div 
                      key={src} 
                      className={`
                        flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer
                        ${sources.includes(src) ? 'bg-indigo-500/10 border-indigo-500/30 text-white' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/[0.08]'}
                      `}
                      onClick={() => toggleSource(src)}
                    >
                      <Checkbox 
                        id={src} 
                        checked={sources.includes(src)}
                        onCheckedChange={() => toggleSource(src)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600 rounded-md"
                      />
                      <label htmlFor={src} className="text-xs font-bold capitalize cursor-pointer">
                        {src.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Experience</h4>
                    <span className="text-xs text-indigo-400 font-black px-2 py-1 bg-indigo-400/10 rounded-lg">{expRange[0]}–{expRange[1]}y</span>
                </div>
                <Slider
                  defaultValue={[0, 20]}
                  max={20}
                  step={1}
                  onValueChange={(val) => {
                    if (Array.isArray(val)) {
                      setExpRange(val as number[]);
                      setPage(1);
                    }
                  }}
                  className="[&_[role=slider]]:h-5 [&_[role=slider]]:w-5 [&_[role=slider]]:bg-indigo-500 [&_[role=slider]]:border-4 [&_[role=slider]]:border-white"
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {error && (
             <Card className="bg-rose-500/10 border-rose-500/20 p-8 text-center space-y-4">
                <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
                <p className="text-rose-400 font-bold">{error}</p>
                <Button onClick={fetchCandidates} variant="outline" className="border-rose-500/20 text-rose-400">Retry Fetch</Button>
             </Card>
          )}

          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-slate-900/40 border border-white/5 rounded-3xl animate-pulse flex items-center p-6 gap-6">
                   <div className="h-14 w-14 rounded-2xl bg-white/5 shrink-0" />
                   <div className="space-y-3 flex-1">
                      <div className="h-5 w-1/4 bg-white/5 rounded" />
                      <div className="h-3 w-1/2 bg-white/5 rounded" />
                      <div className="flex gap-2">
                        <div className="h-4 w-16 bg-white/5 rounded" />
                        <div className="h-4 w-16 bg-white/5 rounded" />
                      </div>
                   </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && candidates.length === 0 && (
            <div className="text-center py-32 border-2 border-dashed border-white/5 rounded-[2rem] space-y-6 bg-slate-900/20">
              <div className="bg-slate-800/50 h-24 w-24 rounded-full flex items-center justify-center mx-auto scale-110">
                <Users className="h-10 w-10 text-slate-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">No candidates available</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  We couldn't find any candidates matching your active filters. Try pulling data from a source or expanding the experience range.
                </p>
              </div>
            </div>
          )}

          {!loading && !error && candidates.length > 0 && (
            <div className="grid gap-4">
              {candidates.map((c) => (
                <Link key={c.id} href={`/candidates/${c.id}`}>
                  <Card className="bg-slate-900/40 border-white/5 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all group cursor-pointer overflow-hidden backdrop-blur-md rounded-3xl">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 font-extrabold text-xl group-hover:scale-110 group-hover:shadow-2xl group-hover:shadow-indigo-500/20 transition-all duration-300">
                          {getInitials(c.full_name)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                             <div>
                                <h3 className="text-xl font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                                    {c.full_name}
                                </h3>
                                <p className="text-sm font-bold text-slate-400 truncate mt-0.5">{c.headline}</p>
                             </div>
                             <div className="flex gap-2 shrink-0">
                               {c.sources && c.sources.length > 1 && (
                                 <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] font-black tracking-widest uppercase">
                                    Merged
                                 </Badge>
                               )}
                               <Badge className={`${getSourceColor(c.source)} border text-[10px] font-black tracking-widest uppercase px-2 py-1`}>
                                 {c.source.replace("_", " ")}
                               </Badge>
                             </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-600" /> {c.location || "N/A"}</span>
                            <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-slate-600" /> {c.experience_years}y Exp</span>
                            <div className="flex flex-wrap gap-2">
                                {c.skills.slice(0, 3).map(s => (
                                    <span key={s} className="px-3 py-1 bg-white/5 rounded-full text-slate-400 group-hover:text-indigo-200 transition-colors border border-transparent group-hover:border-indigo-500/20">
                                        {s}
                                    </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-white/5 rounded-xl text-slate-600 transition-all group-hover:bg-indigo-500/10 group-hover:text-white group-hover:translate-x-1">
                          <ChevronRight className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-between pt-10 border-t border-white/5">
                <Button 
                    variant="ghost" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="text-slate-400 hover:text-white hover:bg-white/5 font-bold gap-2"
                >
                    <ChevronRight className="h-4 w-4 rotate-180" />
                    Previous
                </Button>
                <div className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                </div>
                <Button 
                    variant="ghost"
                    disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                    onClick={() => setPage(page + 1)}
                    className="text-slate-400 hover:text-white hover:bg-white/5 font-bold gap-2"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
