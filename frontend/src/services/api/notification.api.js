import { apiClient } from "./apiClient";

export const notificationApi = {
  getNotifications: async () => {
    const res = await apiClient.get("/notifications");
    return res.data;
  },

  getAll: async () => {
    const res = await apiClient.get("/notifications");
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.data?.notifications))
      return res.data.data.notifications;
    if (Array.isArray(res.data?.notifications)) return res.data.notifications;
    return [];
  },

  markAsRead: async (id) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await apiClient.patch("/notifications/read-all");
    return res.data;
  },
};
