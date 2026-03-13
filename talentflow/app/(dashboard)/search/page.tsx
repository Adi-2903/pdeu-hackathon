"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, User, MapPin, Briefcase, GraduationCap, ArrowRight } from "lucide-react";
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
        setError(data.error || "Search failed");
      }
    } catch (err) {
      setError("Failed to connect to search engine");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-8">
      {/* Search Header */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Candidate Intelligence
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Describe your ideal candidate in natural language. We'll search across all sources 
          using vector similarity and technical re-ranking.
        </p>

        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto mt-8 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. Senior React Developer with 5+ years fintech experience..."
            className="w-full pl-12 pr-32 py-8 text-lg bg-slate-900/50 border-white/10 text-white rounded-2xl focus:ring-purple-500/20 focus:border-purple-500/30 transition-all backdrop-blur-xl"
          />
          <Button 
            type="submit" 
            disabled={loading || query.length < 3}
            className="absolute right-2 top-2 bottom-2 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl transition-all font-semibold shadow-lg shadow-purple-900/20"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
          </Button>
        </form>
      </div>

      {/* Results Area */}
      <div className="space-y-6">
        {loading && (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900/30 border-white/5 animate-pulse overflow-hidden">
                <div className="h-40 bg-white/5" />
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/20 text-red-400 rounded-xl text-center">
            {error}
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid gap-6">
            {results.map((res) => (
              <Card key={res.candidate_id} className="bg-slate-900/40 border-white/10 hover:border-purple-500/30 transition-all group overflow-hidden backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-6 items-start">
                    <div className="h-16 w-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/10">
                      <User className="h-8 w-8" />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                            {res.candidate.full_name}
                          </h3>
                          <p className="text-slate-400 font-medium">{res.candidate.headline}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-purple-400">{res.score}%</div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Match Score</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {res.candidate.location}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-slate-500" />
                          {res.candidate.experience_years} Years
                        </div>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-400">
                          {res.candidate.source}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {res.candidate.skills.slice(0, 6).map((skill) => (
                          <Badge key={skill} className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20">
                            {skill}
                          </Badge>
                        ))}
                        {res.candidate.skills.length > 6 && (
                          <span className="text-xs text-slate-500 self-center">+{res.candidate.skills.length - 6} more</span>
                        )}
                      </div>

                      <div className="p-4 bg-purple-500/5 border-l-2 border-purple-500/30 rounded-r-lg mt-4">
                        <p className="text-sm text-slate-300 italic">
                          "{res.reason}"
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col justify-end">
                      <Link 
                        href={`/candidates/${res.candidate_id}`}
                        className="p-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
                      >
                        <ArrowRight className="h-6 w-6" />
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl space-y-4 shadow-inner">
            <div className="bg-slate-800/50 h-20 w-20 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-slate-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">No candidates matched your search</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                Try a more general description or check if you have candidates imported from your sources.
              </p>
            </div>
            <div className="pt-6 flex flex-wrap justify-center gap-3">
              <button 
                onClick={() => { setQuery("Expert Frontend Developer"); handleSearch(); }}
                className="px-4 py-2 text-xs font-bold text-slate-400 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-all"
              >
                "Expert Frontend Developer"
              </button>
              <button 
                onClick={() => { setQuery("Node.js Backend with AWS"); handleSearch(); }}
                className="px-4 py-2 text-xs font-bold text-slate-400 border border-white/10 rounded-full hover:bg-white/5 hover:text-white transition-all"
              >
                "Node.js Backend with AWS"
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
