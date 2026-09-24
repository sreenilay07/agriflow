import { apiClient } from "./apiClient";

export const receiptApi = {
  getById: async (id) => {
    const response = await apiClient.get(`/receipts/${id}`);
    return response.data;
  },

  getByBooking: async (bookingId) => {
    const response = await apiClient.get(`/receipts/booking/${bookingId}`);
    return response.data;
  },

  getDownloadUrl: (id, print = false) => {
    const baseURL = apiClient.defaults.baseURL || "/api/v1";
    return `${baseURL}/receipts/${id}/download${print ? "?print=true" : ""}`;
  },
};
