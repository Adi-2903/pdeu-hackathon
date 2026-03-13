import { useState } from 'react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [values, setValues] = useState(['Ownership', 'Move Fast', 'Data-Driven', 'Remote-First', 'Continuous Learning']);
  const [newValue, setNewValue] = useState('');

  const addValue = () => {
    if (newValue.trim() && values.length < 10) {
      setValues([...values, newValue.trim()]);
      setNewValue('');
    }
  };

  return (
    <div className="page-enter">
      <div className="section-header stagger-1">
        <div>
          <h1>Settings</h1>
          <p className="section-subtitle">Configure integrations, company values, and platform preferences</p>
        </div>
      </div>

      <div className="tabs stagger-2">
        <button className={`tab ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>General</button>
        <button className={`tab ${activeTab === 'integrations' ? 'active' : ''}`} onClick={() => setActiveTab('integrations')}>Integrations</button>
        <button className={`tab ${activeTab === 'values' ? 'active' : ''}`} onClick={() => setActiveTab('values')}>Company Values</button>
        <button className={`tab ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
      </div>

      <div className="stagger-3">
        {activeTab === 'general' && (
          <div className="glass-card-static" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>General Settings</h3>
            <div className="input-group"><label>Company Name</label><input className="input" defaultValue="TalentOS Inc." /></div>
            <div className="input-group"><label>Ghost Detection Threshold (days)</label><input className="input" type="number" defaultValue="14" /></div>
            <div className="input-group"><label>Passive Pool Minimum Score</label><input className="input" type="number" defaultValue="60" /></div>
            <div className="input-group"><label>Default Currency</label>
              <select className="input"><option>USD</option><option>EUR</option><option>GBP</option><option>INR</option><option>CAD</option></select>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '8px' }}>Save Changes</button>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div style={{ maxWidth: '600px' }}>
            {[
              { name: 'Gmail', icon: '📧', desc: 'Automatically scan inbox for resume attachments', status: 'Connected', color: 'var(--accent-mint)' },
              { name: 'Microsoft Outlook', icon: '📬', desc: 'Integrate with Outlook for email parsing', status: 'Not Connected', color: 'var(--text-tertiary)' },
              { name: 'LinkedIn', icon: '💼', desc: 'Import candidate profiles from LinkedIn', status: 'Connected', color: 'var(--accent-mint)' },
              { name: 'BambooHR', icon: '🎋', desc: 'Sync candidate data via webhook', status: 'Not Connected', color: 'var(--text-tertiary)' },
              { name: 'Workday', icon: '⚡', desc: 'Receive candidate submissions via API', status: 'Not Connected', color: 'var(--text-tertiary)' },
              { name: 'Slack', icon: '💬', desc: 'Get notifications for pipeline updates', status: 'Connected', color: 'var(--accent-mint)' },
            ].map((integration, i) => (
              <div key={i} className="glass-card" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '1.5rem' }}>{integration.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{integration.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{integration.desc}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.78rem', color: integration.color }}>{integration.status}</span>
                  <button className={`btn btn-sm ${integration.status === 'Connected' ? 'btn-secondary' : 'btn-primary'}`}>
                    {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'values' && (
          <div className="glass-card-static" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Company Values</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '20px' }}>Define your company values (5-10). These are used by the Culture Fit Analyzer to score candidates.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
              {values.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--text-tertiary)', width: '24px' }}>{i+1}.</span>
                  <span style={{ flex: 1 }}>{v}</span>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-red)', padding: '4px 8px' }} onClick={() => setValues(values.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Add a company value..." onKeyDown={e => e.key === 'Enter' && addValue()} />
              <button className="btn btn-primary" onClick={addValue}>Add</button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="glass-card-static" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '20px' }}>Notification Preferences</h3>
            {[
              { label: 'New candidate ingested', desc: 'When a candidate is added via any source' },
              { label: 'Ghost candidate detected', desc: 'When a candidate goes silent beyond threshold' },
              { label: 'Pipeline stage change', desc: 'When a candidate moves between stages' },
              { label: 'Passive pool resurface', desc: 'When AI surfaces a passive candidate for a new job' },
              { label: 'Duplicate detected', desc: 'When a potential duplicate candidate is found' },
            ].map((notif, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.88rem' }}>{notif.label}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{notif.desc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" defaultChecked={i < 3} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{
                    position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: i < 3 ? 'var(--accent-blue)' : 'var(--bg-tertiary)',
                    borderRadius: '12px', transition: '0.3s',
                  }}>
                    <span style={{
                      position: 'absolute', height: '18px', width: '18px',
                      left: i < 3 ? '23px' : '3px', bottom: '3px',
                      backgroundColor: 'white', borderRadius: '50%', transition: '0.3s'
                    }}></span>
                  </span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
