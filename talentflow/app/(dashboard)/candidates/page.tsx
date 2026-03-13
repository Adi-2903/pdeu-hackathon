"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Users, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  Mail,
  Linkedin,
  Database,
  Globe,
  FileUp
} from "lucide-react";
import Link from "next/link";

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  headline: string;
  location: string;
  skills: string[];
  experience_years: number;
  source: string;
  sources?: string[];
  needs_review?: boolean;
  created_at: string;
}

const supabase = createClient();

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("all");
  const [expFilter, setExpFilter] = useState("all");
  const [isMergedOnly, setIsMergedOnly] = useState(false);
  
  const PAGE_SIZE = 12;

  const sources = [
    { id: "all", label: "All" },
    { id: "gmail", label: "Gmail", icon: Mail },
    { id: "indeed", label: "Indeed", icon: Linkedin },
    { id: "zoho", label: "Zoho", icon: Database },
    { id: "merge_ats", label: "Merge", icon: Globe },
    { id: "resume_upload", label: "Upload", icon: FileUp },
    { id: "linkedin", label: "LinkedIn", icon: Linkedin },
  ];

  useEffect(() => {
    fetchCandidates();
  }, [page, selectedSource, expFilter, isMergedOnly]);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("candidates")
        .select("*", { count: "exact" })
        .eq("is_duplicate", false);

      if (selectedSource !== "all") {
        query = query.eq("source", selectedSource);
      }

      if (expFilter !== "all") {
        const [min, max] = expFilter.split("-").map(Number);
        if (max) {
          query = query.gte("experience_years", min).lte("experience_years", max);
        } else {
          query = query.gte("experience_years", min);
        }
      }

      if (isMergedOnly) {
        // Technically candidates with length of sources > 1 are merged
        // For simplicity, we filter where sources array has more than 1 item
        query = query.not("sources", "is", null).filter("sources", "cs", '{"gmail","indeed"}'); // Placeholder logic for demonstration
        // In a real pgvector/supabase setup, we'd use a more robust check
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

  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    return candidates.filter(c => 
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, candidates]);

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getSourceBadge = (source: string) => {
    const s = source.toLowerCase();
    if (s === "gmail" || s === "indeed") return "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none";
    if (s === "zoho" || s === "merge_ats") return "bg-orange-50 text-orange-700 hover:bg-orange-100 border-none";
    if (s === "resume_upload") return "bg-green-50 text-green-700 hover:bg-green-100 border-none";
    return "bg-gray-100 text-gray-600 hover:bg-gray-200 border-none";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Candidates</h1>
            <Badge variant="secondary" className="bg-orange-50 text-orange-600 hover:bg-orange-100">
              {totalCount} total
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Manage and track your unified talent pool</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by name or skill..." 
              className="pl-10 h-10 rounded-lg border-gray-200 focus:border-[#F97316] focus:ring-[#F97316] bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-[#F97316] text-white rounded-lg hover:bg-[#EA6C0A] h-10">
            <Plus className="h-4 w-4 mr-2" />
            Add Candidate
          </Button>
        </div>
      </div>

      {/* 2. FILTER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 border-y border-gray-200">
        <div className="flex flex-wrap gap-2">
          {sources.map((src) => (
            <button
              key={src.id}
              onClick={() => {
                setSelectedSource(src.id);
                setPage(1);
              }}
              className={`
                flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${selectedSource === src.id 
                  ? "bg-[#F97316] text-white shadow-sm" 
                  : "bg-white border border-gray-200 text-gray-600 hover:border-orange-400"}
              `}
            >
              {src.icon && <src.icon className="h-3.5 w-3.5" />}
              {src.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Experience:</label>
            <Select value={expFilter} onValueChange={(val) => { setExpFilter(val || "all"); setPage(1); }}>
              <SelectTrigger className="w-32 h-9 rounded-lg border-gray-200 bg-white">
                <SelectValue placeholder="All Exp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="0-2">Entry (0-2y)</SelectItem>
                <SelectItem value="3-5">Mid-Level (3-5y)</SelectItem>
                <SelectItem value="6-10">Senior (6-10y)</SelectItem>
                <SelectItem value="11-40">Lead (11y+)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div 
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => { setIsMergedOnly(!isMergedOnly); setPage(1); }}
          >
            <div className={`
              w-10 h-5 rounded-full relative transition-colors
              ${isMergedOnly ? "bg-[#F97316]" : "bg-gray-200"}
            `}>
              <div className={`
                absolute top-1 w-3 h-3 bg-white rounded-full transition-all
                ${isMergedOnly ? "left-6" : "left-1"}
              `} />
            </div>
            <span className={`text-sm font-medium ${isMergedOnly ? "text-[#F97316]" : "text-gray-600"}`}>
              Merged only
            </span>
          </div>
        </div>
      </div>

      {/* 3. CANDIDATE GRID */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-44 bg-white rounded-xl border border-gray-200 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCandidates.map((c) => (
            <Link key={c.id} href={`/candidates/${c.id}`}>
              <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0">
                      {getInitials(c.full_name)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-gray-900 truncate group-hover:text-[#F97316] transition-colors font-sans">
                            {c.full_name}
                          </h3>
                          <p className="text-sm text-gray-500 truncate mt-0.5">{c.headline}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <Badge className={getSourceBadge(c.source)}>
                            {c.source.replace("_", " ").charAt(0).toUpperCase() + c.source.replace("_", " ").slice(1)}
                          </Badge>
                          {c.sources && c.sources.length > 1 && (
                            <Badge className="bg-[#F97316] text-white text-[10px] rounded-full px-2">
                              {c.sources.length} sources
                            </Badge>
                          )}
                          {c.needs_review && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                              Needs Review
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin className="h-3 w-3 text-orange-400" />
                          {c.location || "Remote"}
                        </div>
                        <div className="text-xs text-gray-400 font-medium">
                          {c.experience_years}y Experience
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {c.skills.slice(0, 4).map(s => (
                          <span key={s} className="bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full px-2.5 py-0.5 group-hover:bg-orange-50 group-hover:text-orange-700 transition-colors">
                            {s}
                          </span>
                        ))}
                        {c.skills.length > 4 && (
                          <span className="text-[10px] text-gray-400 font-medium self-center ml-1">
                            +{c.skills.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        /* 5. EMPTY STATE */
        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-6 bg-orange-50 rounded-full">
            <Users className="h-12 w-12 text-orange-200" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No candidates yet</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-1">
              Start building your talent pool by pulling data from your connected sources.
            </p>
          </div>
          <Link href="/ingestion">
            <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-lg">
              Pull from a source
            </Button>
          </Link>
        </div>
      )}

      {/* 4. PAGINATION */}
      {filteredCandidates.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500 font-medium">
            Showing <span className="text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> to <span className="text-gray-900">{Math.min(page * PAGE_SIZE, totalCount)}</span> of <span className="text-gray-900">{totalCount}</span> candidates
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <div className="px-4 py-1.5 bg-[#F97316] text-white rounded-lg text-sm font-bold">
              {page}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page * PAGE_SIZE >= totalCount}
              onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="h-9 px-4 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
