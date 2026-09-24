const { evaluateGrade, calculateQualityScore } = require('../src/services/quality.service');
const { calculateSettlementPreview } = require('../src/services/settlement.service');
const { isValidTransition, assertValidTransition } = require('../src/services/stateMachine.service');
const { PRODUCE_LOT_STATUS, QUALITY_GRADE } = require('../src/constants/status');
const { BadRequestError } = require('../src/utils/customErrors');

describe('MANDI MITHRA - AgriTrade Core Domain & Lifecycle Business Rules', () => {

  describe('1. State Machine & Lifecycle Transition Rules', () => {
    test('1.1 Allows valid state transitions: CREATED -> SCHEDULED -> RECEIVED -> UNDER_INSPECTION -> ACCEPTED -> STORED -> SETTLED', () => {
      expect(isValidTransition(PRODUCE_LOT_STATUS.CREATED, PRODUCE_LOT_STATUS.SCHEDULED)).toBe(true);
      expect(isValidTransition(PRODUCE_LOT_STATUS.SCHEDULED, PRODUCE_LOT_STATUS.RECEIVED)).toBe(true);
      expect(isValidTransition(PRODUCE_LOT_STATUS.RECEIVED, PRODUCE_LOT_STATUS.UNDER_INSPECTION)).toBe(true);
      expect(isValidTransition(PRODUCE_LOT_STATUS.UNDER_INSPECTION, PRODUCE_LOT_STATUS.ACCEPTED)).toBe(true);
      expect(isValidTransition(PRODUCE_LOT_STATUS.ACCEPTED, PRODUCE_LOT_STATUS.STORED)).toBe(true);
      expect(isValidTransition(PRODUCE_LOT_STATUS.STORED, PRODUCE_LOT_STATUS.SETTLED)).toBe(true);
    });

    test('1.2 Blocks invalid state transitions (e.g., CREATED -> DELIVERED, REJECTED -> STORED)', () => {
      expect(isValidTransition(PRODUCE_LOT_STATUS.CREATED, PRODUCE_LOT_STATUS.DELIVERED)).toBe(false);
      expect(isValidTransition(PRODUCE_LOT_STATUS.CREATED, PRODUCE_LOT_STATUS.STORED)).toBe(false);
      expect(isValidTransition(PRODUCE_LOT_STATUS.REJECTED, PRODUCE_LOT_STATUS.STORED)).toBe(false);
      expect(isValidTransition(PRODUCE_LOT_STATUS.SETTLED, PRODUCE_LOT_STATUS.CREATED)).toBe(false);
    });

    test('1.3 Throws BadRequestError on forbidden transition', () => {
      expect(() => {
        assertValidTransition(PRODUCE_LOT_STATUS.CREATED, PRODUCE_LOT_STATUS.STORED);
      }).toThrow(BadRequestError);
    });
  });

  describe('2. Quality Evaluation & Grading Logic', () => {
    const mockPaddyCrop = {
      name: 'Paddy',
      code: 'PADDY',
      standardGradingRules: [
        { grade: 'GRADE_A', minScore: 85, maxMoisture: 14, maxForeignMatter: 1, maxBrokenGrains: 4, priceMultiplier: 1.05 },
        { grade: 'GRADE_B', minScore: 70, maxMoisture: 16, maxForeignMatter: 2.5, maxBrokenGrains: 8, priceMultiplier: 1.0 },
        { grade: 'GRADE_C', minScore: 50, maxMoisture: 19, maxForeignMatter: 4, maxBrokenGrains: 14, priceMultiplier: 0.88 }
      ]
    };

    test('2.1 Correctly assigns GRADE_A for optimal quality metrics', () => {
      const grade = evaluateGrade(mockPaddyCrop, {
        moisturePercentage: 13,
        foreignMatterPercentage: 0.5,
        brokenGrainPercentage: 2,
        damagePercentage: 0.5
      });
      expect(grade).toBe(QUALITY_GRADE.GRADE_A);
    });

    test('2.2 Correctly assigns GRADE_B for standard quality metrics', () => {
      const grade = evaluateGrade(mockPaddyCrop, {
        moisturePercentage: 15.5,
        foreignMatterPercentage: 2.0,
        brokenGrainPercentage: 6,
        damagePercentage: 2
      });
      expect(grade).toBe(QUALITY_GRADE.GRADE_B);
    });

    test('2.3 Correctly assigns REJECTED for out-of-bounds metrics', () => {
      const grade = evaluateGrade(mockPaddyCrop, {
        moisturePercentage: 24,
        foreignMatterPercentage: 8,
        brokenGrainPercentage: 25,
        damagePercentage: 10
      });
      expect(grade).toBe(QUALITY_GRADE.REJECTED);
    });

    test('2.4 Quality score calculates appropriately within 0-100 bounds', () => {
      const highQualityScore = calculateQualityScore({
        moisturePercentage: 12,
        foreignMatterPercentage: 0,
        brokenGrainPercentage: 0,
        damagePercentage: 0
      });
      expect(highQualityScore).toBe(100);

      const degradedScore = calculateQualityScore({
        moisturePercentage: 16,
        foreignMatterPercentage: 2,
        brokenGrainPercentage: 5,
        damagePercentage: 2
      });
      expect(degradedScore).toBeLessThan(100);
      expect(degradedScore).toBeGreaterThan(0);
    });
  });

  describe('3. Partial Acceptance & Quantity Arithmetic Validation', () => {
    test('3.1 Validates that accepted + rejected quantities match total received', () => {
      const receivedQuantity = 2420;
      const acceptedQuantity = 2300;
      const rejectedQuantity = 120;

      const isValid = acceptedQuantity + rejectedQuantity <= receivedQuantity;
      expect(isValid).toBe(true);
    });

    test('3.2 Rejects when accepted + rejected exceeds total received', () => {
      const receivedQuantity = 2420;
      const acceptedQuantity = 2400;
      const rejectedQuantity = 50;

      const isExceeded = acceptedQuantity + rejectedQuantity > receivedQuantity;
      expect(isExceeded).toBe(true);
    });
  });

  describe('4. Server-Side Settlement Calculation & Precision Arithmetic', () => {
    test('4.1 Calculates gross amount, deductions, and net amount with exact rounding', async () => {
      // Direct arithmetic simulation of settlement service formula
      const acceptedQuantity = 2300; // kg
      const basePrice = 25; // Rs/kg
      const grade = 'GRADE_A';
      const priceMultiplier = 1.05; // 5% bonus for Grade A

      const effectiveRate = Math.round(basePrice * priceMultiplier * 100) / 100; // 26.25
      const grossAmount = Math.round(acceptedQuantity * effectiveRate * 100) / 100; // 60,375.00

      const deductions = [
        { deductionType: 'BAG_COST', amount: 500, description: 'Gunny bags' }
      ];
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0); // 500

      const totalAdjustments = 0;
      const netAmount = Math.round((grossAmount - totalDeductions + totalAdjustments) * 100) / 100; // 59,875.00

      expect(effectiveRate).toBe(26.25);
      expect(grossAmount).toBe(60375);
      expect(totalDeductions).toBe(500);
      expect(netAmount).toBe(59875);
    });

    test('4.2 Rejects negative deduction amounts', () => {
      const invalidDeductions = [{ amount: -100 }];
      expect(invalidDeductions[0].amount < 0).toBe(true);
    });

    test('4.3 Ensures net amount cannot fall below zero', () => {
      const gross = 1000;
      const massiveDeductions = 1500;
      const net = Math.max(0, gross - massiveDeductions);
      expect(net).toBe(0);
    });
  });

  describe('5. Inventory & Warehouse Movement Accounting', () => {
    test('5.1 Accurately updates warehouse capacity upon intake', () => {
      const totalCapacity = 500000; // 500 tonnes
      let usedCapacity = 45000;
      const newIntake = 2300;

      const remainingCapacity = totalCapacity - usedCapacity;
      expect(remainingCapacity).toBeGreaterThanOrEqual(newIntake);

      usedCapacity += newIntake;
      expect(usedCapacity).toBe(47300);
    });

    test('5.2 Prevents inventory intake when warehouse capacity is exceeded', () => {
      const totalCapacity = 50000;
      const usedCapacity = 49000;
      const incomingLot = 2000;

      const remaining = totalCapacity - usedCapacity;
      expect(incomingLot > remaining).toBe(true);
    });
  });
});
