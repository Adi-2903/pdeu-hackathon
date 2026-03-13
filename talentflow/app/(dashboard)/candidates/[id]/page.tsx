export default function CandidateDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Candidate Details</h1>
      <p className="text-slate-400">Viewing candidate: {params.id}</p>
      <div className="mt-4 p-4 bg-slate-900 border border-white/10 rounded-lg">
        Candidate profile details will be implemented in Step 5.
      </div>
    </div>
  );
}
