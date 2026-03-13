export default function JobDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Job Details</h1>
      <p className="text-slate-400">Viewing job: {params.id}</p>
      <div className="mt-4 p-4 bg-slate-900 border border-white/10 rounded-lg">
        Job details and matching candidates will be implemented in Phase 5.
      </div>
    </div>
  );
}
