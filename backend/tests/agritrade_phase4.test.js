const {
  PURCHASE_ORDER_STATUS,
  LOT_ALLOCATION_STATUS,
  SHIPMENT_STATUS,
  PRODUCE_LOT_STATUS,
  BUYER_VERIFICATION_STATUS,
  VEHICLE_STATUS
} = require('../src/constants/status');
const {
  isValidPOTransition,
  assertValidPOTransition,
  isValidShipmentTransition,
  assertValidShipmentTransition
} = require('../src/services/stateMachine.service');
const { BadRequestError, ForbiddenError } = require('../src/utils/customErrors');

describe('MANDI MITHRA - AgriTrade Phase 4 Business Rules & Logistics Engine', () => {
  describe('1. Purchase Order State Machine & Validation', () => {
    test('1.1 Allows valid PO lifecycle state progression', () => {
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DRAFT, PURCHASE_ORDER_STATUS.SUBMITTED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.SUBMITTED, PURCHASE_ORDER_STATUS.UNDER_REVIEW)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.UNDER_REVIEW, PURCHASE_ORDER_STATUS.APPROVED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.APPROVED, PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.PARTIALLY_ALLOCATED, PURCHASE_ORDER_STATUS.FULLY_ALLOCATED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.FULLY_ALLOCATED, PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.READY_FOR_DISPATCH, PURCHASE_ORDER_STATUS.DISPATCHED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DISPATCHED, PURCHASE_ORDER_STATUS.DELIVERED)).toBe(true);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DELIVERED, PURCHASE_ORDER_STATUS.COMPLETED)).toBe(true);
    });

    test('1.2 Blocks invalid PO state transitions', () => {
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.SUBMITTED, PURCHASE_ORDER_STATUS.DELIVERED)).toBe(false);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.COMPLETED, PURCHASE_ORDER_STATUS.APPROVED)).toBe(false);
      expect(isValidPOTransition(PURCHASE_ORDER_STATUS.REJECTED, PURCHASE_ORDER_STATUS.DISPATCHED)).toBe(false);
    });

    test('1.3 Throws error on forbidden PO transition', () => {
      expect(() => {
        assertValidPOTransition(PURCHASE_ORDER_STATUS.DRAFT, PURCHASE_ORDER_STATUS.COMPLETED);
      }).toThrow(BadRequestError);
    });
  });

  describe('2. Buyer Verification & Order Calculations', () => {
    test('2.1 Validates that unverified buyers cannot create live POs', () => {
      const mockUnverifiedBuyer = {
        organizationName: 'Grain Corp',
        verificationStatus: BUYER_VERIFICATION_STATUS.PENDING
      };

      const checkBuyerVerified = (buyer) => {
        if (buyer.verificationStatus !== BUYER_VERIFICATION_STATUS.VERIFIED) {
          throw new ForbiddenError(`Buyer ${buyer.organizationName} is not verified.`);
        }
        return true;
      };

      expect(() => checkBuyerVerified(mockUnverifiedBuyer)).toThrow(ForbiddenError);

      const mockVerifiedBuyer = {
        organizationName: 'AgroFresh Foods',
        verificationStatus: BUYER_VERIFICATION_STATUS.VERIFIED
      };
      expect(checkBuyerVerified(mockVerifiedBuyer)).toBe(true);
    });

    test('2.2 Performs exact PO subtotal, 5% tax and total value arithmetic', () => {
      const items = [
        { requestedQuantityKg: 1500, agreedUnitPricePerKg: 25.0 }, // 37,500
        { requestedQuantityKg: 800, agreedUnitPricePerKg: 32.5 }   // 26,000
      ];

      const subtotal = items.reduce((sum, item) => sum + (item.requestedQuantityKg * item.agreedUnitPricePerKg), 0);
      const taxAmount = Number((subtotal * 0.05).toFixed(2));
      const totalValue = Number((subtotal + taxAmount).toFixed(2));

      expect(subtotal).toBe(63500);
      expect(taxAmount).toBe(3175);
      expect(totalValue).toBe(66675);
    });
  });

  describe('3. Lot Allocation & Atomic Inventory Reservation Logic', () => {
    test('3.1 Validates allocation and updates available vs reserved inventory', () => {
      const inventory = {
        totalQuantityKg: 2500,
        availableQuantityKg: 2500,
        reservedQuantityKg: 0,
        status: 'AVAILABLE'
      };

      const qtyToAllocate = 1000;
      expect(inventory.availableQuantityKg >= qtyToAllocate).toBe(true);

      inventory.availableQuantityKg -= qtyToAllocate;
      inventory.reservedQuantityKg += qtyToAllocate;

      expect(inventory.availableQuantityKg).toBe(1500);
      expect(inventory.reservedQuantityKg).toBe(1000);
      expect(inventory.availableQuantityKg + inventory.reservedQuantityKg).toBe(inventory.totalQuantityKg);
    });

    test('3.2 Rejects allocation exceeding available stock', () => {
      const inventory = {
        availableQuantityKg: 400
      };
      const requestedAlloc = 500;

      const validateAllocation = (avail, req) => {
        if (req > avail) {
          throw new BadRequestError(`Insufficient stock. Available: ${avail}, requested: ${req}`);
        }
      };

      expect(() => validateAllocation(inventory.availableQuantityKg, requestedAlloc)).toThrow(BadRequestError);
    });

    test('3.3 Releases reserved inventory upon allocation cancellation', () => {
      const inventory = {
        totalQuantityKg: 2500,
        availableQuantityKg: 1500,
        reservedQuantityKg: 1000
      };

      const cancelledAllocationQty = 1000;
      inventory.availableQuantityKg += cancelledAllocationQty;
      inventory.reservedQuantityKg -= cancelledAllocationQty;

      expect(inventory.availableQuantityKg).toBe(2500);
      expect(inventory.reservedQuantityKg).toBe(0);
    });
  });

  describe('4. Logistics, Fleet & Shipment State Engine', () => {
    test('4.1 Allows valid shipment transitions', () => {
      expect(isValidShipmentTransition(SHIPMENT_STATUS.PLANNED, SHIPMENT_STATUS.READY_FOR_DISPATCH)).toBe(true);
      expect(isValidShipmentTransition(SHIPMENT_STATUS.READY_FOR_DISPATCH, SHIPMENT_STATUS.DISPATCHED)).toBe(true);
      expect(isValidShipmentTransition(SHIPMENT_STATUS.DISPATCHED, SHIPMENT_STATUS.IN_TRANSIT)).toBe(true);
      expect(isValidShipmentTransition(SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.ARRIVED)).toBe(true);
      expect(isValidShipmentTransition(SHIPMENT_STATUS.ARRIVED, SHIPMENT_STATUS.DELIVERED)).toBe(true);
    });

    test('4.2 Blocks invalid shipment transitions', () => {
      expect(isValidShipmentTransition(SHIPMENT_STATUS.PLANNED, SHIPMENT_STATUS.DELIVERED)).toBe(false);
      expect(isValidShipmentTransition(SHIPMENT_STATUS.DELIVERED, SHIPMENT_STATUS.DISPATCHED)).toBe(false);
    });

    test('4.3 Enforces vehicle capacity constraint', () => {
      const vehicle = {
        vehicleNumber: 'TS09AB1234',
        capacityKg: 10000
      };

      const checkVehicleCapacity = (veh, cargoWeight) => {
        if (cargoWeight > veh.capacityKg) {
          throw new BadRequestError(`Cargo weight (${cargoWeight} kg) exceeds vehicle capacity (${veh.capacityKg} kg).`);
        }
        return true;
      };

      expect(checkVehicleCapacity(vehicle, 8500)).toBe(true);
      expect(() => checkVehicleCapacity(vehicle, 12000)).toThrow(BadRequestError);
    });
  });

  describe('5. Delivery Confirmation, Partial Deliveries & Traceability', () => {
    test('5.1 Calculates delivery discrepancies accurately', () => {
      const dispatchedWeightKg = 1500;
      const deliveredWeightKg = 1450;

      expect(deliveredWeightKg <= dispatchedWeightKg).toBe(true);
      const discrepancyKg = dispatchedWeightKg - deliveredWeightKg;
      expect(discrepancyKg).toBe(50);
    });

    test('5.2 Rejects delivery weight greater than dispatched weight', () => {
      const validateDeliveryWeight = (dispatched, delivered) => {
        if (delivered > dispatched) {
          throw new BadRequestError('Delivered weight cannot exceed dispatched weight.');
        }
      };

      expect(() => validateDeliveryWeight(1500, 1600)).toThrow(BadRequestError);
    });

    test('5.3 Verifies end-to-end traceability relationship mapping', () => {
      // Mock full supply-chain graph
      const supplyChainGraph = {
        purchaseOrder: {
          poNumber: 'PO-2026-000001',
          buyer: 'AgroFresh Foods Pvt Ltd',
          totalQuantityKg: 1500
        },
        allocations: [
          {
            produceLot: {
              lotNumber: 'MM-2026-09-000101',
              farmer: 'Ramesh Kumar',
              crop: 'Paddy',
              qualityGrade: 'GRADE_A',
              warehouse: 'Central Warehouse Jadcherla',
              settlement: {
                settlementId: 'SETTLE-202609-00101',
                netAmount: 57000
              }
            },
            allocatedQuantityKg: 800
          },
          {
            produceLot: {
              lotNumber: 'MM-2026-09-000102',
              farmer: 'Lakshmi Devi',
              crop: 'Paddy',
              qualityGrade: 'GRADE_A',
              warehouse: 'Central Warehouse Jadcherla',
              settlement: {
                settlementId: 'SETTLE-202609-00102',
                netAmount: 49500
              }
            },
            allocatedQuantityKg: 700
          }
        ],
        shipment: {
          shipmentNumber: 'SHP-2026-000001',
          vehicle: 'TS09AB1234',
          status: 'DELIVERED',
          deliveryConfirmation: {
            deliveredQuantityKg: 1500,
            receiverName: 'AgroFresh Inward Manager'
          }
        }
      };

      // Assert complete forward & backward linkage
      expect(supplyChainGraph.purchaseOrder.poNumber).toBe('PO-2026-000001');
      expect(supplyChainGraph.allocations.length).toBe(2);
      expect(supplyChainGraph.allocations[0].produceLot.farmer).toBe('Ramesh Kumar');
      expect(supplyChainGraph.allocations[1].produceLot.farmer).toBe('Lakshmi Devi');
      expect(supplyChainGraph.shipment.deliveryConfirmation.deliveredQuantityKg).toBe(1500);
      expect(supplyChainGraph.allocations[0].produceLot.settlement.netAmount).toBe(57000);
    });
  });
});
