import { apiClient } from "./apiClient";

export const adminApi = {
  getUsers: async (params) => {
    const res = await apiClient.get("/users", { params });
    return res.data;
  },

  createUser: async (data) => {
    const res = await apiClient.post("/users", data);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await apiClient.patch(`/users/${id}`, data);
    return res.data;
  },

  getAuditLogs: async (params) => {
    const res = await apiClient.get("/audit-logs", { params });
    return res.data;
  },
};
