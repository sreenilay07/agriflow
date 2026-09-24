# MANDI MITHRA - AgriTrade API Reference Specification

This document provides the complete API reference for the **Mandi Mithra / AgriTrade** domain services implemented in Phase 2 & Phase 3.

All protected endpoints require an `Authorization: Bearer <JWT_TOKEN>` header.

---

## 1. Farms API (`/api/farms`)

### 1.1 List Farmer Farms
- **Method**: `GET`
- **Path**: `/api/farms`
- **Auth**: `FARMER`, `ADMIN`
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f...",
      "farmerId": "65f...",
      "farmName": "Green Acres - Plot 1",
      "village": "Gollapalli",
      "mandal": "Jadcherla",
      "district": "Mahbubnagar",
      "surveyNumber": "142/A",
      "acreage": 4.5,
      "cropsGrown": ["Paddy", "Cotton"],
      "status": "ACTIVE"
    }
  ]
}
```

### 1.2 Register New Farm
- **Method**: `POST`
- **Path**: `/api/farms`
- **Auth**: `FARMER`
- **Request Body**:
```json
{
  "farmName": "Green Valley East",
  "village": "Jadcherla Village",
  "mandal": "Jadcherla",
  "district": "Mahbubnagar",
  "surveyNumber": "88/B",
  "acreage": 3.0,
  "cropsGrown": ["Paddy", "Maize"]
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": { ... }
}
```

---

## 2. Produce Lots API (`/api/produce-lots`)

### 2.1 Create Produce Lot
- **Method**: `POST`
- **Path**: `/api/produce-lots`
- **Auth**: `FARMER`
- **Request Body**:
```json
{
  "cropId": "65f...cropId",
  "declaredQuantity": 2500,
  "farmId": "65f...farmId",
  "collectionCentreId": "65f...centreId",
  "harvestDate": "2026-09-20T00:00:00.000Z",
  "unit": "kg"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "_id": "65f...",
    "lotNumber": "MM-2026-09-000101",
    "farmer": "65f...",
    "crop": "65f...",
    "declaredQuantity": 2500,
    "currentQuantity": 2500,
    "status": "CREATED",
    "lifecycleHistory": [
      {
        "fromStatus": "NONE",
        "toStatus": "CREATED",
        "performedBy": "65f...",
        "action": "LOT_CREATED",
        "timestamp": "2026-09-23T10:00:00.000Z"
      }
    ]
  }
}
```

### 2.2 List Farmer Lots
- **Method**: `GET`
- **Path**: `/api/produce-lots`
- **Auth**: `FARMER` (returns caller's lots), `OFFICER`/`ADMIN` (supports filtering)
- **Response `200 OK`**:
```json
{
  "success": true,
  "count": 3,
  "data": [ ... ]
}
```

### 2.3 Get Lot Details by ID
- **Method**: `GET`
- **Path**: `/api/produce-lots/:id`
- **Auth**: Authenticated (Owner, Officer, Manager, Admin)
- **Response `200 OK`**: Full lot document populated with farmer, crop, farm, centre, quality inspection, and settlement references.

### 2.4 Lookup Lot by Business Lot Number
- **Method**: `GET`
- **Path**: `/api/produce-lots/lookup/:lotNumber`
- **Auth**: Authenticated (Weighbridge / Quality operators)
- **Response `200 OK`**: Lot details for weighbridge or inspection lookup.

### 2.5 Record Lot Arrival / Weighbridge Receiving
- **Method**: `POST`
- **Path**: `/api/produce-lots/:id/receive`
- **Auth**: `OFFICER`, `OPERATOR`, `MANAGER`, `ADMIN`
- **Request Body**:
```json
{
  "receivedQuantity": 2420,
  "notes": "Moisture check pending. Weighbridge ticket #WB-4012"
}
```
- **Response `200 OK`**: Updates lot to `RECEIVED` (or directly to `UNDER_INSPECTION`). Stores `receivedQuantity` separately from `declaredQuantity`.

---

## 3. Quality Inspections API (`/api/quality-inspections`)

### 3.1 Perform Quality Inspection & Lot Decision
- **Method**: `POST`
- **Path**: `/api/quality-inspections`
- **Auth**: `QUALITY_INSPECTOR`, `PROCUREMENT_OFFICER`, `OPERATOR`, `ADMIN`
- **Request Body**:
```json
{
  "lotId": "65f...lotId",
  "metrics": {
    "moisturePercentage": 13.0,
    "foreignMatterPercentage": 1.0,
    "brokenGrainsPercentage": 2.0,
    "damagedGrainsPercentage": 0.5
  },
  "assignedGrade": "GRADE_A",
  "acceptedQuantity": 2300,
  "rejectedQuantity": 120,
  "rejectionReason": "Excess foreign matter in bottom bags",
  "remarks": "High quality harvest, graded Grade A"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "inspection": {
      "_id": "65f...",
      "lot": "65f...",
      "assignedGrade": "GRADE_A",
      "qualityScore": 92.5,
      "decision": "ACCEPTED",
      "acceptedQuantity": 2300,
      "rejectedQuantity": 120
    },
    "lot": {
      "_id": "65f...",
      "status": "ACCEPTED",
      "acceptedQuantity": 2300,
      "rejectedQuantity": 120
    }
  }
}
```

### 3.2 Get Inspection by Lot ID
- **Method**: `GET`
- **Path**: `/api/quality-inspections/lot/:lotId`
- **Auth**: Authenticated

---

## 4. Warehouses & Inventory API (`/api/warehouses`, `/api/inventory`)

### 4.1 List Warehouses
- **Method**: `GET`
- **Path**: `/api/warehouses`
- **Auth**: Authenticated

### 4.2 Get Warehouse Stock Batches
- **Method**: `GET`
- **Path**: `/api/inventory/warehouse/:warehouseId`
- **Auth**: Authenticated

### 4.3 Intake Accepted Lot into Warehouse
- **Method**: `POST`
- **Path**: `/api/inventory/intake-lot`
- **Auth**: `WAREHOUSE_MANAGER`, `OFFICER`, `ADMIN`
- **Request Body**:
```json
{
  "lotId": "65f...lotId",
  "warehouseId": "65f...whId",
  "storageBay": "Bay A-12",
  "notes": "Standard palletized stack"
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "inventory": {
      "batchNumber": "BATCH-MM-2026-09-000101",
      "warehouse": "65f...",
      "quantityKg": 2300,
      "availableQuantityKg": 2300,
      "status": "AVAILABLE"
    },
    "movement": {
      "movementType": "RECEIPT",
      "quantityKg": 2300
    },
    "lot": {
      "status": "STORED"
    }
  }
}
```

### 4.4 Get Inventory Audit Movements
- **Method**: `GET`
- **Path**: `/api/inventory/movements?warehouseId=65f...`
- **Auth**: Authenticated

---

## 5. Settlements API (`/api/settlements`)

### 5.1 Calculate Settlement Preview
- **Method**: `POST`
- **Path**: `/api/settlements/calculate-preview`
- **Auth**: Authenticated
- **Request Body**:
```json
{
  "lotId": "65f...lotId",
  "unitPrice": 25.0,
  "deductions": [
    { "type": "UNLOADING_CHARGES", "amount": 300, "description": "Mandi labor loading/unloading" },
    { "type": "WEIGHBRIDGE_FEE", "amount": 200, "description": "Standard weighbridge verification fee" }
  ],
  "adjustments": []
}
```
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": {
    "acceptedQuantity": 2300,
    "unitPrice": 25,
    "grossAmount": 57500,
    "totalDeductions": 500,
    "totalAdjustments": 0,
    "netAmount": 57000
  }
}
```

