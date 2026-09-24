const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'QUEUE_UPDATE',
        'TURN_APPROACHING',
        'DEPARTURE_REMINDER',
        'DOCUMENT_REMINDER',
        'STAGE_COMPLETED',
        'PROCUREMENT_COMPLETED',
        'PAYMENT_UPDATE',
        'SYSTEM',
        'ANNOUNCEMENT',
        'LOT_UPDATE',
        'QUALITY_UPDATE',
        'PO_UPDATE',
        'SHIPMENT_UPDATE',
        'INVENTORY_ALERT',
        'SETTLEMENT_UPDATE',
        'DISPUTE_UPDATE',
        'SYSTEM_ALERT',
        'AI_INSIGHT'
      ],
      default: 'SYSTEM_ALERT'
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    },
    entityType: {
      type: String
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    read: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
