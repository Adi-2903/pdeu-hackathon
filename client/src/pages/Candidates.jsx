import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const avatarColors = ['#3b82f6','#8b5cf6','#06d6a0','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
function getAvatarColor(name) { return avatarColors[name.charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
function getChipClass(cat) {
  const map = { Frontend: 'chip-frontend', Backend: 'chip-backend', DevOps: 'chip-devops', 'Data Science': 'chip-data', Mobile: 'chip-mobile', 'Soft Skills': 'chip-soft', Management: 'chip-management' };
  return map[cat] || 'chip-other';
}
function getSourceBadge(source) {
  const map = { Upload: 'badge-blue', Email: 'badge-violet', LinkedIn: 'badge-mint', Referral: 'badge-amber', HRMS: 'badge-red' };
  return map[source] || 'badge-blue';
}

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [seniority, setSeniority] = useState('');
  const [source, setSource] = useState('');
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const fetchCandidates = () => {
    setLoading(true);
    api.getCandidates({ search, seniority, source }).then(d => {
      setCandidates(d.candidates || []);
      setTotal(d.total || 0);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchCandidates(); }, [search, seniority, source]);

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const scoreColor = (score) => score >= 70 ? 'var(--accent-mint)' : score >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div className="page-enter">
      <div className="section-header stagger-1">
        <div>
          <h1>Candidates</h1>
          <p className="section-subtitle">{total} candidates in your talent pool</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {selected.length > 0 && (
            <button className="btn btn-secondary btn-sm">{selected.length} selected · Bulk Actions ▾</button>
          )}
          <button className="btn btn-primary">＋ Add Candidate</button>
        </div>
      </div>

      <div className="filter-bar stagger-2">
        <div className="topbar-search" style={{ width: '300px' }}>
          <span className="search-icon">⌕</span>
          <input type="text" placeholder="Search by name, email, or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={seniority} onChange={(e) => setSeniority(e.target.value)}>
          <option value="">All Levels</option>
          <option value="Junior">Junior</option>
          <option value="Mid">Mid</option>
          <option value="Senior">Senior</option>
          <option value="Lead">Lead</option>
          <option value="Executive">Executive</option>
        </select>
        <select className="filter-select" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="">All Sources</option>
          <option value="Upload">Upload</option>
          <option value="Email">Email</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Referral">Referral</option>
          <option value="HRMS">HRMS</option>
        </select>
      </div>

      <div className="glass-card-static stagger-3" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '20px' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton skeleton-text" style={{ height: '60px', marginBottom: '1px' }}></div>)}
          </div>
        ) : candidates.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No candidates found</div>
            <div className="empty-state-text">Try adjusting your search or filters to find candidates.</div>
          </div>
        ) : (
          candidates.map((c, i) => (
            <div key={c.id} className="candidate-row" onClick={() => navigate(`/candidates/${c.id}`)} style={{ animationDelay: `${i * 0.03}s` }}>
              <input type="checkbox" className="candidate-row-checkbox" checked={selected.includes(c.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(c.id); }} onClick={e => e.stopPropagation()} />
              <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${getAvatarColor(c.full_name)}, ${getAvatarColor(c.full_name)}dd)`, color: 'white' }}>
                {getInitials(c.full_name)}
              </div>
              <div className="candidate-row-info">
                <div className="candidate-row-name">
                  {c.full_name}
                  {c.ghost_status === 1 && <span className="badge badge-ghost" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>👻 GHOST</span>}
                </div>
                <div className="candidate-row-meta">
                  <span>{c.location}</span>
                  <span>·</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.years_experience}y exp</span>
                  <span>·</span>
                  <span className={`badge badge-source ${getSourceBadge(c.source)}`}>{c.source}</span>
                </div>
              </div>
              <div className="candidate-row-skills">
                {c.skills_list?.slice(0, 4).map((s, j) => (
                  <span key={j} className={`chip ${getChipClass(c.skill_categories?.[0])}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>{s}</span>
                ))}
                {c.skills_list?.length > 4 && <span className="chip chip-other" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>+{c.skills_list.length - 4}</span>}
              </div>
              <div style={{ textAlign: 'right', minWidth: '80px' }}>
                <span className={`badge ${c.seniority_level === 'Senior' || c.seniority_level === 'Lead' ? 'badge-violet' : c.seniority_level === 'Junior' ? 'badge-mint' : 'badge-blue'}`}>
                  {c.seniority_level}
                </span>
              </div>
              <div className="candidate-row-score" style={{ color: scoreColor(c.confidence_score * 100) }}>
                {Math.round(c.confidence_score * 100)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
