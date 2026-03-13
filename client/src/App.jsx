import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Candidates from './pages/Candidates';
import CandidateProfile from './pages/CandidateProfile';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import AISearch from './pages/AISearch';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Copilot from './components/Copilot';
import CommandPalette from './components/CommandPalette';

const navItems = [
  { section: 'Overview' },
  { path: '/', icon: '◉', label: 'Dashboard' },
  { path: '/candidates', icon: '◎', label: 'Candidates', badge: null },
  { path: '/jobs', icon: '◈', label: 'Jobs' },
  { section: 'Intelligence' },
  { path: '/ai-search', icon: '⬡', label: 'AI Search' },
  { path: '/analytics', icon: '◇', label: 'Analytics' },
  { section: 'System' },
  { path: '/settings', icon: '⚙', label: 'Settings' },
];

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const [candidateCount, setCandidateCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/v1/analytics/dashboard')
      .then(r => r.json())
      .then(d => setCandidateCount(d.stats?.totalCandidates || 0))
      .catch(() => {});
  }, []);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowCmdPalette(prev => !prev);
    }
    if (e.key === 'Escape') setShowCmdPalette(false);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">T</div>
          <div className="sidebar-logo-text">
            Talent<span>OS</span>
          </div>
        </div>
        <button className="sidebar-collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? '▶' : '◀'}
        </button>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return <div key={i} className="sidebar-section-title sidebar-label">{item.section}</div>;
            }
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                {item.label === 'Candidates' && candidateCount > 0 && (
                  <span className="nav-badge sidebar-label">{candidateCount}</span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-search" onClick={() => setShowCmdPalette(true)}>
            <span className="search-icon">⌕</span>
            <input type="text" placeholder="Search candidates, jobs, or actions..." readOnly />
            <kbd>Ctrl+K</kbd>
          </div>
          <div className="topbar-actions">
            <button className="topbar-action-btn" title="Notifications">
              🔔
              <span className="notification-dot"></span>
            </button>
            <button className="topbar-action-btn" title="Help">?</button>
            <div className="topbar-avatar">AT</div>
          </div>
        </header>

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/candidates" element={<Candidates />} />
            <Route path="/candidates/:id" element={<CandidateProfile />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/ai-search" element={<AISearch />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>

      <Copilot />
      {showCmdPalette && <CommandPalette onClose={() => setShowCmdPalette(false)} onNavigate={(path) => { navigate(path); setShowCmdPalette(false); }} />}
    </div>
  );
}
