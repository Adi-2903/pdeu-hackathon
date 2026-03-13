import { useRef, useEffect } from 'react';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

export default function TalentRadar({ data }) {
  if (!data) return null;

  const chartData = {
    labels: ['Technical Depth', 'Communication', 'Leadership', 'Domain Knowledge', 'Cultural Fit', 'Growth Trajectory'],
    datasets: [
      {
        label: 'Candidate Profile',
        data: [
          data.technical_depth,
          data.communication,
          data.leadership,
          data.domain_knowledge,
          data.cultural_fit,
          data.growth_trajectory
        ],
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          display: false,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        angleLines: {
          color: 'rgba(255, 255, 255, 0.06)',
        },
        pointLabels: {
          color: '#94a3b8',
          font: {
            family: 'DM Sans',
            size: 11,
            weight: 500,
          },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#131a2e',
        borderColor: 'rgba(59, 130, 246, 0.3)',
        borderWidth: 1,
        titleFont: { family: 'DM Sans', weight: 600 },
        bodyFont: { family: 'JetBrains Mono', size: 13 },
        callbacks: {
          label: (ctx) => `${ctx.raw}/100`,
        },
      },
    },
  };

  return (
    <div style={{ maxWidth: '320px', margin: '0 auto' }}>
      <Radar data={chartData} options={options} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
        {[
          { label: 'Technical', value: data.technical_depth, color: '#3b82f6' },
          { label: 'Communication', value: data.communication, color: '#8b5cf6' },
          { label: 'Leadership', value: data.leadership, color: '#f59e0b' },
          { label: 'Domain', value: data.domain_knowledge, color: '#06d6a0' },
          { label: 'Culture', value: data.cultural_fit, color: '#ec4899' },
          { label: 'Growth', value: data.growth_trajectory, color: '#22d3ee' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700, color: item.color, minWidth: '28px' }}>
              {Math.round(item.value)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: '2px' }}>{item.label}</div>
              <div className="progress-bar" style={{ height: '3px' }}>
                <div className="progress-fill" style={{ width: `${item.value}%`, background: item.color }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
