# AGRITRADE — ROLE PERMISSION & SCOPING MATRIX

This document specifies the authorization model, role hierarchy, regional/organizational scoping rules, and route permissions for the **AgriTrade** platform.

---

## 1. Canonical Role Hierarchy & Alias Normalization

| Canonical Role | System Constant | Normalized Legacy Aliases | Scope Domain |
|---|---|---|---|
| **Platform Administrator** | `PLATFORM_ADMIN` | `SUPER_ADMIN` | Global platform configuration, all organizations, all regions |
| **District Administrator** | `DISTRICT_ADMIN` | `DISTRICT_OFFICER` | Assigned District, child centres, and staff approvals |
| **Collection Centre Manager** | `COLLECTION_CENTRE_MANAGER` | `CENTRE_MANAGER`, `CENTER_MANAGER` | Assigned Collection Centre, warehouse, daily intake, staff approvals |
| **Quality Inspector** | `QUALITY_INSPECTOR` | None | Assigned Laboratory / Centre, inspection queue & grading |
| **Intake / Centre Operator** | `CENTER_OPERATOR` | `PROCUREMENT_OFFICER` | Assigned Collection Centre, physical weighbridge intake |
| **Farmer** | `FARMER` | None | Self-owned Farms, Produce Lots, Settlements, Disputes |
| **Buyer** | `BUYER` | None | Self-owned Purchase Orders, Deliveries, Market Discovery |
| **Logistics Coordinator** | `LOGISTICS_COORDINATOR` | None | Transporter Fleet, Vehicles, Dispatches, Shipments |

---

## 2. Operation Permissions by Role

| Operation / Capability | Platform Admin | District Admin | Centre Manager | Quality Inspector | Centre Operator | Farmer | Buyer | Logistics |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manage Organizations & Regions** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Configure Quality / Pricing Rules** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Staff Registration Approvals** | ✅ (All) | ✅ (Mgrs) | ✅ (Ops) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Declare Harvest Produce Lot** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Physical Weighment & Intake** | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Quality Testing & Official Grading** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Warehouse Inventory Allocation** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Marketplace Discovery & PO Issue** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Approve / Reject Purchase Orders** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Create Shipment & Dispatch Manifest**| ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Confirm Delivery & Log Discrepancies**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Execute Server Settlement** | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Raise Dispute / Grievance** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| **Resolve / Close Disputes** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 3. Scoping Constraints

1. **Organization Scoping (`organizationId`)**:
   - Any request by an organizational actor (`BUYER`, `LOGISTICS_COORDINATOR`, `COLLECTION_CENTRE_MANAGER`) is bounded to their specific enterprise organization unless overridden by `PLATFORM_ADMIN`.
2. **Regional Scoping (`regionId`, `districtId`, `centreId`)**:
   - `DISTRICT_ADMIN` cannot access, view, or approve centres or staff outside their designated `districtId`.
   - `COLLECTION_CENTRE_MANAGER` cannot manage inventory or dispatches for warehouses outside their assigned `centreId`.
3. **Entity Ownership**:
   - `FARMER` queries are strictly scoped to `req.user._id === lot.farmerId`. Farmers can only view procurement order records for lots they produced.
   - `BUYER` queries are strictly scoped to `req.user._id === purchaseOrder.buyerId`.

---

## 4. Frontend Route Access Control

| Role | Landing Route | Authorized Route Namespaces |
|---|---|---|
| `FARMER` | `/farmer/dashboard` | `/farmer/*`, `/notifications` |
| `QUALITY_INSPECTOR` | `/quality/dashboard` | `/quality/*`, `/notifications` |
| `COLLECTION_CENTRE_MANAGER` | `/manager/dashboard` | `/manager/*`, `/warehouse/*`, `/officer/*`, `/district/reports`, `/notifications` |
| `CENTER_OPERATOR` | `/officer/dashboard` | `/officer/*`, `/notifications` |
| `BUYER` | `/buyer/dashboard` | `/buyer/*`, `/notifications` |
| `LOGISTICS_COORDINATOR` | `/logistics/dashboard` | `/logistics/*`, `/notifications` |
| `DISTRICT_ADMIN` | `/district/dashboard` | `/district/*`, `/notifications` |
| `PLATFORM_ADMIN` | `/admin/dashboard` | `/admin/*`, `/manager/*`, `/logistics/*`, `/district/*`, `/notifications` |
