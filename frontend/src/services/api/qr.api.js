import { apiClient } from "./apiClient";

export const qrApi = {
  generateBookingQR: async (bookingId) => {
    const res = await apiClient.post(`/qr/generate/${bookingId}`);
    return res.data;
  },

  getQRData: async (procurementId, stageNumber = 0, type = "ARRIVAL") => {
    const res = await apiClient.get(`/qr/procurement/${procurementId}`, {
      params: { stageNumber, type },
    });
    return res.data;
  },

  scanQR: async (qrData) => {
    const res = await apiClient.post("/qr/scan", { qrData });
    return res.data;
  },

  verifyQRData: async (qrData) => {
    const res = await apiClient.post("/qr/scan", { qrData });
    return res.data;
  },
};
