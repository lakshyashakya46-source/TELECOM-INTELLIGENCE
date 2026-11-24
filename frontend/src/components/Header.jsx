import React from 'react';
import { Target, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Header({ 
  targetNumber, 
  setTargetNumber, 
  availableNumbers = [], 
  caseId = 'CASE-2026-X88' 
}) {
  return (
    <header className="top-header">
      <div className="case-info">
        <div className="case-chip">
          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'var(--emerald-primary)', display: 'inline-block' }}></span>
          <strong style={{ color: '#fff' }}>{caseId}</strong>
          <span>Operation Nightfall</span>
        </div>

        <div className="target-select-wrap">
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Target size={15} style={{ color: 'var(--cyan-primary)' }} />
            Active Target:
          </span>
          <select 
            className="target-select"
            value={targetNumber}
            onChange={(e) => setTargetNumber(e.target.value)}
          >
            {availableNumbers.length > 0 ? (
              availableNumbers.map(num => (
                <option key={num} value={num}>
                  {num} {num === '+91 98765 43210' ? '(Primary Target)' : ''}
                </option>
              ))
            ) : (
              <option value="+91 98765 43210">+91 98765 43210 (Primary Target)</option>
            )}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--emerald-primary)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <ShieldCheck size={14} />
          <span>Local Engine Active</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '0.3rem 0.6rem', borderRadius: 4, border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          <AlertTriangle size={13} />
          <span>Synthetic Demo Data Only</span>
        </div>
      </div>
    </header>
  );
}
