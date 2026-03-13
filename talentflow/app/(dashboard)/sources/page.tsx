"use client";

import { Database, ArrowRight, Server, Globe, Link2, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SourcesPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Sources</h1>
        <p className="text-gray-500 font-medium">Manage and configure your unified candidate pipelines</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-white rounded-3xl border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-50 pb-6 bg-gradient-to-r from-white to-orange-50/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Active Integrations</CardTitle>
                <CardDescription className="text-gray-500 font-medium">Unified data stream status</CardDescription>
              </div>
              <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-xl font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
                <Plus className="h-4 w-4 mr-2" />
                Add Source
              </Button>
            </div>
          </CardHeader>
          <CardContent className="py-24 text-center space-y-6">
            <div className="bg-orange-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-sm group">
              <Database className="h-10 w-10 text-orange-200 group-hover:text-[#F97316] transition-all group-hover:scale-110" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Advanced Source Management</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                Detailed webhook configuration and custom mapping tools are being synchronized. Use the Ingestion dashboard for active discovery.
              </p>
            </div>
            <div className="flex items-center justify-center gap-4">
              <Link href="/ingestion">
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-orange-50 hover:border-orange-200 rounded-xl h-11 px-6 font-bold transition-all">
                  Go to Ingestion
                </Button>
              </Link>
              <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-xl h-11 px-6 font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
                Visit Documentation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[
             { name: "Gmail MCP", icon: Server, status: "Active" },
             { name: "Indeed API", icon: Globe, status: "Development" },
             { name: "Merge.dev", icon: Link2, status: "Config Required" }
           ].map((s, i) => (
             <Card key={i} className="bg-white rounded-2xl border-gray-200 p-6 flex flex-col items-center text-center space-y-4 hover:border-orange-200 transition-all group cursor-not-allowed opacity-60">
                <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#F97316] group-hover:bg-[#F97316] group-hover:text-white transition-all">
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                   <h4 className="font-bold text-gray-900 text-sm">{s.name}</h4>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{s.status}</p>
                </div>
             </Card>
           ))}
        </div>
      </div>
    </div>
  );
}

