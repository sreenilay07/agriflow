import { apiClient } from "./apiClient";

export const pricingApi = {
  getByCentre: async (centreId) => {
    const response = await apiClient.get(`/pricing/centre/${centreId}`);
    return response.data;
  },

  getHistory: async (centreId) => {
    const response = await apiClient.get(`/pricing/history/${centreId}`);
    return response.data;
  },

  createOrUpdatePrice: async (payload) => {
    const response = await apiClient.post("/pricing", payload);
    return response.data;
  },

  updateStatus: async (id, payload) => {
    const response = await apiClient.patch(`/pricing/${id}`, payload);
    return response.data;
  },
};
