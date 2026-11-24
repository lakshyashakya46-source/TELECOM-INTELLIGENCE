import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Phone, 
  Clock, 
  ShieldAlert, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  ArrowUpRight, 
  ArrowDownLeft,
  X,
  Radio,
  FileText
} from 'lucide-react';
import { fetchNetwork, fetchCdr } from '../api';

export default function NetworkGraphView({ targetNumber, setTargetNumber, onNavigate }) {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [contactRecords, setContactRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [minCallsFilter, setMinCallsFilter] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    loadNetwork();
  }, [targetNumber]);

  const loadNetwork = async () => {
    try {
      setLoading(true);
      const res = await fetchNetwork(targetNumber);
      setNetworkData(res);
      setSelectedContact(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContact = async (contact) => {
    setSelectedContact(contact);
    try {
      setLoadingRecords(true);
      const res = await fetchCdr({
        number: targetNumber,
        limit: 50
      });
      // Filter records between target and selected contact
      const related = (res.records || []).filter(
        r => (r.caller === targetNumber && r.receiver === contact.contactNumber) ||
             (r.receiver === targetNumber && r.caller === contact.contactNumber)
      );
      setContactRecords(related);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Rendering communication topology for {targetNumber}...
      </div>
    );
  }

  const contacts = (networkData?.contacts || []).filter(c => c.totalCalls >= minCallsFilter);
  const centerNode = networkData?.centerNode || { label: targetNumber };

  // Calculate radial coordinates around center (SVG dimensions 800x520)
  const svgWidth = 800;
  const svgHeight = 520;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;
  const radius = Math.min(centerX, centerY) - 85;

  const nodePositions = contacts.map((contact, index) => {
    const angle = (index / (contacts.length || 1)) * 2 * Math.PI - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { ...contact, x, y };
  });

  return (
    <div>
      {/* Synthetic Intelligence Disclaimer */}
      <div className="disclaimer-banner">
        <ShieldAlert size={18} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong>SYNTHETIC TOPOLOGY GRAPH:</strong> Communication links represent frequency of synthetic CDR interactions. Node placement is an analytical graph representation, not geographic placement.
        </div>
      </div>

      {/* Graph Toolbar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Target Center:</span>
            <span className="badge badge-cyan font-mono" style={{ fontSize: '0.85rem' }}>
              {targetNumber}
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              ({contacts.length} connected contacts visible)
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Filter Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>Min Calls:</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={minCallsFilter} 
                onChange={(e) => setMinCallsFilter(parseInt(e.target.value, 10))}
                style={{ accentColor: 'var(--cyan-primary)', cursor: 'pointer' }}
              />
              <span className="font-mono badge badge-cyan">{minCallsFilter}+</span>
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setZoomLevel(z => Math.min(1.5, z + 0.1))}
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setZoomLevel(z => Math.max(0.6, z - 0.1))}
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => setZoomLevel(1)}
                title="Reset Zoom"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Graph & Slide-out Inspector Drawer */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedContact ? '1fr 380px' : '1fr', gap: '1.25rem' }}>
        {/* SVG Network Canvas */}
        <div className="network-canvas-container">
          <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ 
              transform: `scale(${zoomLevel})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease'
            }}
          >
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="#1e293b" />
              </pattern>
              <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" />
              </linearGradient>
            </defs>

            <rect width={svgWidth} height={svgHeight} fill="url(#grid)" />

            {/* Concentric Guide Rings */}
            <circle cx={centerX} cy={centerY} r={radius * 0.45} fill="none" stroke="#17223b" strokeDasharray="3 3" />
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#17223b" strokeDasharray="4 4" />

            {/* Communication Links */}
            {nodePositions.map((pos) => {
              const isSelected = selectedContact?.contactNumber === pos.contactNumber;
              const strokeWidth = Math.min(6, Math.max(1.5, pos.totalCalls * 0.45));
              const isBurner = pos.contactNumber === '+91 97711 22334';
              const lineColor = isBurner ? '#f59e0b' : isSelected ? '#22d3ee' : '#334155';

              // Midpoint for call count badge
              const midX = (centerX + pos.x) / 2;
              const midY = (centerY + pos.y) / 2;

              return (
                <g key={`link-${pos.contactNumber}`} style={{ cursor: 'pointer' }} onClick={() => handleSelectContact(pos)}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={pos.x}
                    y2={pos.y}
                    stroke={lineColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={isSelected ? 1 : 0.75}
                  />
                  {/* Badge on connection line */}
                  <rect
                    x={midX - 18}
                    y={midY - 9}
                    width={36}
                    height={18}
                    rx={9}
                    fill="#0f172a"
                    stroke={lineColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fill={isBurner ? '#fbbf24' : '#94a3b8'}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {pos.totalCalls}
                  </text>
                </g>
              );
            })}

            {/* Orbiting Contact Nodes */}
            {nodePositions.map((pos) => {
              const isSelected = selectedContact?.contactNumber === pos.contactNumber;
              const isBurner = pos.contactNumber === '+91 97711 22334';
              const nodeFill = isBurner ? '#78350f' : isSelected ? '#0e7490' : '#1e293b';
              const nodeStroke = isBurner ? '#f59e0b' : isSelected ? '#22d3ee' : '#3b82f6';

              return (
                <g 
                  key={`node-${pos.contactNumber}`} 
                  transform={`translate(${pos.x}, ${pos.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSelectContact(pos)}
                >
                  <circle
                    r={isSelected ? 26 : 22}
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={isSelected ? 3 : 2}
                    filter="drop-shadow(0 2px 6px rgba(0,0,0,0.6))"
                  />
                  <Phone 
                    x={-8} 
                    y={-8} 
                    size={16} 
                    color={isBurner ? '#fbbf24' : '#38bdf8'} 
                  />
                  {/* Contact Number Label */}
                  <rect
                    x={-55}
                    y={28}
                    width={110}
                    height={18}
                    rx={4}
                    fill="#090d16"
                    stroke="#1e293b"
                  />
                  <text
                    x={0}
                    y={40}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                    fontSize={9}
                    fontFamily="monospace"
                    fontWeight="600"
                  >
                    {pos.contactNumber.replace('+91 ', '')}
                  </text>
                </g>
              );
            })}

            {/* Central Target Node */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              {/* Pulsing ring */}
              <circle r={44} fill="none" stroke="rgba(6, 182, 212, 0.25)" strokeWidth={2} />
              <circle r={36} fill="#0e344e" stroke="var(--cyan-primary)" strokeWidth={3} filter="drop-shadow(0 0 12px rgba(6, 182, 212, 0.4))" />
              <Radio x={-11} y={-11} size={22} color="#22d3ee" />
              <rect
                x={-65}
                y={42}
                width={130}
                height={20}
                rx={4}
                fill="#070c17"
                stroke="var(--cyan-primary)"
              />
              <text
                x={0}
                y={55}
                textAnchor="middle"
                fill="#22d3ee"
                fontSize={10}
                fontFamily="monospace"
                fontWeight="bold"
              >
                TARGET (Suspect)
              </text>
            </g>
          </svg>
        </div>

        {/* Contact Inspector Drawer */}
        {selectedContact && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '540px' }}>
            <div className="card-title" style={{ justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={16} style={{ color: 'var(--cyan-primary)' }} />
                <span>Contact Intelligence</span>
              </div>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setSelectedContact(null)}
                style={{ padding: '0.2rem' }}
              >
                <X size={15} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Phone Number</div>
              <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
                {selectedContact.contactNumber}
              </div>
              {selectedContact.contactNumber === '+91 97711 22334' && (
                <span className="badge badge-amber" style={{ marginTop: 4 }}>
                  Suspected Nocturnal Burner Contact
                </span>
              )}
            </div>

            {/* Interaction Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Total Calls</div>
                <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--cyan-primary)' }}>
                  {selectedContact.totalCalls}
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Total Duration</div>
                <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', marginTop: 4 }}>
                  {selectedContact.totalDurationFormatted}
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Outgoing to Target</div>
                <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color: '#38bdf8' }}>
                  {selectedContact.incomingCalls}
                </div>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: 6 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Target Outgoing</div>
                <div className="font-mono" style={{ fontSize: '1rem', fontWeight: 600, color: '#34d399' }}>
                  {selectedContact.outgoingCalls}
                </div>
              </div>
            </div>

            {/* Related Records List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={13} /> Correlated Call Records ({contactRecords.length})
              </div>

              {loadingRecords ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Loading records...</div>
              ) : contactRecords.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {contactRecords.map(rec => (
                    <div 
                      key={rec.record_id}
                      style={{ 
                        padding: '0.5rem', 
                        borderRadius: 6, 
                        background: 'var(--bg-secondary)', 
                        border: '1px solid var(--border-color)',
                        fontSize: '0.76rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', marginBottom: 2 }}>
                        <span className="font-mono">{rec.record_id}</span>
                        <span>{rec.duration_formatted}</span>
                      </div>
                      <div className="font-mono" style={{ color: 'var(--text-main)' }}>
                        {rec.timestamp}
                      </div>
                      <div style={{ marginTop: 2, fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Tower: <span className="font-mono" style={{ color: 'var(--emerald-primary)' }}>{rec.cell_id}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>No direct CDR records found for this pairing.</div>
              )}
            </div>

            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ width: '100%' }}
                onClick={() => {
                  setTargetNumber(selectedContact.contactNumber);
                }}
              >
                Set this Contact as New Center Target
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
