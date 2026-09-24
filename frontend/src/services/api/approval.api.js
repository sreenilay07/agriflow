import { apiClient } from "./apiClient";

export const approvalApi = {
  getPendingCentreManagers: async () => {
    const response = await apiClient.get("/approvals/centre-managers");
    return response.data;
  },

  getPendingCentreOperators: async () => {
    const response = await apiClient.get("/approvals/centre-operators");
    return response.data;
  },

  getPendingDistrictAdmins: async () => {
    const response = await apiClient.get("/approvals/district-admins");
    return response.data;
  },

  approveRequest: async (id, remarks = "") => {
    const response = await apiClient.patch(`/approvals/${id}/approve`, {
      remarks,
    });
    return response.data;
  },

  rejectRequest: async (id, rejectionReason, remarks = "") => {
    const response = await apiClient.patch(`/approvals/${id}/reject`, {
      rejectionReason,
      remarks,
    });
    return response.data;
  },
};
