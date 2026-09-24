import { apiClient } from "./apiClient";

export const aiApi = {
  getProcurementInsights: async () => {
    const res = await apiClient.get("/ai/insights/procurement");
    return res.data?.data;
  },

  interpretQuality: async (inspectionData) => {
    const res = await apiClient.post("/ai/interpret/quality", inspectionData);
    return res.data?.data;
  },

  getFarmerInsights: async () => {
    const res = await apiClient.get("/ai/insights/farmer");
    return res.data?.data;
  },

  getShipmentRisk: async (shipmentId) => {
    const res = await apiClient.get(`/ai/risk/shipment/${shipmentId}`);
    return res.data?.data;
  },

  getWarehouseIntelligence: async (warehouseId) => {
    const res = await apiClient.get(
      `/ai/intelligence/warehouse/${warehouseId}`,
    );
    return res.data?.data;
  },
};
