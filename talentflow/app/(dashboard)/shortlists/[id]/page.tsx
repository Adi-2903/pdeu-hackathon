export default function ShortlistDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Shortlist Details</h1>
      <p className="text-slate-400">Viewing shortlist: {params.id}</p>
      <div className="mt-4 p-4 bg-slate-900 border border-white/10 rounded-lg">
        Shortlist management will be implemented in Phase 6.
      </div>
    </div>
  );
}
