"use client";

import { 
  LayoutDashboard, 
  Users, 
  Search, 
  Briefcase, 
  ListChecks, 
  Settings,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/search", label: "AI Search", icon: Search },
    { href: "/shortlists", label: "Shortlists", icon: ListChecks },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <span className="text-lg font-black text-white">
          Talent<span className="text-indigo-400">Flow</span>
        </span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-slate-900/40 backdrop-blur-xl p-6 flex flex-col gap-8 transition-transform duration-300 lg:translate-x-0 lg:static
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}>
          <div className="hidden lg:block">
            <span className="text-2xl font-black text-white tracking-tighter">
              Talent<span className="text-indigo-400">Flow</span>
            </span>
          </div>
          
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="group flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <item.icon className="h-5 w-5 group-hover:text-indigo-400 transition-colors" />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 hidden lg:block">
            <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Enterprise Plan</p>
            <p className="text-[10px] text-slate-500 mt-1">Unlimited AI Search & Parsing</p>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden min-h-screen">
          <div className="p-6 lg:p-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
