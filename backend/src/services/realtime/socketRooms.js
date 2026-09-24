/**
 * AgriTrade Standardized Socket Room Generators
 */
const ROOMS = {
  user: (userId) => `user:${userId}`,
  farmer: (farmerId) => `farmer:${farmerId}`,
  buyer: (buyerId) => `buyer:${buyerId}`,
  centre: (centreId) => `centre:${centreId}`,
  warehouse: (warehouseId) => `warehouse:${warehouseId}`,
  role: (role) => `role:${role}`,
  district: (districtId) => `district:${districtId}`,
  allAdmins: () => 'role:SUPER_ADMIN',
  allBuyers: () => 'role:BUYER',
  allLogistics: () => 'role:LOGISTICS_COORDINATOR'
};

module.exports = ROOMS;
