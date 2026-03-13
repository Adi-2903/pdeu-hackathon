"use client";

import { useEffect, useState } from "react";
import { 
  ListFilter, 
  Loader2, 
  Sparkles, 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  User, 
  ArrowRight,
  Save,
  Clock,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

interface ShortlistResult {
  candidate_id: string;
  score: number;
  reason: string;
  candidate: {
    id: string;
    full_name: string;
    headline: string;
    skills: string[];
  };
}

const supabase = createClient();

export default function ShortlistPage() {
  const [jd, setJd] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [isScoring, setIsScoring] = useState(false);
  const [results, setResults] = useState<ShortlistResult[] | null>(null);
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [lastScoredAt, setLastScoredAt] = useState<Date | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, title")
      .eq("status", "open");
    setJobs(data || []);
  };

  const handleScoreCandidates = async () => {
    if (jd.length < 50) {
      toast.error("Job description must be at least 50 characters long");
      return;
    }

    setIsScoring(true);
    setResults(null);
    try {
      const response = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          job_description: jd,
          job_id: selectedJobId || undefined 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Scoring failed");
      }

      const data = await response.json();
      setResults(data.results);
      setLastScoredAt(new Date());
      toast.success(`Successfully scored ${data.results.length} candidates!`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong during scoring");
    } finally {
      setIsScoring(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-700 border-green-200";
    if (score >= 50) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-50 text-red-600 border-red-100";
  };

  const sortedResults = results ? [...results].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    return a.candidate.full_name.localeCompare(b.candidate.full_name);
  }) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
      {/* LEFT PANEL: INPUTS */}
      <Card className="bg-white rounded-xl border-gray-200 shadow-sm sticky top-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            Score Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Assign to Job (Optional)</label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full bg-white border-gray-200 rounded-lg">
                <SelectValue placeholder="Select a job position..." />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Job Description</label>
            <Textarea 
              placeholder="Paste job description here...&#10;&#10;Example: Senior Backend Engineer — Node.js, 5+ years, fintech preferred, remote"
              className="min-h-64 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-xl text-sm leading-relaxed p-4"
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 font-medium">Min 50 characters required for AI analysis.</p>
          </div>

          <div className="pt-2">
            <Button 
              className="w-full bg-[#F97316] hover:bg-[#EA6C0A] text-white py-6 h-auto rounded-xl font-bold text-base shadow-lg shadow-orange-100 transition-all active:scale-95 disabled:opacity-50"
              onClick={handleScoreCandidates}
              disabled={isScoring || jd.length < 50}
            >
              {isScoring ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Analyzing Resumes...
                </>
              ) : (
                "Score All Candidates"
              )}
            </Button>
            
            {isScoring && (
              <div className="mt-4 space-y-2">
                <Progress value={45} className="h-1 bg-orange-100 [&>div]:bg-orange-500" />
                <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest text-center animate-pulse">
                  Powered by Claude AI · ~10 seconds
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT PANEL: RESULTS */}
      <Card className="bg-white rounded-xl border-gray-200 shadow-sm min-h-[600px]">
        <CardHeader className="border-b border-gray-50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl font-bold text-gray-900">Top Match Candidates</CardTitle>
              {results && (
                <Badge className="bg-[#F97316] text-white rounded-full px-2.5 py-0.5 text-xs font-bold border-none">
                  {results.length}
                </Badge>
              )}
            </div>
            {results && lastScoredAt && (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                Scored {formatDistanceToNow(lastScoredAt)} ago
              </span>
            )}
          </div>
          
          {results && (
            <div className="flex items-center gap-6 mt-6 border-b border-transparent">
              <button 
                onClick={() => setSortBy("score")}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${sortBy === "score" ? "text-[#F97316] border-[#F97316]" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              >
                By AI Score
              </button>
              <button 
                onClick={() => setSortBy("name")}
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${sortBy === "name" ? "text-[#F97316] border-[#F97316]" : "text-gray-400 border-transparent hover:text-gray-600"}`}
              >
                By Name
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {!results && !isScoring ? (
            <div className="flex flex-col items-center justify-center py-40 text-center space-y-4 px-10">
              <div className="h-16 w-16 bg-orange-50 rounded-full flex items-center justify-center">
                <ListFilter className="h-8 w-8 text-orange-200" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-800">Ready to shortlist?</h3>
                <p className="text-sm text-gray-400 max-w-xs font-medium">
                  Paste a job description on the left to see which candidates from your pool fit the role best.
                </p>
              </div>
            </div>
          ) : isScoring ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gray-50/50 rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {sortedResults.map((res, index) => (
                <div key={res.candidate_id} className="p-6 flex flex-col md:flex-row items-start gap-6 hover:bg-orange-50/10 transition-colors">
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-lg font-black text-orange-500 w-6 italic">#{index + 1}</span>
                    <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm ring-4 ring-orange-50">
                      {res.candidate.full_name?.split(" ").map(n => n[0]).join("") || "C"}
                    </div>
                  </div>

                  <div className="flex-1 space-y-3 min-w-0">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg tracking-tight">{res.candidate.full_name}</h4>
                      <p className="text-sm text-gray-500 font-medium truncate">{res.candidate.headline}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {res.candidate.skills.slice(0, 4).map(skill => (
                        <Badge key={skill} className="bg-orange-50 text-orange-600 border border-orange-100 rounded-lg text-[10px] font-bold px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-xs italic text-gray-500 font-medium leading-relaxed bg-[#FFF7F2] p-3 rounded-xl border border-orange-50/50">
                      &ldquo;{res.reason}&rdquo;
                    </p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 w-full md:w-32 shrink-0 md:border-l border-gray-50 md:pl-6">
                    <div className={`px-4 py-2 rounded-2xl border text-center w-full md:w-auto ${getScoreColor(res.score)}`}>
                      <span className="text-xl font-black">{res.score}%</span>
                    </div>
                    <div className="flex flex-wrap gap-2 md:w-full">
                       <Button variant="outline" className="h-8 text-[10px] font-bold uppercase border-green-500 text-green-600 hover:bg-green-50 rounded-lg px-2 flex-1 md:w-full">Approve</Button>
                       <Button variant="outline" className="h-8 text-[10px] font-bold uppercase border-red-400 text-red-500 hover:bg-red-50 rounded-lg px-2 flex-1 md:w-full">Reject</Button>
                       <Button className="h-8 text-[10px] font-bold uppercase bg-orange-500 text-white rounded-lg px-2 flex-1 md:w-full shadow-sm shadow-orange-100">Schedule</Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="p-8 flex items-center justify-center">
                <Button variant="outline" className="border-[#F97316] text-[#F97316] hover:bg-orange-50 rounded-xl px-10 py-6 h-auto font-bold text-sm transition-all shadow-sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Final Shortlist
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
