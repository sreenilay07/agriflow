import { apiClient } from "./apiClient";

export const qualityApi = {
  submitInspection: async (data) => {
    const res = await apiClient.post("/quality-inspections", data);
    return res.data;
  },

  listInspections: async (params) => {
    const res = await apiClient.get("/quality-inspections", { params });
    return res.data;
  },

  getInspectionById: async (id) => {
    const res = await apiClient.get(`/quality-inspections/${id}`);
    return res.data;
  },
};
