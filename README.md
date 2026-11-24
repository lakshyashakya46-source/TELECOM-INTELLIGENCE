<<<<<<< HEAD
# TELECOM INTELLIGENCE – CDR/IPDR Analysis Platform

> **Hackathon Demonstration Prototype**  
> *A clean, functional, and beginner-friendly web application for telecom forensic investigation triage. This platform analyzes synthetic CDR (Call Detail Records) and IPDR (Internet Protocol Detail Records), identifies communication patterns, displays approximate cellular tower associations, and provides an evidence-backed investigation assistant.*

---

## ⚠️ Important Forensic & Synthetic Data Disclaimer
- **100% Synthetic Demo Data:** All phone numbers, IMEIs, IMSIs, public/private IPs, cell tower identifiers, and subscriber sessions in this platform are locally generated synthetic demonstration records.
- **No Live Operator Connection:** This software does not tap into live cellular networks or access real private surveillance streams.
- **Tower Association Notice:** Cell tower association reflects base station antenna sector radio coverage, **NOT exact GPS location or conclusive proof of physical human movement**.
- **CGNAT Address Sharing Notice:** Under modern Carrier-Grade NAT (CGNAT), hundreds or thousands of mobile devices share the exact same public IPv4 address simultaneously. Identifying a subscriber using only a public IP address is technically invalid. A valid correlation strictly requires the **3-tuple: (Public IP, Source Port, Exact Timestamp)**.

---

## Technology Stack
- **Frontend:** React 18, Vite, JavaScript (ES Modules)
- **Styling:** Custom CSS (Professional Dark Navy/Blue Cyber Forensics Theme: `#070b14` / `#0d1424` / `#131c31` with `#06b6d4` cyan and `#3b82f6` blue accents)
- **Visualizations:** Recharts (Call volume timelines & 24-hour diurnal bar chart)
- **Network Graph:** Custom interactive vector SVG communication topology with orbital node layout, call frequency badges, zoom/pan controls, and click-to-inspect contact drawer
- **Geographic Mapping:** Leaflet + OpenStreetMap tile layer with cell sector radiuses and chronological transit polylines
- **Backend:** Node.js (v18+) + Express.js REST API
- **Data Stores:** Local synthetic CSV and JSON datasets with automated schema normalization
- **Assistant:** Zero-hallucination rule-based forensic NLP correlation engine with exact record citations

---

## Project Structure

```
Telecom intelligence/
├── backend/
│   ├── data/
│   │   ├── operator_a_sample.csv   # Schema: caller, receiver, call_time, duration, imei, cell_id
│   │   ├── operator_b_sample.csv   # Schema: from_number, to_number, timestamp, call_duration, device_imei, tower_id
│   │   ├── ipdr_sample.json        # Cellular session records (public IP, port, private IP, bytes)
│   │   ├── cgnat_mappings.json     # Dynamic NAT translation tables (port lease windows, MSISDN, IMEI)
│   │   └── towers.json             # NCR cell towers metadata (lat, lng, coverage, azimuth)
│   ├── services/
│   │   ├── cdrNormalizer.js        # Multi-operator CSV schema detector and normalizer
│   │   ├── analyticsService.js     # Frequency rankings, SIM/IMEI swap detector, diurnal patterns
│   │   ├── ipdrService.js          # CGNAT 3-tuple correlation engine
│   │   └── aiAssistantService.js   # Rule-based investigation query engine with evidence citations
│   ├── server.js                   # Express application and REST routes
│   ├── test_api.js                 # Automated backend test suite
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx         # 7-module navigation & demo data controls
│   │   │   ├── Header.jsx          # Case banner, active target selector, health indicator
│   │   │   ├── DashboardView.jsx   # KPI cards, Recharts call volume, 24-hr chart, top callers
│   │   │   ├── CdrAnalysisView.jsx # Ingestion, CSV upload, filterable table, nocturnal badges
│   │   │   ├── NetworkGraphView.jsx# Interactive SVG topology, call weight, contact drawer
│   │   │   ├── TowerTimelineView.jsx# Leaflet map, coverage sectors, chronological sequence
│   │   │   ├── IpdrAnalysisView.jsx# CGNAT correlation tool & session records
│   │   │   ├── AssistantView.jsx   # Evidence-based investigation assistant chat
│   │   │   └── ReportsView.jsx     # Case report generator, CSV download, PDF print
│   │   ├── api.js                  # Fetch wrapper for backend endpoints
│   │   ├── App.jsx                 # Master application state
│   │   ├── index.css               # Dark navy design system
│   │   └── main.jsx
│   ├── vite.config.js              # Proxy configuration (/api -> localhost:5000)
│   ├── index.html
│   └── package.json
├── sample-data/
│   ├── operator_a_sample.csv
│   ├── operator_b_sample.csv
│   └── sample_ipdr.csv
└── README.md
```

---

## Getting Started on Windows

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended; v24 verified)
- Windows PowerShell or Command Prompt

---

### Step 1: Install Dependencies

Open a PowerShell terminal in the project directory:

```powershell
# 1. Install Backend Dependencies
cd backend
npm install

# 2. Install Frontend Dependencies
cd ..\frontend
npm install
```

