import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import TalentRadar from '../components/TalentRadar';

const avatarColors = ['#3b82f6','#8b5cf6','#06d6a0','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
function getAvatarColor(name) { return avatarColors[(name||'').charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return (name||'').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
function getChipClass(cat) {
  const map = { Frontend: 'chip-frontend', Backend: 'chip-backend', DevOps: 'chip-devops', 'Data Science': 'chip-data', Mobile: 'chip-mobile', 'Soft Skills': 'chip-soft', Management: 'chip-management' };
  return map[cat] || 'chip-other';
}

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [interviewBrief, setInterviewBrief] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [cultureFitData, setCultureFitData] = useState(null);
  const [showBriefModal, setShowBriefModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    api.getCandidate(id).then(d => { setCandidate(d); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const loadSalary = () => {
    if (candidate) {
      api.salaryPredict({ seniority_level: candidate.seniority_level, years_experience: candidate.years_experience, location: candidate.location, skills: candidate.skills?.map(s=>s.skill_name) || [] }).then(setSalaryData);
    }
  };

  const loadCultureFit = () => { api.cultureFit(id).then(setCultureFitData); };

  const generateBrief = () => {
    api.interviewBrief(id).then(d => { setInterviewBrief(d); setShowBriefModal(true); });
  };

  const addNote = () => {
    if (!noteText.trim()) return;
    api.addNote(id, { content: noteText, author: 'You' }).then(() => {
      setNoteText('');
      api.getCandidate(id).then(setCandidate);
    });
  };

  useEffect(() => { if (candidate && !salaryData) loadSalary(); if (candidate && !cultureFitData) loadCultureFit(); }, [candidate]);

  if (loading) return <div className="page-enter"><div className="skeleton skeleton-card" style={{ height: '300px' }}></div></div>;
  if (!candidate) return <div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">Candidate not found</div></div>;

  const c = candidate;
  const skillsByCategory = {};
  c.skills?.forEach(s => { if (!skillsByCategory[s.category]) skillsByCategory[s.category] = []; skillsByCategory[s.category].push(s); });

  const journeySteps = [
    { label: 'Applied', icon: '📄', date: c.created_at, active: true },
    { label: 'Parsed', icon: '🤖', date: c.created_at, active: true },
    { label: 'Screening', icon: '🔍', date: null, active: c.applications?.some(a => ['Screening','Phone Interview','Technical Interview','Final Interview','Offer','Hired'].includes(a.stage_name)) },
    { label: 'Interview', icon: '🎤', date: null, active: c.applications?.some(a => ['Phone Interview','Technical Interview','Final Interview','Offer','Hired'].includes(a.stage_name)) },
    { label: 'Decision', icon: '⚖️', date: null, active: c.applications?.some(a => ['Offer','Hired','Rejected'].includes(a.stage_name)) },
  ];

  return (
    <div className="page-enter">
      <button className="btn btn-ghost btn-sm stagger-1" onClick={() => navigate('/candidates')} style={{ marginBottom: '16px' }}>← Back to Candidates</button>

      {/* Header Card */}
      <div className="glass-card-static stagger-2" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
          <div className="avatar avatar-xl" style={{ background: `linear-gradient(135deg, ${getAvatarColor(c.full_name)}, ${getAvatarColor(c.full_name)}aa)`, color: 'white' }}>
            {getInitials(c.full_name)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>{c.full_name}</h1>
              <span className={`badge ${c.seniority_level === 'Senior' || c.seniority_level === 'Lead' ? 'badge-violet' : 'badge-blue'}`}>{c.seniority_level}</span>
              <span className={`badge badge-source ${{'Upload':'badge-blue','Email':'badge-violet','LinkedIn':'badge-mint','Referral':'badge-amber','HRMS':'badge-red'}[c.source]}`}>{c.source}</span>
              {c.ghost_status === 1 && <span className="badge badge-ghost">👻 Ghost ({c.ghost_days}d)</span>}
            </div>
            <div style={{ display: 'flex', gap: '20px', color: 'var(--text-secondary)', fontSize: '0.88rem', flexWrap: 'wrap' }}>
              <span>📍 {c.location}</span>
              <span>📧 {c.email}</span>
              {c.phone && <span>📱 {c.phone}</span>}
              <span style={{ fontFamily: 'var(--font-mono)' }}>⏱ {c.years_experience}y experience</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' }}>
              {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">LinkedIn ↗</a>}
              {c.github_url && <a href={c.github_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">GitHub ↗</a>}
              {c.portfolio_url && <a href={c.portfolio_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">Portfolio ↗</a>}
              <button className="btn btn-primary btn-sm" onClick={generateBrief}>📋 Interview Brief</button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 700, color: c.confidence_score >= 0.8 ? 'var(--accent-mint)' : 'var(--accent-amber)' }}>
              {Math.round(c.confidence_score * 100)}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>Confidence Score</div>
          </div>
        </div>

        {/* Journey Timeline */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
          <h3 style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Candidate Journey</h3>
          <div className="journey-timeline">
            {journeySteps.map((step, i) => (
              <div key={i} className="journey-step">
                <div className={`journey-dot ${step.active ? 'active' : ''}`}>{step.icon}</div>
                <div className="journey-step-label">{step.label}</div>
                {step.date && <div className="journey-step-date">{new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs stagger-3">
        {['overview','skills','experience','applications','notes'].map(tab => (
          <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="stagger-4">
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Talent Radar */}
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>🎯 Talent Radar</h3>
              {c.radar && <TalentRadar data={c.radar} />}
            </div>

            {/* Salary Prediction */}
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>💰 Salary Prediction</h3>
              {salaryData ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Estimated Range ({salaryData.currency})</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 700 }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>{(salaryData.min/1000).toFixed(0)}K</span>
                      <span style={{ color: 'var(--accent-mint)', margin: '0 8px' }}>—</span>
                      <span style={{ color: 'var(--accent-mint)' }}>{(salaryData.max/1000).toFixed(0)}K</span>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>Median: {(salaryData.median/1000).toFixed(0)}K</div>
                  </div>
                  <div className="progress-bar" style={{ height: '8px', marginBottom: '16px' }}>
                    <div className="progress-fill score-high" style={{ width: `${salaryData.confidence * 100}%` }}></div>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
                    {salaryData.factors?.map((f, i) => <div key={i} style={{ marginBottom: '4px' }}>• {f}</div>)}
                  </div>
                </div>
              ) : <div className="skeleton skeleton-card" style={{ height: '120px' }}></div>}
            </div>

            {/* Culture Fit */}
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>🧬 Culture Fit Analysis</h3>
              {cultureFitData ? (
                <div>
                  <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2.2rem', fontWeight: 700, color: cultureFitData.overall_score >= 75 ? 'var(--accent-mint)' : 'var(--accent-amber)' }}>
                      {cultureFitData.overall_score}%
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Overall Culture Fit</div>
                  </div>
                  {cultureFitData.values_alignment?.map((v, i) => (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.82rem' }}>{v.value}</span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: v.score >= 70 ? 'var(--accent-mint)' : 'var(--accent-amber)' }}>{v.score}%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${v.score}%`, background: v.score >= 70 ? 'var(--accent-mint)' : 'var(--accent-amber)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="skeleton skeleton-card" style={{ height: '120px' }}></div>}
            </div>

            {/* Summary */}
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '12px' }}>📝 Summary</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7 }}>{c.summary}</p>
              {c.applications?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Active Applications</h4>
                  {c.applications.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${a.job_id}`)}>
                      <span className="badge" style={{ background: `${a.stage_color}22`, color: a.stage_color }}>{a.stage_name}</span>
                      <span style={{ fontSize: '0.85rem' }}>{a.job_title}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: a.score >= 70 ? 'var(--accent-mint)' : 'var(--accent-amber)', marginLeft: 'auto' }}>{Math.round(a.score)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="glass-card-static">
            {Object.entries(skillsByCategory).map(([cat, skills]) => (
              <div key={cat} style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-tertiary)', marginBottom: '10px' }}>{cat}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skills.map((s, i) => (
                    <div key={i} className={`chip ${getChipClass(s.category)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {s.skill_name}
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.7 }}>{'●'.repeat(s.proficiency_level)}{'○'.repeat(5 - s.proficiency_level)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="glass-card-static">
            <div className="timeline">
              {c.experience?.map((e, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-item-date">{e.start_date?.slice(0,7)} — {e.is_current ? 'Present' : e.end_date?.slice(0,7)}</div>
                  <div className="timeline-item-content" style={{ fontWeight: 600 }}>{e.role}</div>
                  <div className="timeline-item-detail" style={{ color: 'var(--accent-blue)' }}>{e.company_name}</div>
                  <div className="timeline-item-detail" style={{ marginTop: '6px' }}>{e.description}</div>
                </div>
              ))}
            </div>
            {c.education?.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px' }}>🎓 Education</h3>
                {c.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{e.degree}</div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{e.institution} · {e.start_year}—{e.end_year}</div>
                  </div>
                ))}
              </div>
            )}
            {c.certifications?.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px' }}>📜 Certifications</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {c.certifications.map((cert, i) => (
                    <span key={i} className="badge badge-violet">{cert.name} ({cert.year})</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="glass-card-static">
            {c.applications?.length > 0 ? c.applications.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${a.job_id}`)}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{a.job_title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{a.department} · Applied {new Date(a.applied_at).toLocaleDateString()}</div>
                </div>
                <span className="badge" style={{ background: `${a.stage_color}22`, color: a.stage_color }}>{a.stage_name}</span>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: a.score >= 70 ? 'var(--accent-mint)' : 'var(--accent-amber)' }}>{Math.round(a.score)}</div>
              </div>
            )) : <div className="empty-state"><div className="empty-state-icon">📋</div><div className="empty-state-title">No applications yet</div></div>}
          </div>
        )}

        {activeTab === 'notes' && (
          <div className="glass-card-static">
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input className="input" placeholder="Add a note about this candidate..." value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addNote()} />
              <button className="btn btn-primary" onClick={addNote}>Add</button>
            </div>
            {c.notes?.map((n, i) => (
              <div key={i} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{n.author}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{new Date(n.created_at).toLocaleString()}</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{n.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interview Brief Modal */}
      {showBriefModal && interviewBrief && (
        <div className="modal-overlay" onClick={() => setShowBriefModal(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2>📋 Interview Brief — {interviewBrief.candidate_name}</h2>
              <button className="modal-close" onClick={() => setShowBriefModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Role</div>
                  <div style={{ fontWeight: 600, marginTop: '4px' }}>{interviewBrief.current_role}</div>
                </div>
                <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Experience</div>
                  <div style={{ fontWeight: 600, marginTop: '4px', fontFamily: 'var(--font-mono)' }}>{interviewBrief.years_experience} years · {interviewBrief.seniority}</div>
                </div>
              </div>
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '10px', color: 'var(--accent-mint)' }}>✦ Key Highlights</h3>
              {interviewBrief.highlights?.map((h, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {h}</div>)}
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 10px', color: 'var(--accent-blue)' }}>💪 Strengths</h3>
              {interviewBrief.strengths?.map((s, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {s}</div>)}
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 10px', color: 'var(--accent-amber)' }}>🔍 Areas to Probe</h3>
              {interviewBrief.areas_to_probe?.map((a, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>• {a}</div>)}
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 10px', color: 'var(--accent-violet)' }}>❓ Suggested Questions</h3>
              {interviewBrief.interview_questions?.map((q, i) => <div key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '6px', paddingLeft: '12px', borderLeft: '2px solid var(--accent-violet-dim)' }}>{i+1}. {q}</div>)}
              <h3 style={{ fontSize: '0.88rem', fontWeight: 700, margin: '16px 0 10px' }}>⏱ Recommended Structure</h3>
              {interviewBrief.recommended_structure?.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem' }}>{s.phase}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>{s.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
