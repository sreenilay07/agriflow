import { apiClient } from "./apiClient";

export const inventoryApi = {
  getWarehouses: async (params) => {
    const res = await apiClient.get("/warehouses", { params });
    return res.data;
  },

  storeLot: async (data) => {
    const res = await apiClient.post("/inventory/store-lot", data);
    return res.data;
  },

  transferInventory: async (data) => {
    const res = await apiClient.post("/inventory/transfer", data);
    return res.data;
  },

  getWarehouseInventory: async (warehouseId, params) => {
    const res = await apiClient.get(`/inventory/warehouse/${warehouseId}`, {
      params,
    });
    return res.data;
  },

  getInventoryMovements: async (params) => {
    const res = await apiClient.get("/inventory/movements", { params });
    return res.data;
  },
};
