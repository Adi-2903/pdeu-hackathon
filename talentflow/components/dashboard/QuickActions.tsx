"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, Database, Globe, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const [ingesting, setIngesting] = useState<string | null>(null);
  const router = useRouter();

  const handleIngest = async (source: string, endpoint: string) => {
    setIngesting(source);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error("Ingestion error");
      
      const data = await res.json();
      toast.success(`Synced ${data.queued || 0} candidates from ${source}`, {
        description: "Refresh the dashboard in a few moments to see updates."
      });
      
      // Refresh the page data after a short delay
      setTimeout(() => {
        router.refresh();
      }, 2000);
      
    } catch (err) {
      toast.error(`Ingestion Failed: Could not trigger ${source} engine.`);
    } finally {
      setIngesting(null);
    }
  };

  const actions = [
    { label: "Pull Gmail", source: "Gmail", endpoint: "/api/ingest/gmail", icon: Mail },
    { label: "Pull Zoho", source: "Zoho", endpoint: "/api/ingest/apifly?source=zoho", icon: Database },
    { label: "Pull Merge", source: "Merge", endpoint: "/api/ingest/apifly?source=merge", icon: Globe },
    { label: "Pull Indeed", source: "Indeed", endpoint: "/api/ingest/indeed", icon: Linkedin },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.source}
          onClick={() => handleIngest(action.source, action.endpoint)}
          disabled={!!ingesting}
          className="bg-[#F97316] text-white rounded-lg px-4 py-2 hover:bg-[#EA6C0A] transition-all"
        >
          {ingesting === action.source ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <action.icon className="h-4 w-4 mr-2" />
          )}
          {ingesting === action.source ? `Syncing...` : action.label}
        </Button>
      ))}
    </div>
  );
}
