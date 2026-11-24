/**
 * Analytics Service for CDR & IPDR Data
 */

export function computeDashboardStats(cdrRecords = [], ipdrRecords = []) {
  const uniqueNumbersSet = new Set();
  const uniqueImeisSet = new Set();
  
  cdrRecords.forEach(r => {
    if (r.caller) uniqueNumbersSet.add(r.caller);
    if (r.receiver) uniqueNumbersSet.add(r.receiver);
    if (r.imei && r.imei !== 'Unknown') uniqueImeisSet.add(r.imei);
  });

  ipdrRecords.forEach(ip => {
    if (ip.subscriber_msisdn) uniqueNumbersSet.add(ip.subscriber_msisdn);
  });

  const simImeiChanges = detectSimImeiChanges(cdrRecords);

  // Time-series breakdown
  const callsByDate = {};
  const callsByHour = Array(24).fill(0);

  cdrRecords.forEach(r => {
    try {
      const datePart = r.timestamp.split(' ')[0] || r.timestamp.split('T')[0];
      callsByDate[datePart] = (callsByDate[datePart] || 0) + 1;

      const hourPart = parseInt(r.timestamp.split(' ')[1]?.split(':')[0] || '12', 10);
      if (!isNaN(hourPart) && hourPart >= 0 && hourPart < 24) {
        callsByHour[hourPart]++;
      }
    } catch {
      // ignore parse err
    }
  });

  const dateChartData = Object.keys(callsByDate).sort().map(d => ({
    date: d,
    calls: callsByDate[d]
  }));

  const hourChartData = callsByHour.map((count, h) => ({
    hour: `${String(h).padStart(2, '0')}:00`,
    calls: count
  }));

  // Top overall callers
  const callerCounts = {};
  cdrRecords.forEach(r => {
    if (r.caller) {
      callerCounts[r.caller] = (callerCounts[r.caller] || 0) + 1;
    }
  });

  const topCallers = Object.entries(callerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([number, count]) => ({ number, count }));

  return {
    totalCdrRecords: cdrRecords.length,
    totalIpdrRecords: ipdrRecords.length,
    uniquePhoneNumbers: uniqueNumbersSet.size,
    uniqueImeis: uniqueImeisSet.size,
    detectedSimImeiChangesCount: simImeiChanges.length,
    simImeiChanges,
    charts: {
      dateChartData,
      hourChartData,
      topCallers
    }
  };
}

/**
 * Detect SIM/IMEI changes:
 * 1. Single MSISDN using multiple IMEIs (Device hopping)
 * 2. Single IMEI used by multiple MSISDNs (SIM swapping / device sharing)
 */
export function detectSimImeiChanges(cdrRecords = []) {
  const numberToImeis = {};
  const imeiToNumbers = {};
  const changes = [];

  // Sort chronologically
  const sorted = [...cdrRecords].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  sorted.forEach(rec => {
    const num = rec.caller;
    const imei = rec.imei;
    if (!num || !imei || imei === 'Unknown') return;

    // Track MSISDN -> IMEIs
    if (!numberToImeis[num]) {
      numberToImeis[num] = [];
    }
    const existing = numberToImeis[num].find(item => item.imei === imei);
    if (!existing) {
      numberToImeis[num].push({
        imei,
        firstSeen: rec.timestamp,
        recordId: rec.record_id,
        sourceFile: rec.source_file,
        sourceRow: rec.source_row
      });
    }

    // Track IMEI -> MSISDNs
    if (!imeiToNumbers[imei]) {
      imeiToNumbers[imei] = [];
    }
    const existingNum = imeiToNumbers[imei].find(item => item.number === num);
    if (!existingNum) {
      imeiToNumbers[imei].push({
        number: num,
        firstSeen: rec.timestamp,
        recordId: rec.record_id,
        sourceFile: rec.source_file,
        sourceRow: rec.source_row
      });
    }
  });

  // MSISDN using multiple IMEIs
  Object.keys(numberToImeis).forEach(num => {
    const list = numberToImeis[num];
    if (list.length > 1) {
      changes.push({
        type: 'HANDSET_CHANGE',
        title: 'Device Change (Single MSISDN on Multiple IMEIs)',
        description: `Phone number ${num} was observed operating across ${list.length} different IMEI devices.`,
        targetNumber: num,
        details: list.map(l => `IMEI ${l.imei} (First seen: ${l.firstSeen}, Record: ${l.recordId})`),
        evidence: list.map(l => ({ recordId: l.recordId, file: l.sourceFile, row: l.sourceRow, timestamp: l.firstSeen }))
      });
    }
  });

  // IMEI used by multiple MSISDNs
  Object.keys(imeiToNumbers).forEach(imei => {
    const list = imeiToNumbers[imei];
    if (list.length > 1) {
      changes.push({
        type: 'SIM_SWAP_OR_DEVICE_SHARE',
        title: 'SIM Swap / Handset Sharing Detected',
        description: `Device IMEI ${imei} was observed transmitting with ${list.length} different phone numbers.`,
        targetImei: imei,
        details: list.map(l => `MSISDN ${l.number} (First seen: ${l.firstSeen}, Record: ${l.recordId})`),
        evidence: list.map(l => ({ recordId: l.recordId, file: l.sourceFile, row: l.sourceRow, timestamp: l.firstSeen }))
      });
    }
  });

  return changes;
}

