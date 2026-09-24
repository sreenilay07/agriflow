# AgriTrade — Requirements & Repository Audit Report
## Capstone Compliance & Domain Consistency Audit

**Date:** September 2026  
**Project:** Mandi Mithra / AgriFlow $\to$ AgriTrade  
**System:** Farm Produce Procurement & Supply Chain Platform  

---

### Executive Summary

A comprehensive, ground-truth audit of the repository was conducted across backend models, controllers, services, routes, middleware, socket events, test suites, and frontend components, pages, stores, and API clients.

The audit revealed three primary structural challenges requiring immediate remediation:
1. **Inventory Domain Drift**: The Mongoose `Inventory` model defined fields (`totalQuantity`, `availableQuantity`, `reservedQuantity`, `grade`, `status: IN_STOCK`), whereas several services (`marketplace.service.js`, `allocation.service.js`, `aiService.js`) and frontend pages referenced legacy attributes (`availableQuantityKg`, `reservedQuantityKg`, `qualityGrade`, `status: AVAILABLE`).
2. **Missing Organization & Region Entities**: The platform referenced districts and centres, but lacked a formal multi-tenant `Organization` model and `Region` hierarchy required for region- and organization-scoped RBAC.
3. **Role & Routing Inconsistencies**: The `QUALITY_INSPECTOR` role was conflated with `CENTER_OPERATOR`/`PROCUREMENT_OFFICER` in routing guards, redirecting inspectors to generic officer views rather than a dedicated scientific grading workstation.

---

### Requirements Compliance Matrix

