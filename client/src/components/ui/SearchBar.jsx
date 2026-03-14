import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ placeholder = "Search...", value, onChange, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-3 py-2 border border-glass-border rounded-xl leading-5 bg-glass-card text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-orange focus:border-orange sm:text-sm transition-colors"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
      />
    </div>
  );
};

export default SearchBar;
