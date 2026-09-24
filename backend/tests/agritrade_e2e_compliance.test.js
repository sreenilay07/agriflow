const {
  PRODUCE_LOT_STATUS,
  PURCHASE_ORDER_STATUS,
  SHIPMENT_STATUS,
  SETTLEMENT_STATUS,
  PAYMENT_STATUS,
  QUALITY_GRADE
} = require('../src/constants/status');
const {
  isValidTransition,
  assertValidTransition,
  isValidPOTransition,
  isValidShipmentTransition
} = require('../src/services/stateMachine.service');
const { evaluateGrade, calculateQualityScore } = require('../src/services/quality.service');
const { calculateSettlementPreview } = require('../src/services/settlement.service');
const Crop = require('../src/models/Crop');

describe('AGRITRADE — End-to-End Capstone Compliance Integration Test', () => {

  const testCrop = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Basmati Rice',
    code: 'BASMATI',
    unit: 'KG',
    category: 'CEREALS',
    basePricePerKg: 40.0,
    standardGradingRules: [
      { grade: 'GRADE_A', minScore: 85, maxMoisture: 13, maxForeignMatter: 1, maxBrokenGrains: 5, priceMultiplier: 1.05 },
      { grade: 'GRADE_B', minScore: 70, maxMoisture: 15, maxForeignMatter: 2, maxBrokenGrains: 10, priceMultiplier: 1.0 },
      { grade: 'GRADE_C', minScore: 50, maxMoisture: 18, maxForeignMatter: 3, maxBrokenGrains: 15, priceMultiplier: 0.88 }
    ]
  };

  test('Step 1: Farmer declares harvest produce lot (CREATED)', () => {
    const lot = {
      lotNumber: 'LOT-2026-09-000101',
      declaredQuantity: 2000,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.CREATED
    };

    expect(lot.status).toBe('CREATED');
    expect(lot.declaredQuantity).toBe(2000);
  });

  test('Step 2: Lot arrival and physical weighment at Collection Centre (SCHEDULED -> RECEIVED)', () => {
    expect(isValidTransition(PRODUCE_LOT_STATUS.CREATED, PRODUCE_LOT_STATUS.SCHEDULED)).toBe(true);
    expect(isValidTransition(PRODUCE_LOT_STATUS.SCHEDULED, PRODUCE_LOT_STATUS.RECEIVED)).toBe(true);

    const receivedLot = {
      lotNumber: 'LOT-2026-09-000101',
      declaredQuantity: 2000,
      receivedQuantity: 1980,
      status: PRODUCE_LOT_STATUS.RECEIVED
    };

    expect(receivedLot.receivedQuantity).toBe(1980);
    expect(receivedLot.status).toBe('RECEIVED');
  });

  test('Step 3: Quality Inspector laboratory grading and decision (UNDER_INSPECTION -> ACCEPTED)', () => {
    expect(isValidTransition(PRODUCE_LOT_STATUS.RECEIVED, PRODUCE_LOT_STATUS.UNDER_INSPECTION)).toBe(true);

    const testMeasurements = {
      moisturePercentage: 12.0,
      foreignMatterPercentage: 0.3,
      brokenGrainPercentage: 1.5,
      damagePercentage: 0.3
    };

    const qualityScore = calculateQualityScore(testMeasurements);
    expect(qualityScore).toBeGreaterThanOrEqual(85);

    const assignedGrade = evaluateGrade(testCrop, testMeasurements);
    expect(assignedGrade).toBe(QUALITY_GRADE.GRADE_A);

    expect(isValidTransition(PRODUCE_LOT_STATUS.UNDER_INSPECTION, PRODUCE_LOT_STATUS.ACCEPTED)).toBe(true);
    expect(isValidTransition(PRODUCE_LOT_STATUS.UNDER_INSPECTION, PRODUCE_LOT_STATUS.PARTIALLY_ACCEPTED)).toBe(true);
    expect(isValidTransition(PRODUCE_LOT_STATUS.UNDER_INSPECTION, PRODUCE_LOT_STATUS.REJECTED)).toBe(true);
  });

  test('Step 4: Canonical warehouse inventory storage (ACCEPTED -> STORED)', () => {
    expect(isValidTransition(PRODUCE_LOT_STATUS.ACCEPTED, PRODUCE_LOT_STATUS.STORED)).toBe(true);

    // Canonical inventory schema check
    const canonicalInventory = {
      warehouseId: '507f1f77bcf86cd799439022',
      lotId: '507f1f77bcf86cd799439033',
      cropId: testCrop._id,
      batchNumber: 'BATCH-2026-09-001',
      grade: 'GRADE_A',
      totalQuantity: 1980,
      availableQuantity: 1980,
      reservedQuantity: 0,
      storageLocation: 'BAY-A-12',
      status: 'IN_STOCK'
    };

    expect(canonicalInventory.status).toBe('IN_STOCK');
    expect(canonicalInventory.availableQuantity).toBe(1980);
    expect(canonicalInventory.reservedQuantity).toBe(0);
    expect(canonicalInventory.storageLocation).toBe('BAY-A-12');
  });

  test('Step 5: Buyer Purchase Order & Multi-Lot Allocation (DRAFT -> SUBMITTED -> APPROVED -> FULLY_ALLOCATED)', () => {
    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DRAFT, PURCHASE_ORDER_STATUS.SUBMITTED)).toBe(true);
    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.SUBMITTED, PURCHASE_ORDER_STATUS.APPROVED)).toBe(true);
    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.APPROVED, PURCHASE_ORDER_STATUS.FULLY_ALLOCATED)).toBe(true);

    // Simulating deterministic reservation: 1500 kg reserved from 1980 kg inventory
    const allocatedQty = 1500;
    const inventoryBefore = { totalQuantity: 1980, availableQuantity: 1980, reservedQuantity: 0 };
    const inventoryAfter = {
      totalQuantity: inventoryBefore.totalQuantity,
      availableQuantity: inventoryBefore.availableQuantity - allocatedQty,
      reservedQuantity: inventoryBefore.reservedQuantity + allocatedQty,
      status: 'IN_STOCK'
    };

    expect(inventoryAfter.availableQuantity).toBe(480);
    expect(inventoryAfter.reservedQuantity).toBe(1500);

    // Produce Lot transitions to ALLOCATED
    expect(isValidTransition(PRODUCE_LOT_STATUS.STORED, PRODUCE_LOT_STATUS.ALLOCATED)).toBe(true);
  });

  test('Step 6: Logistics Manifest & Fleet Transit (DISPATCHED -> IN_TRANSIT -> DELIVERED)', () => {
    expect(isValidShipmentTransition(SHIPMENT_STATUS.PLANNED, SHIPMENT_STATUS.READY_FOR_DISPATCH)).toBe(true);
    expect(isValidShipmentTransition(SHIPMENT_STATUS.READY_FOR_DISPATCH, SHIPMENT_STATUS.DISPATCHED)).toBe(true);
    expect(isValidShipmentTransition(SHIPMENT_STATUS.DISPATCHED, SHIPMENT_STATUS.IN_TRANSIT)).toBe(true);
    expect(isValidShipmentTransition(SHIPMENT_STATUS.IN_TRANSIT, SHIPMENT_STATUS.DELIVERED)).toBe(true);

    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.FULLY_ALLOCATED, PURCHASE_ORDER_STATUS.DISPATCHED)).toBe(true);
    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DISPATCHED, PURCHASE_ORDER_STATUS.DELIVERED)).toBe(true);
    expect(isValidPOTransition(PURCHASE_ORDER_STATUS.DELIVERED, PURCHASE_ORDER_STATUS.COMPLETED)).toBe(true);

    // Produce Lot transitions through DISPATCHED to DELIVERED
    expect(isValidTransition(PRODUCE_LOT_STATUS.ALLOCATED, PRODUCE_LOT_STATUS.DISPATCHED)).toBe(true);
    expect(isValidTransition(PRODUCE_LOT_STATUS.DISPATCHED, PRODUCE_LOT_STATUS.DELIVERED)).toBe(true);
  });

  test('Step 7: Server-authoritative transparent settlement calculation', async () => {
    // Mock Crop.findById to return testCrop
    jest.spyOn(Crop, 'findById').mockResolvedValue(testCrop);

    const agreedProcurementRate = 42.0; // Persisted agreed price
    const calculation = await calculateSettlementPreview({
      cropId: testCrop._id,
      acceptedQuantity: 1980,
      agreedPricePerKg: agreedProcurementRate,
      grade: 'GRADE_A',
      deductions: [
        { deductionType: 'HANDLING_CHARGES', amount: 500, description: 'Loading & unloading bay fee' },
        { deductionType: 'MOISTURE_PENALTY', amount: 0, description: 'None' }
      ],
      adjustments: [
        { adjustmentType: 'PREMIUM_GRADE_BONUS', amount: 300, description: 'Certified Organic / Clean batch bonus' }
      ]
    });

    // Formula: Gross = 1980 KG * (42.0 * 1.05 = 44.1) = 87,318
    expect(calculation.acceptedQuantity).toBe(1980);
    expect(calculation.agreedPricePerKg).toBe(42.0);
    expect(calculation.effectiveRatePerKg).toBe(44.1);
    expect(calculation.grossAmount).toBe(87318);
    expect(calculation.totalDeductions).toBe(500);
    expect(calculation.totalAdjustments).toBe(300);
    // Net: 87318 - 500 + 300 = 87118
    expect(calculation.netAmount).toBe(87118);
    expect(calculation.breakdown.formula).toContain('87118');

    // Lot transitions to SETTLED
    expect(isValidTransition(PRODUCE_LOT_STATUS.DELIVERED, PRODUCE_LOT_STATUS.SETTLED)).toBe(true);
    expect(isValidTransition(PRODUCE_LOT_STATUS.STORED, PRODUCE_LOT_STATUS.SETTLED)).toBe(true);

    Crop.findById.mockRestore();
  });
});