### 5.2 Generate Final Settlement
- **Method**: `POST`
- **Path**: `/api/settlements`
- **Auth**: `FINANCE_OFFICER`, `CENTRE_MANAGER`, `ADMIN`
- **Request Body**:
```json
{
  "lotId": "65f...lotId",
  "unitPrice": 25.0,
  "deductions": [
    { "type": "UNLOADING_CHARGES", "amount": 500, "description": "Mandi labor unloading charges" }
  ]
}
```
- **Response `201 Created`**: Creates settlement record and transitions lot to `SETTLED`.

### 5.3 Update Payment Status
- **Method**: `PATCH`
- **Path**: `/api/settlements/:id/payment`
- **Auth**: `FINANCE_OFFICER`, `ADMIN`
- **Request Body**:
```json
{
  "paymentStatus": "PAID",
  "paymentReference": "UPI-BANK-90812391023",
  "paymentMethod": "DIRECT_BANK_TRANSFER"
}
```

---

## 6. Disputes API (`/api/disputes`)

### 6.1 Raise Farmer Dispute
- **Method**: `POST`
- **Path**: `/api/disputes`
- **Auth**: `FARMER`
- **Request Body**:
```json
{
  "category": "GRADE_DISPUTE",
  "referenceType": "PRODUCE_LOT",
  "referenceId": "65f...lotId",
  "reason": "Quality grade assigned is lower than actual tested moisture",
  "description": "Lab report showed 12% moisture but inspector marked Grade B."
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "_id": "65f...",
    "disputeId": "DSP-202609-00101",
    "status": "OPEN",
    "category": "GRADE_DISPUTE"
  }
}
```

