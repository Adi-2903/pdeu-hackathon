"use client";

import { useEffect, useState, useRef } from "react";
import { 
  UploadCloud, 
  Mail, 
  Briefcase, 
  Building2, 
  Database, 
  Users, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Clock, 
  ArrowRight,
  Server,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface SourceCard {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  last_synced_at: string | null;
  candidates_imported: number;
  icon: any;
}

interface IngestionLog {
  id: string;
  source: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at: string;
  finished_at: string | null;
  total_fetched: number;
  total_inserted: number;
  error_message: string | null;
  metadata?: {
    filename?: string;
  };
}

const SOURCE_CONFIG = [
  { type: "gmail", icon: Mail, label: "Gmail MCP" },
  { type: "indeed", icon: Briefcase, label: "Indeed MCP" },
  { type: "merge_ats", icon: Database, label: "Merge.dev ATS" },
  { type: "linkedin", icon: Users, label: "LinkedIn Mock" },
  { type: "zoho", icon: Building2, label: "Zoho Recruit" },
];

export default function IngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [sources, setSources] = useState<SourceCard[]>([]);
  const [logs, setLogs] = useState<IngestionLog[]>([]);
  const [loadingSources, setLoadingSources] = useState(true);
  const [pullingSource, setPullingSource] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSources();
    fetchLogs();
    
    const interval = setInterval(() => {
      fetchLogs();
    }, 30000);

    return () => clearInterval(interval);
  }, [page]);

  const fetchSources = async () => {
    setLoadingSources(true);
    const { data } = await supabase.from("sources").select("*");
    
    // Map icons and labels
    const mappedSources = (data || []).map(s => {
      const config = SOURCE_CONFIG.find(c => c.type === s.type) || { icon: Server, label: s.name };
      return { ...s, icon: config.icon, displayName: config.label };
    });

    // Add Zoho mock if not present in DB
    if (!mappedSources.some(s => s.type === "zoho")) {
      mappedSources.push({
        id: "mock-zoho",
        name: "Zoho Recruit",
        type: "zoho",
        is_active: false,
        last_synced_at: null,
        candidates_imported: 0,
        icon: Building2,
        displayName: "Zoho Recruit"
      } as any);
    }

    setSources(mappedSources);
    setLoadingSources(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("ingestion_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .range((page - 1) * 10, page * 10 - 1);
    setLogs(data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(10);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 500);

      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const result = await response.json();

      if (response.ok) {
        toast.success(`Resume parsed — ${result.candidate?.full_name || "Candidate"} added`);
        setFile(null);
        fetchLogs();
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload and parse resume");
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handlePullNow = async (sourceType: string) => {
    setPullingSource(sourceType);
    try {
      const response = await fetch(`/api/ingest/${sourceType}`, {
        method: "POST",
      });
      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || `Successfully synced ${sourceType}`);
        fetchSources();
        fetchLogs();
      } else {
        throw new Error(result.error || "Sync failed");
      }
    } catch (err: any) {
      toast.error(err.message || `Failed to sync ${sourceType}`);
    } finally {
      setPullingSource(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-100 text-green-700 border-green-200">SUCCESS</Badge>;
      case "failed": return <Badge className="bg-red-50 text-red-600 border-red-100">FAILED</Badge>;
      case "processing": return <Badge className="bg-orange-50 text-orange-600 border-orange-100 animate-pulse">PROCESSING</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-500 border-gray-200 uppercase">{status}</Badge>;
    }
  };

  const recentUploads = logs.filter(l => l.source === "resume_upload").slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Ingestion</h1>
        <p className="text-gray-500 font-medium">Pull candidates from all connected sources</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* LEFT COLUMN: UPLOAD */}
        <div className="space-y-6">
          <Card className="bg-white rounded-2xl border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#F97316]" />
                Resume Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer group
                  ${file ? 'border-[#F97316] bg-orange-50' : 'border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="application/pdf"
                  className="hidden"
                />
                <div className="space-y-4">
                  <div className="mx-auto h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8 text-[#F97316]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      {file ? file.name : "Drop PDF here or click to browse"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-medium">Supporting PDF files up to 10MB</p>
                  </div>
                </div>
              </div>

              {file && (
                <div className="bg-orange-50 rounded-xl px-4 py-3 flex items-center justify-between border border-orange-100">
                   <div className="flex items-center gap-3">
                     <FileText className="h-4 w-4 text-[#F97316]" />
                     <span className="text-sm font-bold text-[#F97316] truncate max-w-[200px]">{file.name}</span>
                   </div>
                   <button onClick={() => setFile(null)} className="text-[#F97316] hover:text-[#EA6C0A] p-1">
                     <XCircle className="h-4 w-4" />
                   </button>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="w-full bg-[#F97316] hover:bg-[#EA6C0A] text-white py-6 h-auto rounded-xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-95"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Uploading & Parsing...
                    </>
                  ) : (
                    "Upload & Parse"
                  )}
                </Button>

                {uploadProgress > 0 && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-1.5 bg-orange-100 [&>div]:bg-orange-500" />
                    <p className="text-[10px] text-center font-bold text-orange-500 uppercase tracking-widest animate-pulse">
                      Processing with AI...
                    </p>
                  </div>
                )}
              </div>

              {/* RECENT UPLOADS */}
              <div className="pt-4 space-y-4">
                <div className="flex items-center gap-2">
                   <div className="h-1 w-8 bg-orange-200 rounded-full" />
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recent Uploads</p>
                </div>
                <div className="space-y-2">
                  {recentUploads.length > 0 ? (
                    recentUploads.map(log => (
                      <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 group">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-orange-300 group-hover:text-orange-500 transition-colors" />
                          <span className="text-xs font-bold text-gray-600 truncate max-w-[180px]">
                            {log.metadata?.filename || "Resume document"}
                          </span>
                        </div>
                        <span className="text-[10px] font-medium text-gray-400">
                          {formatDistanceToNow(new Date(log.started_at))} ago
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No recent uploads found.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: SOURCES */}
        <div className="space-y-4">
          {sources.map(source => (
            <Card key={source.id} className="bg-white rounded-2xl border-gray-200 shadow-sm p-5 hover:border-orange-200 transition-all group">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#F97316] transition-all">
                   <source.icon className="h-6 w-6 text-[#F97316] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 truncate">{(source as any).displayName}</h4>
                    {source.is_active ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px] font-black tracking-tight border-green-200">CONNECTED</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-500 text-[10px] font-black tracking-tight border-gray-200">DISCONNECTED</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>{source.candidates_imported} Candidates</span>
                    <span>•</span>
                    <span>Last Synced: {source.last_synced_at ? formatDistanceToNow(new Date(source.last_synced_at)) + " ago" : "Never"}</span>
                  </div>
                </div>
                <Button 
                   onClick={() => handlePullNow(source.type)}
                   disabled={pullingSource === source.type || (!source.is_active && source.type !== "linkedin")}
                   className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-xl h-10 px-4 text-xs font-bold shadow-lg shadow-orange-100 transition-all shrink-0"
                >
                  {pullingSource === source.type ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Pull Now"
                  )}
                </Button>
              </div>
            </Card>
          ))}
          
          <div className="p-6 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center text-center space-y-3 opacity-60">
             <Plus className="h-6 w-6 text-gray-300" />
             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect New Source</p>
          </div>
        </div>
      </div>

      {/* BOTTOM: INGESTION LOG */}
      <Card className="bg-white rounded-3xl border-gray-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-white to-orange-50/20">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Activity</h3>
            <p className="text-sm text-gray-400 font-medium lowercase">Real-time status of all candidate discovery pipelines</p>
          </div>
          <button 
            onClick={() => fetchLogs()} 
            className="h-10 w-10 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-orange-400 hover:text-orange-600 hover:shadow-md transition-all active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow className="border-0 hover:bg-transparent">
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12 px-8">Source</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Count</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12">Status</TableHead>
                <TableHead className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] h-12 text-right px-8">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? (
                logs.map((log, i) => (
                  <TableRow key={log.id} className={`border-gray-50 hover:bg-orange-50/30 transition-colors ${i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'}`}>
                    <TableCell className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center font-bold text-[10px] text-orange-600">
                          {log.source.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-700 text-sm uppercase tracking-tight">
                          {log.source.replace("_", " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">+{log.total_inserted}</span>
                        <span className="text-[10px] font-medium text-gray-400 uppercase">Inserted</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.status)}
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex flex-col items-end">
                         <span className="text-sm font-bold text-gray-700">{new Date(log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         <span className="text-[10px] font-medium text-gray-400 uppercase">{new Date(log.started_at).toLocaleDateString()}</span>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                       <Loader2 className="h-8 w-8 animate-spin" />
                       <p className="text-xs font-bold uppercase tracking-widest">Fetching live logs...</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          {/* PAGINATION */}
          <div className="p-8 border-t border-gray-50 flex items-center justify-center gap-3">
            <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setPage(p => Math.max(1, p - 1))}
               disabled={page === 1}
               className="border-gray-200 text-gray-600 rounded-xl font-bold text-xs h-9 px-4 hover:bg-orange-50 hover:border-orange-200"
            >
              Previous
            </Button>
            <div className="bg-orange-50 text-[#F97316] rounded-lg h-9 w-9 flex items-center justify-center font-black text-xs">
              {page}
            </div>
            <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setPage(p => p + 1)}
               disabled={logs.length < 10}
               className="border-gray-200 text-gray-600 rounded-xl font-bold text-xs h-9 px-4 hover:bg-orange-50 hover:border-orange-200"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Plus(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
