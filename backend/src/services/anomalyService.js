const mongoose = require('mongoose');
const ProduceLot = require('../models/ProduceLot');
const Warehouse = require('../models/Warehouse');
const PurchaseOrder = require('../models/PurchaseOrder');
const Shipment = require('../models/Shipment');
const Dispute = require('../models/Dispute');
const Settlement = require('../models/Settlement');
const logger = require('../utils/logger');

class AnomalyService {
  /**
   * Run system-wide rule-based anomaly detection
   */
  async detectAnomalies() {
    const anomalies = [];
    const now = new Date();

    if (mongoose.connection.readyState !== 1) {
      return anomalies;
    }

    try {
      // 1. Check for high warehouse utilization (> 85%)
      const warehouses = await Warehouse.find({ active: true });
      for (const wh of warehouses) {
        if (wh.totalCapacityKg > 0) {
          const utilPct = Math.round((wh.usedCapacityKg / wh.totalCapacityKg) * 100);
          if (utilPct >= 85) {
            anomalies.push({
              anomalyType: 'WAREHOUSE_NEAR_CAPACITY',
              severity: utilPct >= 95 ? 'CRITICAL' : 'HIGH',
              entityType: 'Warehouse',
              entityId: wh._id,
              description: `Warehouse ${wh.name} (${wh.code}) has reached ${utilPct}% capacity (${(wh.usedCapacityKg / 1000).toFixed(1)} / ${(wh.totalCapacityKg / 1000).toFixed(1)} Tonnes).`,
              detectedAt: now.toISOString()
            });
          }
        }
      }

      // 2. Check for delayed shipments (ETA passed while not delivered)
      const activeShipments = await Shipment.find({
        status: { $in: ['DISPATCHED', 'IN_TRANSIT'] },
        estimatedArrivalDate: { $lt: now }
      });

      for (const shp of activeShipments) {
        anomalies.push({
          anomalyType: 'SHIPMENT_DELAYED',
          severity: 'HIGH',
          entityType: 'Shipment',
          entityId: shp._id,
          description: `Shipment #${shp.shipmentNumber} is past its estimated arrival date (${new Date(shp.estimatedArrivalDate).toLocaleDateString()}) without delivery confirmation.`,
          detectedAt: now.toISOString()
        });
      }

      // 3. Check for high rejection rate lots
      const highRejectionLots = await ProduceLot.find({
        status: { $in: ['REJECTED', 'PARTIALLY_ACCEPTED'] },
        rejectedQuantity: { $gt: 500 }
      }).populate('cropId', 'name').limit(10);

      for (const lot of highRejectionLots) {
        anomalies.push({
          anomalyType: 'HIGH_PRODUCE_REJECTION',
          severity: 'MEDIUM',
          entityType: 'ProduceLot',
          entityId: lot._id,
          description: `Lot #${lot.lotNumber} (${lot.cropId?.name || 'Crop'}) experienced significant rejection (${lot.rejectedQuantity} kg rejected out of ${lot.declaredQuantity} kg).`,
          detectedAt: now.toISOString()
        });
      }

      // 4. Check for stale unallocated approved POs (> 48 hours old)
      const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
      const stalePOs = await PurchaseOrder.find({
        status: 'APPROVED',
        createdAt: { $lt: twoDaysAgo }
      }).limit(10);

      for (const po of stalePOs) {
        anomalies.push({
          anomalyType: 'UNALLOCATED_PURCHASE_ORDER',
          severity: 'MEDIUM',
          entityType: 'PurchaseOrder',
          entityId: po._id,
          description: `Purchase Order #${po.poNumber} has been approved for over 48 hours without warehouse lot allocation.`,
          detectedAt: now.toISOString()
        });
      }

      // 5. Check for active open disputes
      const openDisputes = await Dispute.find({ status: 'RAISED' }).limit(10);
      for (const disp of openDisputes) {
        anomalies.push({
          anomalyType: 'UNRESOLVED_DISPUTE',
          severity: 'HIGH',
          entityType: 'Dispute',
          entityId: disp._id,
          description: `Grievance #${disp.disputeNumber || disp._id} remains open awaiting administrative review. Reason: ${disp.reason || 'Quality/Weight mismatch'}.`,
          detectedAt: now.toISOString()
        });
      }

      return anomalies;
    } catch (err) {
      logger.error(`[ANOMALY SERVICE] Detection error: ${err.message}`);
      return [];
    }
  }
}

module.exports = new AnomalyService();
