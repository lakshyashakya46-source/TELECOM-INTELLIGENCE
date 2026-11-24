import React from 'react';
import { 
  PhoneCall, 
  Globe, 
  Users, 
  Smartphone, 
  AlertOctagon, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  ShieldAlert,
  Calendar,
  Radio
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  CartesianGrid 
} from 'recharts';

export default function DashboardView({ 
  dashboardData, 
  onNavigate, 
  setTargetNumber 
}) {
  if (!dashboardData) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Loading telecom analytics engine...
      </div>
    );
  }

  const {
    totalCdrRecords = 0,
    totalIpdrRecords = 0,
    uniquePhoneNumbers = 0,
    uniqueImeis = 0,
    detectedSimImeiChangesCount = 0,
    simImeiChanges = [],
    recentActivity = [],
    charts = {}
  } = dashboardData;

  const dateData = charts.dateChartData || [];
  const hourData = charts.hourChartData || [];
  const topCallers = charts.topCallers || [];

  return (
    <div>
      {/* Synthetic Intelligence Disclaimer */}
      <div className="disclaimer-banner">
        <ShieldAlert size={18} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>HACKATHON DEMONSTRATION PROTOTYPE:</strong> All telephone numbers, IMEIs, cell IDs, and IPDR sessions displayed within this platform are locally generated synthetic demonstration data. This software does not connect to live telecom provider networks or access real subscriber surveillance records.
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total CDR Records</span>
            <PhoneCall size={15} style={{ color: 'var(--cyan-primary)' }} />
          </div>
          <div className="kpi-value">{totalCdrRecords}</div>
          <div className="kpi-sub">Normalized across Operator A & B</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total IPDR Sessions</span>
            <Globe size={15} style={{ color: 'var(--blue-primary)' }} />
          </div>
          <div className="kpi-value">{totalIpdrRecords}</div>
          <div className="kpi-sub">Carrier NAT cellular sessions</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Unique Numbers</span>
            <Users size={15} style={{ color: 'var(--emerald-primary)' }} />
          </div>
          <div className="kpi-value">{uniquePhoneNumbers}</div>
          <div className="kpi-sub">Callers & receivers indexed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Unique IMEI Devices</span>
            <Smartphone size={15} style={{ color: 'var(--purple-primary)' }} />
          </div>
          <div className="kpi-value">{uniqueImeis}</div>
          <div className="kpi-sub">Active cellular hardware tags</div>
        </div>

        <div className="kpi-card" style={{ borderColor: detectedSimImeiChangesCount > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)' }}>
          <div className="kpi-label">
            <span>SIM / IMEI Anomalies</span>
            <AlertOctagon size={15} style={{ color: detectedSimImeiChangesCount > 0 ? 'var(--red-primary)' : 'var(--emerald-primary)' }} />
          </div>
          <div className="kpi-value" style={{ color: detectedSimImeiChangesCount > 0 ? '#f87171' : '#ffffff' }}>
            {detectedSimImeiChangesCount}
          </div>
          <div className="kpi-sub">
            {detectedSimImeiChangesCount > 0 ? (
              <span className="badge badge-red">Handset / SIM Swap Alert</span>
            ) : (
              'No hardware swap detected'
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Call Volume Over Time */}
        <div className="card">
          <div className="card-title">
            <Calendar size={16} style={{ color: 'var(--cyan-primary)' }} />
            <span>Call Volume by Date</span>
          </div>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <AreaChart data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 6, fontSize: '0.8rem', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="calls" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#callGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Call Distribution by Hour */}
        <div className="card">
          <div className="card-title">
            <Clock size={16} style={{ color: 'var(--amber-primary)' }} />
            <span>24-Hour Diurnal Pattern (Notice Late-Night Bursts)</span>
          </div>
          <div style={{ width: '100%', height: 230 }}>
            <ResponsiveContainer>
              <BarChart data={hourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 6, fontSize: '0.8rem', color: '#fff' }} 
                />
                <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Callers & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Top Callers Table */}
        <div className="card">
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={16} style={{ color: 'var(--cyan-primary)' }} />
              <span>Top Outgoing Numbers</span>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onNavigate('cdr')}
            >
              View CDR Table <ArrowUpRight size={13} />
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Phone Number</th>
                  <th>Calls</th>
                  <th>Role / Action</th>
                </tr>
              </thead>
              <tbody>
                {topCallers.map((tc, idx) => (
                  <tr key={tc.number}>
                    <td className="font-mono">
                      <strong>{tc.number}</strong>
                    </td>
                    <td>
                      <span className="badge badge-cyan">{tc.count} calls</span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                        onClick={() => {
                          setTargetNumber(tc.number);
                          onNavigate('network');
                        }}
                      >
                        Inspect Target
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity Log */}
        <div className="card">
          <div className="card-title">
            <Activity size={16} style={{ color: 'var(--emerald-primary)' }} />
            <span>Recent Forensic Findings</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentActivity.map(act => {
              let badgeClass = 'badge-cyan';
              if (act.severity === 'high') badgeClass = 'badge-red';
              if (act.severity === 'medium') badgeClass = 'badge-amber';
              if (act.severity === 'info') badgeClass = 'badge-emerald';

              return (
                <div 
                  key={act.id} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: 8, 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`badge ${badgeClass}`}>{act.type}</span>
                    <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {act.timestamp}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-main)' }}>
                    {act.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
