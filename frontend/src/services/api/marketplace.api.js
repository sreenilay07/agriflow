import { apiClient } from "./apiClient";

export const marketplaceApi = {
  getMarketplaceLots: async (params) => {
    const res = await apiClient.get("/marketplace/lots", { params });
    return res.data;
  },

  getMarketplaceLotDetail: async (id) => {
    const res = await apiClient.get(`/marketplace/lots/${id}`);
    return res.data;
  },

  getFilters: async () => {
    const res = await apiClient.get("/marketplace/filters");
    return res.data;
  },
};
