"use client";

import { Settings as SettingsIcon, Shield, Sliders, Bell, Globe, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* PAGE HEADER */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 font-medium">Configure your TalentFlow workspace and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* SIDEBAR NAVIGATION */}
        <div className="space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-2 bg-orange-50 text-[#F97316] border-l-4 border-[#F97316] font-bold text-sm rounded-r-lg">
            <Sliders className="h-4 w-4" />
            General
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm rounded-lg transition-all">
            <Bell className="h-4 w-4" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm rounded-lg transition-all">
            <Shield className="h-4 w-4" />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 font-medium text-sm rounded-lg transition-all">
            <Globe className="h-4 w-4" />
            Integrations
          </button>
        </div>

        {/* MAIN SETTINGS CONTENT */}
        <Card className="md:col-span-3 bg-white rounded-3xl border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-gray-50 pb-6 bg-gradient-to-r from-white to-orange-50/20">
            <CardTitle className="text-lg font-bold text-gray-900">Workspace Preferences</CardTitle>
            <CardDescription className="text-gray-500 font-medium">Coming soon during the next expansion</CardDescription>
          </CardHeader>
          <CardContent className="py-24 text-center space-y-6">
            <div className="bg-orange-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto shadow-sm group">
              <SettingsIcon className="h-10 w-10 text-orange-200 group-hover:text-[#F97316] transition-all group-hover:rotate-45" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Settings Engine Construction</h3>
              <p className="text-gray-500 max-w-sm mx-auto font-medium leading-relaxed">
                Team permissions, API key management, and custom branding tools are currently being indexed by our development system.
              </p>
            </div>
            <Button className="bg-[#F97316] hover:bg-[#EA6C0A] text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-orange-100 transition-all active:scale-95">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

