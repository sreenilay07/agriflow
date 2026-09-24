import { apiClient } from "./apiClient";

export const lotApi = {
  createLot: async (data) => {
    const res = await apiClient.post("/produce-lots", data);
    return res.data;
  },

  getFarmerLots: async (params) => {
    const res = await apiClient.get("/produce-lots/me", { params });
    return res.data;
  },

  getLots: async (params) => {
    const res = await apiClient.get("/produce-lots", { params });
    return res.data;
  },

  getLotById: async (id) => {
    const res = await apiClient.get(`/produce-lots/${id}`);
    return res.data;
  },

  getLotByNumber: async (lotNumber) => {
    const res = await apiClient.get(`/produce-lots/number/${lotNumber}`);
    return res.data;
  },

  receiveLot: async (id, data) => {
    const res = await apiClient.post(`/produce-lots/${id}/receive`, data);
    return res.data;
  },

  cancelLot: async (id, reason) => {
    const res = await apiClient.patch(`/produce-lots/${id}/cancel`, { reason });
    return res.data;
  },
};
