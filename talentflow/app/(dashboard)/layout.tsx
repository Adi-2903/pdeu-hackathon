"use client";

import { 
  LayoutDashboard, 
  Users, 
  Briefcase,
  Search, 
  ListChecks, 
  Download,
  Settings,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/candidates", label: "Candidates", icon: Users },
    { href: "/jobs", label: "Jobs", icon: Briefcase },
    { href: "/search", label: "AI Search", icon: Search },
    { href: "/shortlists", label: "Shortlists", icon: ListChecks },
    { href: "/ingestion", label: "Ingestion", icon: Download },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F9F5F2] text-[#1A1A1A]">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex flex-col">
          <span className="text-xl font-bold text-gray-900 leading-none">
            Talent<span className="text-[#F97316]">Flow</span>
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">AI Recruitment</span>
        </div>
        <button 
          onClick={() => setIsMobileExpanded(!isMobileExpanded)}
          className="p-2 text-gray-500 hover:text-[#F97316] hover:bg-orange-50 rounded-xl transition-all active:scale-95"
          aria-label="Toggle Menu"
        >
          {isMobileExpanded ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out
            md:static md:translate-x-0
            ${isMobileExpanded ? "w-64 translate-x-0 shadow-2xl" : "w-12 -translate-x-full md:w-64"}
            max-md:translate-x-0 max-md:w-12 /* Fallback to icon rail on mobile by default? The prompt said icon-only 48px wide */
          `}
          style={{ width: isMobileExpanded ? '256px' : undefined }}
        >
          {/* Logo Section */}
          <div className="h-20 px-6 flex flex-col justify-center border-b border-gray-50 max-md:px-0 max-md:items-center">
             <div className="flex flex-col group cursor-pointer max-md:hidden">
                <span className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-[#F97316] transition-colors">
                  Talent<span className="text-[#F97316]">Flow</span>
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">AI Recruitment</span>
             </div>
             {/* Collapsed Mobile Logo Icon */}
             <div className="md:hidden h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center font-black text-[#F97316] text-[10px] shadow-sm">
                TF
             </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-2 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileExpanded(false)}
                  className={`
                    group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative
                    ${isActive 
                      ? 'text-orange-600 bg-orange-50 border-l-4 border-orange-500 font-semibold' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                    max-md:justify-center max-md:px-0 max-md:border-l-0
                  `}
                  title={item.label}
                >
                  <item.icon className={`h-[18px] w-[18px] shrink-0 transition-colors ${isActive ? 'text-orange-600' : 'group-hover:text-orange-600'}`} />
                  <span className="text-sm font-medium truncate max-md:hidden">{item.label}</span>
                  
                  {/* Subtle active indicator for mobile icon-rail */}
                  {isActive && (
                    <div className="md:hidden absolute left-0 top-3 bottom-3 w-1 bg-orange-500 rounded-r-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Section (Pinned Bottom) */}
          <div className="mt-auto p-2 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group cursor-pointer max-md:justify-center max-md:p-1">
              <div className="h-8 w-8 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center font-black text-xs shrink-0 ring-2 ring-orange-50 group-hover:ring-orange-200 transition-all">
                AD
              </div>
              <div className="flex-1 min-w-0 max-md:hidden">
                <p className="text-xs font-bold text-gray-900 truncate leading-none">Aditya</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Recruiter</p>
              </div>
              <Settings className="h-4 w-4 text-gray-400 group-hover:text-[#F97316] transition-colors max-md:hidden" />
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {isMobileExpanded && (
          <div 
            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-30 md:hidden"
            onClick={() => setIsMobileExpanded(false)}
          />
        )}

        {/* Main Workspace */}
        <main className="flex-1 w-full min-w-0 min-h-screen">
          <div className="p-4 md:p-8 lg:p-12">
            {children}
          </div>
        </main>
      </div>

      <Toaster theme="light" position="bottom-right" richColors />
    </div>
  );
}
