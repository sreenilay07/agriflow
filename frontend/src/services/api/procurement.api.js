import { apiClient } from "./apiClient";

export const procurementApi = {
  getProcurementById: async (id) => {
    const res = await apiClient.get(`/procurements/${id}`);
    return res.data;
  },

  scanArrival: async (id, qrData) => {
    const res = await apiClient.post(`/procurements/${id}/arrival`, { qrData });
    return res.data;
  },

  getStages: async (procurementId) => {
    const res = await apiClient.get(`/procurements/${procurementId}/stages`);
    return res.data;
  },

  completeStage: async (procurementId, stageId, payload) => {
    const res = await apiClient.post(
      `/procurements/${procurementId}/stages/${stageId}/complete`,
      payload,
    );
    return res.data;
  },
};
