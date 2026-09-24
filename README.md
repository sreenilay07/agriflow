# MANDI MITHRA
## Intelligent Farm Produce Procurement & Supply Chain Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-19.0.0-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-4.0-teal.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-green.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-35%2F35%20Passing-success.svg)](#-automated-testing)

---

### 🌟 Executive Overview
**Mandi Mithra** is a next-generation agricultural technology platform connecting farmers, quality grading laboratories, mandi collection centres, regional warehouses, institutional B2B buyers, and logistics transport fleets into a unified, transparent, and intelligent digital supply chain ecosystem.

The platform provides end-to-end provenance and unbroken traceability across the entire farm-to-table lifecycle:

```mermaid
flowchart LR
    A[🌾 Farmer / Farm] --> B[🏢 Collection Centre]
    B --> C[🔬 Quality Inspection]
    C --> D[🏭 Warehouse Inventory]
    D --> E[🛒 Buyer PO Discovery]
    E --> F[📦 Lot Allocation]
    F --> G[🚚 Logistics Dispatch]
    G --> H[✅ Buyer Delivery]
    H --> I[💳 Automated Settlement]
    I --> J[⚖️ Grievance / Audit]
```

---

### 🚀 Core Platform Capabilities

1. **Farmer & Farm Acreage Management**
   - GeoJSON land boundary mapping, survey number verification, and multi-crop yield tracking.
   - Workload-aware mandi slot booking with dynamic token generation and arrival time estimators.

2. **Scientific Quality Inspection & Grading**
   - Laboratory appraisal recording moisture %, foreign matter %, and defective grain count.
   - Algorithmic quality score generation ($0-100$) assigning Grade A, Grade B, Grade C, or Rejection.
   - Non-binding AI Quality Assistant alerting inspectors to elevated storage risks (>14% moisture).

3. **Regional Warehousing & Dynamic Bin Storage**
   - Multi-warehouse capacity utilization monitoring with automated near-capacity alarms ($\ge 85\%$).
   - Immutable `InventoryMovement` transaction ledger logging intake, bin transfers, reservations, and dispatches.

4. **B2B Buyer Marketplace & Purchase Order Execution**
   - Real-time catalog of accredited mandi inventory filtered by crop, grade, and warehouse location.
   - Multi-item Purchase Orders with approval workflows and automated warehouse lot reservation.

5. **Fleet Logistics & Dispatch Operations**
   - Transport vehicle registry with payload capacity validation against cargo manifest.
   - Transit tracking with AI-assisted delivery risk scoring and signed digital delivery confirmation.

6. **Transparent Farmer Settlement Vouchers**
   - Automated payout generation applying MSP base rates, grade quality multipliers, and itemized mandi fee deductions.
   - Multi-channel instant disbursement audit trail with SMS/Push notification alerts.

7. **AI Intelligence & Anomaly Detection**
   - Google Gemini 1.5 Flash integration with offline deterministic domain heuristics for 100% offline resilience.
   - Automated background anomaly detection flagging transit delays, unallocated POs, and excessive rejections.

8. **Realtime Socket.IO & Notification Center**
   - Targeted room segregation (`user:*`, `role:*`, `centre:*`, `warehouse:*`, `buyer:*`, `farmer:*`).
   - Interactive header Notification Center with priority chips, unread counters, and deep links.

9. **Global Search (`⌘K`) & Enterprise CSV Exporter**
   - Instant multi-entity lookup across lots, orders, shipments, warehouses, and farmers.
   - Streaming RFC 4180 CSV exports for lots, purchase orders, inventory, shipments, and settlements.

---

### 📂 Repository Structure

```
agriflow/
├── backend/
│   ├── src/
│   │   ├── controllers/         # REST API route controllers
│   │   ├── models/              # 20+ Mongoose domain models
│   │   ├── routes/              # Express API endpoints
│   │   ├── services/
│   │   │   ├── ai/              # Gemini AI client, prompts, & domain fallback heuristics
│   │   │   ├── realtime/        # Event service, event types, & room helpers
│   │   │   ├── analytics.service.js
│   │   │   ├── anomalyService.js
│   │   │   ├── export.service.js
│   │   │   ├── search.service.js
│   │   │   └── lotStateMachine.js
│   │   ├── socket/              # Socket.IO connection and room handlers
│   │   └── app.js               # Express application initialization & middleware
│   ├── tests/                   # Jest automated test suites
│   ├── .env.example             # Backend environment template
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components & role widgets
│   │   │   ├── notifications/   # NotificationCenter component
│   │   │   ├── layout/          # AppHeader, Sidebar, Navigation
│   │   │   └── ui/              # AIInsightCard, RiskBadge, DateRangeSelector, GlobalSearch, ExportButton
│   │   ├── pages/               # Role dashboards and workflows
│   │   ├── services/api/        # Typed API clients for all backend routes
│   │   ├── hooks/               # useRealtime and custom React hooks
│   │   ├── store/               # Zustand state stores
│   │   └── App.tsx              # React Router v7 application setup
│   ├── .env.example             # Frontend environment template
│   └── package.json
└── docs/
    ├── FINAL_ARCHITECTURE.md    # Complete platform architectural blueprint
    ├── DATABASE_SCHEMA.md       # Comprehensive database models and indexes
    ├── API_DOCUMENTATION.md     # Full REST & Realtime API reference
    ├── USER_GUIDE.md            # Role-by-role operational user guide
    ├── DEMO_CREDENTIALS.md      # Demo user accounts and test credentials
    ├── FINAL_CODEBASE_AUDIT.md  # Capstone scorecard & validation report
    └── PHASE_7_IMPLEMENTATION.md# Phase 7 AI & Realtime technical report
```

---

### 🛠️ Getting Started

#### 1. Prerequisites
- **Node.js** $\ge 18.0.0$
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)
- **npm** or **pnpm**

#### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run seed     # Populate database with initial demo data
npm run dev      # Starts backend server on http://localhost:5000
```

#### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

#### 4. Automated Testing
Run the complete automated test suite:
```bash
cd backend
npm test
```

---

### 👥 User Roles & Demo Credentials

| Role | Email / Phone | Password | Access Portal |
|---|---|---|---|
| **Super Admin** | `admin@agritrade.gov.in` | `Admin@123456` | `/admin` |
| **District Officer** | `district@agritrade.gov.in` | `Officer@123456` | `/district` |
| **Centre Manager** | `manager@agritrade.gov.in` | `Manager@123456` | `/manager` |
| **Quality Inspector** | `inspector@agritrade.gov.in` | `Inspector@123456` | `/officer/inspect` |
| **B2B Buyer** | `buyer@agritrade.gov.in` | `Buyer@123456` | `/buyer` |
| **Logistics Coordinator** | `logistics@agritrade.gov.in` | `Logistics@123456` | `/logistics` |
| **Farmer (Demo)** | `9111111111` | OTP: `123456` | `/farmer` |

---

### 📄 Documentation Links
- [System Architecture](file:///docs/FINAL_ARCHITECTURE.md)
- [Database Schema](file:///docs/DATABASE_SCHEMA.md)
- [API Reference](file:///docs/API_DOCUMENTATION.md)
- [User Guide](file:///docs/USER_GUIDE.md)
- [Demo Credentials](file:///docs/DEMO_CREDENTIALS.md)
- [Phase 7 Implementation](file:///docs/PHASE_7_IMPLEMENTATION.md)
- [Final Codebase Audit](file:///docs/FINAL_CODEBASE_AUDIT.md)

---

### 🛡️ License
This project is licensed under the MIT License.
