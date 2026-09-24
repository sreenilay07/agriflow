import { apiClient } from "./apiClient";

export const searchApi = {
  search: async (q) => {
    if (!q || !q.trim()) return [];
    const response = await apiClient.get(`/search?q=${encodeURIComponent(q)}`);
    return response.data?.data || [];
  },
};
