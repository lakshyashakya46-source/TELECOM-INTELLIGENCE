/**
 * API client for Telecom Intelligence Backend
 */

const BASE_URL = '/api';

export async function fetchHealth() {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchDashboard() {
  const res = await fetch(`${BASE_URL}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard analytics');
  return res.json();
}

export async function fetchCdr(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/cdr?${query}`);
  if (!res.ok) throw new Error('Failed to fetch CDR records');
  return res.json();
}

export async function uploadCdrCsv({ csvData, filename, mode = 'append' }) {
  const res = await fetch(`${BASE_URL}/cdr/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvData, filename, mode })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to upload and normalize CSV');
  }
  return res.json();
}

export async function fetchIpdr(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/ipdr?${query}`);
  if (!res.ok) throw new Error('Failed to fetch IPDR records');
  return res.json();
}

export async function fetchNetwork(number) {
  const res = await fetch(`${BASE_URL}/network/${encodeURIComponent(number)}`);
  if (!res.ok) throw new Error(`Failed to fetch network graph for ${number}`);
  return res.json();
}

export async function fetchTimeline(number) {
  const res = await fetch(`${BASE_URL}/timeline/${encodeURIComponent(number)}`);
  if (!res.ok) throw new Error(`Failed to fetch tower timeline for ${number}`);
  return res.json();
}

export async function correlateIpdr(payload) {
  const res = await fetch(`${BASE_URL}/correlate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to run IPDR correlation');
  return res.json();
}

export async function fetchReport(number) {
  const res = await fetch(`${BASE_URL}/report/${encodeURIComponent(number)}`);
  if (!res.ok) throw new Error(`Failed to generate report for ${number}`);
  return res.json();
}

export async function queryAssistant(question) {
  const res = await fetch(`${BASE_URL}/assistant`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error('Failed to query investigation assistant');
  return res.json();
}

export async function fetchTowers() {
  const res = await fetch(`${BASE_URL}/towers`);
  if (!res.ok) throw new Error('Failed to fetch towers');
  return res.json();
}

export async function resetDemoData() {
  const res = await fetch(`${BASE_URL}/reset`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset dataset');
  return res.json();
}
