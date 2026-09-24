import { apiClient } from "./apiClient";

export const settlementApi = {
  calculatePreview: async (data) => {
    const res = await apiClient.post("/settlements/preview", data);
    return res.data;
  },

  createSettlement: async (data) => {
    const res = await apiClient.post("/settlements", data);
    return res.data;
  },

  getFarmerSettlements: async (params) => {
    const res = await apiClient.get("/settlements/me", { params });
    return res.data;
  },

  getSettlementById: async (id) => {
    const res = await apiClient.get(`/settlements/${id}`);
    return res.data;
  },

  updatePaymentStatus: async (id, data) => {
    const res = await apiClient.patch(
      `/settlements/${id}/payment-status`,
      data,
    );
    return res.data;
  },
};
