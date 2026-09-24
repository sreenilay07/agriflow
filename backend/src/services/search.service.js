const ProduceLot = require('../models/ProduceLot');
const PurchaseOrder = require('../models/PurchaseOrder');
const Shipment = require('../models/Shipment');
const Warehouse = require('../models/Warehouse');
const User = require('../models/User');

const searchEntities = async (query, user) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const regex = new RegExp(cleanQuery, 'i');
  const results = [];
  const role = user.role;

  // 1. Produce Lots search
  const lotFilter = {
    $or: [{ lotNumber: regex }]
  };
  if (role === 'FARMER') {
    lotFilter.farmerId = user._id;
  }

  const lots = await ProduceLot.find(lotFilter)
    .populate('cropId', 'name')
    .limit(5);

  lots.forEach((lot) => {
    results.push({
      type: 'PRODUCE_LOT',
      id: lot._id,
      title: lot.lotNumber,
      subtitle: `${lot.cropId?.name || 'Produce'} • ${lot.declaredQuantity} kg`,
      status: lot.status,
      url: `/farmer/lots/${lot._id}`
    });
  });

  // 2. Purchase Orders search (Buyer or Operations/Admin)
  if (role === 'BUYER' || ['SUPER_ADMIN', 'CENTRE_MANAGER', 'DISTRICT_ADMIN'].includes(role)) {
    const poFilter = {
      $or: [{ poNumber: regex }]
    };
    if (role === 'BUYER') {
      poFilter.buyerId = user._id;
    }

    const pos = await PurchaseOrder.find(poFilter)
      .populate('items.crop', 'name')
      .limit(5);

    pos.forEach((po) => {
      results.push({
        type: 'PURCHASE_ORDER',
        id: po._id,
        title: po.poNumber,
        subtitle: `${po.items?.[0]?.crop?.name || 'Produce'} • ₹${po.totalValue?.toLocaleString()}`,
        status: po.status,
        url: role === 'BUYER' ? `/buyer/orders/${po._id}` : `/manager/purchase-orders`
      });
    });
  }

  // 3. Shipments search (Logistics or Operations/Admin)
  if (['LOGISTICS_COORDINATOR', 'SUPER_ADMIN', 'CENTRE_MANAGER'].includes(role)) {
    const shipments = await Shipment.find({
      $or: [{ shipmentNumber: regex }, { driverName: regex }]
    }).limit(5);

    shipments.forEach((s) => {
      results.push({
        type: 'SHIPMENT',
        id: s._id,
        title: s.shipmentNumber,
        subtitle: `Driver: ${s.driverName} • ${s.totalWeightKg} kg`,
        status: s.status,
        url: `/logistics/shipments/${s._id}`
      });
    });
  }

  // 4. Warehouses search (Operations/Admin)
  if (['SUPER_ADMIN', 'CENTRE_MANAGER', 'DISTRICT_ADMIN'].includes(role)) {
    const warehouses = await Warehouse.find({
      $or: [{ name: regex }, { code: regex }]
    }).limit(5);

    warehouses.forEach((w) => {
      results.push({
        type: 'WAREHOUSE',
        id: w._id,
        title: `${w.name} (${w.code})`,
        subtitle: `${(w.usedCapacityKg / 1000).toFixed(1)} / ${(w.totalCapacityKg / 1000).toFixed(1)} Tonnes`,
        status: w.active ? 'ACTIVE' : 'INACTIVE',
        url: `/manager/inventory`
      });
    });
  }

  return results;
};

module.exports = {
  searchEntities
};
