import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Server, 
  Cpu, 
  ArrowRight,
  Database,
  Lock,
  Layers,
  HelpCircle
} from 'lucide-react';
import { fetchIpdr, correlateIpdr } from '../api';

export default function IpdrAnalysisView({ targetNumber }) {
  const [ipdrRecords, setIpdrRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Correlation form state
  const [queryIp, setQueryIp] = useState('198.51.100.45');
  const [queryPort, setQueryPort] = useState('41200');
  const [queryTime, setQueryTime] = useState('2026-11-20 09:15:00');
  const [correlating, setCorrelating] = useState(false);
  const [correlationResult, setCorrelationResult] = useState(null);

  useEffect(() => {
    loadIpdr();
  }, [search]);

  const loadIpdr = async () => {
    try {
      setLoading(true);
      const res = await fetchIpdr({ search });
      setIpdrRecords(res.records || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunCorrelation = async (e) => {
    if (e) e.preventDefault();
    try {
      setCorrelating(true);
      const res = await correlateIpdr({
        publicIp: queryIp,
        sourcePort: queryPort,
        timestamp: queryTime
      });
      setCorrelationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCorrelating(false);
    }
  };

  // Quick preset buttons
  const setPreset = (ip, port, time) => {
    setQueryIp(ip);
    setQueryPort(port);
    setQueryTime(time);
    setCorrelationResult(null);
  };

  return (
    <div>
      {/* Crucial CGNAT Investigation Warning Banner */}
      <div className="disclaimer-banner" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}>
        <ShieldAlert size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#fff' }}>CRITICAL FORENSIC REQUIREMENT (CGNAT ARCHITECTURE):</strong> Never attempt to identify a subscriber using only a Public IP address. In cellular networks (Carrier-Grade NAT / CGNAT), hundreds or thousands of mobile devices share the exact same public IPv4 address simultaneously. Correlation strictly requires the <strong>3-tuple: (Public IP, Exact Source Port, Exact Timestamp)</strong>.
        </div>
      </div>

      {/* CGNAT Correlation Tool Card */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid var(--border-light)' }}>
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={17} style={{ color: 'var(--cyan-primary)' }} />
            <span>CGNAT / IPDR Cellular Session Correlation Tool</span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem' }}
              onClick={() => setPreset('198.51.100.45', '41200', '2026-11-20 09:15:00')}
            >
              Preset: Suspect Session
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem' }}
              onClick={() => setPreset('198.51.100.45', '', '2026-11-20 09:15:00')}
            >
              Preset: Missing Port Error
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '0.72rem' }}
              onClick={() => setPreset('203.0.113.88', '99999', '2026-11-21 02:15:00')}
            >
              Preset: Unverified Port
            </button>
          </div>
        </div>

        <form onSubmit={handleRunCorrelation} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.4fr auto', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Public IP Address:
            </label>
            <input 
              type="text" 
              className="input-text font-mono" 
              placeholder="e.g. 198.51.100.45"
              value={queryIp}
              onChange={(e) => setQueryIp(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Source Port (Required for CGNAT):
            </label>
            <input 
              type="text" 
              className="input-text font-mono" 
              placeholder="e.g. 41200"
              value={queryPort}
              onChange={(e) => setQueryPort(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
              Exact Session Timestamp:
            </label>
            <input 
              type="text" 
              className="input-text font-mono" 
              placeholder="YYYY-MM-DD HH:MM:SS"
              value={queryTime}
              onChange={(e) => setQueryTime(e.target.value)}
            />
          </div>

          <div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', height: '38px' }}
              disabled={correlating}
            >
              <Cpu size={15} />
              <span>{correlating ? 'Correlating...' : 'Correlate Session'}</span>
            </button>
          </div>
        </form>

        {/* Correlation Result Box */}
        {correlationResult && (
          <div style={{ 
            marginTop: '1rem', 
            borderRadius: 8, 
            padding: '1.1rem', 
            background: correlationResult.status === 'Match Found' 
              ? 'rgba(16, 185, 129, 0.1)' 
              : correlationResult.status === 'Insufficient Information' 
                ? 'rgba(239, 68, 68, 0.12)' 
                : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${
              correlationResult.status === 'Match Found' 
                ? 'rgba(16, 185, 129, 0.35)' 
                : correlationResult.status === 'Insufficient Information' 
                  ? 'rgba(239, 68, 68, 0.35)' 
                  : 'rgba(245, 158, 11, 0.35)'
            }`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {correlationResult.status === 'Match Found' && <CheckCircle2 size={18} style={{ color: '#34d399' }} />}
                {correlationResult.status === 'Insufficient Information' && <XCircle size={18} style={{ color: '#f87171' }} />}
                {correlationResult.status === 'Unverified' && <AlertTriangle size={18} style={{ color: '#fbbf24' }} />}
                <strong style={{ 
                  fontSize: '1rem',
                  color: correlationResult.status === 'Match Found' ? '#34d399' : correlationResult.status === 'Insufficient Information' ? '#f87171' : '#fbbf24'
                }}>
                  Result: {correlationResult.status}
                </strong>
              </div>
              <span className="badge" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-muted)' }}>
                Confidence: {correlationResult.confidence}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {correlationResult.reason}
            </p>

            {correlationResult.evidence && (
              <div style={{ background: 'rgba(0,0,0,0.35)', padding: '0.85rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--cyan-primary)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  Forensic Evidence Corroboration
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Subscriber MSISDN: </span>
                    <strong className="font-mono" style={{ color: '#38bdf8' }}>{correlationResult.evidence.subscriberMsisdn}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Carrier Private IP: </span>
                    <strong className="font-mono">{correlationResult.evidence.privateIp}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Device IMEI: </span>
                    <span className="font-mono">{correlationResult.evidence.deviceImei}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>CGNAT Allocation ID: </span>
                    <span className="font-mono">{correlationResult.evidence.allocationId}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Carrier Log Ref: </span>
                    <span className="font-mono" style={{ color: 'var(--emerald-primary)' }}>{correlationResult.evidence.logReference}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-dim)' }}>Associated Cell Tower: </span>
                    <span className="font-mono">{correlationResult.evidence.associatedCellId}</span>
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: '0.65rem', fontSize: '0.73rem', color: 'var(--text-muted)' }}>
              <em>Technical note: {correlationResult.technicalNote}</em>
            </div>
          </div>
        )}
      </div>

      {/* IPDR Session Records Table */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe size={16} style={{ color: 'var(--cyan-primary)' }} />
            <span>IPDR Cellular Data Session Logs ({ipdrRecords.length} records)</span>
          </div>
          <div style={{ width: '260px' }}>
            <input 
              type="text" 
              className="input-text font-mono" 
              placeholder="Search IP, subscriber, app..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Subscriber MSISDN</th>
                <th>Public IP:Port</th>
                <th>Private IP (Carrier)</th>
                <th>Destination</th>
                <th>Time Window</th>
                <th>Data Volume</th>
                <th>Traffic Category</th>
                <th>Tower</th>
              </tr>
            </thead>
            <tbody>
              {ipdrRecords.length > 0 ? (
                ipdrRecords.map(rec => (
                  <tr key={rec.session_id}>
                    <td className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                      {rec.session_id}
                    </td>
                    <td className="font-mono">
                      <strong style={{ color: rec.subscriber_msisdn === targetNumber ? 'var(--cyan-primary)' : 'inherit' }}>
                        {rec.subscriber_msisdn}
                      </strong>
                    </td>
                    <td className="font-mono">
                      <span style={{ color: '#38bdf8' }}>{rec.public_ip}</span>
                      <span style={{ color: '#fbbf24' }}>:{rec.source_port}</span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {rec.private_ip}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.76rem' }}>
                      {rec.destination_ip}:{rec.destination_port}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.76rem' }}>
                      {rec.session_start.split(' ')[1]} - {rec.session_end.split(' ')[1]}
                    </td>
                    <td>
                      <span className="badge badge-cyan font-mono">{rec.total_mb} MB</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        {rec.app_type}
                      </span>
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.76rem' }}>
                      {rec.cell_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
                    {loading ? 'Loading IPDR sessions...' : 'No IPDR sessions found matching query.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
