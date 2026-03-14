import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid, AreaChart, Area, Funnel, FunnelChart, LabelList
} from 'recharts';
import { 
  BarChart3, Users, MapPin, Briefcase, TrendingUp, 
  ChevronRight, Filter, Download, Calendar, ArrowUpRight, ArrowDownRight,
  Globe, UserCheck, Scale, AlertTriangle, CheckCircle2
} from 'lucide-react';
import GlassCard from '../components/ui/GlassCard';
import Badge from '../components/ui/Badge';
import api from '../api';

const COLORS = ['#FF6B00', '#FF8C42', '#FFA366', '#FFB380', '#E55A00', '#FFD1B3'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-panel p-3 border border-orange/30 shadow-[0_4px_20px_rgba(255,107,0,0.15)] rounded-xl bg-white/90 backdrop-blur-md">
        <p className="font-bold text-gray-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-medium" style={{ color: entry.color || '#FF6B00' }}>
            {entry.name}: <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [diversityData, setDiversityData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashResp, divResp] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/diversity')
        ]);
        setDashboardData(dashResp.data.data);
        setDiversityData(divResp.data.data);
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-500 font-bold tracking-widest text-xs uppercase">Computing Intelligence</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* ━━━ HEADER SECTION ━━━ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Advanced <span className="text-[#FF6B00]">Analytics</span></h1>
          <p className="text-gray-500 font-medium">Deep insights into your talent ecosystem and pipeline health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white border border-gray-100 p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500">
            <Calendar size={18} />
          </button>
          <button className="bg-white border border-gray-100 p-2.5 rounded-xl shadow-sm hover:shadow-md transition-all text-gray-500">
            <Filter size={18} />
          </button>
          <button className="bg-[#FF6B00] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-[0_4px_16px_rgba(255,107,0,0.3)] hover:scale-105 transition-all">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* ━━━ KPI MINI CARDS ━━━ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Hiring Velocity', value: '18d', change: '-4.2d', icon: <TrendingUp />, color: 'orange' },
          { label: 'Offer Accept Rate', value: '84%', change: '+12%', icon: <UserCheck />, color: 'emerald' },
          { label: 'Cost Per Hire', value: '$2.4k', change: '-$200', icon: <Scale />, color: 'blue' },
          { label: 'Active Pipeline', value: dashboardData?.stats?.totalApplications || 0, change: '+5', icon: <Users />, color: 'purple' }
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-gray-50 text-gray-400`}>
              {React.cloneElement(stat.icon, { size: 24 })}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-gray-900">{stat.value}</span>
                <span className={`text-[10px] font-bold ${stat.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stat.change}
                </span>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ━━━ FUNNEL DROP-OFF ANALYSIS ━━━ */}
        <GlassCard className="xl:col-span-2 p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <Filter className="text-[#FF6B00]" size={22} /> Pipeline Efficiency & Drop-off
            </h2>
            <Badge className="bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20">Last 30 Days</Badge>
          </div>
          
          <div className="flex-1 w-full flex items-center">
            <ResponsiveContainer width="100%" height={320}>
              <FunnelChart>
                <Tooltip content={<CustomTooltip />} />
                <Funnel
                  data={diversityData?.dropOffAnalysis || []}
                  dataKey="rate"
                  nameKey="stage"
                  labelLine={true}
                >
                  <LabelList position="right" fill="#6B7280" font-weight="700" content={({ x, y, value, name }) => (
                    <text x={x + 10} y={y + 20} fill="#6B7280" fontSize={12} fontWeight={700}>
                      {name}: {value}%
                    </text>
                  )} />
                  {diversityData?.dropOffAnalysis.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.flag ? '#EF4444' : COLORS[index % COLORS.length]} fillOpacity={0.8} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 pt-6 border-t border-glass-border grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={20} />
              <div>
                <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-none mb-1">Critical Drop-off</p>
                <p className="text-xs font-bold text-gray-700">Technical Assessment</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={20} />
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest leading-none mb-1">Highest Conversion</p>
                <p className="text-xs font-bold text-gray-700">Offer Excellence</p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* ━━━ DIVERSITY MATRIX ━━━ */}
        <GlassCard className="p-8 min-h-[450px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
            <Scale className="text-[#FF6B00]" size={22} /> Talent Diversity
          </h2>
          <div className="flex-1 w-full flex flex-col items-center justify-center">
             <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diversityData?.genderDist || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="gender"
                    >
                      {diversityData?.genderDist.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-0">Total</p>
                  <p className="text-2xl font-black text-gray-900 leading-none">{dashboardData?.stats?.totalCandidates || 0}</p>
                </div>
             </div>
             
             <div className="w-full mt-6 space-y-3">
                {diversityData?.genderDist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                       <span className="text-xs font-bold text-gray-600">{item.gender}</span>
                    </div>
                    <span className="text-xs font-black text-gray-900">{Math.round((item.count / (dashboardData?.stats?.totalCandidates || 1)) * 100)}%</span>
                  </div>
                ))}
             </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ━━━ GLOBAL TALENT DISTRIBUTION ━━━ */}
        <GlassCard className="p-8 h-[400px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Globe className="text-[#FF6B00]" size={22} /> Geo-Distribution
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diversityData?.locationDist || []} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="location" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#6B7280' }} width={80} />
                <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#FF6B00" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* ━━━ EXPERIENCE HEATMAP ━━━ */}
        <GlassCard className="p-8 h-[400px] flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Briefcase className="text-[#FF6B00]" size={22} /> Experience Heatmap
          </h2>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={diversityData?.experienceDist || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#6B7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* ━━━ RETENTION PREDICTION / MOCK AI INSIGHT ━━━ */}
      <GlassCard className="p-8 bg-gradient-to-r from-[#FF6B00]/5 to-transparent border-l-4 border-l-[#FF6B00]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-2xl bg-[#FF6B00] shadow-[0_8px_24px_rgba(255,107,0,0.3)] flex items-center justify-center text-white shrink-0">
                <BarChart3 size={32} />
             </div>
             <div>
                <h3 className="text-lg font-bold text-gray-900">Predictive Hiring Insights</h3>
                <p className="text-sm text-gray-500 font-medium">Gemini AI models suggest increasing focus on <span className="text-[#FF6B00] font-bold">Mid-Level Engineers</span> in the next quarter to optimize for retention.</p>
             </div>
          </div>
          <button className="px-6 py-3 bg-white border border-glass-border rounded-xl font-bold text-gray-900 shadow-sm hover:shadow-md transition-all flex items-center gap-2 whitespace-nowrap">
             View Full Report <ArrowUpRight size={18} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default Analytics;
