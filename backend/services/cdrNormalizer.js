/**
 * CDR Normalizer Service
 * Normalizes different telecom operator CSV schemas into a unified investigation schema.
 * 
 * Supports:
 * - Operator A: caller, receiver, call_time, duration, imei, cell_id
 * - Operator B: from_number, to_number, timestamp, call_duration, device_imei, tower_id
 */

export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  
  const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split on commas while preserving simple CSV formatting
    const values = rawLine.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    if (values.length < headers.length) continue;

    const rowObj = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    records.push({ rowNumber: i + 1, data: rowObj, raw: rawLine });
  }

  return { headers, records };
}

export function normalizeCdrRecords(parsedCsv, sourceFileName = 'unknown.csv') {
  const { headers, records } = parsedCsv;

  // Detect Operator Format
  const isOperatorA = headers.includes('caller') && headers.includes('receiver');
  const isOperatorB = headers.includes('from_number') && headers.includes('to_number');

  return records.map((rec, index) => {
    const d = rec.data;
    let caller = '';
    let receiver = '';
    let timestamp = '';
    let duration = 0;
    let imei = '';
    let cell_id = '';
    let operatorType = 'Generic';

    if (isOperatorA) {
      operatorType = 'Operator A';
      caller = d['caller'];
      receiver = d['receiver'];
      timestamp = d['call_time'];
      duration = parseInt(d['duration'], 10) || 0;
      imei = d['imei'];
      cell_id = d['cell_id'];
    } else if (isOperatorB) {
      operatorType = 'Operator B';
      caller = d['from_number'];
      receiver = d['to_number'];
      timestamp = d['timestamp'];
      duration = parseInt(d['call_duration'], 10) || 0;
      imei = d['device_imei'];
      cell_id = d['tower_id'];
    } else {
      // Fallback best effort
      caller = d['caller'] || d['from_number'] || d['from'] || d['src'] || 'Unknown';
      receiver = d['receiver'] || d['to_number'] || d['to'] || d['dst'] || 'Unknown';
      timestamp = d['call_time'] || d['timestamp'] || d['time'] || d['datetime'] || new Date().toISOString();
      duration = parseInt(d['duration'] || d['call_duration'] || '0', 10);
      imei = d['imei'] || d['device_imei'] || 'Unknown';
      cell_id = d['cell_id'] || d['tower_id'] || d['tower'] || 'Unknown';
    }

    // Standardize timestamp formatting if needed
    let cleanTime = timestamp;
    try {
      const dt = new Date(timestamp);
      if (!isNaN(dt.getTime())) {
        cleanTime = dt.toISOString().replace('T', ' ').substring(0, 19);
      }
    } catch {
      // Keep original
    }

    return {
      record_id: `CDR-${sourceFileName.replace('.csv', '')}-${String(index + 1).padStart(3, '0')}`,
      source_file: sourceFileName,
      source_row: rec.rowNumber,
      operator_format: operatorType,
      caller: caller.trim(),
      receiver: receiver.trim(),
      timestamp: cleanTime,
      duration: duration,
      duration_formatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
      imei: imei.trim(),
      cell_id: cell_id.trim()
    };
  });
}
