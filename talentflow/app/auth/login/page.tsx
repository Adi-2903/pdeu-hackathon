export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md p-8 bg-slate-900 border border-white/10 rounded-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Login to TalentFlow</h1>
        <p className="text-slate-400 mb-8">Authentication setup is planned for Day 2.</p>
        <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
          Continue as Admin (Demo)
        </button>
      </div>
    </div>
  );
}
