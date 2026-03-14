"use client";

import { useState } from "react";
import { Search, Loader2, SearchX, MapPin, Briefcase, Plus, User, Sparkles } from "lucide-react";
import { Input } from "@/frontend/components/ui/input";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Badge } from "@/frontend/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";

interface SearchResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate: {
    id: string;
    full_name: string;
    headline: string;
    location: string;
    skills: string[];
    experience_years: number;
    source: string;
  };
}

const EXAMPLE_SEARCHES = [
  "Senior React developer, 5+ years",
  "Backend engineer, Node.js and Postgres",
  "Product manager, SaaS background",
  "UX designer, fintech experience",
];

export default function AISearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);

  const handleSearch = async (forcedQuery?: string) => {
    const activeQuery = forcedQuery || query;
    if (!activeQuery || activeQuery.length < 3) {
      toast.error("Please enter at least 3 characters");
      return;
    }

    setLoading(true);
    setResults([]); // Clear previous results immediately
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: activeQuery }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Search failed");
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Search failed. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-600 border-red-100";
  };

  const getInitials = (name: string) => {
    return name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 pt-20">
      {/* 1. SEARCH HERO */}
      <div className="text-center space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight font-sans">
            Find Your Next Hire
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-lg mx-auto">
            Search across all candidates using plain English
          </p>
        </div>

        <div className="relative group max-w-2xl mx-auto px-4 sm:px-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white rounded-[2rem] sm:rounded-2xl border-2 border-gray-200 focus-within:border-[#F97316] shadow-md transition-all duration-300 overflow-hidden">

            <div className="flex items-center flex-1 h-16 px-4">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Senior React developer..."
                className="flex-1 px-4 bg-transparent border-0 focus:ring-0 text-gray-800 placeholder-gray-400 font-bold text-base outline-none h-full"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-[#F97316] hover:bg-[#EA6C0A] text-white h-14 sm:h-16 px-8 rounded-none sm:rounded-r-xl font-black text-sm uppercase tracking-widest shadow-none transition-all active:scale-95 sm:active:scale-100"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search Discovery"}
            </Button>
          </div>

          <p className="flex items-center justify-center gap-1.5 mt-4 text-[11px] uppercase tracking-widest font-black text-gray-400 mb-2">
            <Sparkles className="h-3 w-3 text-orange-400" />
            Powered by Claude AI + pgvector
          </p>
        </div>
      </div>

      {/* 2. EXAMPLE CHIPS (Initial State) */}
      {!results && !loading && (
        <div className="space-y-4 pt-4">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            Try these examples
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {EXAMPLE_SEARCHES.map((example) => (
              <button
                key={example}
                onClick={() => {
                  setQuery(example);
                  handleSearch(example);
                }}
                className="bg-orange-50 border border-orange-200 text-[#F97316] rounded-full px-5 py-2 text-sm font-semibold hover:bg-orange-100 hover:border-orange-300 transition-all shadow-sm active:scale-95"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. LOADING & RESULTS */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#F97316]" />
              <p className="text-[#F97316] font-bold tracking-tight">AI is matching candidates...</p>
            </div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 bg-white rounded-2xl border border-gray-200 animate-pulse overflow-hidden shadow-sm"
              >
                <div className="h-full w-full bg-gradient-to-r from-transparent via-gray-50 to-transparent" />
              </div>
            ))}
          </div>
        ) : results ? (
          results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                  Found {results.length} Matches
                </p>
              </div>
              {results.map((res) => (
                <Card
                  key={res.candidate_id}
                  className="bg-white rounded-2xl border-gray-200 shadow-sm hover:border-orange-200 hover:shadow-md transition-all group overflow-hidden"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm shrink-0 ring-4 ring-orange-50">
                            {getInitials(res.candidate.full_name)}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 group-hover:text-[#F97316] transition-colors font-sans text-lg">
                              {res.candidate.full_name}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium truncate">
                              {res.candidate.headline}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 font-semibold">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-orange-400" /> {res.candidate.location || "Remote"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3 text-orange-400" /> {res.candidate.experience_years}y Exp
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1.5 pl-16">
                          {res.candidate.skills.slice(0, 5).map((skill) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="bg-gray-50 text-gray-600 border-gray-200 rounded-lg text-[10px] font-bold px-2.5"
                            >
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="pl-16">
                          <div className="p-3 bg-[#FFF7F2] border border-orange-50 rounded-xl relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300" />
                            <p className="text-xs italic text-gray-600 font-medium leading-relaxed">
                              &ldquo;{res.reason}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center justify-between md:justify-center gap-4 shrink-0 md:border-l border-gray-100 md:pl-6 md:w-32">
                        <div className={`text-center p-3 rounded-2xl border ${getScoreColor(res.score)} w-full`}>
                          <p className="text-[10px] uppercase font-black opacity-60 tracking-tighter">AI Match</p>
                          <p className="text-2xl font-black">
                            {Math.round(res.score)}<span className="text-sm opacity-60">%</span>
                          </p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <Link href={`/candidates/${res.candidate_id}`} className="w-full">
                            <Button
                              variant="outline"
                              className="w-full border-gray-300 text-gray-600 rounded-xl h-9 text-xs font-bold hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50 transition-all px-0"
                            >
                              View Profile
                            </Button>
                          </Link>
                          <Button className="w-full bg-[#F97316] text-white rounded-xl h-9 text-xs font-bold hover:bg-[#EA6C0A] shadow-sm transition-all px-0">
                            Shortlist
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* 5. EMPTY STATE */
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 space-y-4">
              <div className="mx-auto h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center">
                <SearchX className="h-8 w-8 text-orange-300" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800">No candidates matched</h3>
                <p className="text-gray-500 max-w-xs mx-auto text-sm">
                  Try broadening your search criteria or using different keywords.
                </p>
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
}
