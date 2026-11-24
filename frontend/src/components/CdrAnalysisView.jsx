import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Upload, 
  Filter, 
  Calendar, 
  Phone, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  RotateCcw,
  Sparkles,
  Radio,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { fetchCdr, uploadCdrCsv } from '../api';

export default function CdrAnalysisView({ targetNumber, setTargetNumber, onNavigate }) {
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [phoneFilter, setPhoneFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Stats computed from current query / loaded records
  const [stats, setStats] = useState({
    incoming: 0,
    outgoing: 0,
    totalDuration: 0,
    uniqueContacts: 0
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await fetchCdr({
        search,
        number: phoneFilter,
        date: dateFilter,
        page,
        limit: 20
      });
      setRecords(res.records || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.totalPages || 1);

      // Compute quick stats for this slice
      let inCount = 0;
      let outCount = 0;
      let dur = 0;
      const contacts = new Set();

      (res.records || []).forEach(r => {
        if (phoneFilter) {
          if (r.caller === phoneFilter) outCount++;
          if (r.receiver === phoneFilter) inCount++;
        } else {
          outCount++;
        }
        dur += r.duration;
        contacts.add(r.caller);
        contacts.add(r.receiver);
      });

      setStats({
        incoming: inCount,
        outgoing: outCount,
        totalDuration: dur,
        uniqueContacts: contacts.size
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [page, search, phoneFilter, dateFilter]);

  // Handle direct file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setUploading(true);
        const csvContent = event.target.result;
        const res = await uploadCdrCsv({
          csvData: csvContent,
          filename: file.name,
          mode: 'append'
        });
        setUploadStatus({
          type: 'success',
          msg: `Uploaded ${file.name}: Normalized ${res.sampleRecords?.length || 'all'} records under ${res.detectedFormat}.`
        });
        loadRecords();
      } catch (err) {
        setUploadStatus({
          type: 'error',
          msg: `Failed to upload CSV: ${err.message}`
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  // Sample quick load for Operator A
  const handleLoadSampleA = async () => {
    const sampleACsv = `caller,receiver,call_time,duration,imei,cell_id
+91 98765 43210,+91 91234 56789,2026-11-20 09:15:22,145,867543029182301,DEL-TOW-101
+91 91234 56789,+91 98765 43210,2026-11-20 09:42:10,312,869012345678901,DEL-TOW-101
+91 98765 43210,+91 99887 76655,2026-11-20 11:20:05,45,867543029182301,DEL-TOW-104`;
    setUploading(true);
    try {
      const res = await uploadCdrCsv({
        csvData: sampleACsv,
        filename: 'operator_a_preset.csv',
        mode: 'append'
      });
      setUploadStatus({
        type: 'success',
        msg: `Normalized Operator A schema (${res.detectedFormat}): caller, receiver, call_time, duration, imei, cell_id`
      });
      loadRecords();
    } catch (err) {
      setUploadStatus({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  // Sample quick load for Operator B
  const handleLoadSampleB = async () => {
    const sampleBCsv = `from_number,to_number,timestamp,call_duration,device_imei,tower_id
+91 98765 43210,+91 97711 22334,2026-11-21 03:45:12,410,867543029182301,DEL-TOW-103
+91 97711 22334,+91 98765 43210,2026-11-21 04:10:00,180,864567890123456,DEL-TOW-103`;
    setUploading(true);
    try {
      const res = await uploadCdrCsv({
        csvData: sampleBCsv,
        filename: 'operator_b_preset.csv',
        mode: 'append'
      });
      setUploadStatus({
        type: 'success',
        msg: `Normalized Operator B schema (${res.detectedFormat}): from_number, to_number, timestamp, call_duration, device_imei, tower_id`
      });
      loadRecords();
    } catch (err) {
      setUploadStatus({ type: 'error', msg: err.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Upload and Normalization Banner */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Upload size={17} style={{ color: 'var(--cyan-primary)' }} />
            <span>Multi-Operator CDR Ingestion & Schema Normalization</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleLoadSampleA}
              disabled={uploading}
            >
              <Sparkles size={13} style={{ color: 'var(--cyan-primary)' }} />
              Test Operator A Schema
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={handleLoadSampleB}
              disabled={uploading}
            >
              <Sparkles size={13} style={{ color: 'var(--blue-primary)' }} />
              Test Operator B Schema
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Upload any raw CSV from <strong>Operator A</strong> (<code>caller, receiver, call_time...</code>) or <strong>Operator B</strong> (<code>from_number, to_number, timestamp...</code>). The engine automatically detects the header schema and normalizes records into a unified structure.
            </p>
          </div>
          <div>
            <label className="btn btn-primary btn-sm" style={{ cursor: 'pointer' }}>
              <Upload size={14} />
              <span>Select CSV File</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload} 
                style={{ display: 'none' }} 
              />
            </label>
          </div>
        </div>

        {uploadStatus && (
          <div style={{ 
            marginTop: '0.8rem', 
            padding: '0.55rem 0.85rem', 
            borderRadius: 6, 
            fontSize: '0.8rem', 
            backgroundColor: uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: uploadStatus.type === 'success' ? '#34d399' : '#f87171',
            border: `1px solid ${uploadStatus.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {uploadStatus.type === 'success' ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
            <span>{uploadStatus.msg}</span>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr auto', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--text-dim)' }} />
            <input 
              type="text" 
              className="input-text" 
              placeholder="Search across callers, receivers, IMEIs, Cell IDs..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: '2rem' }}
            />
          </div>

          <div>
            <input 
              type="text" 
              className="input-text font-mono" 
              placeholder="Filter by Phone Number..."
              value={phoneFilter}
              onChange={(e) => { setPhoneFilter(e.target.value); setPage(1); }}
            />
          </div>

          <div>
            <input 
              type="date" 
              className="input-text font-mono" 
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
            />
          </div>

          <div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setSearch('');
                setPhoneFilter('');
                setDateFilter('');
                setPage(1);
              }}
            >
              <RotateCcw size={13} /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Target Quick Filter Badge if set */}
      {targetNumber && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', background: 'rgba(6, 182, 212, 0.08)', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid rgba(6, 182, 212, 0.2)' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Investigating Target:</span>
          <strong className="font-mono" style={{ color: 'var(--cyan-primary)' }}>{targetNumber}</strong>
          <button 
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem' }}
            onClick={() => {
              setPhoneFilter(targetNumber);
              setPage(1);
            }}
          >
            Filter Records to Target
          </button>
        </div>
      )}

      {/* Normalized Records Table */}
      <div className="card">
        <div className="card-title" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--cyan-primary)' }} />
            <span>Normalized CDR Records ({totalRecords} total matching)</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            Page {page} of {totalPages}
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Record ID</th>
                <th>Caller</th>
                <th>Receiver</th>
                <th>Timestamp</th>
                <th>Duration</th>
                <th>IMEI Hardware</th>
                <th>Cell Tower ID</th>
                <th>Format Source</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map(rec => {
                  const hour = parseInt(rec.timestamp.split(' ')[1]?.split(':')[0] || '12', 10);
                  const isLateNight = hour >= 0 && hour <= 5;

                  return (
                    <tr key={rec.record_id}>
                      <td className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        {rec.record_id}
                      </td>
                      <td className="font-mono">
                        <strong style={{ color: rec.caller === targetNumber ? 'var(--cyan-primary)' : 'inherit' }}>
                          {rec.caller}
                        </strong>
                      </td>
                      <td className="font-mono">
                        <strong style={{ color: rec.receiver === targetNumber ? 'var(--cyan-primary)' : 'inherit' }}>
                          {rec.receiver}
                        </strong>
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.78rem' }}>
                        {rec.timestamp}
                        {isLateNight && (
                          <span className="badge badge-amber" style={{ marginLeft: '0.4rem', fontSize: '0.65rem' }}>
                            Night Call
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge badge-cyan">{rec.duration_formatted}</span>
                      </td>
                      <td className="font-mono" style={{ fontSize: '0.78rem' }}>
                        {rec.imei}
                      </td>
                      <td>
                        <span className="badge badge-emerald font-mono">
                          <Radio size={11} style={{ marginRight: 2 }} />
                          {rec.cell_id}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                          {rec.operator_format}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                          onClick={() => {
                            setTargetNumber(rec.caller);
                            onNavigate('network');
                          }}
                        >
                          Graph
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                    {loading ? 'Fetching CDR records...' : 'No CDR records match your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing page {page} of {totalPages} ({totalRecords} records)
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
