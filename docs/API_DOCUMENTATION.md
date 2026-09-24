# MANDI MITHRA — Complete REST & Realtime API Reference

---

### Authentication
All authenticated endpoints require an `Authorization` header containing the JWT Bearer token:
```
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

---

### API Route Directory

#### 1. Produce Lots (`/api/lots`)
- `POST /api/lots` — Create new produce lot (`FARMER`, `CENTRE_MANAGER`)
- `GET /api/lots` — List lots with filters for status, farmerId, cropId, date
- `GET /api/lots/:id` — Get detailed lot data with quality, inventory, and audit trail
- `PATCH /api/lots/:id/status` — Transition state with strict state machine validation
- `GET /api/lots/:id/traceability` — Full farm-to-dispatch traceability tree

#### 2. Quality Inspection (`/api/quality`)
- `POST /api/quality/inspections` — Record laboratory moisture, foreign matter, and assign grade (`QUALITY_INSPECTOR`)
- `GET /api/quality/inspections/lot/:lotId` — Retrieve inspection details for a lot
- `GET /api/quality/standards` — Retrieve government/mandi quality grading standards

#### 3. Warehouse & Inventory (`/api/inventory` & `/api/warehouses`)
- `GET /api/warehouses` — List accredited storage facilities and capacity metrics
- `GET /api/inventory` — List physical produce inventory by warehouse and grade
- `POST /api/inventory/intake` — Store accepted produce lot in warehouse bay
- `GET /api/inventory/movements` — Immutable audit trail of stock movements

#### 4. B2B Marketplace & Purchase Orders (`/api/marketplace` & `/api/purchase-orders`)
- `GET /api/marketplace/catalogue` — Real-time catalog of available produce lots
- `POST /api/purchase-orders` — Create new purchase order contract (`BUYER`)
- `GET /api/purchase-orders` — List buyer purchase orders
- `PATCH /api/purchase-orders/:id/approve` — Approve purchase order (`CENTRE_MANAGER`, `SUPER_ADMIN`)
- `POST /api/purchase-orders/:id/allocate` — Allocate specific inventory lots to PO

#### 5. Logistics & Shipments (`/api/logistics`)
- `GET /api/logistics/vehicles` — List registered transport fleet
- `POST /api/logistics/shipments` — Create shipment manifest from approved PO
- `PATCH /api/logistics/shipments/:id/dispatch` — Mark shipment as dispatched
- `PATCH /api/logistics/shipments/:id/deliver` — Submit signed delivery confirmation

#### 6. Settlements & Payouts (`/api/settlements`)
- `GET /api/settlements` — List farmer payout vouchers
- `GET /api/settlements/:id` — Detailed voucher with itemized cess and quality deductions
- `POST /api/settlements/:id/disburse` — Release funds to farmer bank account

#### 7. Disputes & Grievances (`/api/disputes`)
- `POST /api/disputes` — Raise formal grievance on lot, order, or settlement
- `GET /api/disputes` — List active disputes
- `PATCH /api/disputes/:id/resolve` — Submit binding administrative resolution

#### 8. AI Intelligence (`/api/ai`)
- `GET /api/ai/insights/procurement` — High-level demand vs supply intelligence
- `POST /api/ai/interpret/quality` — Instant non-binding quality interpretation
- `GET /api/ai/insights/farmer` — Personalized farmer production insights
- `GET /api/ai/risk/shipment/:id` — Shipment transit risk scoring
- `GET /api/ai/intelligence/warehouse/:id` — Warehouse capacity warnings

#### 9. Advanced Analytics & Exports (`/api/analytics`, `/api/export`, `/api/search`)
- `GET /api/analytics/overview?period=7d` — Aggregated operational scorecard
- `GET /api/analytics/procurement-trends` — Temporal intake trends
- `GET /api/analytics/quality-metrics` — Quality scores and rejection distributions
- `GET /api/search?q=LOT-2026` — RBAC-scoped global entity search
- `GET /api/export/:resource` — Stream RFC 4180 CSV export (`lots`, `orders`, `inventory`, `shipments`, `settlements`)
- `GET /api/health` — Platform health check, DB state, uptime, and system diagnostics
