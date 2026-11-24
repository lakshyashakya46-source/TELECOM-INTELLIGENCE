import React from 'react';
import { 
  LayoutDashboard, 
  PhoneCall, 
  Share2, 
  Radio, 
  Globe, 
  Bot, 
  FileText, 
  ShieldAlert, 
  RefreshCw,
  Database
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, onResetData, isResetting }) {
  const navItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'cdr', label: '2. CDR Analysis', icon: PhoneCall },
    { id: 'network', label: '3. Network Graph', icon: Share2 },
    { id: 'towers', label: '4. Tower Timeline', icon: Radio },
    { id: 'ipdr', label: '5. IPDR Analysis', icon: Globe },
    { id: 'assistant', label: '6. AI Assistant', icon: Bot },
    { id: 'reports', label: '7. Reports', icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand-badge">
          <div className="brand-logo-icon">
            <Radio size={18} />
          </div>
          <div>
            <div style={{ lineHeight: 1.1 }}>TELECOM INTEL</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 400 }}>CDR / IPDR Forensic Suite</div>
          </div>
        </div>
        <div className="badge-demo">
          Synthetic Demo Platform
        </div>
      </div>

      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', color: 'var(--text-dim)', padding: '0.4rem 0.5rem', fontWeight: 700, letterSpacing: '0.05em' }}>
          Investigation Modules
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon size={17} style={{ color: isActive ? 'var(--cyan-primary)' : 'var(--text-muted)' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Database size={13} /> Local Data Controls
        </div>
        <button 
          className="btn btn-secondary btn-sm" 
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={onResetData}
          disabled={isResetting}
        >
          <RefreshCw size={14} className={isResetting ? 'spin-anim' : ''} />
          {isResetting ? 'Resetting...' : 'Reload Demo Data'}
        </button>
        <div style={{ marginTop: '0.6rem', fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
          Hackathon Prototype<br/>No Real Surveillance Data
        </div>
      </div>
    </aside>
  );
}
