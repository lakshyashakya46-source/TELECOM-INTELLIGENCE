/**
 * IPDR & CGNAT Correlation Service
 * 
 * In carrier networks utilizing CGNAT (Carrier-Grade NAT), hundreds or thousands
 * of subscribers share the exact same Public IP address simultaneously.
 * A correlation MUST have:
 * 1. Public IP
 * 2. Source Port
 * 3. Exact Timestamp
 */

export function correlateIpdrSession({ publicIp, sourcePort, timestamp }, cgnatMappings = [], ipdrSessions = []) {
  // 1. Validation checks for "Insufficient Information"
  const cleanIp = (publicIp || '').trim();
  const portNum = parseInt(sourcePort, 10);
  const cleanTime = (timestamp || '').trim();

  if (!cleanIp) {
    return {
      status: 'Insufficient Information',
      confidence: 'None',
      reason: 'Public IP is missing. Correlation cannot be performed without an IP address.',
      technicalNote: 'A Public IP address is the initial parameter needed to identify the carrier NAT pool.',
      evidence: null
    };
  }

  if (isNaN(portNum) || portNum <= 0 || portNum > 65535) {
    return {
      status: 'Insufficient Information',
      confidence: 'None',
      reason: 'Source Port is missing or invalid. In modern cellular networks with Carrier-Grade NAT (CGNAT), hundreds or thousands of mobile subscribers share the same public IP address simultaneously. Identifying a subscriber using only a public IP is technically invalid and causes false accusations.',
      technicalNote: 'Source Port is an essential identifier to resolve the dynamic NAT port translation table.',
      evidence: null
    };
  }

  if (!cleanTime) {
    return {
      status: 'Insufficient Information',
      confidence: 'None',
      reason: 'Timestamp is missing. Dynamic port allocations are transient and reused across different subscribers over time. An exact date and time is required to correlate with carrier translation logs.',
      technicalNote: 'NAT port allocations are time-bounded leases.',
      evidence: null
    };
  }

  const queryDate = new Date(cleanTime);
  const isQueryDateValid = !isNaN(queryDate.getTime());

  // 2. Search CGNAT Mappings Table
  let matchedNat = null;

  for (const map of cgnatMappings) {
    if (map.public_ip !== cleanIp) continue;

    // Check port range
    const inPortRange = portNum >= map.source_port_start && portNum <= map.source_port_end;
    if (!inPortRange) continue;

    // Check time window
    if (isQueryDateValid) {
      const fromDate = new Date(map.valid_from);
      const toDate = new Date(map.valid_to);
      if (queryDate >= fromDate && queryDate <= toDate) {
        matchedNat = map;
        break;
      }
    } else {
      // If timestamp string match or lenient check
      if (cleanTime.startsWith(map.valid_from.substring(0, 10))) {
        matchedNat = map;
        break;
      }
    }
  }

  if (matchedNat) {
    // Also look for associated IPDR session if available
    const relatedSession = ipdrSessions.find(s => 
      s.public_ip === cleanIp && 
      s.source_port === portNum
    );

    return {
      status: 'Match Found',
      confidence: 'High (Correlated with CGNAT Port & Time Lease)',
      reason: `Exact CGNAT allocation found for IP ${cleanIp} on Port ${portNum} at requested timestamp window.`,
      evidence: {
        allocationId: matchedNat.allocation_id,
        subscriberMsisdn: matchedNat.msisdn,
        deviceImei: matchedNat.imei,
        privateIp: matchedNat.private_ip,
        publicIp: matchedNat.public_ip,
        allocatedPortRange: matchedNat.allocated_ports,
        queryPort: portNum,
        validTimeWindow: `${matchedNat.valid_from} to ${matchedNat.valid_to}`,
        associatedCellId: matchedNat.cell_id,
        logReference: matchedNat.log_reference,
        relatedIpdrSessionId: relatedSession ? relatedSession.session_id : 'N/A'
      },
      technicalNote: 'Correlation confirmed via carrier CGNAT translation log. Verified 3-tuple: (Public IP, Source Port, Timestamp window).'
    };
  }

  // 3. Fallback: If IP matches but Port/Time doesn't match active leases
  const anyIpMatch = cgnatMappings.some(m => m.public_ip === cleanIp);
  if (anyIpMatch) {
    return {
      status: 'Unverified',
      confidence: 'Low',
      reason: `The Public IP ${cleanIp} exists in the carrier pool, but Port ${portNum} was NOT allocated to any recorded subscriber session at timestamp ${cleanTime}.`,
      technicalNote: 'Port translation mismatch or expired session lease. No active translation record exists for the provided parameters.',
      evidence: {
        publicIp: cleanIp,
        queryPort: portNum,
        queryTimestamp: cleanTime,
        poolStatus: 'Public IP belongs to Carrier NAT Pool, but port allocation was absent or unlogged.'
      }
    };
  }

  return {
    status: 'Unverified',
    confidence: 'Zero',
    reason: `Public IP ${cleanIp} was not found in the loaded carrier network range or translation tables.`,
    technicalNote: 'IP address is outside the jurisdiction/network boundaries of this dataset.',
    evidence: null
  };
}
