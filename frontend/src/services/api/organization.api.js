import apiClient from "./apiClient";

export const organizationApi = {
  getOrganizations: async (params) => {
    const res = await apiClient.get("/organizations", { params });
    return res.data;
  },
  getOrganizationById: async (id) => {
    const res = await apiClient.get(`/organizations/${id}`);
    return res.data;
  },
  createOrganization: async (data) => {
    const res = await apiClient.post("/organizations", data);
    return res.data;
  },
  updateOrganization: async (id, data) => {
    const res = await apiClient.put(`/organizations/${id}`, data);
    return res.data;
  },
  deleteOrganization: async (id) => {
    const res = await apiClient.delete(`/organizations/${id}`);
    return res.data;
  },
};
