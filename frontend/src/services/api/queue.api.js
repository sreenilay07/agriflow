import { apiClient } from "./apiClient";

export const queueApi = {
  getCentreQueue: async (centreId) => {
    const res = await apiClient.get(`/queue/${centreId}`);
    return res.data;
  },

  recalculateQueue: async (centreId) => {
    const res = await apiClient.post(`/queue/recalculate/${centreId}`);
    return res.data;
  },
};
