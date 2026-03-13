import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const avatarColors = ['#3b82f6','#8b5cf6','#06d6a0','#f59e0b','#ef4444','#ec4899','#22d3ee','#f97316'];
function getAvatarColor(name) { return avatarColors[(name||'').charCodeAt(0) % avatarColors.length]; }
function getInitials(name) { return (name||'').split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase(); }
function getChipClass(cat) {
  const map = { Frontend: 'chip-frontend', Backend: 'chip-backend', DevOps: 'chip-devops', 'Data Science': 'chip-data', Mobile: 'chip-mobile', 'Soft Skills': 'chip-soft' };
  return map[cat] || 'chip-other';
}

export default function AISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [recentSearches] = useState([
    'Senior React developers in San Francisco',
    'Backend engineers with Python and Kubernetes experience',
    'ML engineers who know PyTorch and have 3+ years',
    'Junior developers open to remote work',
    'Lead engineers with leadership experience in fintech'
  ]);
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    api.search(query).then(d => { setResults(d); setSearching(false); }).catch(() => setSearching(false));
  };

  return (
    <div className="page-enter">
      <div className="stagger-1" style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          ⬡ AI-Powered Search
        </h1>
        <p className="section-subtitle">Describe your ideal candidate in plain English. Our AI translates your query into structured filters and finds the best matches.</p>
      </div>

      <div className="stagger-2" style={{ maxWidth: '700px', margin: '0 auto 32px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="topbar-search" style={{ width: '100%', padding: '12px 20px' }}>
            <span className="search-icon" style={{ fontSize: '1.1rem' }}>⬡</span>
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="e.g., &quot;Find me senior React developers in Bangalore with fintech experience&quot;" style={{ fontSize: '0.95rem' }} />
          </div>
          <button className="btn btn-primary" onClick={handleSearch} disabled={searching} style={{ whiteSpace: 'nowrap' }}>
            {searching ? '⏳ Searching...' : '🔍 Search'}
          </button>
        </div>

        {!results && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Try These</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recentSearches.map((s, i) => (
                <button key={i} className="btn btn-ghost" style={{ justifyContent: 'flex-start', fontSize: '0.85rem', color: 'var(--text-secondary)' }} onClick={() => { setQuery(s); }}>
                  ⌕ {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {searching && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {[1,2,3].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '100px', marginBottom: '12px' }}></div>)}
        </div>
      )}

      {results && !searching && (
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>
                {results.total} Results Found
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Query: "{results.query}"</p>
            </div>
            {results.filters_applied && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {results.filters_applied.seniority && <span className="badge badge-violet">{results.filters_applied.seniority}</span>}
                {results.filters_applied.location && <span className="badge badge-blue">{results.filters_applied.location}</span>}
                {results.filters_applied.skills?.map((s, i) => <span key={i} className="badge badge-mint">{s}</span>)}
              </div>
            )}
          </div>

          {results.results?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <div className="empty-state-title">No matches found</div>
              <div className="empty-state-text">Try broadening your search criteria or using different keywords.</div>
            </div>
          ) : (
            results.results?.map((c, i) => (
              <div key={c.id} className="search-result-card" style={{ animationDelay: `${i * 0.05}s`, animation: 'fadeInUp 0.4s ease both' }} onClick={() => navigate(`/candidates/${c.id}`)}>
                <div className="search-result-match" style={{ color: c.match_score >= 75 ? 'var(--accent-mint)' : c.match_score >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                  {c.match_score}%
                </div>
                <div className="avatar avatar-md" style={{ background: `linear-gradient(135deg, ${getAvatarColor(c.full_name)}, ${getAvatarColor(c.full_name)}cc)`, color: 'white' }}>
                  {getInitials(c.full_name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.full_name}</span>
                    <span className={`badge ${c.seniority_level === 'Senior' || c.seniority_level === 'Lead' ? 'badge-violet' : 'badge-blue'}`}>{c.seniority_level}</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '6px' }}>
                    📍 {c.location} · {c.years_experience}y exp · {c.source}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    {c.skills_list?.slice(0, 6).map((s, j) => (
                      <span key={j} className={`chip ${getChipClass(c.skill_categories?.[0])}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{s}</span>
                    ))}
                  </div>
                  <div className="search-result-explanation">💡 {c.match_explanation}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