### 6.2 Review & Resolve Dispute
- **Method**: `PATCH`
- **Path**: `/api/disputes/:id/review`
- **Auth**: `ADMIN`, `CENTRE_MANAGER`
- **Request Body**:
```json
{
  "status": "RESOLVED",
  "resolutionNotes": "Sample re-inspected by senior quality officer. Upgraded to Grade A."
}
```

---

## 7. Buyers API (`/api/buyers`)

### 7.1 Get / Upsert Buyer Profile
- **Method**: `GET` / `POST`
- **Path**: `/api/buyers/profile`
- **Auth**: `BUYER`
- **Request Body (for POST)**:
```json
{
  "organizationName": "AgroFresh Foods Pvt Ltd",
  "businessName": "AgroFresh Milling Unit 4",
  "businessType": "PROCESSING_MILL",
  "gstin": "36AAACA1234A1Z5",
  "contactPerson": "K. S. Narayana",
  "phone": "9555500001",
  "address": "Plot 42, IDA Nacharam",
  "district": "Hyderabad",
  "state": "Telangana",
  "pincode": "500076",
  "operatingRegions": ["Mahbubnagar", "Rangareddy"]
}
```

### 7.2 Verify Buyer Profile
- **Method**: `PATCH`
- **Path**: `/api/buyers/:id/verify`
- **Auth**: `SUPER_ADMIN`, `DISTRICT_ADMIN`, `CENTRE_MANAGER`
- **Request Body**:
```json
{
  "status": "VERIFIED"
}
```

---

## 8. B2B Produce Marketplace API (`/api/marketplace`)

### 8.1 List Available Produce Lots
- **Method**: `GET`
- **Path**: `/api/marketplace/lots?cropId=...&grade=GRADE_A&district=Mahbubnagar&sortBy=newest&page=1&limit=20`
- **Auth**: Authenticated (`BUYER`, `ADMIN`)
- **Response `200 OK`**:
```json
{
  "success": true,
  "data": [
    {
      "inventoryId": "65f...",
      "lotNumber": "MM-2026-09-000104",
      "cropName": "Paddy",
      "qualityGrade": "GRADE_A",
      "qualityScore": 92,
      "qualityMetrics": { "moisturePercentage": 13.0, "foreignMatterPercentage": 1.0 },
      "warehouseName": "Jadcherla Central Mandi Warehouse",
      "region": "Mahbubnagar, Telangana",
      "availableQuantityKg": 2300,
      "unitPricePerKg": 26.25,
      "verifiedLot": true
    }
  ],
  "pagination": { "total": 1, "page": 1, "limit": 20, "totalPages": 1 }
}
```

### 8.2 Get Marketplace Lot Detail
- **Method**: `GET`
- **Path**: `/api/marketplace/lots/:id`
- **Auth**: Authenticated

---

## 9. Purchase Orders API (`/api/purchase-orders`)

### 9.1 Create Purchase Order
- **Method**: `POST`
- **Path**: `/api/purchase-orders`
- **Auth**: Verified `BUYER`
- **Request Body**:
```json
{
  "items": [
    {
      "cropId": "65f...cropId",
      "requestedGrade": "GRADE_A",
      "requestedQuantityKg": 1500,
      "agreedUnitPricePerKg": 26.25
    }
  ],
  "requestedDeliveryDate": "2026-09-25T00:00:00.000Z",
  "deliveryAddress": {
    "facilityName": "AgroFresh Nacharam Mill #4",
    "street": "Plot 42, IDA Nacharam",
    "district": "Hyderabad",
    "state": "Telangana",
    "pincode": "500076",
    "contactPerson": "K. S. Narayana",
    "contactPhone": "9555500001"
  },
  "notes": "Standard 50kg gunny bags required"
}
```
- **Response `201 Created`**:
```json
{
  "success": true,
  "data": {
    "poNumber": "PO-2026-000001",
    "status": "SUBMITTED",
    "totalQuantityKg": 1500,
    "subtotal": 39375,
    "taxAmount": 1968.75,
    "totalValue": 41343.75
  }
}
```