| Requirement Domain | Backend State | Frontend State | Audit Status | Required Remediation Action |
|---|---|---|---|---|
| **1. Authentication & Session** | JWT + Refresh token authentication, OTP service with development fallback. | Login, Register, OTP verification pages. | **PASS** | Ensure consistent role claims and organization scope in JWT payload. |
| **2. Role-Based Access Control (RBAC)** | Roles defined in `roles.js`. Aliases mapped in `auth.middleware.js`. | `ProtectedRoute.tsx` checks `allowedRoles`. | **PARTIAL** | Enforce canonical roles: `PLATFORM_ADMIN`, `FARMER`, `COLLECTION_CENTRE_MANAGER`, `QUALITY_INSPECTOR`, `BUYER`, `LOGISTICS_COORDINATOR`. Decouple Quality Inspector from Center Operator. |
| **3. Organization Scope** | No formal `Organization` model existed; references were ad-hoc. | No organization management screens. | **MISSING** | Create `Organization` model (`PROCUREMENT_NETWORK`, `BUYER_ORGANIZATION`, `WAREHOUSE_OPERATOR`, `LOGISTICS_PROVIDER`), link to users/entities, add admin management UI. |
| **4. Region Hierarchy** | `District` model existed without parent `Region` entity. | District views existed; no region hierarchy. | **MISSING** | Create `Region` model (`name`, `code`, `state`). Link `District` $\to$ `Region`. Support Admin Region management. |
| **5. Farmer & Farm Acreage** | `FarmerProfile` and `Farm` models with GeoJSON coordinates and survey numbers. | `FarmerFarmsPage`, `FarmerProfilePage`. | **PASS** | Maintain current models and ensure farmer lots link directly to registered farms. |
| **6. Produce Categories & Crops** | `Crop` model has enum category, but lacks separate `ProduceCategory` entity. | Crop selection in lot and booking forms. | **PARTIAL** | Create `ProduceCategory` model (`name`, `code`, `description`). Link `Crop` to category. Add Admin category management. |
| **7. Produce Lot Lifecycle** | `ProduceLot.js` with lifecycle steps and audit history. | `FarmerLotsPage`, `CreateLotPage`, `LotDetailPage`. | **DRIFT** | Standardize canonical lifecycle: `CREATED` $\to$ `SCHEDULED` $\to$ `RECEIVED` $\to$ `UNDER_INSPECTION` $\to$ `ACCEPTED` / `PARTIALLY_ACCEPTED` / `REJECTED` $\to$ `STORED` $\to$ `ALLOCATED` $\to$ `DISPATCHED` $\to$ `DELIVERED` $\to$ `SETTLED`. Add explicit `PARTIALLY_ACCEPTED` enum. |
| **8. Quality Inspection Workstation** | `QualityInspection.js` calculates scores ($0-100$) and assigns Grade A/B/C/Rejected. | Officer inspections page mixed with queue operations. | **PARTIAL** | Build dedicated `/quality/dashboard`, `/quality/inspections`, `/quality/inspections/:id` with parameter inputs, criteria breakdown, and explicit inspector decisions. |
| **9. Warehouse & Physical Inventory** | `Warehouse` and `Inventory` models with bay locations and `InventoryMovement` log. | `WarehouseInventoryPage.tsx`. | **CRITICAL DRIFT** | Reconcile inventory schema across all services: `warehouseId`, `lotId`, `cropId`, `totalQuantity`, `availableQuantity`, `reservedQuantity`, `grade`, `status`. Remove all competing `Kg` suffix attributes. |
| **10. B2B Buyer Marketplace** | `marketplace.service.js` querying inventory lots. | `MarketplacePage`, `MarketplaceDetailPage`. | **CRITICAL DRIFT** | Fix marketplace query to filter on `status: 'IN_STOCK'` and `availableQuantity > 0`. Update frontend marketplace types to match canonical schema. |
| **11. Purchase Orders & Allocation** | `PurchaseOrder.js` and `LotAllocation.js`. | `BuyerOrdersPage`, `BuyerOrderDetailPage`, `ManagerAllocationsPage`. | **DRIFT** | Update allocation engine to decrement `availableQuantity` and increment `reservedQuantity` on canonical `Inventory` schema. |
| **12. Logistics & Fleet Dispatch** | `Vehicle.js`, `Shipment.js`, and `DeliveryConfirmation.js`. | `LogisticsDashboard`, `ShipmentsPage`, `VehiclesPage`. | **PASS** | Maintain operational milestone dispatch workflow (Planned $\to$ Assigned $\to$ Manifest $\to$ Ready $\to$ Dispatched $\to$ In Transit $\to$ Arrived $\to$ Delivered). |
| **13. Farmer Settlements & Payouts** | `Settlement.js` with itemized cess and quality multipliers. | `FarmerSettlementsPage.tsx`. | **PARTIAL** | Ensure server-authoritative settlement uses agreed procurement rate instead of silently falling back to static base price. Add transparent calculation breakdown. |
| **14. Grievance & Dispute Redressal** | `Dispute.js` referencing entities. | `FarmerDisputesPage.tsx`. | **PASS** | Ensure polymorphic reference links to Lots, Quality Inspections, POs, and Settlements. |
| **15. Platform Admin Console** | Admin user management and audit log viewer. | `AdminDashboard`, `AdminUserManagement`. | **PARTIAL** | Add complete management for Organizations, Regions, Produce Categories, and Central System Configuration. |
| **16. Centre Manager Workflow** | Manager dashboard with counters and capacity. | `ManagerDashboard`, `ManagerCountersPage`. | **PARTIAL** | Add explicit lot receiving workflow: lot verification, actual weight logging, status transition to `RECEIVED`. |
| **17. Farmer Procurement Records** | Farmer views lots and settlements. | Lacked dedicated view of POs fulfilling their produce. | **MISSING** | Add `/farmer/purchase-orders` (or procurement fulfillment view) showing how their lots fulfill institutional orders without leaking private buyer details. |
| **18. Reports & Data Exports** | `export.service.js` with CSV generation for lots, POs, inventory, shipments. | `ExportButton.tsx` and district reports. | **PASS** | Support role-scoped CSV and Excel exports across all key entities. |
| **19. Global Multi-Entity Search** | `search.service.js` indexing lots, POs, shipments, warehouses, users. | `GlobalSearch.tsx` in header with `⌘K`. | **PASS** | Extend search to include Organizations and Regions. |
| **20. Realtime Event Architecture** | Socket.IO room segregation with persistent notifications. | `useRealtime.ts` and `NotificationCenter.tsx`. | **PASS** | Support live updates across all domain state transitions. |
| **21. Frontend Design & Performance** | Large un-split JS bundle (>9.7MB), legacy branding, AI badge patterns. | Monolithic imports across all pages. | **NEEDS REMEDIATION** | Rebrand to AgriTrade. Implement `React.lazy` route code-splitting to reduce initial bundle size. Remove excessive decorative elements. |
