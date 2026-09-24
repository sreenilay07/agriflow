const mongoose = require('mongoose');
const env = require('../config/env');
const logger = require('../utils/logger');

// Import Models
const User = require('../models/User');
const FarmerProfile = require('../models/FarmerProfile');
const Farm = require('../models/Farm');
const District = require('../models/District');
const ProcurementCentre = require('../models/ProcurementCentre');
const Crop = require('../models/Crop');
const CentreCapacity = require('../models/CentreCapacity');
const Booking = require('../models/Booking');
const Token = require('../models/Token');
const Counter = require('../models/Counter');
const OfficerAssignment = require('../models/OfficerAssignment');
const Procurement = require('../models/Procurement');
const ProcurementStage = require('../models/ProcurementStage');
const DocumentVerification = require('../models/DocumentVerification');
const CentrePricing = require('../models/CentrePricing');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const ProduceLot = require('../models/ProduceLot');
const QualityInspection = require('../models/QualityInspection');
const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const InventoryMovement = require('../models/InventoryMovement');
const Settlement = require('../models/Settlement');
const Dispute = require('../models/Dispute');
const BuyerProfile = require('../models/BuyerProfile');
const PurchaseOrder = require('../models/PurchaseOrder');
const LotAllocation = require('../models/LotAllocation');
const Vehicle = require('../models/Vehicle');
const Shipment = require('../models/Shipment');
const DeliveryConfirmation = require('../models/DeliveryConfirmation');

const { PROCUREMENT_STAGES } = require('../constants/stages');
const {
  PRODUCE_LOT_STATUS,
  QUALITY_GRADE,
  INVENTORY_MOVEMENT_TYPE,
  PAYMENT_STATUS,
  SETTLEMENT_STATUS,
  DISPUTE_STATUS,
  BUYER_VERIFICATION_STATUS,
  PURCHASE_ORDER_STATUS,
  LOT_ALLOCATION_STATUS,
  SHIPMENT_STATUS,
  VEHICLE_STATUS,
  DELIVERY_CONDITION
} = require('../constants/status');
const queueService = require('../services/queue/queue.service');

