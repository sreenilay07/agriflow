const mongoose = require('mongoose');
const ProduceLot = require('../models/ProduceLot');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');
const Warehouse = require('../models/Warehouse');
const Shipment = require('../models/Shipment');
const Settlement = require('../models/Settlement');
const QualityInspection = require('../models/QualityInspection');
const Dispute = require('../models/Dispute');
const User = require('../models/User');

class AnalyticsService {
  /**
   * Helper to parse date ranges into MongoDB Date match objects
   */
  getDateFilter(range = '30d', customStart = null, customEnd = null) {
    const now = new Date();
    let startDate = new Date();

    switch (range.toLowerCase()) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case 'this_year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (customStart) {
          startDate = new Date(customStart);
        } else {
          startDate.setDate(now.getDate() - 30);
        }
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    const endDate = customEnd ? new Date(customEnd) : now;

    return {
      $gte: startDate,
      $lte: endDate
    };
  }

  /**
   * 1. Executive Admin Overview
   */
  async getAdminOverview(range = '30d') {
    const dateFilter = this.getDateFilter(range);

    const [
      totalFarmers,
      totalBuyers,
      totalLots,
      lotsAccepted,
      inventoryStats,
      poStats,
      shipmentStats,
      settlementStats,
      openDisputes
    ] = await Promise.all([
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'BUYER' }),
      ProduceLot.countDocuments({ createdAt: dateFilter }),
      ProduceLot.aggregate([
        { $match: { createdAt: dateFilter, status: { $in: ['ACCEPTED', 'STORED', 'ALLOCATED', 'DELIVERED', 'SETTLED'] } } },
        { $group: { _id: null, totalAcceptedKg: { $sum: '$acceptedQuantity' }, totalDeclaredKg: { $sum: '$declaredQuantity' } } }
      ]),
      Inventory.aggregate([
        { $group: { _id: '$status', totalKg: { $sum: '$availableQuantity' } } }
      ]),
      PurchaseOrder.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: null, totalPOs: { $sum: 1 }, totalValue: { $sum: '$totalValue' }, totalKg: { $sum: '$totalQuantityKg' } } }
      ]),
      Shipment.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Settlement.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: '$paymentStatus', totalGross: { $sum: '$grossAmount' }, totalNet: { $sum: '$netAmount' }, count: { $sum: 1 } } }
      ]),
      Dispute.countDocuments({ status: 'RAISED' })
    ]);

    const acceptedKg = lotsAccepted[0]?.totalAcceptedKg || 0;
    const declaredKg = lotsAccepted[0]?.totalDeclaredKg || 0;
    const totalInventoryKg = inventoryStats.reduce((acc, curr) => acc + (curr.totalKg || 0), 0);

    return {
      timeframe: range,
      overview: {
        totalFarmers,
        totalBuyers,
        totalLots,
        acceptedKg,
        declaredKg,
        acceptanceRate: declaredKg ? Math.round((acceptedKg / declaredKg) * 100) : 100,
        totalInventoryKg,
        openPurchaseOrders: poStats[0]?.totalPOs || 0,
        totalProcurementValue: poStats[0]?.totalValue || 0,
        totalProcurementKg: poStats[0]?.totalKg || 0,
        shipmentsByStatus: shipmentStats,
        settlements: settlementStats,
        openDisputes
      }
    };
  }

  /**
   * 2. Procurement Volume & Trends Analytics
   */
  async getProcurementAnalytics(range = '30d') {
    const dateFilter = this.getDateFilter(range);

    const [volumeByCrop, dailyTrend] = await Promise.all([
      ProduceLot.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$cropId',
            totalDeclaredKg: { $sum: '$declaredQuantity' },
            totalAcceptedKg: { $sum: '$acceptedQuantity' },
            lotCount: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'crops',
            localField: '_id',
            foreignField: '_id',
            as: 'crop'
          }
        },
        { $unwind: { path: '$crop', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            cropName: '$crop.name',
            cropCode: '$crop.code',
            totalDeclaredKg: 1,
            totalAcceptedKg: 1,
            lotCount: 1
          }
        }
      ]),
      ProduceLot.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            declaredKg: { $sum: '$declaredQuantity' },
            acceptedKg: { $sum: '$acceptedQuantity' },
            lots: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      timeframe: range,
      volumeByCrop,
      dailyTrend
    };
  }

  /**
   * 3. Quality Grading Distribution Analytics
   */
  async getQualityAnalytics(range = '30d') {
    const dateFilter = this.getDateFilter(range);

    const [gradeDistribution, averageMoistureByCrop] = await Promise.all([
      QualityInspection.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$assignedGrade',
            count: { $sum: 1 },
            avgScore: { $avg: '$qualityScore' },
            avgMoisture: { $avg: '$moisturePercentage' }
          }
        }
      ]),
      QualityInspection.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$cropId',
            avgMoisture: { $avg: '$moisturePercentage' },
            avgForeignMatter: { $avg: '$foreignMatterPercentage' },
            totalInspected: { $sum: 1 }
          }
        },
        {
          $lookup: {
            from: 'crops',
            localField: '_id',
            foreignField: '_id',
            as: 'crop'
          }
        },
        { $unwind: { path: '$crop', preserveNullAndEmptyArrays: true } },
        {
          $project: {
            cropName: '$crop.name',
            avgMoisture: { $round: ['$avgMoisture', 1] },
            avgForeignMatter: { $round: ['$avgForeignMatter', 1] },
            totalInspected: 1
          }
        }
      ])
    ]);

    return {
      timeframe: range,
      gradeDistribution,
      averageMoistureByCrop
    };
  }

  /**
   * 4. Logistics Turnaround & Fleet Analytics
   */
  async getLogisticsAnalytics(range = '30d') {
    const dateFilter = this.getDateFilter(range);

    const [statusBreakdown, deliveryPerformance] = await Promise.all([
      Shipment.aggregate([
        { $match: { createdAt: dateFilter } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalWeightKg: { $sum: '$totalWeightKg' } } }
      ]),
      Shipment.aggregate([
        { $match: { createdAt: dateFilter, status: 'DELIVERED' } },
        {
          $project: {
            shipmentNumber: 1,
            totalWeightKg: 1,
            plannedDispatchDate: 1,
            actualDeliveryDate: 1
          }
        },
        { $limit: 20 }
      ])
    ]);

    return {
      timeframe: range,
      statusBreakdown,
      deliveryPerformance
    };
  }

  /**
   * 5. Settlement & Disbursal Financial Analytics
   */
  async getSettlementAnalytics(range = '30d') {
    const dateFilter = this.getDateFilter(range);

    const [paymentStatusBreakdown, financialTotals] = await Promise.all([
      Settlement.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: '$paymentStatus',
            count: { $sum: 1 },
            totalGross: { $sum: '$grossAmount' },
            totalDeductions: { $sum: '$totalDeductions' },
            totalNet: { $sum: '$netAmount' }
          }
        }
      ]),
      Settlement.aggregate([
        { $match: { createdAt: dateFilter } },
        {
          $group: {
            _id: null,
            totalPaidOut: {
              $sum: { $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$netAmount', 0] }
            },
            totalPending: {
              $sum: { $cond: [{ $ne: ['$paymentStatus', 'PAID'] }, '$netAmount', 0] }
            },
            totalDeductions: { $sum: '$totalDeductions' }
          }
        }
      ])
    ]);

    return {
      timeframe: range,
      paymentStatusBreakdown,
      totals: financialTotals[0] || { totalPaidOut: 0, totalPending: 0, totalDeductions: 0 }
    };
  }
}

module.exports = new AnalyticsService();
