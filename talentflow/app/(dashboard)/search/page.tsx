"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, User, MapPin, Briefcase, GraduationCap, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.length < 3) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
      } else {
        setError(data.error || "AI Search Engine Offline: Please try again in 30s.");
      }
    } catch (err) {
      setError("Network error: Failed to reach the search intelligence service.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Search Header */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-10 px-4">
        <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-6 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Talent Intelligence
        </h1>
        <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed">
          Describe the engineer you need. Our AI scans your entire talent pipeline 
          using vector similarity and technical cross-referencing.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mt-12 group">
          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer with FinTech experience..."
            className="w-full pl-16 pr-40 py-10 text-xl bg-slate-900/40 border-white/10 text-white rounded-[2rem] focus:ring-purple-500/20 focus:border-purple-500/30 transition-all backdrop-blur-2xl shadow-2xl"
          />
          <Button 
            type="submit" 
            disabled={loading || query.length < 3}
            className="absolute right-3 top-3 bottom-3 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-900/40 hover:scale-105 active:scale-95"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : "FIND TALENT"}
          </Button>
        </form>
      </div>

      {/* Results Area */}
      <div className="space-y-6">
        {loading && (
          <div className="grid gap-6 px-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900/30 border-white/5 animate-pulse overflow-hidden rounded-[2rem]">
                 <div className="flex gap-6 p-8 items-start">
                    <div className="h-20 w-20 bg-white/5 rounded-2xl shrink-0" />
                    <div className="space-y-4 flex-1">
                      <div className="h-6 w-1/4 bg-white/5 rounded" />
                      <div className="h-4 w-1/2 bg-white/5 rounded" />
                      <div className="h-20 w-full bg-white/5 rounded" />
                    </div>
                 </div>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="mx-4 p-8 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-3xl text-center space-y-4 animate-in zoom-in-95">
            <AlertCircle className="h-10 w-10 mx-auto" />
            <p className="font-bold text-lg">{error}</p>
            <Button onClick={() => handleSearch()} variant="outline" className="border-rose-500/20 text-rose-400 rounded-xl">Retry Search</Button>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-6 px-4">
            {results.map((res) => (
              <Card key={res.candidate_id} className="bg-slate-900/40 border-white/10 hover:border-purple-500/40 hover:shadow-2xl hover:shadow-purple-500/10 transition-all group overflow-hidden backdrop-blur-sm rounded-[2.5rem]">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="h-20 w-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform flex-shrink-0">
                      <User className="h-10 w-10" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <h3 className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors tracking-tight">
                            {res.candidate.full_name}
                          </h3>
                          <p className="text-lg text-slate-400 font-bold mt-1">{res.candidate.headline}</p>
                        </div>
                        <div className="text-left sm:text-right bg-purple-500/10 px-6 py-3 rounded-2xl border border-purple-500/20">
                          <div className="text-4xl font-black text-purple-400 tabular-nums">{res.score}%</div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">Match Index</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-y-3 gap-x-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-500" />
                          {res.candidate.location || "Remote"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-purple-500" />
                          {res.candidate.experience_years} Years
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-400 px-3 py-1">
                          {res.candidate.source.replace("_", " ")}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {res.candidate.skills.slice(0, 8).map((skill) => (
                          <Badge key={skill} className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 font-bold px-3 py-1.5 rounded-xl">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="p-6 bg-purple-500/5 border-l-4 border-purple-500/40 rounded-r-3xl mt-6 relative group/reason overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Sparkles className="h-12 w-12 text-purple-500" />
                        </div>
                        <p className="text-sm text-indigo-100 font-medium leading-relaxed italic relative z-10 font-mono">
                          Claude Intelligence: &quot;{res.reason}&quot;
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 lg:self-stretch items-center">
                      <Link 
                        href={`/candidates/${res.candidate_id}`}
                        className="p-5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-3xl transition-all group-hover:translate-x-3"
                      >
                        <ArrowRight className="h-8 w-8" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="mx-4 text-center py-32 border-2 border-dashed border-white/5 rounded-[3rem] space-y-8 bg-slate-900/10">
            <div className="bg-slate-800/50 h-32 w-32 rounded-full flex items-center justify-center mx-auto shadow-inner group transition-all">
              <Search className="h-16 w-16 text-slate-700 group-hover:scale-110 group-hover:text-indigo-900 transition-all opacity-40" />
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-black text-white px-4">Awaiting Search Parameters</h3>
              <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed px-4">
                Enter a specific engineering requirement to see AI in action. Try these specialized queries:
              </p>
            </div>
            <div className="pt-6 flex flex-wrap justify-center gap-4 px-6">
              {[
                  "Senior React Developer with 5+ years experience",
                  "Expert Node.js Backend with AWS & K8s",
                  "Python Data Engineer based in India",
                  "Frontend Architect with glassmorphism skills"
              ].map(q => (
                  <button 
                  key={q}
                  onClick={() => { setQuery(q); handleSearch(); }}
                  className="px-6 py-3 text-xs font-black text-slate-400 border border-white/5 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-600/30 hover:text-white transition-all transform hover:-translate-y-1"
                >
                  &quot;{q}&quot;
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
