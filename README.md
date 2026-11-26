# Telecom Intelligence
### CDR & IPDR Analysis and Telecom Forensics Platform

A web-based telecom investigation and forensic analysis platform designed to process synthetic Call Detail Records (CDR) and Internet Protocol Detail Records (IPDR). It helps investigators explore communication patterns, identify potential SIM/device anomalies, analyze approximate cell-tower associations, correlate CGNAT sessions, and generate evidence-backed investigation reports.

> **Project Type:** Hackathon Demonstration Prototype  
> **Purpose:** Educational use, telecom data analysis, and forensic investigation simulation.

---

## Overview

Telecom Intelligence is a centralized platform that transforms structured telecom records into actionable investigative insights.

The application supports multiple CDR formats, IPDR session analysis, communication network visualization, approximate tower association timelines, and rule-based investigation assistance.

It is designed with a focus on data traceability, analytical accuracy, and transparent evidence presentation.

### Key Capabilities

- Multi-operator CDR ingestion and normalization.
- Communication frequency and pattern analysis.
- SIM and IMEI change anomaly detection.
- Interactive communication network visualization.
- Approximate cellular tower association mapping.
- CGNAT-based IPDR subscriber correlation.
- Evidence-backed investigation assistant.
- Investigation report generation and data export.

---

## Important Data & Forensic Disclaimer

**This project uses 100% synthetic demonstration data.**

- All phone numbers, IMEIs, IMSIs, IP addresses, tower identifiers, and subscriber sessions are generated for testing and demonstration.
- The application has no connection to live telecom operator infrastructure, private surveillance systems, or real subscriber databases.
- Cell tower associations indicate approximate radio-sector coverage, not precise GPS coordinates or conclusive evidence of a person's physical location.
- A tower association alone cannot establish an individual's movement or presence at a particular location.
- Public IP attribution under Carrier-Grade NAT (CGNAT) requires accurate correlation using the public IP address, source port, and exact timestamp.
- Analytical alerts indicate patterns requiring further investigation; they do not establish criminal activity.

The platform is intended strictly for educational, research, and authorized forensic demonstration purposes.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, JavaScript |
| Backend | Node.js, Express.js |
| Styling | Custom CSS |
| Charts | Recharts |
| Network Visualization | Interactive SVG |
| Mapping | Leaflet, OpenStreetMap |
| Data Processing | CSV and JSON |
| API Communication | REST APIs |

### Design System

The interface uses a professional dark forensic dashboard theme.

- Background: `#070b14`
- Secondary Background: `#0d1424`
- Surface: `#131c31`
- Cyan Accent: `#06b6d4`
- Blue Accent: `#3b82f6`

---

## System Architecture

The application follows a modular frontend-backend architecture.

```text
                 TELECOM INTELLIGENCE
                          |
              +-----------+-----------+
              |                       |
          FRONTEND                 BACKEND
         React + Vite           Node + Express
              |                       |
      +-------+-------+       +-------+-------+
      |       |       |       |       |       |
   Dashboard CDR   Network  Analytics IPDR  Assistant
              |                       |
              +-----------+-----------+
                          |
                   SYNTHETIC DATA
                          |
              +-----------+-----------+
              |           |           |
            CDR CSV     IPDR JSON   CGNAT Logs
              |
           Towers Data
```

---

## Project Structure

```text
Telecom Intelligence/
│
├── backend/
│   ├── data/
│   │   ├── operator_a_sample.csv
│   │   ├── operator_b_sample.csv
│   │   ├── ipdr_sample.json
│   │   ├── cgnat_mappings.json
│   │   └── towers.json
│   │
│   ├── services/
│   │   ├── cdrNormalizer.js
│   │   ├── analyticsService.js
│   │   ├── ipdrService.js
│   │   └── aiAssistantService.js
│   │
│   ├── server.js
│   ├── test_api.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── DashboardView.jsx
│   │   │   ├── CdrAnalysisView.jsx
│   │   │   ├── NetworkGraphView.jsx
│   │   │   ├── TowerTimelineView.jsx
│   │   │   ├── IpdrAnalysisView.jsx
│   │   │   ├── AssistantView.jsx
│   │   │   └── ReportsView.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
├── sample-data/
│   ├── operator_a_sample.csv
│   ├── operator_b_sample.csv
│   └── sample_ipdr.csv
│
└── README.md
```

---

## Core Modules & Features

### 1. Investigation Dashboard

Provides a centralized overview of telecom investigation data.

**Features:**
- Total CDR and IPDR record counts.
- Unique phone number and IMEI statistics.
- SIM/IMEI anomaly indicators.
- Daily call volume visualization.
- 24-hour communication pattern analysis.
- Recent investigation activity.

The dashboard helps investigators identify patterns that may require additional examination.

### 2. CDR Analysis & Normalization

Supports ingestion and analysis of different operator-specific CDR formats.

**Supported sample schemas:**

**Operator A**
```csv
caller,receiver,call_time,duration,imei,cell_id
```

**Operator B**
```csv
from_number,to_number,timestamp,call_duration,device_imei,tower_id
```

**Features:**
- Automatic schema detection.
- CSV parsing and field normalization.
- Search and filtering.
- Date and phone number filters.
- Pagination.
- Late-night communication indicators.

