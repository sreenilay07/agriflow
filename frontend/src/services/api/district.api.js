import { apiClient } from "./apiClient";

export const districtApi = {
  getAllDistricts: async () => {
    const res = await apiClient.get("/district/list");
    return res.data;
  },
  getDashboard: async (params) => {
    const res = await apiClient.get("/district/dashboard", { params });
    return res.data;
  },
};