---

### Step 2: Run the Backend Server

In Terminal 1:
```powershell
cd backend
npm start
```
*The Express backend will start on **`http://localhost:5000`**, loading 60+ synthetic CDR records, 10 IPDR sessions, 8 cell towers, and 7 CGNAT translation leases.*

---

### Step 3: Run the Frontend Application

In a new Terminal 2 (from project root):
```powershell
cd frontend
npm run dev
```
*The Vite development server will start on **`http://localhost:3000`** (or configured Vite port). Open this URL in your web browser.*

---

### Automated Backend Verification Test
To verify all 9 core Express API routes pass with HTTP 200 OK:
```powershell
cd backend
npm test
```

---

## Investigation Walkthrough & Key Features

### 1. Main Dashboard
- **5 Forensic KPI Cards:** Total CDRs (60+), Total IPDRs (10), Unique Phone Numbers, Unique IMEIs, Detected SIM/IMEI Anomalies.
- **Recharts Visualizations:** Daily Call Volume Area Chart & 24-Hour Diurnal Pattern Bar Chart (highlighting nocturnal calls between 00:00 and 05:00).
- **Recent Activity Log:** Displays alerts such as handset swaps, burst nocturnal calls, and IPDR synchronizations.

### 2. CDR Analysis & Normalization
- **Multi-Operator Ingestion:** Seamlessly parses two distinct industry formats:
  - **Operator A:** `caller, receiver, call_time, duration, imei, cell_id`
  - **Operator B:** `from_number, to_number, timestamp, call_duration, device_imei, tower_id`
- **Instant Test Presets:** Click *"Test Operator A Schema"* or *"Test Operator B Schema"* to test schema detection and normalizer on the fly.
- **Filtering & Search:** Instant keyword search across callers, receivers, IMEIs, Cell IDs, plus phone number and date filters with pagination.

### 3. Communication Network Graph
- **Radial Orbital Topology:** Visualizes target `+91 98765 43210` in the center surrounded by connected contacts.
- **Call Frequency Indicators:** Connection lines scale in thickness based on call count and display call count badges.
- **Interactive Contact Drawer:** Click any contact node (e.g. associate `+91 91234 56789` or late-night burner `+91 97711 22334`) to inspect mutual interaction ratio, total duration, earliest/latest call times, and individual CDR records.

### 4. Tower Timeline & Map View
- **Interactive Leaflet Map:** Displays cell tower markers across the National Capital Region (Aerocity, Connaught Place, Chandni Chowk, Dhaula Kuan, Noida, Gurugram) with coverage sector radiuses.
- **Chronological Transit Path:** Polyline connecting sequential base station associations.
- **Tower Cards:** Click any chronological event to fly the map camera directly to that tower sector.

### 5. IPDR Analysis & CGNAT Correlation Tool
- **CGNAT 3-Tuple Correlation Engine:** Input `Public IP`, `Source Port`, and `Timestamp` to query carrier translation logs.
- **Three Supported Verification States:**
  - `Match Found`: Corroborates exact subscriber MSISDN, Private IP, Handset IMEI, and carrier translation log reference.
  - `Unverified`: Explains why the port translation lease was inactive.
  - `Insufficient Information`: Triggers when an investigator supplies an IP without a port, explaining why CGNAT address multiplexing prevents single-IP attribution.
- **Test Presets:** Three 1-click test buttons to demonstrate each state.

### 6. AI Investigation Assistant
- **Rule-Based Forensic NLP Engine:** Answers questions using actual loaded demo records and analytics without external paid AI keys.
- **Pre-Configured Quick Questions:**
  - *"Which number has the highest number of outgoing calls?"*
  - *"Who are the most frequent contacts of +91 98765 43210?"*
  - *"Show this number's tower timeline."*
  - *"Are there any SIM/IMEI changes detected?"*
  - *"Is there a matching IPDR session for 198.51.100.45 port 41200?"*
  - *"Are there any suspicious late-night calls?"*
- **Strict Evidence Guardrail:** Every answer displays clickable **Supporting Evidence Cards** (Record ID, CSV file origin, row number, timestamp, call event details) or clearly states *"Insufficient data"*. Zero hallucinations.

### 7. Reports & Export
- **Formal Case Dossier:** Synthesizes suspect profile, hardware anomalies, top 5 associates, tower transit itinerary, and sample evidence rows.
- **1-Click CSV Export:** Generates and downloads a clean RFC4180-compliant `.csv` report file directly to your disk.
- **Print / PDF Export:** Clean print-optimized layout ready for printing or saving as PDF.

---

## License
Created for hackathon demonstration and educational evaluation purposes.
=======
# TELECOM-INTELLIGENCE
Telecom Intelligence is a web-based investigation platform for analyzing CDR, IPDR, IP addresses, port numbers, timestamps, cell tower data, and CGNAT mappings. It correlates telecom records to identify network activity, trace digital evidence, and uncover suspicious patterns through a centralized dashboard.
>>>>>>> 0bc6d69c701f93b51b5eaad39bcc7b609e6ebefb
# TELECOM-INTELLIGENCE
