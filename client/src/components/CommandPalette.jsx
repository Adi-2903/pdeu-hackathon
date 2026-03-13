import { useState, useEffect, useRef } from 'react';

export default function CommandPalette({ onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems = [
    { type: 'Page', label: 'Dashboard', path: '/' },
    { type: 'Page', label: 'Candidates', path: '/candidates' },
    { type: 'Page', label: 'Jobs', path: '/jobs' },
    { type: 'Page', label: 'AI Search', path: '/ai-search' },
    { type: 'Page', label: 'Analytics', path: '/analytics' },
    { type: 'Page', label: 'Settings', path: '/settings' },
    { type: 'Action', label: 'Add New Candidate', path: '/candidates' },
    { type: 'Action', label: 'Create New Job', path: '/jobs' },
    { type: 'Action', label: 'Run AI Search', path: '/ai-search' },
    { type: 'Action', label: 'View D&I Dashboard', path: '/analytics' },
    { type: 'Action', label: 'Analyze Job Description', path: '/jobs' },
    { type: 'Action', label: 'Open Recruiter Copilot', path: null },
  ];

  const filtered = query
    ? allItems.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
    : allItems;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setSelectedIndex(0); }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === 'Enter' && filtered[selectedIndex]) {
      const item = filtered[selectedIndex];
      if (item.path) onNavigate(item.path);
      else onClose();
    }
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div className="command-palette" onClick={e => e.stopPropagation()}>
        <div className="command-palette-input">
          <span style={{ color: 'var(--text-tertiary)', fontSize: '1.1rem' }}>⌕</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
          />
          <kbd style={{ background: 'var(--bg-tertiary)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>ESC</kbd>
        </div>
        <div className="command-palette-results">
          {filtered.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
              No results found
            </div>
          ) : (
            filtered.map((item, i) => (
              <div
                key={i}
                className={`command-palette-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => { if (item.path) onNavigate(item.path); else onClose(); }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span className="command-palette-item-type">{item.type}</span>
                <span>{item.label}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
