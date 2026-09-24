import { apiClient } from "./apiClient";

export const documentApi = {
  mockAadhaarVerify: async (aadhaarNumber, name) => {
    const response = await apiClient.post("/documents/mock-aadhaar-verify", {
      aadhaarNumber,
      name,
    });
    return response.data;
  },

  getByProcurement: async (procurementId) => {
    const response = await apiClient.get(
      `/documents/procurement/${procurementId}`,
    );
    return response.data;
  },

  saveVerification: async (procurementId, payload) => {
    const response = await apiClient.post(
      `/documents/procurement/${procurementId}`,
      payload,
    );
    return response.data;
  },
};
