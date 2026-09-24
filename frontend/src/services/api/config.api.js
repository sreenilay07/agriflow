import apiClient from "./apiClient";

export const configApi = {
  getConfig: async () => {
    const res = await apiClient.get("/config");
    return res.data;
  },
  updateConfig: async (data) => {
    const res = await apiClient.put("/config", data);
    return res.data;
  },
};