### 9.2 Review Purchase Order (Approve / Reject)
- **Method**: `PATCH`
- **Path**: `/api/purchase-orders/:id/review`
- **Auth**: `CENTRE_MANAGER`, `ADMIN`
- **Request Body**:
```json
{
  "action": "APPROVE"
}
```

---

## 10. Lot Allocations API (`/api/allocations`)

### 10.1 Allocate Stored Lot to Purchase Order
- **Method**: `POST`
- **Path**: `/api/allocations`
- **Auth**: `CENTRE_MANAGER`, `ADMIN`
- **Request Body**:
```json
{
  "purchaseOrderId": "65f...poId",
  "purchaseOrderItemId": "65f...itemId",
  "produceLotId": "65f...lotId",
  "inventoryId": "65f...invId",
  "allocatedQuantityKg": 1500
}
```
- **Response `201 Created`**: Reserves inventory and transitions PO status to `PARTIALLY_ALLOCATED` or `FULLY_ALLOCATED`.

### 10.2 Cancel Allocation
- **Method**: `POST`
- **Path**: `/api/allocations/:id/cancel`
- **Auth**: `CENTRE_MANAGER`, `ADMIN`
- **Request Body**:
```json
{
  "reason": "Customer delivery postponement"
}
```

---

## 11. Logistics & Fleet API (`/api/logistics`)

### 11.1 Register Fleet Vehicle
- **Method**: `POST`
- **Path**: `/api/logistics/vehicles`
- **Auth**: `LOGISTICS_COORDINATOR`, `ADMIN`
- **Request Body**:
```json
{
  "vehicleNumber": "TS09AB1234",
  "type": "HEAVY_TRUCK_10T",
  "capacityKg": 10000,
  "transporterName": "Deccan Express Logistics",
  "driverName": "Mohammed Rafi",
  "driverPhone": "9888812345",
  "driverLicenseNumber": "DL-042018005678"
}
```

### 11.2 Create Shipment & Manifest
- **Method**: `POST`
- **Path**: `/api/logistics/shipments`
- **Auth**: `LOGISTICS_COORDINATOR`, `ADMIN`
- **Request Body**:
```json
{
  "purchaseOrderId": "65f...poId",
  "allocationIds": ["65f...allocId"],
  "vehicleId": "65f...vehId",
  "plannedDispatchDate": "2026-09-24T09:00:00.000Z"
}
```

### 11.3 Dispatch Shipment
- **Method**: `POST`
- **Path**: `/api/logistics/shipments/:id/dispatch`
- **Auth**: `LOGISTICS_COORDINATOR`, `ADMIN`
- **Request Body**:
```json
{
  "notes": "Outbound weighbridge cleared"
}
```

### 11.4 Update Transit Milestone
- **Method**: `PATCH`
- **Path**: `/api/logistics/shipments/:id/transit-status`
- **Auth**: `LOGISTICS_COORDINATOR`, `ADMIN`
- **Request Body**:
```json
{
  "status": "IN_TRANSIT",
  "location": "Jadcherla Toll Plaza NH44",
  "notes": "Vehicle en route to Hyderabad"
}
```

### 11.5 Confirm Delivery Receipt
- **Method**: `POST`
- **Path**: `/api/logistics/delivery-confirmation`
- **Auth**: `BUYER`, `LOGISTICS_COORDINATOR`, `ADMIN`
- **Request Body**:
```json
{
  "shipmentId": "65f...shipmentId",
  "deliveredQuantityKg": 1500,
  "condition": "EXCELLENT",
  "receiverName": "K. S. Narayana",
  "receiverPhone": "9555500001",
  "notes": "Electronic weighbridge verified and bags unloaded"
}
```
- **Response `200 OK`**: Transitions Shipment to `DELIVERED` and Purchase Order to `COMPLETED`.
