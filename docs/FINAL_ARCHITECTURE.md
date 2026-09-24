# MANDI MITHRA — Platform Architecture & Technical Blueprint
## Intelligent Farm Produce Procurement & Supply Chain Platform

---

### 1. Architectural Principles
Mandi Mithra is an enterprise agricultural supply chain platform engineered on modern MERN architectural patterns, adhering to:
- **Clean Domain-Driven Layering**: Segregation of Models, Data Access, Services, Controllers, and Middleware.
- **Strict State Machine Lifecycle**: Guaranteed linear state transitions with deterministic audit trails.
- **Role-Based Access Control (RBAC)**: Fine-grained authorizations spanning 7 distinct stakeholder personas.
- **Fail-Safe Resilience**: All AI, Socket.IO, and external integrations feature zero-crash offline graceful fallbacks.
- **Traceability Guarantee**: Unbroken digital lineage from Farmer Acreage $\to$ Produce Lot $\to$ Quality Grade $\to$ Warehouse Bin $\to$ Buyer Purchase Order $\to$ Dispatch Shipment $\to$ Final Delivery.

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT APPLICATIONS                               |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   |  Farmer Dashboard |  | Quality Inspector  |  | B2B Buyer Marketplace      |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   +-------------------+  +--------------------+  +----------------------------+   |
|   |  Centre Manager   |  | Warehouse Logistics|  | Super Admin Analytics      |   |
|   +-------------------+  +--------------------+  +----------------------------+   |
+------------------------------------------+----------------------------------------+
                                           | HTTP REST / WebSocket JSON
+------------------------------------------v----------------------------------------+
|                            BACKEND API GATEWAY & CORE                             |
|  [Rate Limiter] [Security Headers (Helmet)] [JWT + Refresh Auth] [RBAC Guard]     |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                             DOMAIN SERVICES                                 |  |
|  |  • Lot State Machine Service       • Quality Grading Engine                 |  |
|  |  • Warehouse Inventory & Bins      • PO Allocation & Reservation Engine     |  |
|  |  • Logistics & Dispatch Manifest   • Automated Settlement Engine            |  |
|  |  • AI Intelligence & Anomaly Core  • Realtime Socket & Notification Hub     |  |
|  +-----------------------------------------------------------------------------+  |
+------------------------------------------+----------------------------------------+
                                           |
+------------------------------------------v----------------------------------------+
|                                  DATA & AI TIER                                   |
|   +------------------------------------+  +-----------------------------------+   |
|   |          MongoDB Database          |  |       Google Gemini 1.5 API       |   |
|   |    20+ Normalized Domain Models    |  | (Deterministic Fallback Engine)   |   |
|   +------------------------------------+  +-----------------------------------+   |
+-----------------------------------------------------------------------------------+
```

---

### 2. End-to-End Operational Lifecycle

#### Step 1: Farm Registration & Slot Booking
1. Farmer registers personal profile and land parcel records (`Farm.js`) with geographic coordinates and survey numbers.
2. Farmer books a mandi intake appointment (`Booking.js`) at a local Collection Centre for an estimated crop quantity.
3. System issues a unique Token with dynamic queue tracking and estimated gate arrival time.

#### Step 2: Intake & Lot Creation
1. Vehicle arrives at the Mandi Collection Centre gate. Gate officer scans QR / verifies token.
2. System initializes a `ProduceLot.js` record with state `CREATED`.
3. Gross vehicle weight or initial gross quantity is logged.

#### Step 3: Scientific Quality Inspection & Grading
1. Quality Inspector conducts physical and laboratory appraisal (`QualityInspection.js`).
2. Parameters captured: Moisture %, Foreign Matter %, Defective Grains %, Weight per Sample.
3. Scoring algorithm calculates overall Quality Score ($0-100$) and assigns Grade (`GRADE_A`, `GRADE_B`, `GRADE_C`, `REJECTED`).
4. System executes state transition:
   - If acceptable: transitions to `ACCEPTED` or `PARTIALLY_ACCEPTED` (specifying accepted vs rejected kg).
   - If below threshold: transitions to `REJECTED`.
5. AI Quality Assistant provides non-binding storage advice and checks.

#### Step 4: Warehouse Intake & Inventory Ledger
1. Accepted produce is routed to an accredited `Warehouse.js`.
2. System creates `Inventory.js` entries linked to specific storage bins/sections.
3. `InventoryMovement.js` logs an immutable `INTAKE` transaction.
4. Lot state advances to `STORED`.

#### Step 5: Farmer Settlement Voucher Disbursal
1. Upon acceptance and weighing, `SettlementService` computes payable amount based on accepted quantity, MSP/benchmark base rate, and grade bonus/penalty multipliers.
2. Deductions (mandi cess, handling charges) are itemized.
3. `Settlement.js` voucher generated in `PENDING` state.
4. Mandi manager or automated disbursement processor approves payment, moving voucher to `PAID` and notifying the farmer via SMS/Push.
5. Lot state advances to `SETTLED`.

#### Step 6: B2B Buyer Marketplace Discovery & Purchase Orders
1. Accredited institutional buyers browse available warehouse inventory across grades and centres.
2. Buyer creates `PurchaseOrder.js` specifying required crop, quantity in kg, delivery timeline, and delivery address.
3. Purchase Order submitted in state `SUBMITTED` $\to$ reviewed by Procurement Manager $\to$ `APPROVED`.

#### Step 7: Warehouse Lot Allocation & Inventory Reservation
1. Allocation engine identifies available inventory batches matching PO crop and grade specifications.
2. Matching inventory is locked into `RESERVED` status (`InventoryMovement` records `RESERVATION`).
3. PO transitions to `ALLOCATED` or `PARTIALLY_ALLOCATED`.

#### Step 8: Vehicle Assignment & Dispatch Logistics
1. Logistics Coordinator assigns a transport vehicle (`Vehicle.js`) and driver.
2. System creates a `Shipment.js` with linked PO items, seals, and estimated delivery timeline (ETA).
3. Warehouse bays load the cargo; gate officer scans QR manifest and updates status to `DISPATCHED`.
4. Inventory status changes from `RESERVED` to `DISPATCHED`.

#### Step 9: In-Transit Tracking & Delivery Confirmation
1. Realtime shipment monitoring detects transit milestones.
2. AI Risk Analyzer evaluates transit delays against ETA and cargo weight against truck payload limits.
3. Buyer inspects goods at destination receiving dock and submits digital Delivery Confirmation with receiver signature and accepted weight.
4. Shipment updates to `DELIVERED`.
5. Purchase order completes status transition to `COMPLETED`.

#### Step 10: Grievance Redressal & Disputes
1. If discrepancy arises at any stage (weight loss, quality difference), either party can file a formal `Dispute.js`.
2. Dispute transitions through `RAISED` $\to$ `UNDER_INVESTIGATION` $\to$ `RESOLVED` / `REJECTED`.
3. Administrative resolutions can trigger credit notes, lot re-evaluations, or settlement adjustments.
