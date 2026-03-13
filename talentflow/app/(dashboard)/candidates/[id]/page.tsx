"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
    ArrowLeft, MapPin, Briefcase, GraduationCap, 
    Calendar, Mail, Phone, History, Sparkles, 
    ExternalLink, PlusCircle, ClipboardList 
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Experience {
  company: string;
  title: string;
  years: number;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  skills: string[];
  experience_years: number;
  education: Education[];
  work_history: Experience[];
  source: string;
  sources: string[];
  created_at: string;
}

export default function CandidateProfilePage() {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchCandidate();
      fetchApplications();
    }
  }, [id]);

  const fetchCandidate = async () => {
    try {
      const { data, error } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCandidate(data);
    } catch (err) {
      console.error("Error fetching candidate:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
       const { data, error } = await supabase
         .from("applications")
         .select(`*, jobs (title, status)`)
         .eq("candidate_id", id);
       
       if (!error) setApplications(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case "gmail":
      case "indeed": return "bg-teal-500/10 text-teal-400 border-teal-500/20";
      case "merge_ats":
      case "zoho": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "resume_upload": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "linkedin": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-8 animate-pulse">
        <div className="h-8 w-32 bg-slate-900 rounded" />
        <div className="flex gap-8">
            <div className="h-32 w-32 rounded-full bg-slate-900" />
            <div className="flex-1 space-y-4">
                <div className="h-10 w-2/3 bg-slate-900 rounded" />
                <div className="h-4 w-1/3 bg-slate-900 rounded" />
            </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return <div className="text-center py-20 text-slate-400">Candidate not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-12">
      {/* Top Nav */}
      <Link href="/candidates" className="text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Talent Pool
      </Link>

      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-indigo-500/20">
          {getInitials(candidate.full_name)}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-4xl font-black text-white">{candidate.full_name}</h1>
              <p className="text-xl text-slate-400 font-medium">{candidate.headline}</p>
            </div>
            
            <div className="flex gap-2">
                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Interview
                </button>
                <button className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/5 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Shortlist
                </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-slate-400">
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-500" /> {candidate.location}</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> {candidate.email}</span>
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-500" /> {candidate.phone}</span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
             {candidate.sources?.map(src => (
               <Badge key={src} className={`${getSourceColor(src)} border uppercase text-[10px] tracking-wider`}>
                 {src.replace("_", " ")}
               </Badge>
             ))}
          </div>
        </div>
      </div>

      <Separator className="bg-white/5" />

      <div className="grid lg:grid-cols-[2fr_1fr] gap-12">
        <div className="space-y-12">
            {/* Skills */}
            <section className="space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Technical Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                    {candidate.skills.map(skill => (
                        <Badge key={skill} className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 transition-all px-3 py-1 text-sm">
                            {skill}
                        </Badge>
                    ))}
                </div>
            </section>

            {/* Experience */}
            <section className="space-y-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-indigo-400" />
                    Work History
                </h3>
                <div className="relative pl-8 space-y-8 before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-white/5">
                    {candidate.work_history?.map((exp, idx) => (
                        <div key={idx} className="relative">
                            <div className="absolute -left-10 top-1 h-3 w-3 rounded-full bg-indigo-600 border-4 border-slate-950" />
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-white">{exp.title}</h4>
                                <p className="text-indigo-400 font-medium">{exp.company}</p>
                                <p className="text-sm text-slate-500">{exp.years} Years</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Education */}
            <section className="space-y-6">
                 <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-emerald-400" />
                    Education
                </h3>
                <div className="grid gap-4">
                    {candidate.education?.map((edu, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/30 border border-white/5 rounded-xl">
                            <h4 className="font-bold text-white">{edu.degree}</h4>
                            <p className="text-slate-400 text-sm">{edu.institution} • {edu.year}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        <aside className="space-y-12">
            {/* Merged History */}
            <section className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <History className="h-4 w-4 text-slate-500" />
                    Source History
                </h3>
                <div className="space-y-3">
                    {candidate.sources?.map((src, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                            <div className={`h-2 w-2 rounded-full ${getSourceColor(src).split(" ")[0].replace("/10", "")}`} />
                            <div className="text-xs">
                                <p className="text-slate-300 font-bold capitalize">{src.replace("_", " ")}</p>
                                <p className="text-slate-500">Imported into TalentFlow</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Applications */}
            <section className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-slate-500" />
                    Job Pipeline
                </h3>
                <div className="space-y-3">
                    {applications.length > 0 ? applications.map((app, i) => (
                        <div key={i} className="p-4 bg-indigo-600/5 border border-indigo-500/10 rounded-xl space-y-2">
                            <h4 className="text-sm font-bold text-white leading-tight">{app.jobs.title}</h4>
                            <Badge className="bg-indigo-500/10 text-indigo-400 text-[10px] border-none uppercase tracking-tighter">
                                {app.status}
                            </Badge>
                        </div>
                    )) : (
                        <div className="text-xs text-slate-600 border border-dashed border-white/5 p-4 rounded-xl text-center">
                            No active applications.
                        </div>
                    )}
                </div>
            </section>
        </aside>
      </div>
    </div>
  );
}
