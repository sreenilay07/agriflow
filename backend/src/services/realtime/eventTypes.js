/**
 * AgriTrade Realtime Event Types Definition
 */
const EVENT_TYPES = {
  // Produce Lot Events
  LOT_CREATED: 'lot:created',
  LOT_SCHEDULED: 'lot:scheduled',
  LOT_RECEIVED: 'lot:received',
  QUALITY_INSPECTION_STARTED: 'quality:started',
  QUALITY_INSPECTION_COMPLETED: 'quality:completed',
  LOT_ACCEPTED: 'lot:accepted',
  LOT_PARTIALLY_ACCEPTED: 'lot:partially_accepted',
  LOT_REJECTED: 'lot:rejected',
  LOT_STORED: 'lot:stored',
  LOT_ALLOCATED: 'lot:allocated',
  LOT_DISPATCHED: 'lot:dispatched',
  LOT_DELIVERED: 'lot:delivered',
  LOT_SETTLED: 'lot:settled',
  LOT_CANCELLED: 'lot:cancelled',
  LOT_STATUS_CHANGED: 'lot:status_changed',

  // Purchase Order Events
  PO_CREATED: 'po:created',
  PO_SUBMITTED: 'po:submitted',
  PO_APPROVED: 'po:approved',
  PO_REJECTED: 'po:rejected',
  PO_PARTIALLY_ALLOCATED: 'po:partially_allocated',
  PO_FULLY_ALLOCATED: 'po:fully_allocated',
  PO_DISPATCHED: 'po:dispatched',
  PO_DELIVERED: 'po:delivered',
  PO_COMPLETED: 'po:completed',
  PO_CANCELLED: 'po:cancelled',
  PO_STATUS_CHANGED: 'po:status_changed',

  // Shipment & Logistics Events
  SHIPMENT_CREATED: 'shipment:created',
  SHIPMENT_DISPATCHED: 'shipment:dispatched',
  SHIPMENT_IN_TRANSIT: 'shipment:in_transit',
  SHIPMENT_DELAYED: 'shipment:delayed',
  SHIPMENT_DELIVERED: 'shipment:delivered',
  SHIPMENT_STATUS_CHANGED: 'shipment:status_changed',

  // Settlement Events
  SETTLEMENT_CREATED: 'settlement:created',
  SETTLEMENT_UPDATED: 'settlement:updated',
  SETTLEMENT_COMPLETED: 'settlement:completed',

  // Dispute Events
  DISPUTE_CREATED: 'dispute:created',
  DISPUTE_UPDATED: 'dispute:updated',
  DISPUTE_RESOLVED: 'dispute:resolved',

  // Inventory & Anomaly Events
  INVENTORY_UPDATED: 'inventory:updated',
  INVENTORY_ALERT: 'inventory:alert',
  ANOMALY_DETECTED: 'anomaly:detected',

  // Notification & System Events
  NOTIFICATION_CREATED: 'notification:created',
  SYSTEM_ALERT: 'system:alert'
};

module.exports = EVENT_TYPES;
