import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldAlert, 
  CheckCircle, 
  Phone, 
  Radio, 
  Globe, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { fetchReport } from '../api';

export default function ReportsView({ targetNumber }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [targetNumber]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await fetchReport(targetNumber);
      setReport(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!report) return;

    // Generate CSV content from report
    let csvContent = 'TELECOM INTELLIGENCE FORENSIC INVESTIGATION REPORT\n';
    csvContent += `Case ID,${report.caseId}\n`;
    csvContent += `Target Number,${report.targetNumber}\n`;
    csvContent += `Generated At,${report.generatedAt}\n`;
    csvContent += `Classification,SYNTHETIC DEMONSTRATION PROTOTYPE - NOT LIVE INTELLIGENCE\n\n`;

    csvContent += '--- SUMMARY METRICS ---\n';
    csvContent += `Total Calls,${report.summary.totalInteractions}\n`;
    csvContent += `Outgoing Calls,${report.summary.outgoingCalls}\n`;
    csvContent += `Incoming Calls,${report.summary.incomingCalls}\n`;
    csvContent += `Unique Contacts,${report.summary.uniqueContactsCount}\n`;
    csvContent += `Towers Associated,${report.summary.uniqueTowersCount}\n`;
    csvContent += `IPDR Sessions,${report.summary.ipdrSessionsCount}\n\n`;

    csvContent += '--- TOP FREQUENT CONTACTS ---\n';
    csvContent += 'Contact Number,Total Calls,Outgoing,Incoming,Duration\n';
    (report.topContacts || []).forEach(c => {
      csvContent += `${c.contactNumber},${c.totalCalls},${c.outgoingCalls},${c.incomingCalls},${c.totalDurationFormatted}\n`;
    });

    csvContent += '\n--- SUSPICIOUS HARDWARE ANOMALIES ---\n';
    csvContent += 'Type,Description\n';
    (report.simChanges || []).forEach(s => {
      csvContent += `"${s.title}","${s.description}"\n`;
    });

    csvContent += '\n--- SAMPLE EVIDENCE RECORDS ---\n';
    csvContent += 'Record ID,Source File,Row,Caller,Receiver,Timestamp,Duration (s),IMEI,Cell ID\n';
    (report.sampleEvidenceRecords || []).forEach(r => {
      csvContent += `${r.record_id},${r.source_file},${r.source_row},${r.caller},${r.receiver},${r.timestamp},${r.duration},${r.imei},${r.cell_id}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Investigation_Report_${report.targetNumber.replace(/[^0-9]/g, '')}_${report.caseId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
        Compiling case report for {targetNumber}...
      </div>
    );
  }

  if (!report) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-dim)' }}>
        No report data available.
      </div>
    );
  }

  const { summary = {}, topContacts = [], simChanges = [], suspiciousPatterns = {}, towersVisited = [], sampleEvidenceRecords = [] } = report;

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Action Header */}
      <div className="card no-print" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--cyan-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Formal Forensic Intelligence Dossier</span>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint}>
            <Printer size={14} /> Print / Save PDF
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleDownloadCsv}>
            <Download size={14} /> Download CSV Report
          </button>
        </div>
      </div>

      {/* Report Document Sheet */}
      <div className="card" style={{ padding: '2rem' }}>
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--cyan-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
              Telecom Intelligence Triage Bureau
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', marginTop: 4 }}>
              SUBSCRIBER CDR/IPDR CORRELATION REPORT
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Case File Reference: <strong style={{ color: '#fff' }}>{report.caseId}</strong> (Operation Nightfall)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
              SYNTHETIC HACKATHON DATA
            </span>
            <div className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: 6 }}>
              Generated: {new Date(report.generatedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Target Profile Card */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 8, marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Target MSISDN</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--cyan-primary)', marginTop: 2 }}>
              {report.targetNumber}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total Calls Analyzed</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
              {summary.totalInteractions} ({summary.outgoingCalls} Out / {summary.incomingCalls} In)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Unique Associates</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
              {summary.uniqueContactsCount} numbers
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Cell Towers Visited</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: 2 }}>
              {summary.uniqueTowersCount} sectors
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>IPDR Sessions</div>
            <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--blue-primary)', marginTop: 2 }}>
              {summary.ipdrSessionsCount} recorded
            </div>
          </div>
        </div>

        {/* Hardware Anomalies & SIM Swaps */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Smartphone size={16} style={{ color: 'var(--red-primary)' }} />
            <span>Hardware Status & SIM/IMEI Swap Findings</span>
          </div>

          {simChanges.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {simChanges.map((sc, idx) => (
                <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 3 }}>
                    <AlertTriangle size={15} style={{ color: '#f87171' }} />
                    <strong style={{ fontSize: '0.84rem', color: '#f87171' }}>{sc.title}</strong>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{sc.description}</div>
                  {sc.details && (
                    <ul style={{ paddingLeft: '1.2rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {sc.details.map((d, dIdx) => (
                        <li key={dIdx} className="font-mono">{d}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', background: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 6 }}>
              No SIM swap or IMEI anomalies were identified for this target.
            </div>
          )}
        </div>

        {/* Top Frequent Contacts Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={16} style={{ color: 'var(--cyan-primary)' }} />
            <span>Top Frequent Communications Breakdown</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Associate Number</th>
                  <th>Total Calls</th>
                  <th>Outgoing</th>
                  <th>Incoming</th>
                  <th>Cumulative Duration</th>
                  <th>Earliest Call</th>
                  <th>Latest Call</th>
                </tr>
              </thead>
              <tbody>
                {topContacts.map(c => (
                  <tr key={c.contactNumber}>
                    <td className="font-mono">
                      <strong>{c.contactNumber}</strong>
                      {c.contactNumber === '+91 97711 22334' && (
                        <span className="badge badge-amber" style={{ marginLeft: 6 }}>Nocturnal Contact</span>
                      )}
                    </td>
                    <td>
                      <span className="badge badge-cyan">{c.totalCalls} calls</span>
                    </td>
                    <td className="font-mono">{c.outgoingCalls}</td>
                    <td className="font-mono">{c.incomingCalls}</td>
                    <td className="font-mono">{c.totalDurationFormatted}</td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>{c.firstCallTime}</td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>{c.lastCallTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tower Association Sequence */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Radio size={16} style={{ color: 'var(--emerald-primary)' }} />
            <span>Cell Tower Association Itinerary ({towersVisited.length} sectors)</span>
          </div>
          <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: 6, border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {towersVisited.map((t, idx) => (
                <span key={idx} className="badge badge-emerald font-mono">
                  #{idx + 1} {t}
                </span>
              ))}
            </div>
            <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              <em>Note: Cell tower association reflects base station radio coverage, NOT physical GPS positioning.</em>
            </div>
          </div>
        </div>

        {/* Evidence References Table */}
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} style={{ color: 'var(--purple-primary)' }} />
            <span>Sample Supporting Evidence Records</span>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Source File (Row)</th>
                  <th>Timestamp</th>
                  <th>Duration</th>
                  <th>IMEI Hardware</th>
                  <th>Cell Tower</th>
                </tr>
              </thead>
              <tbody>
                {sampleEvidenceRecords.map(rec => (
                  <tr key={rec.record_id}>
                    <td className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--cyan-primary)' }}>
                      {rec.record_id}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>
                      {rec.source_file} (Row {rec.source_row})
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>
                      {rec.timestamp}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>
                      {rec.duration_formatted}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>
                      {rec.imei}
                    </td>
                    <td className="font-mono" style={{ fontSize: '0.74rem' }}>
                      {rec.cell_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
