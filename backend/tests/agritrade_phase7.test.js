const { EVENT_TYPES, ROOMS } = require('../src/services/realtime/eventService');
const aiService = require('../src/services/ai/aiService');
const analyticsService = require('../src/services/analytics.service');
const anomalyService = require('../src/services/anomalyService');
const exportService = require('../src/services/export.service');

describe('MANDI MITHRA - AgriTrade Phase 7 (AI, Realtime, Analytics & Anomalies)', () => {

  describe('1. Realtime Event Architecture & Room Structure', () => {
    test('1.1 Verifies all required event types exist', () => {
      expect(EVENT_TYPES.LOT_STATUS_CHANGED).toBe('lot:status_changed');
      expect(EVENT_TYPES.PO_STATUS_CHANGED).toBe('po:status_changed');
      expect(EVENT_TYPES.SHIPMENT_STATUS_CHANGED).toBe('shipment:status_changed');
      expect(EVENT_TYPES.SETTLEMENT_CREATED).toBe('settlement:created');
      expect(EVENT_TYPES.NOTIFICATION_CREATED).toBe('notification:created');
      expect(EVENT_TYPES.ANOMALY_DETECTED).toBe('anomaly:detected');
    });

    test('1.2 Generates clean, predictable socket rooms', () => {
      expect(ROOMS.farmer('FARMER123')).toBe('farmer:FARMER123');
      expect(ROOMS.buyer('BUYER456')).toBe('buyer:BUYER456');
      expect(ROOMS.warehouse('WH01')).toBe('warehouse:WH01');
      expect(ROOMS.allAdmins()).toBe('role:SUPER_ADMIN');
      expect(ROOMS.allLogistics()).toBe('role:LOGISTICS_COORDINATOR');
    });
  });

  describe('2. AI Intelligence Layer & Graceful Fallback', () => {
    test('2.1 Quality Assistant generates structured, non-binding evaluation', async () => {
      const mockInspection = {
        moisturePercentage: 13.2,
        foreignMatterPercentage: 1.1,
        qualityScore: 92,
        assignedGrade: 'GRADE_A',
        cropName: 'Paddy'
      };

      const result = await aiService.interpretQuality(mockInspection);
      expect(result).toBeDefined();
      expect(result.isAssistanceOnly).toBe(true);
      expect(result.riskLevel).toBe('LOW');
      expect(Array.isArray(result.observations)).toBe(true);
      expect(result.summary).toContain('GRADE_A');
    });

    test('2.2 Quality Assistant flags high moisture risk (> 14%)', async () => {
      const mockWetInspection = {
        moisturePercentage: 18.5,
        foreignMatterPercentage: 1.0,
        qualityScore: 55,
        assignedGrade: 'GRADE_C',
        cropName: 'Paddy'
      };

      const result = await aiService.interpretQuality(mockWetInspection);
      expect(result.riskLevel).toBe('HIGH');
      expect(result.observations.some(o => o.includes('18.5%'))).toBe(true);
      expect(result.suggestedChecks.length).toBeGreaterThan(0);
    });

    test('2.3 Procurement insights fallback operates deterministically without throwing', async () => {
      const result = await aiService.getProcurementInsights();
      expect(result).toBeDefined();
      expect(result.source).toBeDefined();
      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
      expect(result.insights[0].title).toBeDefined();
      expect(result.insights[0].summary).toBeDefined();
    });
  });

  describe('3. Analytics Date Range Filtering', () => {
    test('3.1 Accurately computes 7d, 30d, 90d and custom date filters', () => {
      const filter7d = analyticsService.getDateFilter('7d');
      expect(filter7d.$gte).toBeInstanceOf(Date);
      expect(filter7d.$lte).toBeInstanceOf(Date);

      const filter30d = analyticsService.getDateFilter('30d');
      expect(filter30d.$gte < filter7d.$gte).toBe(true);

      const customStart = '2026-01-01T00:00:00.000Z';
      const customEnd = '2026-01-15T00:00:00.000Z';
      const customFilter = analyticsService.getDateFilter('custom', customStart, customEnd);
      expect(customFilter.$gte.toISOString()).toBe(customStart);
      expect(customFilter.$lte.toISOString()).toBe(customEnd);
    });
  });

  describe('4. Anomaly & Risk Detection Heuristics', () => {
    test('4.1 Detects operational anomalies without throwing', async () => {
      const anomalies = await anomalyService.detectAnomalies();
      expect(Array.isArray(anomalies)).toBe(true);
      anomalies.forEach((a) => {
        expect(a.anomalyType).toBeDefined();
        expect(a.severity).toBeDefined();
        expect(a.description).toBeDefined();
      });
    });
  });
});
