const PlatformConfig = require('../models/PlatformConfig');

const DEFAULT_CONFIGS = [
  {
    key: 'QUALITY_MAX_MOISTURE_PCT',
    category: 'QUALITY',
    value: 14.0,
    description: 'Maximum moisture percentage threshold for long-term grain warehouse storage'
  },
  {
    key: 'QUALITY_MAX_FOREIGN_MATTER_PCT',
    category: 'QUALITY',
    value: 2.0,
    description: 'Maximum allowable foreign matter impurity percentage'
  },
  {
    key: 'WAREHOUSE_WARNING_UTILIZATION_PCT',
    category: 'WAREHOUSE',
    value: 85,
    description: 'Warehouse utilization threshold to trigger capacity warning anomaly'
  },
  {
    key: 'WAREHOUSE_CRITICAL_UTILIZATION_PCT',
    category: 'WAREHOUSE',
    value: 95,
    description: 'Warehouse utilization threshold to trigger critical bottleneck alert'
  },
  {
    key: 'SETTLEMENT_MANDI_CESS_PCT',
    category: 'SETTLEMENT',
    value: 1.0,
    description: 'Government APMC mandi cess percentage deducted on gross settlement'
  },
  {
    key: 'SETTLEMENT_HANDLING_FEE_PER_KG',
    category: 'SETTLEMENT',
    value: 0.15,
    description: 'Standard handling and weighing charge in rupees per kilogram'
  }
];

const getAllConfigs = async () => {
  const configs = await PlatformConfig.find().lean();
  if (configs.length === 0) {
    // Seed default configs
    await PlatformConfig.insertMany(DEFAULT_CONFIGS);
    return await PlatformConfig.find().lean();
  }
  return configs;
};

const getConfigByKey = async (key) => {
  let config = await PlatformConfig.findOne({ key }).lean();
  if (!config) {
    const defaultConfig = DEFAULT_CONFIGS.find((c) => c.key === key);
    if (defaultConfig) {
      config = await PlatformConfig.create(defaultConfig);
    }
  }
  return config ? config.value : null;
};

const updateConfig = async (key, value, actorUserId) => {
  const config = await PlatformConfig.findOneAndUpdate(
    { key: key.toUpperCase() },
    {
      value,
      updatedBy: actorUserId
    },
    { new: true, upsert: true }
  );
  return config;
};

module.exports = {
  getAllConfigs,
  getConfigByKey,
  updateConfig
};
