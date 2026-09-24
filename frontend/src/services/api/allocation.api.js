import { apiClient } from "./apiClient";

export const allocationApi = {
  allocateLot: async (data) => {
    const res = await apiClient.post("/allocations", data);
    return res.data;
  },

  cancelAllocation: async (id, reason) => {
    const res = await apiClient.post(`/allocations/${id}/cancel`, { reason });
    return res.data;
  },

  getAllocations: async (params) => {
    const res = await apiClient.get("/allocations", { params });
    return res.data;
  },
};