### 3. Communication Network Graph

Visualizes relationships between phone numbers through an interactive communication topology.

**Features:**
- Central target number visualization.
- Connected contact nodes.
- Call-frequency-based connection weights.
- Interactive contact inspection.
- Communication frequency and duration.
- Earliest and latest interaction timestamps.
- Individual CDR record inspection.

This module helps explore communication relationships within the available dataset.

### 4. Tower Timeline & Geographic Analysis

Provides an approximate geographic representation of cell tower associations.

**Features:**
- Interactive Leaflet map.
- OpenStreetMap integration.
- Cell tower markers.
- Coverage-sector visualization.
- Chronological tower association events.
- Sequential association timeline.
- Map navigation through tower event selection.

**Important:** Tower associations represent approximate network coverage and must not be interpreted as exact device locations.

### 5. IPDR Analysis & CGNAT Correlation

Analyzes network session records and demonstrates subscriber correlation using CGNAT translation data.

**Required correlation parameters:**
1. Public IP address.
2. Source port.
3. Exact timestamp.

**Verification outcomes:**

| Status | Explanation |
|---|---|
| Match Found | A matching synthetic translation record is available. |
| Unverified | No valid translation lease matches the supplied parameters. |
| Insufficient Information | Required correlation parameters are missing. |

**Demonstration presets:**
- Successful correlation.
- Unmatched port/timestamp.
- Public IP without sufficient information.

The module demonstrates why public IP addresses alone cannot reliably identify individual subscribers under CGNAT.

### 6. Investigation Assistant

A rule-based investigation assistant that processes questions against the loaded synthetic dataset.

**Example queries:**
- Which number has the highest outgoing call count?
- Who are the most frequent contacts of a selected number?
- Show the tower association timeline.
- Are there any SIM/IMEI changes?
- Is there a matching IPDR session?
- Are there unusual late-night communication patterns?

**Evidence Guardrails:**
- Answers are generated using available records and analytics.
- Supporting evidence includes record identifiers and source references.
- Missing information is explicitly reported.
- The assistant does not invent unsupported subscriber information or investigative conclusions.

**Note:** This is a rule-based assistant, not a generative AI or live telecom intelligence service.

### 7. Investigation Reports & Export

Generates structured investigation summaries from the available demonstration data.

**Features:**
- Case summary generation.
- Suspect/target profile overview.
- Device anomaly summary.
- Frequent contact analysis.
- Tower association timeline.
- Supporting evidence records.
- CSV report download.
- Print-friendly PDF export through browser printing.

---

## Getting Started

### Prerequisites

Install the following before running the application:

- Node.js v18 or higher.
- npm.
- Git (optional).
- Windows PowerShell or Command Prompt.

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd "Telecom Intelligence"
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

Open another terminal from the project root:

```bash
cd frontend
npm install
```

### 4. Start the Backend

In Terminal 1:

```bash
cd backend
npm start
```

The Express server is expected to run at:

```text
http://localhost:5000
```

The demonstration dataset includes approximately 60+ CDR records, 10 IPDR sessions, 8 cell towers, and 7 CGNAT translation leases.

### 5. Start the Frontend

In Terminal 2:

```bash
cd frontend
npm run dev
```

Open the local Vite URL displayed in the terminal.

The default configured frontend port may be `3000`; use the actual URL printed by Vite if it differs.

---

## Backend Testing

Run the automated backend verification suite:

```bash
cd backend
npm test
```

The test suite is intended to verify the application's core API routes and expected responses.

---

## Demonstration Workflow

A suggested investigation walkthrough:

1. Open the Dashboard and review the available dataset statistics.
2. Navigate to CDR Analysis and load an operator sample.
3. Explore communication patterns through the Network Graph.
4. Review chronological tower associations on the map.
5. Open IPDR Analysis and demonstrate all three CGNAT correlation outcomes.
6. Ask investigation questions through the Assistant.
7. Generate and export an investigation report.

This workflow demonstrates how multiple telecom record types can be analyzed within one application.

---

## Future Enhancements

Potential future improvements include:

- Additional operator-specific CDR schema support.
- Larger synthetic datasets for performance testing.
- Advanced temporal and frequency-based anomaly detection.
- More comprehensive evidence provenance and audit logs.
- Role-based investigator access and case management.
- Secure database-backed record storage.
- Improved report templates and evidence exports.
- Automated data validation and ingestion monitoring.

Any integration with real telecom data would require appropriate authorization, privacy safeguards, and compliance with applicable laws.

---

## Security & Privacy

The prototype is designed around synthetic data and does not provide unauthorized access to subscriber information.

Future production deployments should implement:
- Authentication and authorization.
- Encryption of sensitive records.
- Secure file upload validation.
- Audit trails.
- Data retention policies.
- Access control and investigator accountability.

---

## License & Usage

Developed for hackathon demonstration, educational evaluation, and research purposes.

All included demonstration records are synthetic. The project must not be used to make real-world subscriber attribution or surveillance decisions.

---

**Telecom Intelligence — Turning Synthetic Telecom Records into Structured, Evidence-Backed Insights.**
