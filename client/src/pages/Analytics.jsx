import { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Analytics() {
  const [dashboard, setDashboard] = useState(null);
  const [diversity, setDiversity] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getDashboard(), api.getDiversity()]).then(([d, div]) => {
      setDashboard(d);
      setDiversity(div);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'DM Sans', size: 12 } } },
      tooltip: { backgroundColor: '#131a2e', borderColor: 'rgba(59,130,246,0.2)', borderWidth: 1, titleFont: { family: 'DM Sans' }, bodyFont: { family: 'JetBrains Mono', size: 12 } }
    },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: 'DM Sans', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b', font: { family: 'JetBrains Mono', size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  if (loading) return <div className="page-enter"><div className="grid-2">{[1,2,3,4].map(i => <div key={i} className="skeleton skeleton-card" style={{ height: '250px' }}></div>)}</div></div>;

  const sourceData = dashboard?.sourceDistribution ? {
    labels: dashboard.sourceDistribution.map(s => s.source),
    datasets: [{
      data: dashboard.sourceDistribution.map(s => s.count),
      backgroundColor: ['#3b82f6', '#8b5cf6', '#06d6a0', '#f59e0b', '#22d3ee'],
      borderWidth: 0
    }]
  } : null;

  const seniorityData = dashboard?.seniorityDistribution ? {
    labels: dashboard.seniorityDistribution.map(s => s.seniority_level),
    datasets: [{
      label: 'Candidates',
      data: dashboard.seniorityDistribution.map(s => s.count),
      backgroundColor: ['#22d3ee', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
      borderRadius: 6,
      borderWidth: 0
    }]
  } : null;

  const locationData = diversity?.locationDiversity ? {
    labels: diversity.locationDiversity.slice(0, 8).map(l => l.location?.split(',')[0] || 'Unknown'),
    datasets: [{
      label: 'Candidates',
      data: diversity.locationDiversity.slice(0, 8).map(l => l.count),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
      borderWidth: 0
    }]
  } : null;

  const experienceData = diversity?.experienceBuckets ? {
    labels: diversity.experienceBuckets.map(b => b.bracket),
    datasets: [{
      label: 'Candidates',
      data: diversity.experienceBuckets.map(b => b.count),
      backgroundColor: ['#22d3ee', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
      borderRadius: 6,
      borderWidth: 0
    }]
  } : null;

  return (
    <div className="page-enter">
      <div className="section-header stagger-1">
        <div>
          <h1>Analytics & Insights</h1>
          <p className="section-subtitle">Data-driven insights into your talent pipeline and diversity metrics</p>
        </div>
      </div>

      <div className="tabs stagger-2">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`tab ${activeTab === 'diversity' ? 'active' : ''}`} onClick={() => setActiveTab('diversity')}>Diversity & Inclusion</button>
        <button className={`tab ${activeTab === 'pipeline' ? 'active' : ''}`} onClick={() => setActiveTab('pipeline')}>Pipeline Health</button>
      </div>

      {activeTab === 'overview' && (
        <div className="stagger-3">
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Source Distribution</h3>
              <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
                {sourceData && <Doughnut data={sourceData} options={{ ...chartOptions, scales: undefined, cutout: '65%' }} />}
              </div>
            </div>
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Seniority Breakdown</h3>
              <div style={{ height: '250px' }}>
                {seniorityData && <Bar data={seniorityData} options={chartOptions} />}
              </div>
            </div>
          </div>

          <div className="glass-card-static" style={{ marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Pipeline Funnel</h3>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '120px' }}>
              {dashboard?.pipelineFunnel?.filter(s => s.count > 0).map((stage, i) => {
                const max = Math.max(...dashboard.pipelineFunnel.map(s => s.count));
                const colors = ['#6b7280','#3b82f6','#8b5cf6','#f59e0b','#06d6a0','#10b981','#06d6a0','#ef4444'];
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: colors[i] }}>{stage.count}</span>
                    <div style={{ width: '100%', height: `${(stage.count / max) * 100}px`, background: colors[i], borderRadius: '6px 6px 0 0', minHeight: '4px', transition: 'height 1s cubic-bezier(0.16,1,0.3,1)' }}></div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>{stage.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card-static">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Weekly Trend</h3>
            <div style={{ display: 'flex', gap: '16px' }}>
              {dashboard?.weeklyTrend?.map((d, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-blue)' }}>{d.candidates}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div style={{ height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '2px', marginTop: '6px' }}>
                    <div style={{ width: '12px', height: `${d.candidates * 6}px`, background: 'var(--accent-blue)', borderRadius: '3px 3px 0 0' }}></div>
                    <div style={{ width: '12px', height: `${d.applications * 4}px`, background: 'var(--accent-violet)', borderRadius: '3px 3px 0 0' }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-blue)' }}></span>Candidates</span>
              <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', borderRadius: '2px', background: 'var(--accent-violet)' }}></span>Applications</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'diversity' && (
        <div className="stagger-3">
          <div style={{ background: 'var(--accent-blue-dim)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>Diversity & Inclusion Dashboard</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>All data is anonymized. This dashboard helps identify and address potential bias in your hiring process.</div>
              </div>
            </div>
          </div>
          <div className="grid-2" style={{ marginBottom: '20px' }}>
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Geographic Distribution</h3>
              <div style={{ height: '280px' }}>
                {locationData && <Bar data={locationData} options={{ ...chartOptions, indexAxis: 'y' }} />}
              </div>
            </div>
            <div className="glass-card-static">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Experience Distribution</h3>
              <div style={{ height: '280px' }}>
                {experienceData && <Bar data={experienceData} options={chartOptions} />}
              </div>
            </div>
          </div>
          <div className="glass-card-static">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '16px' }}>Source Diversity by Pipeline Stage</h3>
            <div className="data-table" style={{ display: 'table' }}>
              <thead><tr><th>Source</th><th>Stage</th><th>Count</th><th>Trend</th></tr></thead>
              <tbody>
                {diversity?.sourceDiversity?.slice(0, 12).map((s, i) => (
                  <tr key={i}>
                    <td><span className={`badge badge-source ${{'Upload':'badge-blue','Email':'badge-violet','LinkedIn':'badge-mint','Referral':'badge-amber','HRMS':'badge-red'}[s.source]}`}>{s.source}</span></td>
                    <td style={{ fontSize: '0.85rem' }}>{s.stage || 'Unassigned'}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{s.count}</td>
                    <td>
                      <div className="progress-bar" style={{ width: '80px' }}>
                        <div className="progress-fill score-high" style={{ width: `${Math.min(s.count * 15, 100)}%` }}></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'pipeline' && (
        <div className="stagger-3">
          <div className="stats-grid">
            <div className="stat-card" style={{ '--stat-accent': '#3b82f6' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>📊</div>
              <div className="stat-card-value" style={{ color: '#3b82f6' }}>{dashboard?.stats?.avgScore || 0}%</div>
              <div className="stat-card-label">Average Match Score</div>
            </div>
            <div className="stat-card" style={{ '--stat-accent': '#06d6a0' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(6,214,160,0.12)', color: '#06d6a0' }}>🎯</div>
              <div className="stat-card-value" style={{ color: '#06d6a0' }}>{dashboard?.stats?.hiredCount || 0}</div>
              <div className="stat-card-label">Total Hired</div>
            </div>
            <div className="stat-card" style={{ '--stat-accent': '#ef4444' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>👻</div>
              <div className="stat-card-value" style={{ color: '#ef4444' }}>{dashboard?.stats?.ghostCount || 0}</div>
              <div className="stat-card-label">Ghost Candidates</div>
            </div>
            <div className="stat-card" style={{ '--stat-accent': '#8b5cf6' }}>
              <div className="stat-card-icon" style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>💤</div>
              <div className="stat-card-value" style={{ color: '#8b5cf6' }}>{dashboard?.stats?.passiveCount || 0}</div>
              <div className="stat-card-label">Passive Pool</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
