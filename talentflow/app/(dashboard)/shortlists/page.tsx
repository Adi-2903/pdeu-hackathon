"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Calendar, Sparkles, ClipboardList, User } from "lucide-react";
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
      toast.error("Please provide a more detailed job description (min 50 chars)");
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
        toast.success(`Analysis complete. Ranked ${data.results.length} candidates.`);
      } else {
        toast.error(data.error || "Analysis failed");
      }
    } catch (err) {
      toast.error("Failed to connect to shortlisting engine");
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
    <div className="max-w-6xl mx-auto space-y-8 py-8 px-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
          <Sparkles className="text-purple-400 h-8 w-8" />
          AI Shortlisting
        </h1>
        <p className="text-slate-400 text-lg">
          Paste a job description to instantly rank your entire candidate database using AI.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-indigo-400" />
                Job Description
              </CardTitle>
              <CardDescription className="text-slate-500">
                Detailed JD helps Claude provide more accurate scores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Senior Backend Engineer... Requirements: 5+ years Node.js, experience with Kubernetes and high-scale systems..."
                className="w-full min-h-[300px] p-4 bg-slate-950 border-white/5 text-slate-200 rounded-xl focus:ring-purple-500/20 focus:border-purple-500/30 transition-all resize-none text-sm leading-relaxed"
              />
              <Button 
                onClick={handleShortlist}
                disabled={loading || jd.length < 50}
                className="w-full bg-indigo-600 hover:bg-indigo-500 py-6 text-base font-bold shadow-lg shadow-indigo-900/20 rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Database...
                  </>
                ) : (
                  "Rank Candidates"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {!loading && results.length === 0 && (
            <div className="h-[500px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="bg-slate-900 p-6 rounded-full">
                <Sparkles className="h-12 w-12 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-slate-300">Ready to Shortlist</h3>
              <p className="text-slate-500 max-w-xs">
                Enter a job description on the left to start the AI analysis of your candidate pool.
              </p>
            </div>
          )}

          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-slate-900/30 border border-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-white font-bold text-xl">
                  Ranked Candidates ({results.length})
                </h2>
                <Badge variant="outline" className="text-slate-400 border-white/10">
                  Top 50 Displayed
                </Badge>
              </div>

              {results.map((res) => (
                <Card key={res.candidate_id} className="bg-slate-900/40 border-white/5 hover:border-white/10 transition-all group overflow-hidden backdrop-blur-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-800 rounded-lg">
                              <User className="h-5 w-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">
                                    {res.candidate.full_name}
                                </h3>
                                <p className="text-sm text-slate-400 font-medium">{res.candidate.headline}</p>
                            </div>
                          </div>
                          
                          <Badge className={`${getScoreColor(res.score)} px-3 py-1 text-sm font-black rounded-lg border`}>
                            {res.score}% Match
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {res.candidate.skills.slice(0, 4).map(skill => (
                            <Badge key={skill} variant="secondary" className="bg-slate-800/50 text-slate-400 text-[10px] font-bold tracking-wider uppercase border-none">
                              {skill}
                            </Badge>
                          ))}
                        </div>

                        <div className="bg-indigo-500/5 border-l-2 border-indigo-500/30 p-3 rounded-r-lg">
                          <p className="text-xs text-indigo-200/80 italic leading-relaxed">
                            "{res.reason}"
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-4 min-w-[140px]">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-xs w-full font-bold">
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Approve
                        </Button>
                        <Button size="sm" variant="outline" className="border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs w-full font-bold">
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Reject
                        </Button>
                        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white text-xs w-full font-bold">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          Interview
                        </Button>
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
