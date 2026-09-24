import { apiClient } from "./apiClient";

export const purchaseOrderApi = {
  createPO: async (data) => {
    const res = await apiClient.post("/purchase-orders", data);
    return res.data;
  },

  getPOs: async (params) => {
    const res = await apiClient.get("/purchase-orders", { params });
    return res.data;
  },

  getPODetail: async (id) => {
    const res = await apiClient.get(`/purchase-orders/${id}`);
    return res.data;
  },

  reviewPO: async (id, action, rejectionReason) => {
    const res = await apiClient.patch(`/purchase-orders/${id}/review`, {
      action,
      rejectionReason,
    });
    return res.data;
  },
};