/**
 * Frequent Contacts and Communication breakdown for a given number
 */
export function getFrequentContacts(cdrRecords = [], targetNumber) {
  const contactMap = {};

  cdrRecords.forEach(r => {
    let contact = null;
    let direction = null;

    if (r.caller === targetNumber) {
      contact = r.receiver;
      direction = 'outgoing';
    } else if (r.receiver === targetNumber) {
      contact = r.caller;
      direction = 'incoming';
    }

    if (!contact) return;

    if (!contactMap[contact]) {
      contactMap[contact] = {
        contactNumber: contact,
        totalCalls: 0,
        incomingCalls: 0,
        outgoingCalls: 0,
        totalDurationSec: 0,
        firstCallTime: r.timestamp,
        lastCallTime: r.timestamp,
        records: []
      };
    }

    const c = contactMap[contact];
    c.totalCalls++;
    if (direction === 'incoming') c.incomingCalls++;
    if (direction === 'outgoing') c.outgoingCalls++;
    c.totalDurationSec += r.duration;
    if (new Date(r.timestamp) < new Date(c.firstCallTime)) c.firstCallTime = r.timestamp;
    if (new Date(r.timestamp) > new Date(c.lastCallTime)) c.lastCallTime = r.timestamp;
    c.records.push(r.record_id);
  });

  return Object.values(contactMap)
    .sort((a, b) => b.totalCalls - a.totalCalls)
    .map(c => ({
      ...c,
      totalDurationFormatted: `${Math.floor(c.totalDurationSec / 60)}m ${c.totalDurationSec % 60}s`,
      avgDurationSec: Math.round(c.totalDurationSec / c.totalCalls)
    }));
}

/**
 * Identify Communication Patterns (Night owl, burst, mutual)
 */
export function detectPatterns(cdrRecords = [], targetNumber) {
  const targetRecords = cdrRecords.filter(r => r.caller === targetNumber || r.receiver === targetNumber);
  
  const lateNightCalls = [];
  const longDurationCalls = [];

  targetRecords.forEach(r => {
    try {
      const hour = parseInt(r.timestamp.split(' ')[1]?.split(':')[0] || '12', 10);
      if (hour >= 0 && hour <= 5) {
        lateNightCalls.push(r);
      }
      if (r.duration >= 300) {
        longDurationCalls.push(r);
      }
    } catch {
      // ignore
    }
  });

  return {
    lateNightCallsCount: lateNightCalls.length,
    lateNightCalls: lateNightCalls.slice(0, 10),
    longDurationCallsCount: longDurationCalls.length,
    longDurationCalls: longDurationCalls.slice(0, 10)
  };
}
