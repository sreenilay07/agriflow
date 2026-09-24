import { apiClient } from "./apiClient";

export const disputeApi = {
  createDispute: async (data) => {
    const res = await apiClient.post("/disputes", data);
    return res.data;
  },

  getDisputes: async (params) => {
    const res = await apiClient.get("/disputes", { params });
    return res.data;
  },

  getDisputeById: async (id) => {
    const res = await apiClient.get(`/disputes/${id}`);
    return res.data;
  },

  resolveDispute: async (id, data) => {
    const res = await apiClient.patch(`/disputes/${id}/resolve`, data);
    return res.data;
  },
};
