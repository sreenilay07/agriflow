# MANDI MITHRA — Phase 7 Implementation Report
## AI Intelligence, Realtime Operations & Advanced Supply Chain Analytics

---

### Executive Summary
Phase 7 elevates Mandi Mithra (AgriTrade) from an enterprise procurement workflow system into an intelligent, event-driven, proactive agri-supply chain ecosystem. It introduces:
1. **AI Domain Intelligence Layer** with Google Gemini 1.5 Flash integration and offline deterministic fallback heuristics.
2. **Centralized Realtime Event Architecture** via Socket.IO, targeted multi-role rooms, and persistent database notifications.
3. **Automated Anomaly & Risk Detection** monitoring warehouse capacity ceilings, shipment transit delays, unallocated purchase orders, excessive lot rejections, and open grievances.
4. **Server-Side Aggregations & Analytics Engine** with dynamic temporal filtering (`today`, `7d`, `30d`, `90d`, `this_year`, `custom`).
5. **Global Multi-Entity Search** indexing Lots, Purchase Orders, Shipments, Warehouses, Farms, and Users.
6. **Enterprise CSV Data Exporter** supporting operational and audit exports across all core entities.

---

### 1. AI Intelligence Layer Architecture

#### 1.1 Multi-Tier AI Provider
- **Primary AI Provider**: Google Gemini 1.5 Flash API client (`aiProvider.js`) configured via `GEMINI_API_KEY`.
- **System Instruction**: Enforces domain-specific agricultural rules, JSON-only outputs, and strict assistance boundaries. AI suggestions are non-binding and never override authorized personnel (e.g. Quality Inspectors).
- **Deterministic Offline Heuristics**: If the `GEMINI_API_KEY` is absent, invalid, or API rate limits are reached, the system seamlessly falls back to mathematical and rule-based heuristic calculations.

#### 1.2 Core AI Capabilities & Endpoints
| Endpoint | Method | Role Scopes | Function |
|---|---|---|---|
| `/api/ai/insights/procurement` | GET | `SUPER_ADMIN`, `DISTRICT_OFFICER`, `CENTRE_MANAGER`, `BUYER` | Evaluates procurement demand vs available inventory, identifies warehouse bottlenecks, and predicts supply tightness. |
| `/api/ai/interpret/quality` | POST | `QUALITY_INSPECTOR`, `CENTRE_MANAGER`, `SUPER_ADMIN` | Evaluates moisture %, foreign matter %, grain score, highlights storage risks (>14% moisture), and suggests secondary cleaning actions. |
| `/api/ai/insights/farmer` | GET | `FARMER` | Generates personalized farmer feedback on historical approval rates, voucher settlement timelines, and delivery trends. |
| `/api/ai/risk/shipment/:id` | GET | `LOGISTICS_COORDINATOR`, `BUYER`, `SUPER_ADMIN` | Computes shipment transit risk by matching vehicle capacity vs cargo weight and comparing transit duration against ETA. |
| `/api/ai/intelligence/warehouse/:id` | GET | `CENTRE_MANAGER`, `DISTRICT_OFFICER`, `SUPER_ADMIN` | Evaluates warehouse utilization, reserved vs free stock ratio, and suggests dispatch priorities. |

---

### 2. Centralized Realtime Event Architecture

#### 2.1 Socket Rooms
- `user:<userId>`: Individual private notification stream.
- `role:<ROLE_NAME>`: Broadcasts to specific role cohorts (e.g., all `LOGISTICS_COORDINATOR` or `BUYER`).
- `centre:<centreId>`: Mandi centre intake events and queue updates.
- `warehouse:<warehouseId>`: Warehouse inventory movements and allocations.
- `buyer:<buyerId>`: Purchase order approvals and shipment dispatches.
- `farmer:<farmerId>`: Lot acceptance, grading, and settlement voucher releases.

#### 2.2 Event Registry (`eventTypes.js`)
- **Lot Events**: `LOT_CREATED`, `LOT_UPDATED`, `LOT_STATUS_CHANGED`
- **Quality Events**: `INSPECTION_STARTED`, `INSPECTION_COMPLETED`, `LOT_GRADED`, `LOT_REJECTED`
- **Warehouse Events**: `INVENTORY_STORED`, `INVENTORY_RESERVED`, `INVENTORY_ALLOCATED`, `STOCK_LOW`
- **Buyer & PO Events**: `PO_SUBMITTED`, `PO_APPROVED`, `PO_REJECTED`, `PO_ALLOCATED`, `PO_COMPLETED`
- **Logistics Events**: `SHIPMENT_CREATED`, `SHIPMENT_DISPATCHED`, `SHIPMENT_IN_TRANSIT`, `SHIPMENT_DELIVERED`
- **Settlement & Dispute Events**: `SETTLEMENT_GENERATED`, `PAYMENT_COMPLETED`, `DISPUTE_RAISED`, `DISPUTE_RESOLVED`
- **System & Anomalies**: `ANOMALY_DETECTED`, `NOTIFICATION_RECEIVED`

---

### 3. Rule-Based Anomaly & Risk Detector (`anomalyService.js`)
Runs active queries across operational collections:
1. **Warehouse Near Capacity**: Flags warehouses operating at $\ge 85\%$ capacity (Warning) or $\ge 95\%$ capacity (Critical).
2. **Delayed In-Transit Shipments**: Flags shipments where current time has elapsed past the `estimatedArrivalDate` without delivery confirmation.
3. **High Produce Rejection**: Detects lots with $> 500$ kg rejected to alert procurement managers of sub-par harvests.
4. **Stale Approved Purchase Orders**: Flags orders in `APPROVED` status for $> 48$ hours without lot allocation.
5. **Unresolved Grievances**: Flags disputes awaiting manager mediation.

---

### 4. Advanced Analytics & Date Filtering (`analytics.service.js`)
Aggregates procurement metrics via MongoDB Aggregation Pipelines with support for preset and custom date intervals:
- **Time Periods**: `today`, `7d`, `30d`, `90d`, `this_year`, `custom` (with `startDate` and `endDate`).
- **Aggregated Modules**:
  - Procurement intake (lots, total tonnage, crop breakdown).
  - Quality inspection acceptance rate %, average quality score, grade distributions (Grade A / B / C / Rejected).
  - Financial totals (gross PO order volume vs farmer disbursals).
  - Logistics on-time delivery rate %.

---

### 5. Global Search & CSV Exporter

#### Global Search (`/api/search?q=...`)
- Tokenizes search input and searches across Produce Lots (`lotNumber`), Purchase Orders (`poNumber`), Shipments (`shipmentNumber`), Warehouses (`name`, `code`), and Users (`fullName`, `phoneNumber`).
- Filters results based on user RBAC permissions.

#### CSV Exporters (`/api/export/:resource`)
- Streams standard RFC 4180 CSV files directly to client browsers for `lots`, `orders`, `inventory`, `shipments`, and `settlements`.
- Sanitizes strings and escapes commas/newlines to prevent spreadsheet formula injection.

---

### 6. Automated Testing Verification
- Test Suite: `backend/tests/agritrade_phase7.test.js`
- Result: **7/7 Passed** (100% test pass rate across Event Architecture, AI Graceful Fallbacks, Date Range Parsing, and Anomaly Detection).
