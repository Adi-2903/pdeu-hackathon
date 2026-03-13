import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const avatarColors = ['#3b82f6','#8b5cf6','#06d6a0','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
function getAvatarColor(name) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { api.getDashboard().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false)); }, []);

  if (loading) return (
    <div className="page-enter">
      <div className="stats-grid">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton skeleton-card stagger-{i}"></div>)}</div>
    </div>
  );

  if (!data) return <div className="empty-state"><div className="empty-state-icon">📊</div><div className="empty-state-title">Unable to load dashboard</div><div className="empty-state-text">Please check that the server is running on port 3001.</div></div>;

  const { stats, sourceDistribution, recentActivity, topSkills, seniorityDistribution, weeklyTrend } = data;

  const statCards = [
    { label: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', change: '+12%', positive: true },
    { label: 'Active Candidates', value: stats.activeCandidates, icon: '✦', color: '#06d6a0', bg: 'rgba(6,214,160,0.12)', change: '+8%', positive: true },
    { label: 'Open Jobs', value: stats.openJobs, icon: '◈', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', change: '+2', positive: true },
    { label: 'Applications', value: stats.totalApplications, icon: '📋', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', change: '+23%', positive: true },
    { label: 'Hired', value: stats.hiredCount, icon: '🎉', color: '#06d6a0', bg: 'rgba(6,214,160,0.12)', change: '+3', positive: true },
    { label: 'Ghost Candidates', value: stats.ghostCount, icon: '👻', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', change: null, positive: false },
  ];

  return (
    <div className="page-enter">
      <div className="section-header stagger-1">
        <div>
          <h1>Dashboard</h1>
          <p className="section-subtitle">Welcome back! Here's what's happening with your talent pipeline.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/candidates')}>
          ＋ Add Candidate
        </button>
      </div>

      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className={`stat-card stagger-${i+1}`} style={{ '--stat-accent': s.color }}>
            <div className="stat-card-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-card-label">{s.label}</div>
            {s.change && <div className={`stat-card-change ${s.positive ? 'positive' : 'negative'}`}>{s.positive ? '↑' : '↓'} {s.change} this week</div>}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '8px' }}>
        {/* Recent Activity */}
        <div className="glass-card-static stagger-5">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Recent Activity</h2>
          <div className="timeline">
            {recentActivity?.slice(0, 8).map((a, i) => (
              <div key={i} className="timeline-item" onClick={() => a.candidate_id && navigate(`/candidates/${a.candidate_id}`)}>
                <div className="timeline-item-date">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                <div className="timeline-item-content">{a.action}</div>
                <div className="timeline-item-detail">{a.candidate_name || 'System'} · {a.details?.slice(0, 60)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Source Distribution */}
        <div className="glass-card-static stagger-6">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Source Distribution</h2>
          {sourceDistribution?.map((s, i) => {
            const colors = { Upload: '#3b82f6', Email: '#8b5cf6', LinkedIn: '#06d6a0', Referral: '#f59e0b', HRMS: '#22d3ee' };
            const max = Math.max(...sourceDistribution.map(x => x.count));
            return (
              <div key={i} style={{ marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{s.source}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: colors[s.source] || '#94a3b8' }}>{s.count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(s.count / max) * 100}%`, background: colors[s.source] || '#3b82f6', transition: `width 1s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s` }}></div>
                </div>
              </div>
            );
          })}

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '28px 0 16px' }}>Top Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {topSkills?.slice(0, 12).map((s, i) => {
              const chipClass = s.category === 'Frontend' ? 'chip-frontend' : s.category === 'Backend' ? 'chip-backend' : s.category === 'DevOps' ? 'chip-devops' : s.category === 'Data Science' ? 'chip-data' : s.category === 'Mobile' ? 'chip-mobile' : s.category === 'Soft Skills' ? 'chip-soft' : 'chip-other';
              return <span key={i} className={`chip ${chipClass}`}>{s.skill_name} <span style={{ opacity: 0.7, fontSize: '0.65rem', fontFamily: 'var(--font-mono)' }}>({s.count})</span></span>;
            })}
          </div>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, margin: '28px 0 16px' }}>Seniority Levels</h2>
          {seniorityDistribution?.map((s, i) => {
            const colors = { Junior: '#22d3ee', Mid: '#3b82f6', Senior: '#8b5cf6', Lead: '#f59e0b', Executive: '#ec4899' };
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', width: '75px', color: colors[s.seniority_level] }}>{s.seniority_level}</span>
                <div className="progress-bar" style={{ flex: 1 }}>
                  <div className="progress-fill" style={{ width: `${(s.count / stats.totalCandidates) * 100}%`, background: colors[s.seniority_level] }}></div>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-tertiary)', width: '28px', textAlign: 'right' }}>{s.count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
