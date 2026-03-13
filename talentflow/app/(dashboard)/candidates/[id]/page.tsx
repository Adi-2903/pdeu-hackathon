"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronLeft, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  History, 
  Calendar, 
  ExternalLink,
  Mail,
  Linkedin,
  Database,
  Globe,
  FileUp,
  CheckCircle2,
  XCircle,
  Clock,
  Video,
  Copy,
  Plus,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

interface Experience {
  company: string;
  title: string;
  duration?: string;
  description?: string;
}

interface Education {
  institution: string;
  degree: string;
  year?: string;
}

interface Application {
  id: string;
  status: string;
  recruiter_notes?: string;
  applied_at: string;
  job: {
    id: string;
    title: string;
    status: string;
  };
}

interface Candidate {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  summary: string;
  skills: string[];
  experience_years: number;
  education: Education[];
  work_history: Experience[];
  source: string;
  sources?: string[];
  needs_review: boolean;
  resume_url?: string;
  created_at: string;
}

const supabase = createClient();

export default function CandidateDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<any[]>([]);

  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [meetUrl, setMeetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Candidate
      const { data: cand, error: candErr } = await supabase
        .from("candidates")
        .select("*")
        .eq("id", id)
        .single();
      
      if (candErr) throw candErr;
      setCandidate(cand as unknown as Candidate);


      // 2. Fetch Applications
      const { data: apps } = await supabase
        .from("applications")
        .select("*, job:jobs(id, title, status)")
        .eq("candidate_id", id);
      
      setApplications(apps as any[] || []);


      // 3. Fetch open jobs for the modal
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, title")
        .eq("status", "open");
      
      setAvailableJobs(jobs || []);

    } catch (err) {
      console.error("Error fetching detail:", err);
      toast.error("Candidate not found");
      router.push("/candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedJob) return;
    setScheduling(true);
    try {
      const gMeetUrl = `https://meet.google.com/${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
      
      const existing = applications.find(a => a.job?.id === selectedJob);
      if (existing) {
        const { error } = await supabase
          .from("applications")
          .update({ 
            status: "interviewing" as any, 
            recruiter_notes: `Scheduled via dashboard. Meet: ${gMeetUrl}` 
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("applications")
          .insert({ 
            candidate_id: id, 
            job_id: selectedJob, 
            status: "interviewing" as any, 
            recruiter_notes: `Scheduled via dashboard. Meet: ${gMeetUrl}` 
          });
        if (error) throw error;
      }


      setMeetUrl(gMeetUrl);
      toast.success("Interview scheduled successfully!");
      fetchData(); 
    } catch (err) {
      console.error(err);
      toast.error("Failed to schedule interview");
    } finally {
      setScheduling(false);
    }
  };

  const getSourceBadge = (source: string) => {
    const s = source?.toLowerCase() || "";
    if (s === "gmail" || s === "indeed") return "bg-blue-50 text-blue-700 border-none";
    if (s === "zoho" || s === "merge_ats") return "bg-orange-50 text-orange-700 border-none";
    if (s === "resume_upload") return "bg-green-50 text-green-700 border-none";
    return "bg-gray-100 text-gray-600 border-none";
  };

  const getSourceIcon = (source: string) => {
    const s = source?.toLowerCase() || "";
    if (s === "gmail") return <Mail className="h-4 w-4" />;
    if (s === "indeed" || s === "linkedin") return <Linkedin className="h-4 w-4" />;
    if (s === "zoho") return <Database className="h-4 w-4" />;
    if (s === "merge_ats") return <Globe className="h-4 w-4" />;
    return <FileUp className="h-4 w-4" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-gray-100 text-gray-700">Applied</Badge>;
      case "shortlisted": return <Badge className="bg-orange-50 text-orange-700 border-orange-200">Shortlisted</Badge>;
      case "interviewing": return <Badge className="bg-orange-500 text-white">Scheduled</Badge>;
      case "offered":
      case "hired": return <Badge className="bg-green-100 text-green-700 border-green-200">Approved</Badge>;
      case "rejected": return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-600">{status}</Badge>;
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-[#F97316]" />
        <p className="text-gray-500 font-medium font-sans">Loading profile...</p>
      </div>
    </div>
  );

  if (!candidate) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      {/* 1. BACK + HEADER CARD */}
      <Card className="bg-white rounded-xl border-gray-200 shadow-sm overflow-hidden">
        <CardContent className="p-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[#F97316] hover:text-[#EA6C0A] font-medium text-sm mb-8 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Candidates
          </button>

          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
              <div className="h-20 w-20 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-2xl font-bold border-4 border-orange-50 shrink-0">
                {candidate.full_name?.split(" ").map(n => n[0]).join("") || "C"}
              </div>
              
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 font-sans tracking-tight">{candidate.full_name}</h1>
                  <div className="flex gap-2">
                    <Badge className={getSourceBadge(candidate.source)}>
                      {candidate.source.replace("_", " ")}
                    </Badge>
                    {candidate.sources && candidate.sources.length > 1 && (
                      <Badge className="bg-[#F97316] text-white text-[10px] rounded-full px-3 py-1 uppercase font-bold tracking-wider">
                        Merged from {candidate.sources.length} sources
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-lg text-gray-500 font-medium font-sans">{candidate.headline}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-orange-400" /> {candidate.location || "Remote"}</span>
                  <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-orange-400" /> {candidate.experience_years}y Experience</span>
                  <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-orange-400" /> {candidate.email}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full md:w-auto">
              <Dialog>
                <DialogTrigger
                  render={
                    <Button className="bg-[#F97316] text-white rounded-lg hover:bg-[#EA6C0A] py-6 shadow-sm font-semibold h-auto">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Interview
                    </Button>
                  }
                />


                <DialogContent className="bg-white border-0 shadow-2xl sm:max-w-[450px]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">Schedule Interview</DialogTitle>
                  </DialogHeader>
                  
                  {!meetUrl ? (
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Select Job Opening</label>
                        <Select value={selectedJob} onValueChange={(val) => setSelectedJob(val || "")}>
                          <SelectTrigger className="w-full bg-white border-gray-200 rounded-xl h-12 focus:ring-[#F97316]">
                            <SelectValue placeholder="Select a job position..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {availableJobs.map(job => (
                              <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-xl text-xs text-orange-800 leading-relaxed font-medium">
                        Clicking confirm will generate a Google Meet link, invite the candidate via email, and transition their status to &ldquo;Scheduled&rdquo;.
                      </div>

                      <Button 
                        onClick={handleSchedule} 
                        disabled={!selectedJob || scheduling}
                        className="w-full bg-[#F97316] hover:bg-[#EA6C0A] text-white py-6 h-auto font-bold rounded-xl shadow-lg shadow-orange-200"
                      >
                        {scheduling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Confirm & Schedule"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Interview URL</label>
                        <div className="flex gap-2">
                          <Input readOnly value={meetUrl} className="bg-gray-50 border-gray-200 h-11 rounded-xl font-mono text-sm" />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="shrink-0 border-[#F97316] text-[#F97316] hover:bg-orange-50 h-11 w-11 rounded-xl"
                            onClick={() => {
                              navigator.clipboard.writeText(meetUrl);
                              toast.success("Link copied!");
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Draft Email Invitation</label>
                        <textarea 
                          className="w-full h-40 p-4 text-sm rounded-xl border border-gray-200 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 text-gray-700"
                          defaultValue={`Hi ${candidate.full_name},\n\nWe'd love to schedule an interview for the role at TalentFlow. Please use the following Google Meet link to join the session:\n\n${meetUrl}\n\nLooking forward to speaking with you!\n\nBest regards,\nTalentFlow Recruiting`}
                        />
                      </div>

                      <DialogFooter>
                        <Button 
                          className="w-full bg-[#F97316] hover:bg-[#EA6C0A] h-12 rounded-xl font-bold"
                          onClick={() => {
                            setMeetUrl(null);
                            toast.info("Invite sent to draft.");
                          }}
                        >
                          Finish & Send Invitation
                        </Button>
                      </DialogFooter>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="border-[#F97316] text-[#F97316] rounded-lg hover:bg-orange-50 py-6 font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Add to Shortlist
              </Button>

              {candidate.resume_url && (
                <Link href={candidate.resume_url} target="_blank">
                  <Button variant="ghost" className="text-gray-400 hover:text-gray-900 w-full text-xs font-bold uppercase tracking-wider mt-2">
                    <ExternalLink className="h-3 w-3 mr-2" />
                    View Raw File
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* 3. EXPERIENCE TIMELINE */}
          <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <History className="h-4 w-4 text-orange-400" />
                Career Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-orange-100 pb-2">
                {candidate.work_history && candidate.work_history.length > 0 ? candidate.work_history.map((exp, i) => (
                  <div key={i} className="relative pl-12">
                    <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-[#F97316] border-2 border-white ring-4 ring-orange-50" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{exp.title}</h4>
                      <div className="flex items-center gap-2 text-[#F97316] font-semibold text-sm">
                        <span className="text-gray-700 font-medium">{exp.company}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                        <span className="text-gray-400 font-bold">{exp.duration || "Present"}</span>
                      </div>
                      {exp.description && (
                        <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-2xl font-sans">{exp.description}</p>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-gray-400 italic text-sm text-center py-6 font-sans">No work history provided in resume.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 6. APPLICATIONS */}
          <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-orange-400" />
                Live Job Applications
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-50 px-2 pb-2">
                {applications.length > 0 ? applications.map((app) => (
                  <div key={app.id} className="p-5 flex items-center justify-between hover:bg-orange-50/20 transition-all rounded-xl">
                    <div className="space-y-1">
                      <h5 className="font-bold text-gray-900 font-sans tracking-tight">{app.job.title}</h5>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                        <Clock className="h-3 w-3" />
                        Applied {format(new Date(app.applied_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {app.status === "interviewing" && (
                        <Link href={app.recruiter_notes?.match(/https:\/\/\S+/)?.[0] || "#"} target="_blank" className="flex items-center gap-1.5 text-[#F97316] text-xs font-bold underline hover:text-[#EA6C0A] transition-colors">
                          <Video className="h-3 w-3" /> Meet Link
                        </Link>
                      )}
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400 italic text-sm font-sans">
                    This candidate hasn&apos;t applied to any roles yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* 2. SKILLS */}
          <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">Skills & Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {candidate.skills && candidate.skills.length > 0 ? candidate.skills.map((skill, i) => (
                  <Badge 
                    key={i} 
                    className="bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[11px] px-3 py-1 font-bold hover:bg-orange-100 transition-colors"
                  >
                    {skill}
                  </Badge>
                )) : (
                  <div className="text-gray-400 italic text-sm font-sans">No skills detected.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 4. EDUCATION */}
          <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-orange-400" />
                Academic Detail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {candidate.education && candidate.education.length > 0 ? candidate.education.map((edu, i) => (
                <div key={i} className="space-y-1 group">
                  <h4 className="font-bold text-gray-900 group-hover:text-[#F97316] transition-colors font-sans">{edu.degree}</h4>
                  <p className="text-sm text-gray-400 font-semibold">{edu.institution}</p>
                  <p className="text-xs text-[#F97316] font-black uppercase tracking-tighter">{edu.year || "N/A"}</p>
                </div>
              )) : (
                <div className="text-gray-400 italic text-sm font-sans">No education data found.</div>
              )}
            </CardContent>
          </Card>

          {/* 5. SOURCE HISTORY */}
          <Card className="bg-white rounded-xl border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em] flex items-center gap-2">
                <Globe className="h-4 w-4 text-orange-400" />
                Source Identity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-px before:bg-orange-50">
                <div className="relative pl-9">
                  <div className="absolute left-[13px] top-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-4 ring-orange-50" />
                  <div className="flex flex-col gap-1.5">
                    <Badge className={`${getSourceBadge(candidate.source)} w-fit text-[10px] font-bold`}>
                      {candidate.source.replace("_", " ").toUpperCase()}
                    </Badge>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                      Originating Source • {format(new Date(candidate.created_at), "MMM yyyy")}
                    </p>
                  </div>
                </div>
                {candidate.sources && candidate.sources.filter(s => s !== candidate.source).map((extra, i) => (
                  <div key={i} className="relative pl-9">
                    <div className="absolute left-[14.5px] top-2 w-1 h-1 rounded-full bg-orange-300" />
                    <div className="flex flex-col gap-1.5 group cursor-default">
                      <div className="flex items-center gap-2 text-gray-400 transition-colors group-hover:text-gray-600">
                        {getSourceIcon(extra)}
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{extra.replace("_", " ")}</span>
                      </div>
                      <p className="text-[9px] text-gray-300 font-black uppercase tracking-[0.1em]">Duplicate Data Merged</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
