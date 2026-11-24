import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { parseCSV, normalizeCdrRecords } from './services/cdrNormalizer.js';
import { computeDashboardStats, detectSimImeiChanges, getFrequentContacts, detectPatterns } from './services/analyticsService.js';
import { correlateIpdrSession } from './services/ipdrService.js';
import { processInvestigationQuery } from './services/aiAssistantService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-Memory Data Stores
let activeCdrRecords = [];
let activeIpdrRecords = [];
let towersData = [];
let cgnatMappings = [];

// Load default synthetic datasets
function loadInitialData() {
  try {
    const towersPath = path.join(__dirname, 'data', 'towers.json');
    if (fs.existsSync(towersPath)) {
      towersData = JSON.parse(fs.readFileSync(towersPath, 'utf8'));
    }

    const ipdrPath = path.join(__dirname, 'data', 'ipdr_sample.json');
    if (fs.existsSync(ipdrPath)) {
      activeIpdrRecords = JSON.parse(fs.readFileSync(ipdrPath, 'utf8'));
    }

    const cgnatPath = path.join(__dirname, 'data', 'cgnat_mappings.json');
    if (fs.existsSync(cgnatPath)) {
      cgnatMappings = JSON.parse(fs.readFileSync(cgnatPath, 'utf8'));
    }

    // Load Operator A CSV
    let recordsA = [];
    const opAPath = path.join(__dirname, 'data', 'operator_a_sample.csv');
    if (fs.existsSync(opAPath)) {
      const csvA = fs.readFileSync(opAPath, 'utf8');
      const parsedA = parseCSV(csvA);
      recordsA = normalizeCdrRecords(parsedA, 'operator_a_sample.csv');
    }

    // Load Operator B CSV
    let recordsB = [];
    const opBPath = path.join(__dirname, 'data', 'operator_b_sample.csv');
    if (fs.existsSync(opBPath)) {
      const csvB = fs.readFileSync(opBPath, 'utf8');
      const parsedB = parseCSV(csvB);
      recordsB = normalizeCdrRecords(parsedB, 'operator_b_sample.csv');
    }

    activeCdrRecords = [...recordsA, ...recordsB].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    console.log(`[INIT] Loaded ${activeCdrRecords.length} CDR records, ${activeIpdrRecords.length} IPDR records, ${towersData.length} Towers, ${cgnatMappings.length} CGNAT mappings.`);
  } catch (err) {
    console.error('[INIT ERROR] Failed to load initial data:', err);
  }
}

loadInitialData();

// --- 1. Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Telecom Intelligence CDR/IPDR Engine',
    records: {
      cdr: activeCdrRecords.length,
      ipdr: activeIpdrRecords.length,
      towers: towersData.length
    }
  });
});

// --- 2. Dashboard Analytics ---
app.get('/api/dashboard', (req, res) => {
  const stats = computeDashboardStats(activeCdrRecords, activeIpdrRecords);
  
  // Recent activity logs
  const recentActivity = [
    {
      id: 'ACT-01',
      type: 'SIM_IMEI_ALERT',
      title: 'Handset swap detected for primary target +91 98765 43210',
      timestamp: '2026-11-23 18:30:00',
      severity: 'high'
    },
    {
      id: 'ACT-02',
      type: 'BURST_CALL_ALERT',
      title: 'Multiple nocturnal calls detected to burner contact +91 97711 22334',
      timestamp: '2026-11-22 03:05:12',
      severity: 'medium'
    },
    {
      id: 'ACT-03',
      type: 'IPDR_INGESTION',
      title: 'Synchronized 10 IPDR cellular session translation records',
      timestamp: '2026-11-24 10:40:00',
      severity: 'info'
    },
    {
      id: 'ACT-04',
      type: 'TOWER_HOPS',
      title: 'Target transit observed across 5 NCR cell sectors',
      timestamp: '2026-11-21 16:40:22',
      severity: 'info'
    }
  ];

  res.json({
    ...stats,
    caseId: 'CASE-2026-X88',
    caseTitle: 'Operation Nightfall - Cyber Telecom Triage',
    defaultTargetNumber: '+91 98765 43210',
    recentActivity
  });
});

