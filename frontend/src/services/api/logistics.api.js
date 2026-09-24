import { apiClient } from "./apiClient";

export const logisticsApi = {
  getVehicles: async (params) => {
    const res = await apiClient.get("/logistics/vehicles", { params });
    return res.data;
  },

  createVehicle: async (data) => {
    const res = await apiClient.post("/logistics/vehicles", data);
    return res.data;
  },

  createShipment: async (data) => {
    const res = await apiClient.post("/logistics/shipments", data);
    return res.data;
  },

  getShipments: async (params) => {
    const res = await apiClient.get("/logistics/shipments", { params });
    return res.data;
  },

  getShipmentDetail: async (id) => {
    const res = await apiClient.get(`/logistics/shipments/${id}`);
    return res.data;
  },

  dispatchShipment: async (id, notes) => {
    const res = await apiClient.post(`/logistics/shipments/${id}/dispatch`, {
      notes,
    });
    return res.data;
  },

  updateTransitStatus: async (id, data) => {
    const res = await apiClient.patch(
      `/logistics/shipments/${id}/transit-status`,
      data,
    );
    return res.data;
  },

  confirmDelivery: async (data) => {
    const res = await apiClient.post("/logistics/delivery-confirmation", data);
    return res.data;
  },

  getDashboardMetrics: async () => {
    const res = await apiClient.get("/logistics/dashboard-metrics");
    return res.data;
  },
};
