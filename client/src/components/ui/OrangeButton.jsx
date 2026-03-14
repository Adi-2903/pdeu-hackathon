import React from 'react';

const OrangeButton = ({ children, onClick, className = '', variant = 'primary', icon, type = 'button', disabled = false, ...props }) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-orange text-gray-900 hover:bg-orange-light shadow-[var(--orange-glow)]",
    secondary: "bg-glass-card text-gray-900 hover:bg-white/10 border border-glass-border",
    outline: "border border-orange text-orange hover:bg-orange/10",
    ghost: "text-orange hover:bg-orange/10"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} px-4 py-2 ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default OrangeButton;