const seedDatabase = async () => {
  try {
    logger.info('Connecting to MongoDB for Agriflow database seeding...');
    await mongoose.connect(env.MONGO_URI);
    logger.info('Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      FarmerProfile.deleteMany({}),
      Farm.deleteMany({}),
      District.deleteMany({}),
      ProcurementCentre.deleteMany({}),
      Crop.deleteMany({}),
      CentreCapacity.deleteMany({}),
      Booking.deleteMany({}),
      Token.deleteMany({}),
      Counter.deleteMany({}),
      OfficerAssignment.deleteMany({}),
      Procurement.deleteMany({}),
      ProcurementStage.deleteMany({}),
      DocumentVerification.deleteMany({}),
      CentrePricing.deleteMany({}),
      Receipt.deleteMany({}),
      Payment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      ProduceLot.deleteMany({}),
      QualityInspection.deleteMany({}),
      Warehouse.deleteMany({}),
      Inventory.deleteMany({}),
      InventoryMovement.deleteMany({}),
      Settlement.deleteMany({}),
      Dispute.deleteMany({}),
      BuyerProfile.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      LotAllocation.deleteMany({}),
      Vehicle.deleteMany({}),
      Shipment.deleteMany({}),
      DeliveryConfirmation.deleteMany({})
    ]);

    logger.info('Seeding Crops with AgriTrade Quality Configurations...');
    const paddy = await Crop.create({
      name: 'Paddy',
      code: 'PADDY',
      category: 'CEREAL',
      season: 'KHARIF',
      basePricePerKg: 25,
      localNames: { en: 'Paddy', te: 'వరి ధాన్యం', hi: 'धान' },
      unit: 'KG',
      defaultProcessingCapacity: 2000,
      requiredDocuments: ['Aadhaar Card', 'Bank Passbook', 'Land Passbook'],
      qualityParameters: [
        { name: 'Moisture Content', code: 'MOISTURE', unit: '%', minValue: 8, maxValue: 24, optimalValue: 13, weightage: 2 },
        { name: 'Foreign Matter', code: 'FOREIGN_MATTER', unit: '%', minValue: 0, maxValue: 10, optimalValue: 0.5, weightage: 1.5 },
        { name: 'Broken Grains', code: 'BROKEN_GRAINS', unit: '%', minValue: 0, maxValue: 20, optimalValue: 2, weightage: 1 },
        { name: 'Damaged / Discolored Grains', code: 'DAMAGED_GRAINS', unit: '%', minValue: 0, maxValue: 15, optimalValue: 1, weightage: 1.2 }
      ],
      standardGradingRules: [
        { grade: 'GRADE_A', minScore: 85, maxMoisture: 14, maxForeignMatter: 1, maxBrokenGrains: 4, priceMultiplier: 1.05 },
        { grade: 'GRADE_B', minScore: 70, maxMoisture: 16, maxForeignMatter: 2.5, maxBrokenGrains: 8, priceMultiplier: 1.0 },
        { grade: 'GRADE_C', minScore: 50, maxMoisture: 19, maxForeignMatter: 4, maxBrokenGrains: 14, priceMultiplier: 0.88 }
      ]
    });

    const wheat = await Crop.create({
      name: 'Wheat',
      code: 'WHEAT',
      category: 'CEREAL',
      season: 'RABI',
      basePricePerKg: 28,
      localNames: { en: 'Wheat', te: 'గోధుమలు', hi: 'गेहूं' },
      unit: 'KG',
      defaultProcessingCapacity: 1800,
      requiredDocuments: ['Aadhaar Card', 'Bank Passbook', 'Land Passbook'],
      qualityParameters: [
        { name: 'Moisture Content', code: 'MOISTURE', unit: '%', minValue: 8, maxValue: 20, optimalValue: 12, weightage: 2 },
        { name: 'Shriveled & Broken Grains', code: 'BROKEN_GRAINS', unit: '%', minValue: 0, maxValue: 15, optimalValue: 2, weightage: 1 },
        { name: 'Foreign Matter', code: 'FOREIGN_MATTER', unit: '%', minValue: 0, maxValue: 8, optimalValue: 0.5, weightage: 1.5 }
      ],
      standardGradingRules: [
        { grade: 'GRADE_A', minScore: 85, maxMoisture: 12, maxForeignMatter: 1, maxBrokenGrains: 3, priceMultiplier: 1.05 },
        { grade: 'GRADE_B', minScore: 70, maxMoisture: 14, maxForeignMatter: 2, maxBrokenGrains: 6, priceMultiplier: 1.0 },
        { grade: 'GRADE_C', minScore: 50, maxMoisture: 17, maxForeignMatter: 3.5, maxBrokenGrains: 10, priceMultiplier: 0.9 }
      ]
    });

    const maize = await Crop.create({
      name: 'Maize',
      code: 'MAIZE',
      category: 'CEREAL',
      season: 'KHARIF',
      basePricePerKg: 22,
      localNames: { en: 'Maize', te: 'మొక్కజొన్న', hi: 'मक्का' },
      unit: 'KG',
      defaultProcessingCapacity: 1500,
      requiredDocuments: ['Aadhaar Card', 'Bank Passbook'],
      qualityParameters: [
        { name: 'Moisture Content', code: 'MOISTURE', unit: '%', minValue: 10, maxValue: 25, optimalValue: 14, weightage: 2 },
        { name: 'Aflatoxin / Mold', code: 'MOLD', unit: 'ppb', minValue: 0, maxValue: 50, optimalValue: 5, weightage: 2 }
      ],
      standardGradingRules: [
        { grade: 'GRADE_A', minScore: 85, maxMoisture: 14, maxForeignMatter: 1.5, maxBrokenGrains: 3, priceMultiplier: 1.05 },
        { grade: 'GRADE_B', minScore: 70, maxMoisture: 16, maxForeignMatter: 3, maxBrokenGrains: 6, priceMultiplier: 1.0 }
      ]
    });

    const cotton = await Crop.create({
      name: 'Cotton',
      code: 'COTTON',
      category: 'CASH_CROP',
      season: 'KHARIF',
      basePricePerKg: 70,
      localNames: { en: 'Cotton', te: 'పత్తి', hi: 'कपास' },
      unit: 'KG',
      defaultProcessingCapacity: 1200,
      requiredDocuments: ['Aadhaar Card', 'Bank Passbook', 'Land Passbook'],
      qualityParameters: [
        { name: 'Moisture Content', code: 'MOISTURE', unit: '%', minValue: 6, maxValue: 15, optimalValue: 8, weightage: 2 },
        { name: 'Staple Length', code: 'STAPLE_LENGTH', unit: 'mm', minValue: 20, maxValue: 36, optimalValue: 30, weightage: 2 },
        { name: 'Trash Content', code: 'TRASH', unit: '%', minValue: 0, maxValue: 12, optimalValue: 2, weightage: 1.5 }
      ],
      standardGradingRules: [
        { grade: 'GRADE_A', minScore: 85, maxMoisture: 8, maxForeignMatter: 2, maxBrokenGrains: 0, priceMultiplier: 1.08 },
        { grade: 'GRADE_B', minScore: 70, maxMoisture: 10, maxForeignMatter: 4, maxBrokenGrains: 0, priceMultiplier: 1.0 }
      ]
    });

    logger.info('Seeding District...');
    const district = await District.create({
      name: 'Warangal Urban',
      code: 'WGL-URBAN',
      state: 'Telangana'
    });

    logger.info('Seeding Super Admin and District Officers...');
    const admin = await User.create({
      fullName: 'Super Administrator',
      phoneNumber: '9999999999',
      email: 'admin@Agriflow.gov.in',
      password: 'Password123',
      role: 'SUPER_ADMIN',
      status: 'APPROVED',
      isPhoneVerified: true
    });

    const distOfficer1 = await User.create({
      fullName: 'Dr. K. Rama Rao (District Admin)',
      phoneNumber: '9888888881',
      email: 'dist.admin@Agriflow.gov.in',
      password: 'Password123',
      role: 'DISTRICT_ADMIN',
      status: 'APPROVED',
      districtId: district._id,
      isPhoneVerified: true
    });

    district.districtOfficerIds = [distOfficer1._id];
    await district.save();

    logger.info('Seeding Collection Centre...');
    const centreABC = await ProcurementCentre.create({
      name: 'Warangal Central Collection Centre',
      code: 'ABC',
      districtId: district._id,
      address: 'Near Agriculture Market Yard, Hanumakonda',
      village: 'Hanumakonda',
      latitude: 17.9784,
      longitude: 79.5941,
      contactNumber: '0870-224455',
      workingHours: { openingTime: '08:00', closingTime: '18:00' },
      defaultCapacity: 2000,
      activeCounters: 2,
      totalCounters: 2,
      supportedCrops: [paddy._id, wheat._id, maize._id, cotton._id],
      requiredDocuments: [
        { name: 'Aadhaar Card', description: 'Original Aadhaar Card for identity verification', required: true },
        { name: 'Bank Passbook', description: 'Bank Passbook showing active IFSC and Account Number', required: true },
        { name: 'Land Passbook', description: 'Pattadar Passbook / Land Ownership Document', required: true }
      ]
    });

    logger.info('Seeding Warehouses...');
    const warehouseWGL = await Warehouse.create({
      name: 'Warangal Central Agri Warehouse',
      code: 'WH-WGL-01',
      centreId: centreABC._id,
      districtId: district._id,
      address: 'Warehouse Complex, Road No. 4, Hanumakonda',
      totalCapacityKg: 500000,
      usedCapacityKg: 45000,
      supportedCrops: [paddy._id, wheat._id, maize._id, cotton._id],
      status: 'ACTIVE'
    });

    const warehouseNZB = await Warehouse.create({
      name: 'Nizamabad Grain Silos',
      code: 'WH-NZB-01',
      districtId: district._id,
      address: 'National Highway 44 Junction, Nizamabad',
      totalCapacityKg: 800000,
      usedCapacityKg: 120000,
      supportedCrops: [paddy._id, wheat._id],
      status: 'ACTIVE'
    });

    logger.info('Seeding Centre Pricing...');
    await CentrePricing.create([
      {
        centreId: centreABC._id,
        cropId: paddy._id,
        cropName: 'Paddy',
        price: 2500,
        unit: 'Per Quintal',
        effectiveFrom: new Date('2026-09-01'),
        status: 'ACTIVE',
        createdBy: admin._id
      },
      {
        centreId: centreABC._id,
        cropId: cotton._id,
        cropName: 'Cotton',
        price: 7000,
        unit: 'Per Quintal',
        effectiveFrom: new Date('2026-09-01'),
        status: 'ACTIVE',
        createdBy: admin._id
      }
    ]);

    logger.info('Seeding Centre Manager and Quality Inspector...');
    const managerABC = await User.create({
      fullName: 'V. Ramesh (Centre Manager)',
      phoneNumber: '9777777771',
      email: 'manager.abc@Agriflow.gov.in',
      password: 'Password123',
      role: 'CENTER_MANAGER',
      status: 'APPROVED',
      centreId: centreABC._id,
      districtId: district._id,
      isPhoneVerified: true
    });

    const inspectorABC = await User.create({
      fullName: 'Dr. S. Suresh (Quality Inspector)',
      phoneNumber: '9666666661',
      email: 'inspector.abc@Agriflow.gov.in',
      password: 'Password123',
      role: 'PROCUREMENT_OFFICER',
      status: 'APPROVED',
      centreId: centreABC._id,
      districtId: district._id,
      isPhoneVerified: true
    });

    const counter1 = await Counter.create({
      centreId: centreABC._id,
      counterNumber: 1,
      status: 'OPEN',
      assignedOfficerId: inspectorABC._id,
      capacityPerHour: 2000
    });

    await OfficerAssignment.create({
      officerId: inspectorABC._id,
      centreId: centreABC._id,
      counterId: counter1._id,
      assignedBy: managerABC._id,
      status: 'ACTIVE'
    });

    logger.info('Seeding Farmers, Farms, and Produce Lots across lifecycle states...');
    const farmerData = [
      { name: 'Ramesh Kumar', phone: '9111111111', village: 'Hanumakonda', acres: 5.5, crop: paddy },
      { name: 'Lakshmi Devi', phone: '9222222222', village: 'Kazipet', acres: 4.0, crop: cotton },
      { name: 'Suresh Reddy', phone: '9333333333', village: 'Dharmasagar', acres: 8.0, crop: maize },
      { name: 'Naresh Chary', phone: '9444444444', village: 'Hasanparthy', acres: 3.5, crop: paddy },
      { name: 'Demo Farmer (Mandi Mithra)', phone: '9555555555', village: 'Hanumakonda', acres: 6.0, crop: paddy }
    ];

    const seededFarmers = [];
    const seededFarms = [];

    for (let i = 0; i < farmerData.length; i++) {
      const f = farmerData[i];

      const farmerUser = await User.create({
        fullName: f.name,
        phoneNumber: f.phone,
        password: 'Password123',
        role: 'FARMER',
        status: 'APPROVED',
        language: 'en',
        isPhoneVerified: true
      });

      const profile = await FarmerProfile.create({
        userId: farmerUser._id,
        farmerId: `FARM-2026-${100 + i}`,
        fullName: f.name,
        phoneNumber: f.phone,
        village: f.village,
        mandal: 'Hanumakonda',
        district: 'Warangal Urban',
        state: 'Telangana',
        pincode: '506001',
        aadhaarLast4: `123${i}`,
        bankAccountLast4: `452${i}`,
        landPassbookReference: `PASSBOOK-00${i + 1}`,
        preferredLanguage: 'en',
        location: { latitude: 17.9784, longitude: 79.5941 }
      });

      const farm = await Farm.create({
        farmerId: farmerUser._id,
        farmerProfileId: profile._id,
        farmName: `${f.name.split(' ')[0]}'s Agro Field`,
        village: f.village,
        mandal: 'Hanumakonda',
        district: 'Warangal Urban',
        state: 'Telangana',
        pincode: '506001',
        surveyNumber: `SY-${120 + i}/A`,
        acreage: f.acres,
        ownershipType: 'OWNED',
        cropsGrown: [f.crop._id],
        status: 'ACTIVE'
      });

      seededFarmers.push(farmerUser);
      seededFarms.push(farm);
    }

    const demoFarmer = seededFarmers[4];
    const demoFarm = seededFarms[4];

    logger.info('Seeding Produce Lots across lifecycle states...');
    // 1. CREATED Lot
    const lotCreated = await ProduceLot.create({
      lotNumber: 'MM-2026-09-000101',
      farmerId: demoFarmer._id,
      farmId: demoFarm._id,
      cropId: paddy._id,
      declaredQuantity: 2500,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.CREATED,
      collectionCentreId: centreABC._id,
      lifecycleHistory: [
        { fromStatus: null, toStatus: PRODUCE_LOT_STATUS.CREATED, timestamp: new Date(), changedBy: demoFarmer._id, reason: 'Harvested Paddy lot registered' }
      ]
    });

    // 2. SCHEDULED Lot
    const bookingScheduled = await Booking.create({
      farmerId: demoFarmer._id,
      centreId: centreABC._id,
      cropId: paddy._id,
      expectedQuantity: 2000,
      preferredDate: new Date(),
      status: 'CONFIRMED',
      bookingReference: 'BK-ABC-DEMO-002'
    });

    const tokenScheduled = await Token.create({
      tokenNumber: 'ABC-PADDY-DEMO-001',
      bookingId: bookingScheduled._id,
      farmerId: demoFarmer._id,
      centreId: centreABC._id,
      cropId: paddy._id,
      expectedQuantity: 2000,
      status: 'WAITING',
      queuePosition: 1,
      travelTimeMinutes: 30
    });

    const lotScheduled = await ProduceLot.create({
      lotNumber: 'MM-2026-09-000102',
      farmerId: demoFarmer._id,
      farmId: demoFarm._id,
      cropId: paddy._id,
      declaredQuantity: 2000,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.SCHEDULED,
      collectionCentreId: centreABC._id,
      bookingId: bookingScheduled._id,
      tokenId: tokenScheduled._id,
      lifecycleHistory: [
        { fromStatus: null, toStatus: PRODUCE_LOT_STATUS.CREATED, timestamp: new Date(Date.now() - 3600000), changedBy: demoFarmer._id, reason: 'Created' },
        { fromStatus: PRODUCE_LOT_STATUS.CREATED, toStatus: PRODUCE_LOT_STATUS.SCHEDULED, timestamp: new Date(), changedBy: demoFarmer._id, reason: 'Slot booked' }
      ]
    });
    bookingScheduled.lotId = lotScheduled._id;
    await bookingScheduled.save();

    // 3. RECEIVED & UNDER_INSPECTION Lot
    const lotUnderInspection = await ProduceLot.create({
      lotNumber: 'MM-2026-09-000103',
      farmerId: seededFarmers[0]._id,
      farmId: seededFarms[0]._id,
      cropId: paddy._id,
      declaredQuantity: 3000,
      receivedQuantity: 2950,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.UNDER_INSPECTION,
      collectionCentreId: centreABC._id,
      receivedAt: new Date(Date.now() - 1800000),
      receivedBy: inspectorABC._id,
      receivingNotes: 'Weighed on Electronic Weighbridge #1',
      lifecycleHistory: [
        { fromStatus: null, toStatus: PRODUCE_LOT_STATUS.CREATED, timestamp: new Date(Date.now() - 7200000), changedBy: seededFarmers[0]._id },
        { fromStatus: PRODUCE_LOT_STATUS.CREATED, toStatus: PRODUCE_LOT_STATUS.SCHEDULED, timestamp: new Date(Date.now() - 5400000), changedBy: seededFarmers[0]._id },
        { fromStatus: PRODUCE_LOT_STATUS.SCHEDULED, toStatus: PRODUCE_LOT_STATUS.RECEIVED, timestamp: new Date(Date.now() - 1800000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.RECEIVED, toStatus: PRODUCE_LOT_STATUS.UNDER_INSPECTION, timestamp: new Date(Date.now() - 1700000), changedBy: inspectorABC._id }
      ]
    });

    // 4. ACCEPTED & STORED Lot (in Warehouse Inventory)
    const lotStored = await ProduceLot.create({
      lotNumber: 'MM-2026-09-000104',
      farmerId: seededFarmers[1]._id,
      farmId: seededFarms[1]._id,
      cropId: cotton._id,
      declaredQuantity: 1500,
      receivedQuantity: 1480,
      acceptedQuantity: 1450,
      rejectedQuantity: 30,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.STORED,
      collectionCentreId: centreABC._id,
      warehouseId: warehouseWGL._id,
      receivedAt: new Date(Date.now() - 86400000),
      receivedBy: inspectorABC._id,
      lifecycleHistory: [
        { fromStatus: null, toStatus: PRODUCE_LOT_STATUS.CREATED, timestamp: new Date(Date.now() - 90000000), changedBy: seededFarmers[1]._id },
        { fromStatus: PRODUCE_LOT_STATUS.CREATED, toStatus: PRODUCE_LOT_STATUS.SCHEDULED, timestamp: new Date(Date.now() - 88000000), changedBy: seededFarmers[1]._id },
        { fromStatus: PRODUCE_LOT_STATUS.SCHEDULED, toStatus: PRODUCE_LOT_STATUS.RECEIVED, timestamp: new Date(Date.now() - 86400000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.RECEIVED, toStatus: PRODUCE_LOT_STATUS.UNDER_INSPECTION, timestamp: new Date(Date.now() - 85000000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.UNDER_INSPECTION, toStatus: PRODUCE_LOT_STATUS.ACCEPTED, timestamp: new Date(Date.now() - 84000000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.ACCEPTED, toStatus: PRODUCE_LOT_STATUS.STORED, timestamp: new Date(Date.now() - 80000000), changedBy: managerABC._id }
      ]
    });

    const inspectionStored = await QualityInspection.create({
      inspectionNumber: 'QI-2026-09-000104',
      lotId: lotStored._id,
      cropId: cotton._id,
      inspectorId: inspectorABC._id,
      inspectionDate: new Date(Date.now() - 84000000),
      moisturePercentage: 8,
      foreignMatterPercentage: 1.5,
      brokenGrainPercentage: 0,
      damagePercentage: 0.5,
      assignedGrade: QUALITY_GRADE.GRADE_A,
      qualityScore: 92,
      declaredQuantity: 1500,
      receivedQuantity: 1480,
      acceptedQuantity: 1450,
      rejectedQuantity: 30,
      rejectionReason: 'Minor trash & excess moisture in 30 kg batch sample',
      remarks: 'Superior grade long-staple cotton lot',
      status: 'COMPLETED'
    });
    lotStored.qualityInspectionId = inspectionStored._id;
    await lotStored.save();

    const inventoryStored = await Inventory.create({
      warehouseId: warehouseWGL._id,
      cropId: cotton._id,
      lotId: lotStored._id,
      batchNumber: 'BAT-2026-09-000104',
      grade: 'GRADE_A',
      totalQuantity: 1450,
      availableQuantity: 1450,
      reservedQuantity: 0,
      unit: 'KG',
      status: 'IN_STOCK',
      storageLocation: 'Bay-C2'
    });

    await InventoryMovement.create({
      movementNumber: 'MOV-2026-09-000104',
      movementType: INVENTORY_MOVEMENT_TYPE.RECEIPT,
      inventoryId: inventoryStored._id,
      lotId: lotStored._id,
      warehouseId: warehouseWGL._id,
      cropId: cotton._id,
      quantity: 1450,
      unit: 'KG',
      source: 'Collection Centre ABC',
      destination: 'Warangal Central Agri Warehouse (Bay-C2)',
      performedBy: managerABC._id,
      reason: 'Initial intake of accepted cotton lot',
      referenceId: 'BAT-2026-09-000104'
    });

    // 5. SETTLED Lot (with Payout)
    const lotSettled = await ProduceLot.create({
      lotNumber: 'MM-2026-09-000105',
      farmerId: seededFarmers[2]._id,
      farmId: seededFarms[2]._id,
      cropId: paddy._id,
      declaredQuantity: 2400,
      receivedQuantity: 2380,
      acceptedQuantity: 2300,
      rejectedQuantity: 80,
      unit: 'KG',
      status: PRODUCE_LOT_STATUS.SETTLED,
      collectionCentreId: centreABC._id,
      warehouseId: warehouseWGL._id,
      receivedAt: new Date(Date.now() - 172800000),
      receivedBy: inspectorABC._id,
      lifecycleHistory: [
        { fromStatus: null, toStatus: PRODUCE_LOT_STATUS.CREATED, timestamp: new Date(Date.now() - 180000000), changedBy: seededFarmers[2]._id },
        { fromStatus: PRODUCE_LOT_STATUS.CREATED, toStatus: PRODUCE_LOT_STATUS.SCHEDULED, timestamp: new Date(Date.now() - 175000000), changedBy: seededFarmers[2]._id },
        { fromStatus: PRODUCE_LOT_STATUS.SCHEDULED, toStatus: PRODUCE_LOT_STATUS.RECEIVED, timestamp: new Date(Date.now() - 172800000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.RECEIVED, toStatus: PRODUCE_LOT_STATUS.UNDER_INSPECTION, timestamp: new Date(Date.now() - 170000000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.UNDER_INSPECTION, toStatus: PRODUCE_LOT_STATUS.ACCEPTED, timestamp: new Date(Date.now() - 165000000), changedBy: inspectorABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.ACCEPTED, toStatus: PRODUCE_LOT_STATUS.STORED, timestamp: new Date(Date.now() - 160000000), changedBy: managerABC._id },
        { fromStatus: PRODUCE_LOT_STATUS.STORED, toStatus: PRODUCE_LOT_STATUS.SETTLED, timestamp: new Date(Date.now() - 150000000), changedBy: managerABC._id }
      ]
    });

    const inspectionSettled = await QualityInspection.create({
      inspectionNumber: 'QI-2026-09-000105',
      lotId: lotSettled._id,
      cropId: paddy._id,
      inspectorId: inspectorABC._id,
      inspectionDate: new Date(Date.now() - 165000000),
      moisturePercentage: 13,
      foreignMatterPercentage: 1,
      brokenGrainPercentage: 3,
      damagePercentage: 1,
      assignedGrade: QUALITY_GRADE.GRADE_A,
      qualityScore: 90,
      declaredQuantity: 2400,
      receivedQuantity: 2380,
      acceptedQuantity: 2300,
      rejectedQuantity: 80,
      rejectionReason: 'Chaff & foreign particles',
      remarks: 'Clean A-grade Paddy lot',
      status: 'COMPLETED'
    });
    lotSettled.qualityInspectionId = inspectionSettled._id;

    // Settlement: 2,300 kg * (25 * 1.05 = 26.25) = 60,375 - 500 = 59,875
    const settlementSettled = await Settlement.create({
      settlementNumber: 'SET-2026-09-000105',
      farmerId: seededFarmers[2]._id,
      lotId: lotSettled._id,
      cropId: paddy._id,
      qualityInspectionId: inspectionSettled._id,
      acceptedQuantity: 2300,
      unit: 'KG',
      basePricePerKg: 25,
      grade: 'GRADE_A',
      priceMultiplier: 1.05,
      effectiveRatePerKg: 26.25,
      grossAmount: 60375,
      deductions: [{ deductionType: 'BAG_COST', amount: 500, description: 'Gunny Bag Levy' }],
      totalDeductions: 500,
      adjustments: [],
      totalAdjustments: 0,
      netAmount: 59875,
      status: SETTLEMENT_STATUS.SETTLED,
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentReference: 'UPI-TXN-9988771122',
      bankAccountLast4: '4522',
      settlementDate: new Date(Date.now() - 160000000),
      paidAt: new Date(Date.now() - 150000000),
      createdBy: managerABC._id,
      remarks: 'Direct bank payout completed'
    });

    await Payment.create({
      farmerId: seededFarmers[2]._id,
      amount: 59875,
      status: PAYMENT_STATUS.PAID,
      referenceNumber: 'PAY-SET-2026-09-000105',
      paymentInitiatedAt: new Date(Date.now() - 155000000),
      paymentCompletedAt: new Date(Date.now() - 150000000)
    });

    lotSettled.settlementId = settlementSettled._id;
    await lotSettled.save();

    // 6. Dispute Sample
    await Dispute.create({
      disputeNumber: 'DISP-2026-09-000001',
      raisedBy: seededFarmers[0]._id,
      referenceType: 'QUALITY_INSPECTION',
      referenceId: 'QI-2026-09-000103',
      lotId: lotUnderInspection._id,
      category: 'GRADE_DISPUTE',
      reason: 'Requesting moisture recalibration check',
      description: 'The moisture tester reading appeared elevated due to morning rain. Requesting a secondary re-test before final grading.',
      status: DISPUTE_STATUS.OPEN
    });

    // 7. Phase 4 - B2B Buyers & Logistics Seeding
    logger.info('Seeding B2B Buyer Profiles & Logistics Fleet...');
    const buyerUser = await User.create({
      fullName: 'AgroFresh Procurement Lead',
      phoneNumber: '9555500001',
      email: 'procurement@agrofreshfoods.com',
      password: 'Password123',
      role: 'BUYER',
      status: 'APPROVED',
      district: 'Hyderabad',
      state: 'Telangana'
    });

    const buyerProfile = await BuyerProfile.create({
      userId: buyerUser._id,
      organizationName: 'AgroFresh Foods Pvt Ltd',
      businessName: 'AgroFresh Agri-Processing Unit 4',
      businessType: 'PROCESSING_MILL',
      gstin: '36AAACA1234A1Z5',
      contactPerson: 'K. S. Narayana',
      phone: '9555500001',
      email: 'procurement@agrofreshfoods.com',
      address: 'Plot 42, IDA Nacharam, Industrial Area',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500076',
      operatingRegions: ['Mahbubnagar', 'Rangareddy', 'Nalgonda'],
      preferredCategories: [paddy._id, wheat._id],
      verificationStatus: BUYER_VERIFICATION_STATUS.VERIFIED,
      verifiedBy: managerABC._id,
      verifiedAt: new Date()
    });

    const logisticsUser = await User.create({
      fullName: 'Suresh Transport Coordinator',
      phoneNumber: '9666600001',
      email: 'logistics@deccanfleet.com',
      password: 'Password123',
      role: 'LOGISTICS_COORDINATOR',
      status: 'APPROVED',
      district: 'Mahbubnagar',
      state: 'Telangana'
    });

    const vehicle1 = await Vehicle.create({
      vehicleNumber: 'TS09AB1234',
      type: 'HEAVY_TRUCK_10T',
      capacityKg: 10000,
      transporterName: 'Deccan Express Logistics',
      driverName: 'Mohammed Rafi',
      driverPhone: '9888812345',
      driverLicenseNumber: 'DL-042018005678',
      status: VEHICLE_STATUS.ACTIVE
    });

    const vehicle2 = await Vehicle.create({
      vehicleNumber: 'TS08XY5678',
      type: 'MEDIUM_TRUCK_7T',
      capacityKg: 7000,
      transporterName: 'Kisan Agro Transport',
      driverName: 'V. Prakash',
      driverPhone: '9888823456',
      driverLicenseNumber: 'DL-042020008912',
      status: VEHICLE_STATUS.ACTIVE
    });

    // 8. Seed Sample Purchase Order & Lot Allocation
    const po1 = await PurchaseOrder.create({
      poNumber: 'PO-2026-000001',
      buyer: buyerUser._id,
      buyerProfile: buyerProfile._id,
      status: PURCHASE_ORDER_STATUS.FULLY_ALLOCATED,
      items: [
        {
          crop: paddy._id,
          requestedGrade: 'GRADE_A',
          requestedQuantityKg: 1500,
          agreedUnitPricePerKg: 26.25,
          allocatedQuantityKg: 1500,
          dispatchedQuantityKg: 1500,
          deliveredQuantityKg: 0,
          subtotal: 39375
        }
      ],
      totalQuantityKg: 1500,
      allocatedQuantityKg: 1500,
      deliveredQuantityKg: 0,
      subtotal: 39375,
      taxAmount: 1968.75,
      totalValue: 41343.75,
      requestedDeliveryDate: new Date(Date.now() + 86400000 * 2),
      deliveryAddress: {
        facilityName: 'AgroFresh Nacharam Mill #4',
        street: 'Plot 42, IDA Nacharam',
        district: 'Hyderabad',
        state: 'Telangana',
        pincode: '500076',
        contactPerson: 'K. S. Narayana',
        contactPhone: '9555500001'
      },
      notes: 'Standard 50kg gunny bags required. Delivery window 9 AM - 5 PM.',
      reviewedBy: managerABC._id,
      reviewedAt: new Date(),
      lifecycleHistory: [
        {
          fromStatus: 'DRAFT',
          toStatus: 'SUBMITTED',
          action: 'PO_SUBMITTED',
          performedBy: buyerUser._id,
          notes: 'Submitted online via AgriTrade B2B Marketplace',
          timestamp: new Date(Date.now() - 3600000 * 5)
        },
        {
          fromStatus: 'SUBMITTED',
          toStatus: 'APPROVED',
          action: 'PO_APPROVED',
          performedBy: managerABC._id,
          notes: 'Approved by Jadcherla Collection Centre Manager',
          timestamp: new Date(Date.now() - 3600000 * 4)
        },
        {
          fromStatus: 'APPROVED',
          toStatus: 'FULLY_ALLOCATED',
          action: 'PO_ALLOCATED',
          performedBy: managerABC._id,
          notes: 'Allocated 1,500 kg from batch BATCH-MM-2026-09-000104',
          timestamp: new Date(Date.now() - 3600000 * 3)
        }
      ]
    });

    const allocation1 = await LotAllocation.create({
      purchaseOrder: po1._id,
      purchaseOrderItemId: po1.items[0]._id,
      produceLot: lotStored._id,
      inventory: inventoryStored._id,
      warehouse: warehouseJadcherla._id,
      allocatedQuantityKg: 1500,
      unitPricePerKg: 26.25,
      totalAmount: 39375,
      status: LOT_ALLOCATION_STATUS.ALLOCATED,
      allocatedBy: managerABC._id,
      allocatedAt: new Date(Date.now() - 3600000 * 3)
    });

    // Update inventory to reflect allocation reservation
    inventoryStored.availableQuantity = 700;
    inventoryStored.reservedQuantity = 750;
    await inventoryStored.save();

    await InventoryMovement.create({
      inventory: inventoryStored._id,
      produceLot: lotStored._id,
      warehouse: warehouseJadcherla._id,
      movementType: INVENTORY_MOVEMENT_TYPE.RESERVATION,
      quantityKg: 1500,
      sourceLocation: 'Stack Bay A-04',
      destinationLocation: `Reserved for PO ${po1.poNumber}`,
      performedBy: managerABC._id,
      notes: `Reserved 1,500 kg for PO ${po1.poNumber}`
    });

    // 9. Create Shipment in Ready State
    const shipment1 = await Shipment.create({
      shipmentNumber: 'SHP-2026-000001',
      purchaseOrder: po1._id,
      allocations: [allocation1._id],
      originWarehouse: warehouseJadcherla._id,
      destinationAddress: po1.deliveryAddress,
      vehicle: vehicle1._id,
      driverName: vehicle1.driverName,
      driverPhone: vehicle1.driverPhone,
      totalWeightKg: 1500,
      status: SHIPMENT_STATUS.READY_FOR_DISPATCH,
      plannedDispatchDate: new Date(),
      estimatedArrivalDate: new Date(Date.now() + 3600000 * 8),
      manifest: {
        goodsDescription: 'Agricultural Bulk Produce - Grade A Paddy',
        lotNumbers: [lotStored.lotNumber],
        totalBags: 30,
        sealNumber: 'SEAL-JAD-90812',
        weighbridgeSlipNumber: 'WB-440192'
      },
      notes: 'Outbound weighbridge cleared. Vehicle loading complete.',
      trackingEvents: [
        {
          status: 'READY_FOR_DISPATCH',
          location: 'Jadcherla Central Mandi Loading Bay 3',
          notes: 'Assigned to vehicle TS09AB1234',
          updatedBy: logisticsUser._id,
          timestamp: new Date(Date.now() - 3600000)
        }
      ]
    });

    vehicle1.currentShipment = shipment1._id;
    await vehicle1.save();

    logger.info('Calculating initial queue metrics...');
    await queueService.recalculateQueue(centreABC._id);

    logger.info('==================================================');
    logger.info('🌾 MANDI MITHRA AGRITRADE DATABASE SEEDED SUCCESSFULLY!');
    logger.info('==================================================');
    logger.info('Demo Credentials:');
    logger.info('1. Farmer Login: 9555555555 / OTP: 123456');
    logger.info('2. Centre Operator: 9666666661 / Password123');
    logger.info('3. Centre Manager: 9777777771 / Password123');
    logger.info('4. Verified B2B Buyer: 9555500001 / Password123');
    logger.info('5. Logistics Coordinator: 9666600001 / Password123');
    logger.info('6. District Admin: 9888888881 / Password123');
    logger.info('7. Super Admin: 9999999999 / Password123');
    logger.info('==================================================');

    process.exit(0);
  } catch (error) {
    logger.error(`Error seeding database: ${error.message}`, error);
    process.exit(1);
  }
};

seedDatabase();
