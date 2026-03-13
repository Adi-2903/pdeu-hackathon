import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

const avatarColors = ['#3b82f6','#8b5cf6','#06d6a0','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
function getAvatarColor(name) { return avatarColors[(name||'').charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return (name||'').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draggedCard, setDraggedCard] = useState(null);

  useEffect(() => {
    api.getJob(id).then(d => { setJob(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleDragStart = (e, application) => {
    setDraggedCard(application);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    if (draggedCard && draggedCard.stage_id !== stageId) {
      api.moveCandidate(draggedCard.id, stageId).then(() => {
        api.getJob(id).then(setJob);
      });
    }
    setDraggedCard(null);
  };

  if (loading) return <div className="page-enter"><div className="skeleton skeleton-card" style={{ height: '400px' }}></div></div>;
  if (!job) return <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">Job not found</div></div>;

  return (
    <div className="page-enter">
      <button className="btn btn-ghost btn-sm stagger-1" onClick={() => navigate('/jobs')} style={{ marginBottom: '16px' }}>← Back to Jobs</button>

      <div className="glass-card-static stagger-2" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>{job.title}</h1>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', display: 'flex', gap: '16px' }}>
              <span>🏢 {job.department}</span>
              <span>📍 {job.location}</span>
              <span>⏰ {job.type}</span>
              {job.salary_min && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-mint)' }}>${(job.salary_min/1000).toFixed(0)}K—${(job.salary_max/1000).toFixed(0)}K</span>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className={`badge ${job.status === 'Open' ? 'badge-mint' : 'badge-red'}`}>{job.status}</span>
            <span className="badge badge-blue">{job.total_applicants} applicants</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.7, marginTop: '16px' }}>{job.description}</p>
        {job.requirements && (
          <div style={{ marginTop: '12px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {job.requirements.split(',').map((r, i) => (
              <span key={i} className="chip chip-frontend" style={{ fontSize: '0.72rem' }}>{r.trim()}</span>
            ))}
          </div>
        )}
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px' }} className="stagger-3">Pipeline Board</h2>

      <div className="kanban-board stagger-4">
        {job.pipeline?.map((stage) => (
          <div key={stage.id} className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}>
            <div className="kanban-column-header">
              <div className="kanban-column-title">
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: stage.color, display: 'inline-block' }}></span>
                {stage.name}
              </div>
              <span className="kanban-column-count">{stage.candidates?.length || 0}</span>
            </div>
            <div className="kanban-column-body">
              {stage.candidates?.map((app) => (
                <div key={app.id} className="kanban-card"
                  draggable
                  onDragStart={(e) => handleDragStart(e, { ...app, stage_id: stage.id })}
                  onClick={() => navigate(`/candidates/${app.candidate_id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div className="avatar avatar-sm" style={{ background: `linear-gradient(135deg, ${getAvatarColor(app.full_name)}, ${getAvatarColor(app.full_name)}cc)`, color: 'white', fontSize: '0.65rem' }}>
                      {getInitials(app.full_name)}
                    </div>
                    <div>
                      <div className="kanban-card-name">{app.full_name}</div>
                      <div className="kanban-card-role">{app.seniority_level} · {app.location?.split(',')[0]}</div>
                    </div>
                  </div>
                  <div className="kanban-card-skills">
                    {app.skills?.slice(0, 3).map((s, i) => (
                      <span key={i} className="chip chip-frontend" style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{s}</span>
                    ))}
                  </div>
                  <div className="kanban-card-footer">
                    <span className={`badge badge-source ${{'Upload':'badge-blue','Email':'badge-violet','LinkedIn':'badge-mint','Referral':'badge-amber','HRMS':'badge-red'}[app.source]}`} style={{ fontSize: '0.6rem' }}>{app.source}</span>
                    <span className="kanban-card-score" style={{ color: app.score >= 70 ? 'var(--accent-mint)' : app.score >= 45 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                      {Math.round(app.score)}
                    </span>
                  </div>
                </div>
              ))}
              {(!stage.candidates || stage.candidates.length === 0) && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.78rem', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  Drop candidates here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
