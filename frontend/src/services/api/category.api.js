import apiClient from "./apiClient";

export const categoryApi = {
  getCategories: async (params) => {
    const res = await apiClient.get("/categories", { params });
    return res.data;
  },
  getCategoryById: async (id) => {
    const res = await apiClient.get(`/categories/${id}`);
    return res.data;
  },
  createCategory: async (data) => {
    const res = await apiClient.post("/categories", data);
    return res.data;
  },
  updateCategory: async (id, data) => {
    const res = await apiClient.put(`/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await apiClient.delete(`/categories/${id}`);
    return res.data;
  },
};
