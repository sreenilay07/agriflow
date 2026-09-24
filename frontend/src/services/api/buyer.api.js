import { apiClient } from "./apiClient";

export const buyerApi = {
  getProfile: async () => {
    const res = await apiClient.get("/buyers/profile");
    return res.data;
  },

  upsertProfile: async (data) => {
    const res = await apiClient.post("/buyers/profile", data);
    return res.data;
  },

  getDashboardMetrics: async () => {
    const res = await apiClient.get("/buyers/dashboard-metrics");
    return res.data;
  },

  verifyBuyer: async (buyerProfileId, status, rejectionReason) => {
    const res = await apiClient.patch(`/buyers/${buyerProfileId}/verify`, {
      status,
      rejectionReason,
    });
    return res.data;
  },
};
