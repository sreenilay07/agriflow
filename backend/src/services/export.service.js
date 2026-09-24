const ProduceLot = require('../models/ProduceLot');
const PurchaseOrder = require('../models/PurchaseOrder');
const Inventory = require('../models/Inventory');
const Shipment = require('../models/Shipment');
const Settlement = require('../models/Settlement');

/**
 * Generate CSV format string from array of objects
 */
const toCSV = (headers, rows) => {
  const headerLine = headers.map((h) => `"${h.label}"`).join(',');
  const rowLines = rows.map((row) =>
    headers
      .map((h) => {
        let val = typeof h.key === 'function' ? h.key(row) : row[h.key];
        if (val === null || val === undefined) val = '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  return [headerLine, ...rowLines].join('\n');
};

const exportService = {
  exportLotsCSV: async (filter = {}) => {
    const lots = await ProduceLot.find(filter)
      .populate('cropId', 'name')
      .populate('farmId', 'farmName')
      .populate('collectionCentreId', 'name')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      { label: 'Lot Number', key: 'lotNumber' },
      { label: 'Crop', key: (r) => r.cropId?.name || '' },
      { label: 'Farm', key: (r) => r.farmId?.farmName || '' },
      { label: 'Declared Quantity (kg)', key: 'declaredQuantity' },
      { label: 'Accepted Quantity (kg)', key: (r) => r.acceptedQuantity || 0 },
      { label: 'Status', key: 'status' },
      { label: 'Created At', key: (r) => new Date(r.createdAt).toISOString() }
    ];

    return toCSV(headers, lots);
  },

  exportOrdersCSV: async (filter = {}) => {
    const orders = await PurchaseOrder.find(filter)
      .populate('buyerId', 'fullName')
      .populate('items.crop', 'name')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      { label: 'PO Number', key: 'poNumber' },
      { label: 'Buyer', key: (r) => r.buyerId?.fullName || '' },
      { label: 'Produce', key: (r) => r.items?.map((i) => i.crop?.name).join('; ') || '' },
      { label: 'Total Quantity (kg)', key: 'totalQuantityKg' },
      { label: 'Total Value (INR)', key: 'totalValue' },
      { label: 'Status', key: 'status' },
      { label: 'Created At', key: (r) => new Date(r.createdAt).toISOString() }
    ];

    return toCSV(headers, orders);
  },

  exportInventoryCSV: async (filter = {}) => {
    const inventory = await Inventory.find(filter)
      .populate('cropId', 'name')
      .populate('warehouseId', 'name')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      { label: 'Batch Number', key: 'batchNumber' },
      { label: 'Crop', key: (r) => r.cropId?.name || '' },
      { label: 'Warehouse', key: (r) => r.warehouseId?.name || '' },
      { label: 'Grade', key: 'grade' },
      { label: 'Available Quantity (kg)', key: 'availableQuantity' },
      { label: 'Reserved Quantity (kg)', key: (r) => r.reservedQuantity || 0 },
      { label: 'Storage Location', key: 'storageLocation' },
      { label: 'Status', key: 'status' }
    ];

    return toCSV(headers, inventory);
  },

  exportShipmentsCSV: async (filter = {}) => {
    const shipments = await Shipment.find(filter)
      .populate('originWarehouse', 'name')
      .populate('vehicle', 'vehicleNumber')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      { label: 'Shipment Number', key: 'shipmentNumber' },
      { label: 'Origin Warehouse', key: (r) => r.originWarehouse?.name || '' },
      { label: 'Vehicle Number', key: (r) => r.vehicle?.vehicleNumber || '' },
      { label: 'Driver Name', key: 'driverName' },
      { label: 'Total Weight (kg)', key: 'totalWeightKg' },
      { label: 'Status', key: 'status' },
      { label: 'Destination City', key: (r) => r.destinationAddress?.city || '' },
      { label: 'Created At', key: (r) => new Date(r.createdAt).toISOString() }
    ];

    return toCSV(headers, shipments);
  },

  exportSettlementsCSV: async (filter = {}) => {
    const settlements = await Settlement.find(filter)
      .populate('farmerId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(1000);

    const headers = [
      { label: 'Settlement Number', key: 'settlementNumber' },
      { label: 'Farmer', key: (r) => r.farmerId?.fullName || '' },
      { label: 'Accepted Quantity (kg)', key: 'acceptedQuantity' },
      { label: 'Gross Amount (INR)', key: 'grossAmount' },
      { label: 'Total Deductions (INR)', key: 'totalDeductions' },
      { label: 'Net Amount (INR)', key: 'netAmount' },
      { label: 'Payment Status', key: 'paymentStatus' },
      { label: 'Settlement Date', key: (r) => new Date(r.settlementDate || r.createdAt).toISOString() }
    ];

    return toCSV(headers, settlements);
  }
};

module.exports = exportService;