// --- 3. CDR Analysis (Search, Filter, Paging) ---
app.get('/api/cdr', (req, res) => {
  const { number, date, search, cell_id, page = 1, limit = 50 } = req.query;

  let filtered = [...activeCdrRecords];

  if (number) {
    const qNum = number.trim();
    filtered = filtered.filter(r => r.caller.includes(qNum) || r.receiver.includes(qNum));
  }

  if (date) {
    filtered = filtered.filter(r => r.timestamp.startsWith(date.trim()));
  }

  if (cell_id) {
    filtered = filtered.filter(r => r.cell_id.toLowerCase().includes(cell_id.trim().toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(r => 
      r.caller.toLowerCase().includes(q) ||
      r.receiver.toLowerCase().includes(q) ||
      r.imei.toLowerCase().includes(q) ||
      r.cell_id.toLowerCase().includes(q) ||
      r.record_id.toLowerCase().includes(q)
    );
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const total = filtered.length;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  res.json({
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum) || 1,
    records: paginated
  });
});

// --- 4. CDR Upload & Normalization ---
app.post('/api/cdr/upload', (req, res) => {
  try {
    const { csvData, filename = 'custom_upload.csv', mode = 'append' } = req.body;

    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'Valid CSV content string is required in csvData.' });
    }

    const parsed = parseCSV(csvData);
    if (!parsed || parsed.records.length === 0) {
      return res.status(400).json({ error: 'Could not extract valid records from uploaded CSV.' });
    }

    const normalized = normalizeCdrRecords(parsed, filename);

    if (mode === 'replace') {
      activeCdrRecords = normalized.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else {
      activeCdrRecords = [...activeCdrRecords, ...normalized].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    res.json({
      success: true,
      message: `Successfully processed and normalized ${normalized.length} records from ${filename}.`,
      detectedFormat: normalized[0]?.operator_format || 'Generic',
      totalRecordsNow: activeCdrRecords.length,
      sampleRecords: normalized.slice(0, 3)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 5. IPDR Analysis ---
app.get('/api/ipdr', (req, res) => {
  const { subscriber, public_ip, search } = req.query;

  let filtered = [...activeIpdrRecords];

  if (subscriber) {
    filtered = filtered.filter(i => i.subscriber_msisdn.includes(subscriber.trim()));
  }

  if (public_ip) {
    filtered = filtered.filter(i => i.public_ip.includes(public_ip.trim()));
  }

  if (search) {
    const q = search.toLowerCase().trim();
    filtered = filtered.filter(i => 
      i.subscriber_msisdn.toLowerCase().includes(q) ||
      i.public_ip.toLowerCase().includes(q) ||
      i.app_type.toLowerCase().includes(q) ||
      i.session_id.toLowerCase().includes(q)
    );
  }

  res.json({
    total: filtered.length,
    records: filtered
  });
});

// --- 6. Communication Network Graph Data ---
app.get('/api/network/:number', (req, res) => {
  const targetNumber = decodeURIComponent(req.params.number);
  const contacts = getFrequentContacts(activeCdrRecords, targetNumber);

  if (contacts.length === 0) {
    // Return empty graph if number has no calls
    return res.json({
      centerNode: { id: targetNumber, label: targetNumber, isCenter: true },
      nodes: [{ id: targetNumber, label: targetNumber, isCenter: true, calls: 0 }],
      links: [],
      contacts: []
    });
  }

  // Construct network nodes & links
  const centerNode = {
    id: targetNumber,
    label: targetNumber,
    isCenter: true,
    totalCalls: contacts.reduce((sum, c) => sum + c.totalCalls, 0)
  };

  const nodes = [centerNode];
  const links = [];

  contacts.forEach(c => {
    nodes.push({
      id: c.contactNumber,
      label: c.contactNumber,
      isCenter: false,
      totalCalls: c.totalCalls,
      incoming: c.incomingCalls,
      outgoing: c.outgoingCalls,
      duration: c.totalDurationFormatted
    });

    links.push({
      source: targetNumber,
      target: c.contactNumber,
      totalCalls: c.totalCalls,
      incoming: c.incomingCalls,
      outgoing: c.outgoingCalls,
      durationSec: c.totalDurationSec
    });
  });

  res.json({
    centerNode,
    nodes,
    links,
    contacts
  });
});

// --- 7. Tower Timeline Data ---
app.get('/api/timeline/:number', (req, res) => {
  const targetNumber = decodeURIComponent(req.params.number);
  const targetCalls = activeCdrRecords.filter(r => r.caller === targetNumber || r.receiver === targetNumber);

  const sortedCalls = [...targetCalls].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const timelineEvents = sortedCalls.map(c => {
    const tower = towersData.find(t => t.cell_id === c.cell_id) || {
      cell_id: c.cell_id,
      name: `Cell Tower Sector ${c.cell_id}`,
      operator: 'Local Network',
      lat: 28.6139,
      lng: 77.2090,
      azimuth: 0,
      coverage_m: 750,
      area: 'Metropolitan Sector'
    };

    return {
      record_id: c.record_id,
      timestamp: c.timestamp,
      direction: c.caller === targetNumber ? 'Outgoing' : 'Incoming',
      peerNumber: c.caller === targetNumber ? c.receiver : c.caller,
      duration: c.duration,
      duration_formatted: c.duration_formatted,
      imei: c.imei,
      tower
    };
  });

  // Unique towers visited
  const visitedTowerIds = [...new Set(timelineEvents.map(e => e.tower.cell_id))];
  const visitedTowers = visitedTowerIds.map(id => towersData.find(t => t.cell_id === id) || { cell_id: id });

  res.json({
    targetNumber,
    totalEvents: timelineEvents.length,
    timeline: timelineEvents,
    visitedTowers,
    disclaimer: 'Tower association represents approximate antenna coverage sector, NOT exact GPS location or conclusive physical presence.'
  });
});

// --- 8. CGNAT Correlation Tool ---
app.post('/api/correlate', (req, res) => {
  const { publicIp, sourcePort, timestamp } = req.body;
  const result = correlateIpdrSession({ publicIp, sourcePort, timestamp }, cgnatMappings, activeIpdrRecords);
  res.json(result);
});

// --- 9. Investigation Report ---
app.get('/api/report/:number', (req, res) => {
  const targetNumber = decodeURIComponent(req.params.number);
  const contacts = getFrequentContacts(activeCdrRecords, targetNumber);
  const patterns = detectPatterns(activeCdrRecords, targetNumber);
  const simChanges = detectSimImeiChanges(activeCdrRecords).filter(c => 
    c.targetNumber === targetNumber || 
    (c.evidence && c.evidence.some(e => activeCdrRecords.find(r => r.record_id === e.recordId && (r.caller === targetNumber || r.receiver === targetNumber))))
  );

  const targetCalls = activeCdrRecords.filter(r => r.caller === targetNumber || r.receiver === targetNumber);
  const towersVisited = [...new Set(targetCalls.map(r => r.cell_id))];

  // IPDR sessions for target
  const targetIpdr = activeIpdrRecords.filter(i => i.subscriber_msisdn === targetNumber);

  res.json({
    caseId: 'CASE-2026-X88',
    generatedAt: new Date().toISOString(),
    targetNumber,
    classification: 'SYNTHETIC DEMO INTELLIGENCE - FOR TRAINING & HACKATHON EVALUATION ONLY',
    summary: {
      totalInteractions: targetCalls.length,
      outgoingCalls: targetCalls.filter(r => r.caller === targetNumber).length,
      incomingCalls: targetCalls.filter(r => r.receiver === targetNumber).length,
      uniqueContactsCount: contacts.length,
      uniqueTowersCount: towersVisited.length,
      uniqueImeisCount: [...new Set(targetCalls.map(r => r.imei))].length,
      ipdrSessionsCount: targetIpdr.length
    },
    topContacts: contacts.slice(0, 5),
    simChanges,
    suspiciousPatterns: patterns,
    towersVisited,
    sampleEvidenceRecords: targetCalls.slice(0, 10)
  });
});

// --- 10. AI Assistant Query ---
app.post('/api/assistant', (req, res) => {
  const { question } = req.body;
  const response = processInvestigationQuery(question, {
    cdrRecords: activeCdrRecords,
    ipdrRecords: activeIpdrRecords,
    towers: towersData,
    cgnatMappings: cgnatMappings
  });
  res.json(response);
});

// --- 11. Towers Master Metadata ---
app.get('/api/towers', (req, res) => {
  res.json(towersData);
});

// --- 12. Reset to Default Datasets ---
app.post('/api/reset', (req, res) => {
  loadInitialData();
  res.json({
    success: true,
    message: 'Reset synthetic datasets to default baseline demo records.',
    recordsCount: activeCdrRecords.length
  });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Telecom Intelligence Backend listening on port ${PORT}`);
});
