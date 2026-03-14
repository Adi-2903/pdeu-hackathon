import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation for HR email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+\.hr@companyname\.com$/i;
    if (!emailRegex.test(email)) {
      setError('Access restricted to HR personnel (e.g., name.hr@companyname.com)');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#c9d1da] flex flex-col justify-center items-center p-4 font-sans">
      <div className="w-full max-w-[400px] bg-[#e2e8f0] rounded-[32px] p-8 shadow-xl border border-white/40">
        
        <div className="text-center mb-6">
          <div className="text-[#f99b24] flex justify-center mb-4">
            <BarChart2 size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-[#1a2b4c] mb-2 tracking-tight">HireX</h1>
          <p className="text-sm font-medium text-[#64748b]">Human Resources Portal</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#f1f5f9] border-0 rounded-xl px-4 py-3 text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#f99b24]/50 focus:bg-white transition-all font-medium"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#f1f5f9] border-0 rounded-xl px-4 py-3 text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#f99b24]/50 focus:bg-white transition-all font-medium"
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#f99b24] hover:bg-[#eb8c15] text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_14px_rgba(249,155,36,0.4)] transition-all transform hover:-translate-y-[1px] mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center text-[15px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-8 bg-[#f8fafc]/80 border border-[#cbd5e1] rounded-xl p-4 text-center">
          <p className="text-[#0f172a] text-[13px] font-bold mb-1">Demo Credentials:</p>
          <p className="text-[#475569] text-[13px] font-medium leading-relaxed">
            Admin: admin.hr@companyname.com / password123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
