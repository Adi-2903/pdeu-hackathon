"use client";

import { ArrowLeft, ListChecks, Users, Star, Share2, MoreVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ShortlistDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* NAVIGATION */}
      <Link href="/shortlists" className="text-gray-500 hover:text-[#F97316] flex items-center gap-2 transition-colors group font-medium text-sm">
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Back to Shortlists
      </Link>

      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Shortlist Details</h1>
          <p className="text-gray-500 font-medium lowercase">Analyzing shortlist: <span className="font-mono text-[#F97316] uppercase">{params.id}</span></p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="border-gray-200 text-gray-600 rounded-xl h-10 px-4 hover:bg-orange-50 font-bold">
             <Share2 className="h-4 w-4 mr-2" />
             Share
           </Button>
           <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-xl h-10 px-4 font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
             Review All
           </Button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <Card className="bg-white rounded-3xl border-gray-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-gray-50 pb-6 bg-gradient-to-r from-white to-orange-50/20">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Star className="h-6 w-6 text-[#F97316]" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Ranked Talent Pool</CardTitle>
              <CardDescription className="text-gray-500 font-medium">Coming soon after the next ingestion cycle</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-24 text-center space-y-6">
          <div className="bg-orange-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-sm group">
            <ListChecks className="h-10 w-10 text-orange-200 group-hover:text-[#F97316] transition-all group-hover:scale-110" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Advanced Shortlist Views</h3>
            <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
              Comparative data grids and automated candidate re-ranking against updated job descriptions will be available in Phase 6.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

