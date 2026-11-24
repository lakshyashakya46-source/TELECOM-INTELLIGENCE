import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  MapPin, 
  Clock, 
  Phone, 
  ShieldAlert, 
  Layers, 
  ArrowRight,
  Info,
  Calendar
} from 'lucide-react';
import L from 'leaflet';
import { fetchTimeline } from '../api';

export default function TowerTimelineView({ targetNumber }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    loadTimeline();
  }, [targetNumber]);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const res = await fetchTimeline(targetNumber);
      setTimelineData(res);
      if (res.timeline && res.timeline.length > 0) {
        setSelectedEvent(res.timeline[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initialize and update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || !timelineData || !timelineData.timeline) return;

    const timeline = timelineData.timeline;
    if (timeline.length === 0) return;

    // Destroy prior map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      // Find average lat/lon to center map
      const validTowers = timeline.filter(e => e.tower && e.tower.lat && e.tower.lng);
      if (validTowers.length === 0) return;

      const avgLat = validTowers.reduce((s, e) => s + e.tower.lat, 0) / validTowers.length;
      const avgLng = validTowers.reduce((s, e) => s + e.tower.lng, 0) / validTowers.length;

      const map = L.map(mapContainerRef.current, {
        center: [avgLat, avgLng],
        zoom: 12,
        attributionControl: false
      });

      mapInstanceRef.current = map;

      // Dark theme map tiles (CartoDB dark matter) with OpenStreetMap fallback
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Unique visited towers
      const towerMap = new Map();
      validTowers.forEach(ev => {
        if (!towerMap.has(ev.tower.cell_id)) {
          towerMap.set(ev.tower.cell_id, ev.tower);
        }
      });

      // Add markers for towers
      const markers = [];
      towerMap.forEach((tower) => {
        const customIcon = L.divIcon({
          className: 'custom-tower-marker',
          html: `<div style="
            background: #0e7490;
            border: 2px solid #22d3ee;
            color: #fff;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            box-shadow: 0 0 10px rgba(6,182,212,0.6);
          ">📡</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        const marker = L.marker([tower.lat, tower.lng], { icon: customIcon }).addTo(map);
        marker.bindPopup(`
          <div style="color: #000; font-family: sans-serif; font-size: 12px;">
            <strong>${tower.name}</strong><br/>
            Cell ID: <code>${tower.cell_id}</code><br/>
            Area: ${tower.area}<br/>
            Radius: ~${tower.coverage_m}m
          </div>
        `);
        markers.push(marker);

        // Approximate coverage sector circle
        L.circle([tower.lat, tower.lng], {
          radius: tower.coverage_m || 750,
          color: '#06b6d4',
          weight: 1,
          fillColor: '#06b6d4',
          fillOpacity: 0.12
        }).addTo(map);
      });

      // Polyline connecting the chronological tower hops
      const pathPoints = validTowers.map(e => [e.tower.lat, e.tower.lng]);
      if (pathPoints.length > 1) {
        L.polyline(pathPoints, {
          color: '#3b82f6',
          weight: 3,
          dashArray: '6, 8',
          opacity: 0.8
        }).addTo(map);
      }

      // Auto fit bounds
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.15));
      }
    } catch (e) {
      console.warn('Map initialization note:', e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [timelineData]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Retrieving cellular tower association timeline...
      </div>
    );
  }

  const timeline = timelineData?.timeline || [];

  return (
    <div>
      {/* Crucial Forensic Disclaimer Banner */}
      <div className="disclaimer-banner">
        <ShieldAlert size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <strong style={{ color: '#fff' }}>MANDATORY FORENSIC PRINCIPLE:</strong> Tower association is approximate cellular network antenna coverage, <strong>NOT exact GPS location or conclusive proof of physical movement</strong>. Mobile devices frequently switch cell sectors or connect to a distant tower due to RF propagation, atmospheric conditions, handoffs, or local base station load balancing.
        </div>
      </div>

      {/* Main Grid: Leaflet Map & Chronological Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.25rem' }}>
        {/* Map View */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} style={{ color: 'var(--cyan-primary)' }} />
              <span>Cellular Sector Coverage & Transit Sequence</span>
            </div>
            <span className="badge badge-cyan font-mono">
              {timelineData?.visitedTowers?.length || 0} Unique Towers Logged
            </span>
          </div>

          <div 
            ref={mapContainerRef} 
            className="map-wrap" 
            style={{ flex: 1, minHeight: '440px' }}
          >
            {/* Leaflet injects here */}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.85rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--cyan-primary)', display: 'inline-block' }}></span>
              <span>Cell Tower Location</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 14, height: 2, backgroundColor: 'var(--blue-primary)', display: 'inline-block' }}></span>
              <span>Chronological Tower Hops</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'rgba(6, 182, 212, 0.2)', border: '1px solid var(--cyan-primary)', display: 'inline-block' }}></span>
              <span>Approx Sector Radius</span>
            </div>
          </div>
        </div>

        {/* Chronological Timeline Cards */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '560px' }}>
          <div className="card-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} style={{ color: 'var(--amber-primary)' }} />
              <span>Chronological Tower Log</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              {timeline.length} events
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.3rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {timeline.length > 0 ? (
              timeline.map((ev, idx) => {
                const isSelected = selectedEvent?.record_id === ev.record_id;
                const isOut = ev.direction === 'Outgoing';

                return (
                  <div
                    key={ev.record_id}
                    onClick={() => {
                      setSelectedEvent(ev);
                      if (mapInstanceRef.current && ev.tower?.lat && ev.tower?.lng) {
                        mapInstanceRef.current.flyTo([ev.tower.lat, ev.tower.lng], 13);
                      }
                    }}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 8,
                      backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'var(--bg-secondary)',
                      border: `1px solid ${isSelected ? 'var(--cyan-primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span className="badge badge-cyan font-mono" style={{ fontSize: '0.7rem' }}>
                        #{idx + 1} • {ev.tower?.cell_id || 'UNKNOWN'}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {ev.timestamp}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                      {ev.tower?.name || 'Local Cellular Sector'}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      Area: {ev.tower?.area || 'NCR Corridor'} (~{ev.tower?.coverage_m}m reach)
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', background: 'rgba(0,0,0,0.25)', padding: '0.3rem 0.5rem', borderRadius: 4 }}>
                      <span style={{ color: isOut ? '#38bdf8' : '#34d399' }}>
                        {ev.direction}: <strong className="font-mono">{ev.peerNumber}</strong>
                      </span>
                      <span className="font-mono" style={{ color: 'var(--text-dim)' }}>
                        {ev.duration_formatted}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                No tower timeline records available for this target.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
