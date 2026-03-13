export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex h-screen">
        {/* Sidebar placeholder */}
        <aside className="w-64 border-r border-white/10 bg-slate-900 p-4 flex flex-col gap-2">
          <div className="py-4">
            <span className="text-lg font-bold text-white">
              Talent<span className="text-indigo-400">Flow</span>
            </span>
          </div>
          {[
            { href: "/candidates", label: "Candidates" },
            { href: "/jobs", label: "Jobs" },
            { href: "/search", label: "AI Search" },
            { href: "/shortlists", label: "Shortlists" },
            { href: "/sources", label: "Sources" },
            { href: "/ingestion", label: "Ingestion" },
            { href: "/settings", label: "Settings" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
            >
              {item.label}
            </a>
          ))}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
