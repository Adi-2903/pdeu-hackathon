import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2 text-indigo-400 text-sm font-medium">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
          Setting up infrastructure…
        </div>

        <h1 className="text-5xl font-bold text-white tracking-tight">
          Talent<span className="text-indigo-400">Flow</span>
        </h1>

        <p className="text-slate-400 text-lg leading-relaxed">
          Unified AI Recruitment Platform — ingesting candidates from Gmail,
          Indeed, Merge.dev ATS, resume uploads, and LinkedIn. Powered by
          Claude AI and pgvector semantic search.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
          {[
            "Gmail MCP",
            "Indeed MCP",
            "Merge.dev ATS",
            "Resume Upload",
            "LinkedIn",
            "pgvector Search",
          ].map((source) => (
            <div
              key={source}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-slate-300 text-sm"
            >
              {source}
            </div>
          ))}
        </div>

        <Link
          href="/candidates"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors mt-4"
        >
          Go to Dashboard →
        </Link>
      </div>
    </main>
  );
}
