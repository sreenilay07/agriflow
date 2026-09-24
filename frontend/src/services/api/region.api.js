import apiClient from "./apiClient";

export const regionApi = {
  getRegions: async (params) => {
    const res = await apiClient.get("/regions", { params });
    return res.data;
  },
  getRegionById: async (id) => {
    const res = await apiClient.get(`/regions/${id}`);
    return res.data;
  },
  createRegion: async (data) => {
    const res = await apiClient.post("/regions", data);
    return res.data;
  },
  updateRegion: async (id, data) => {
    const res = await apiClient.put(`/regions/${id}`, data);
    return res.data;
  },
  deleteRegion: async (id) => {
    const res = await apiClient.delete(`/regions/${id}`);
    return res.data;
  },
};
