"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Mail, Globe, Loader2, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";

export default function IngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleExternalIngest = async (source: "gmail" | "indeed") => {
    setIngesting(source);
    try {
      const response = await fetch(`/api/ingest/${source}`, {
        method: "POST"
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(result.message || `Successfully synced ${source}`);
      } else {
        toast.error(`Error: ${result.error || "Ingestion failed"}`);
      }
    } catch (error) {
      toast.error(`Failed to trigger ${source} ingestion. Check your network connection.`);
      console.error(error);
    } finally {
      setIngesting(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/ingest/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        toast.success("File uploaded and queued for AI processing.");
        setFile(null);
      } else {
        toast.error(`Upload Error: ${result.error}`);
      }
    } catch (error) {
      toast.error("Upload failed. Check your network connection and try again.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tighter flex items-center gap-4">
          <Upload className="h-10 w-10 lg:h-12 lg:w-12 text-indigo-400" />
          Ingestion
        </h1>
        <p className="text-slate-400 text-lg font-medium max-w-3xl">
          Add candidates to TalentFlow via resume upload or MCP sources. All files are AI-parsed and indexed for semantic search.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden rounded-3xl group hover:border-indigo-500/20 transition-all">
          <CardHeader>
            <div className="p-3 bg-indigo-500/10 rounded-2xl w-fit mb-3 group-hover:bg-indigo-500/20 transition-colors">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
            <CardTitle className="text-white text-xl font-bold">Resume Upload</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Upload a PDF resume to parse with Claude and index for search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="resume" className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">PDF File</Label>
              <div className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                ${file ? 'border-indigo-500/30 bg-indigo-500/5' : 'border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}
              `}>
                <Input 
                  id="resume" 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-indigo-400 mx-auto" />
                    <p className="text-sm font-bold text-indigo-300 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-sm text-slate-500 font-medium">Click or drag to upload a PDF</p>
                  </div>
                )}
              </div>
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-900/20 hover:scale-[1.02] active:scale-95"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                "Upload & Queue"
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-white/5 backdrop-blur-md overflow-hidden rounded-3xl group hover:border-purple-500/20 transition-all">
          <CardHeader>
            <div className="p-3 bg-purple-500/10 rounded-2xl w-fit mb-3 group-hover:bg-purple-500/20 transition-colors">
              <Globe className="h-6 w-6 text-purple-400" />
            </div>
            <CardTitle className="text-white text-xl font-bold">External Sources</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Trigger background sync from connected MCP integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <Button 
                variant="outline"
                onClick={() => handleExternalIngest("gmail")}
                disabled={!!ingesting}
                className="w-full h-14 bg-white/5 border-white/5 text-white hover:bg-indigo-500/10 hover:border-indigo-500/30 hover:text-indigo-300 rounded-2xl transition-all font-bold text-sm"
              >
                {ingesting === "gmail" ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Syncing Gmail...</>
                ) : (
                  <><Mail className="h-5 w-5 mr-2 text-indigo-400" /> Sync Gmail</>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleExternalIngest("indeed")}
                disabled={!!ingesting}
                className="w-full h-14 bg-white/5 border-white/5 text-white hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300 rounded-2xl transition-all font-bold text-sm"
              >
                {ingesting === "indeed" ? (
                  <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Syncing Indeed...</>
                ) : (
                  <><Globe className="h-5 w-5 mr-2 text-purple-400" /> Sync Indeed</>
                )}
              </Button>
            </div>
            <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Requires configured MCP Bridge with valid tokens in your environment variables.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
