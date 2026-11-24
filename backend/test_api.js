import http from 'http';

async function runTests() {
  console.log('--- Starting API Endpoint Verification ---');

  // Dynamically import server or run tests against http://127.0.0.1:5000
  process.env.PORT = '5005';
  await import('./server.js');

  // Wait 1s for server to listen
  await new Promise(r => setTimeout(r, 1000));

  const endpoints = [
    { method: 'GET', url: 'http://127.0.0.1:5005/api/health' },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/dashboard' },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/cdr' },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/ipdr' },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/network/%2B91%2098765%2043210' },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/timeline/%2B91%2098765%2043210' },
    { 
      method: 'POST', 
      url: 'http://127.0.0.1:5005/api/correlate',
      body: JSON.stringify({ publicIp: '198.51.100.45', sourcePort: 41200, timestamp: '2026-11-20 09:15:00' })
    },
    { method: 'GET', url: 'http://127.0.0.1:5005/api/report/%2B91%2098765%2043210' },
    { 
      method: 'POST', 
      url: 'http://127.0.0.1:5005/api/assistant',
      body: JSON.stringify({ question: 'Which number has the highest number of outgoing calls?' })
    }
  ];

  let passed = 0;
  for (const ep of endpoints) {
    try {
      const opts = {
        method: ep.method,
        headers: ep.body ? { 'Content-Type': 'application/json' } : {}
      };
      if (ep.body) opts.body = ep.body;

      const res = await fetch(ep.url, opts);
      if (res.ok) {
        const json = await res.json();
        console.log(`[PASS] ${ep.method} ${ep.url} -> Status: ${res.status}`);
        passed++;
      } else {
        console.error(`[FAIL] ${ep.method} ${ep.url} -> Status: ${res.status}`);
      }
    } catch (err) {
      console.error(`[ERR] ${ep.method} ${ep.url} -> ${err.message}`);
    }
  }

  console.log(`\nTests Completed: ${passed}/${endpoints.length} passed.`);
  process.exit(passed === endpoints.length ? 0 : 1);
}

runTests();
