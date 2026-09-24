import { apiClient } from "./apiClient";

export const farmApi = {
  createFarm: async (data) => {
    const res = await apiClient.post("/farms", data);
    return res.data;
  },

  getFarmerFarms: async () => {
    const res = await apiClient.get("/farms/me");
    return res.data;
  },

  getFarmById: async (id) => {
    const res = await apiClient.get(`/farms/${id}`);
    return res.data;
  },

  updateFarm: async (id, data) => {
    const res = await apiClient.patch(`/farms/${id}`, data);
    return res.data;
  },
};
