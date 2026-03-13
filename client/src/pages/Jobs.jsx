import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJDAnalyzer, setShowJDAnalyzer] = useState(false);
  const [jdInput, setJdInput] = useState('');
  const [jdAnalysis, setJdAnalysis] = useState(null);
  const [newJob, setNewJob] = useState({ title: '', department: '', location: '', type: 'Full-time', description: '', requirements: '' });
  const navigate = useNavigate();

  useEffect(() => { api.getJobs().then(d => { setJobs(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const analyzeJD = () => { if (jdInput.trim()) api.analyzeJD(jdInput).then(setJdAnalysis); };

  const createJob = () => {
    if (!newJob.title) return;
    api.createJob(newJob).then(() => {
      setShowCreate(false);
      setNewJob({ title: '', department: '', location: '', type: 'Full-time', description: '', requirements: '' });
      api.getJobs().then(setJobs);
    });
  };

  const stageColors = { New: '#6b7280', Screening: '#3b82f6', 'Phone Interview': '#8b5cf6', 'Technical Interview': '#f59e0b', 'Final Interview': '#06d6a0', Offer: '#10b981', Hired: '#06d6a0', Rejected: '#ef4444' };

  return (
    <div className="page-enter">
      <div className="section-header stagger-1">
        <div>
          <h1>Jobs</h1>
          <p className="section-subtitle">{jobs.length} open positions</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowJDAnalyzer(true)}>🔬 JD Analyzer</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>＋ Create Job</button>
        </div>
      </div>

      {loading ? (
        <div className="grid-2">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '200px' }}></div>)}</div>
      ) : (
        <div className="grid-2">
          {jobs.map((job, i) => (
            <div key={job.id} className={`glass-card stagger-${Math.min(i+2, 8)}`} onClick={() => navigate(`/jobs/${job.id}`)} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700 }}>{job.title}</h3>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '4px' }}>
                    {job.department} · {job.location} · {job.type}
                  </div>
                </div>
                <span className={`badge ${job.status === 'Open' ? 'badge-mint' : 'badge-red'}`}>{job.status}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6, marginBottom: '16px' }}>{job.description?.slice(0, 120)}...</p>
              
              {job.salary_min && (
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-mint)', marginBottom: '14px' }}>
                  ${(job.salary_min/1000).toFixed(0)}K — ${(job.salary_max/1000).toFixed(0)}K
                </div>
              )}

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {job.stages?.filter(s => s.count > 0).map((s, j) => (
                  <span key={j} className="badge" style={{ background: `${stageColors[s.name] || '#3b82f6'}22`, color: stageColors[s.name] || '#3b82f6', fontSize: '0.65rem' }}>
                    {s.name} ({s.count})
                  </span>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent-blue)' }}>
                  {job.total_applicants} applicants
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  Posted {new Date(job.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Job Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Job</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group"><label>Job Title</label><input className="input" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} placeholder="e.g., Senior Frontend Engineer" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-group"><label>Department</label><input className="input" value={newJob.department} onChange={e => setNewJob({...newJob, department: e.target.value})} placeholder="Engineering" /></div>
                <div className="input-group"><label>Location</label><input className="input" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} placeholder="San Francisco, CA" /></div>
              </div>
              <div className="input-group"><label>Description</label><textarea className="input" value={newJob.description} onChange={e => setNewJob({...newJob, description: e.target.value})} placeholder="Describe the role..." /></div>
              <div className="input-group"><label>Requirements (comma-separated)</label><input className="input" value={newJob.requirements} onChange={e => setNewJob({...newJob, requirements: e.target.value})} placeholder="React, TypeScript, 5+ years" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={createJob}>Create Job</button>
            </div>
          </div>
        </div>
      )}

      {/* JD Analyzer Modal */}
      {showJDAnalyzer && (
        <div className="modal-overlay" onClick={() => setShowJDAnalyzer(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>🔬 Smart JD Analyzer</h2>
              <button className="modal-close" onClick={() => setShowJDAnalyzer(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="input-group">
                <label>Paste Job Description</label>
                <textarea className="input" style={{ minHeight: '150px' }} value={jdInput} onChange={e => setJdInput(e.target.value)} placeholder="Paste your job description here for AI analysis..." />
              </div>
              <button className="btn btn-primary w-full" onClick={analyzeJD}>Analyze Job Description</button>
              
              {jdAnalysis && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{jdAnalysis.word_count}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>WORDS</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-mint)' }}>{jdAnalysis.readability_score}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>READABILITY</div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, color: jdAnalysis.overall_rating === 'Good' ? 'var(--accent-mint)' : 'var(--accent-amber)' }}>{jdAnalysis.overall_rating}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>RATING</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    📊 Estimated candidate pool: <span style={{ color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>{jdAnalysis.estimated_pool_size}</span>
                  </div>
                  {jdAnalysis.issues?.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-amber)', marginBottom: '6px' }}>⚠️ Issues</h4>
                      {jdAnalysis.issues.map((issue, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {issue}</div>)}
                    </div>
                  )}
                  {jdAnalysis.suggestions?.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-mint)', marginBottom: '6px' }}>💡 Suggestions</h4>
                      {jdAnalysis.suggestions.map((s, i) => <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {s}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
