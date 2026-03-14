import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserSearch, Target, Link as LinkIcon, BarChart3, Settings } from 'lucide-react';
import Badge from './Badge';

const navGroups = [
  {
    label: 'OVERVIEW',
    items: [
      { id: 'dashboard', path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    ]
  },
  {
    label: 'RECRUITMENT',
    items: [
      { id: 'candidates', path: '/candidates', label: 'Candidates', icon: <Users size={18} /> },
      { id: 'ai-search', path: '/ai-search', label: 'AI Search', icon: <UserSearch size={18} /> },
      { id: 'pipeline', path: '/pipeline', label: 'Pipeline', icon: <Target size={18} />, badge: '3' },
      { id: 'sources', path: '/sources', label: 'Sources', icon: <LinkIcon size={18} /> },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { id: 'analytics', path: '/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
      { id: 'settings', path: '/settings', label: 'Settings', icon: <Settings size={18} /> },
    ]
  }
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="w-full md:w-64 h-16 md:h-[calc(100vh-2rem)] bg-white rounded-none md:rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-row md:flex-col fixed bottom-0 md:relative z-[60] md:z-10" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>

      {/* ━━━ LOGO (Desktop Only) ━━━ */}
      <div className="hidden md:flex items-center px-6 py-8">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-900 mr-3">
          <path d="M4 19V5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 16V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 16V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-gray-900 text-lg font-bold tracking-tight">HireX</span>
      </div>

      {/* ━━━ NAVIGATION LINKS ━━━ */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar md:px-4 py-0 md:py-2 flex flex-row md:flex-col justify-around w-full">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="mb-6 w-full hidden md:block">
            <h3 className="px-4 text-[10px] font-bold text-gray-400 tracking-wider uppercase mb-3">{group.label}</h3>
            <div className="flex flex-col space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all relative group ${isActive
                        ? 'bg-[#F0F2F5] text-gray-900 font-semibold'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50 font-medium'
                      }`}
                  >
                    {/* Active Indicator Bar */}
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-black rounded-r-md" />
                    )}

                    <div className={`${isActive ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-700'}`}>
                      {item.icon}
                    </div>
                    <span className="text-sm ml-3">
                      {item.label}
                    </span>

                    {item.badge && (
                      <Badge className="ml-auto !bg-[#FF6B00] !text-white !border-none text-[10px] !px-1.5 rounded-full min-w-[20px] text-center">
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}

        {/* Mobile Nav (Flattened for bottom bar) */}
        <div className="md:hidden flex flex-row items-center justify-around w-full h-full">
          {navGroups.flatMap(g => g.items).slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.id} to={item.path} className={`flex flex-col items-center justify-center p-2 relative ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-b-full" />}
                {item.icon}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
