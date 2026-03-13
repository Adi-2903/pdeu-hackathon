"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        alert(result.message);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert(`Failed to trigger ${source} ingestion.`);
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
        alert(`Success! File uploaded and queued for processing.`);
        setFile(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert("Failed to upload. Check console.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Ingestion</h1>
        <p className="text-slate-400">Add candidates to TalentFlow via resume upload or MCP sources.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Resume Upload</CardTitle>
            <CardDescription className="text-slate-400">
              Upload a PDF resume to parse with Claude and index for search.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-slate-200">PDF File</Label>
              <Input 
                id="resume" 
                type="file" 
                accept="application/pdf"
                onChange={handleFileChange}
                className="bg-slate-950 border-white/10 text-slate-200"
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!file || uploading}
              className="w-full bg-indigo-600 hover:bg-indigo-500"
            >
              {uploading ? "Processing..." : "Upload & Queue"}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">External Sources</CardTitle>
            <CardDescription className="text-slate-400">
              Trigger background sync from connected MCP integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                onClick={() => handleExternalIngest("gmail")}
                disabled={!!ingesting}
                className="bg-slate-950 border-white/10 text-white hover:bg-slate-800"
              >
                {ingesting === "gmail" ? "Syncing Gmail..." : "Sync Gmail"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleExternalIngest("indeed")}
                disabled={!!ingesting}
                className="bg-slate-950 border-white/10 text-white hover:bg-slate-800"
              >
                {ingesting === "indeed" ? "Syncing Indeed..." : "Sync Indeed"}
              </Button>
            </div>
            <div className="text-xs text-slate-500 italic text-center">
              Requires configured MCP Bridge with valid tokens in env.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
