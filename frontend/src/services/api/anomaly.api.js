import { apiClient } from "./apiClient";

export const anomalyApi = {
  getAnomalies: async () => {
    const res = await apiClient.get("/anomalies");
    return res.data?.data || [];
  },
};
