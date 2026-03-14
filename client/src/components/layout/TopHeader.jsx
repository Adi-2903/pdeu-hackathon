import React from 'react';
import { Bell, LogOut, ChevronRight, Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const navLabels = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/ai-search': 'AI Search',
  '/pipeline': 'Pipeline',
  '/sources': 'Sources',
  '/settings': 'Settings',
};

const TopHeader = () => {
  const location = useLocation();
  const currentPathLabel = navLabels[location.pathname] || 'Dashboard';

  return (
    <div className="bg-white rounded-3xl h-16 px-6 flex items-center justify-between shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 mb-6">

      {/* Left side: Breadcrumb & Mobile Menu Toggle */}
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-gray-500 hover:text-gray-700 transition-colors">
          <Menu size={20} />
        </button>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <span>HireX</span>
          <ChevronRight size={14} className="mx-2 text-gray-300" />
          <span className="text-gray-900">{currentPathLabel}</span>
        </div>
      </div>

      {/* Right side: Tools & Profile */}
      <div className="flex items-center space-x-5">

        {/* Notifications */}
        <button className="relative text-gray-500 hover:text-gray-700 transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#FF6B00] rounded-full border-2 border-white"></span>
        </button>

        {/* Profile */}
        <div className="flex items-center pl-4 border-l border-gray-100">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00] flex items-center justify-center text-white font-bold text-sm shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
            A
          </div>
          <span className="ml-2.5 text-sm font-bold text-gray-700 hidden sm:block">Admin</span>
        </div>

        {/* Logout */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
          <LogOut size={18} />
        </button>

      </div>
    </div>
  );
};

export default TopHeader;
