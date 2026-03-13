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
import { Search, MapPin, Briefcase, Filter, ChevronRight, User } from "lucide-react";
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
  
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchCandidates();
  }, [page, sources, expRange]);

  const fetchCandidates = async () => {
    setLoading(true);
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
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Talent Pool</h1>
          <p className="text-slate-400">Managing {totalCount} unique candidates from all sources.</p>
        </div>
        <div className="flex items-center gap-3">
            <Link href="/search">
                <Button variant="outline" className="bg-slate-900 border-white/10 text-white hover:bg-slate-800">
                    <Search className="h-4 w-4 mr-2" />
                    AI Search
                </Button>
            </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-8">
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-sm sticky top-8">
            <CardContent className="p-6 space-y-8">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Filter className="h-4 w-4 text-indigo-400" />
                    Sources
                </h4>
                <div className="space-y-3">
                  {["gmail", "indeed", "resume_upload", "linkedin", "merge_ats", "zoho"].map(src => (
                    <div key={src} className="flex items-center space-x-2">
                      <Checkbox 
                        id={src} 
                        checked={sources.includes(src)}
                        onCheckedChange={() => toggleSource(src)}
                        className="border-white/20 data-[state=checked]:bg-indigo-600"
                      />
                      <label htmlFor={src} className="text-sm text-slate-400 capitalize cursor-pointer hover:text-white transition-colors">
                        {src.replace("_", " ")}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200">Experience</h4>
                    <span className="text-xs text-indigo-400 font-mono">{expRange[0]}–{expRange[1]}y</span>
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
                  className="[&_[role=slider]]:bg-indigo-600"
                />
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="space-y-6">
          {loading && (
            <div className="grid gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-slate-900/30 border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {!loading && candidates.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
              <p className="text-slate-500">No candidates found with these filters.</p>
            </div>
          )}

          {!loading && candidates.length > 0 && (
            <div className="grid gap-4">
              {candidates.map((c) => (
                <Link key={c.id} href={`/candidates/${c.id}`}>
                  <Card className="bg-slate-900/40 border-white/5 hover:border-white/10 hover:bg-slate-900/60 transition-all group cursor-pointer overflow-hidden backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center text-slate-300 font-bold group-hover:from-indigo-900 group-hover:to-purple-900 transition-all">
                          {getInitials(c.full_name)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                             <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-400 transition-colors">
                                {c.full_name}
                             </h3>
                             <div className="flex gap-2">
                               {c.sources && c.sources.length > 1 && (
                                 <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px]">
                                    Merged ({c.sources.length})
                                 </Badge>
                               )}
                               <Badge className={`${getSourceColor(c.source)} border text-[10px] capitalize`}>
                                 {c.source.replace("_", " ")}
                               </Badge>
                             </div>
                          </div>
                          <p className="text-sm text-slate-400 truncate">{c.headline}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location || "N/A"}</span>
                            <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {c.experience_years}y Experience</span>
                            <div className="flex gap-1">
                                {c.skills.slice(0, 3).map(s => (
                                    <span key={s} className="px-1.5 py-0.5 bg-white/5 rounded text-slate-400">
                                        {s}
                                    </span>
                                ))}
                            </div>
                          </div>
                        </div>
                        
                        <ChevronRight className="h-5 w-5 text-slate-600 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalCount > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 pt-4">
                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="bg-slate-900 border-white/10 text-white"
                >
                    Previous
                </Button>
                <div className="text-sm text-slate-500 px-4">
                    Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                </div>
                <Button 
                    variant="outline" 
                    size="sm"
                    disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                    onClick={() => setPage(page + 1)}
                    className="bg-slate-900 border-white/10 text-white"
                >
                    Next
                </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
