"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Loader2, Sparkles, CheckCircle, XCircle, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ShortlistResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate: {
    id: string;
    full_name: string;
    headline: string;
    skills: string[];
    experience_years: number;
  };
}

export default function ShortlistingPage() {
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ShortlistResult[]>([]);

  const handleShortlist = async () => {
    if (jd.length < 50) {
      toast.error("Detailed job description required (min 50 chars)");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_description: jd }),
      });

      const data = await response.json();
      if (response.ok) {
        setResults(data.results);
        toast.success(`Analysis precision search complete: Ranked ${data.results.length} candidates.`);
      } else {
        toast.error(data.error || "Analysis engine failure");
      }
    } catch (err) {
      toast.error("Connection timeout: AI Shortlisting service unreachable");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    if (score >= 50) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    return "bg-rose-500/10 text-rose-400 border-rose-500/20";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
          <Sparkles className="text-indigo-400 h-10 w-10 lg:h-12 lg:w-12 animate-pulse" />
          AI Shortlisting
        </h1>
        <p className="text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-3xl">
          Instantly rank your entire candidate database against specific requirements. 
          Claude-3 analysis identifies the nuances that text-matching misses.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md sticky top-6 lg:top-10">
            <CardHeader>
              <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                Job Requirements
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Include skills, seniority, and specific tech stack for the best results.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste Job Description here... e.g. Senior Backend Engineer with Node.js and GCP experience..."
                className="w-full min-h-[400px] p-5 bg-slate-950/50 border-white/5 text-slate-200 rounded-2xl focus:ring-indigo-500/20 focus:border-indigo-500/30 transition-all resize-none text-sm leading-relaxed font-mono"
              />
              <Button 
                onClick={handleShortlist}
                disabled={loading || jd.length < 50}
                className="w-full h-14 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-black shadow-2xl shadow-indigo-900/30 rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    AI SCORING...
                  </>
                ) : (
                  "RANK POOL"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!loading && results.length === 0 && (
            <div className="h-[600px] border-2 border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center p-12 space-y-6 bg-slate-900/20">
              <div className="bg-slate-900 p-8 rounded-[2rem] shadow-inner">
                <Users className="h-16 w-16 text-slate-700 opacity-30" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Analysis Pipeline Ready</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">
                  Provide the job description on the left. The AI will cross-reference every candidate profile 
                  and produce a ranked shortlist with reasoning.
                </p>
              </div>
            </div>
          )}

          {loading && (
            <div className="space-y-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-slate-900/40 border border-white/5 rounded-[2rem] animate-pulse p-8 flex gap-6">
                   <div className="h-16 w-16 bg-white/5 rounded-2xl shrink-0" />
                   <div className="space-y-4 flex-1">
                      <div className="flex justify-between">
                        <div className="h-6 w-1/3 bg-white/5 rounded" />
                        <div className="h-8 w-16 bg-white/5 rounded-lg" />
                      </div>
                      <div className="h-4 w-1/2 bg-white/5 rounded" />
                      <div className="h-16 w-full bg-white/5 rounded-xl" />
                   </div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
              <div className="flex justify-between items-center px-4">
                <h2 className="text-white font-black text-2xl tracking-tight">
                  Ranked Shortlist ({results.length})
                </h2>
                <Badge className="bg-white/5 text-slate-400 border-white/10 font-black tracking-widest px-3 py-1">
                  TOP MATCHES
                </Badge>
              </div>

              {results.map((res) => (
                <Card key={res.candidate_id} className="bg-slate-900/40 border-white/10 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all group overflow-hidden backdrop-blur-sm rounded-[2rem]">
                  <CardContent className="p-8">
                    <div className="flex flex-col xl:flex-row gap-8">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center text-slate-300 font-black text-lg border border-white/5 group-hover:from-indigo-900 transition-all">
                              {res.candidate.full_name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white leading-tight group-hover:text-indigo-400 transition-colors tracking-tight">
                                    {res.candidate.full_name}
                                </h3>
                                <p className="text-sm text-slate-400 font-bold mt-1 tracking-wide">{res.candidate.headline}</p>
                            </div>
                          </div>
                          
                          <div className={`${getScoreColor(res.score)} px-4 py-2 text-xl font-black rounded-xl border tabular-nums shadow-lg`}>
                            {res.score}%
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {res.candidate.skills.slice(0, 5).map(skill => (
                            <Badge key={skill} className="bg-white/5 text-slate-400 text-[10px] font-black tracking-[0.15em] uppercase border-none px-2 py-1 rounded-md">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="bg-indigo-500/5 border-l-4 border-indigo-500/40 p-5 rounded-r-2xl mt-4 relative overflow-hidden group/reason">
                          <div className="absolute top-0 right-0 p-2 opacity-5">
                            <Sparkles className="h-10 w-10 text-indigo-400" />
                          </div>
                          <p className="text-sm text-indigo-100 font-medium leading-relaxed italic relative z-10 font-mono">
                            AI Verdict: &quot;{res.reason}&quot;
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row xl:flex-col gap-3 justify-center xl:border-l border-white/5 xl:pl-8 min-w-[180px]">
                        <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl w-full transition-all hover:scale-105">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          SHORTLIST
                        </Button>
                        <Button size="lg" variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 font-black rounded-xl w-full transition-all">
                          <XCircle className="h-4 w-4 mr-2" />
                          DISMISS
                        </Button>
                        <Link href={`/candidates/${res.candidate_id}`} className="w-full">
                            <Button size="lg" variant="ghost" className="text-slate-400 hover:text-white hover:bg-white/10 font-black rounded-xl w-full transition-all">
                            <Calendar className="h-4 w-4 mr-2" />
                            INTERVIEW
                            </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
