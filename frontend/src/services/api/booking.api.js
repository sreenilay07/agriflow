import { apiClient } from "./apiClient";

export const bookingApi = {
  createBooking: async (data) => {
    const res = await apiClient.post("/bookings", data);
    return res.data;
  },

  getMyBookings: async () => {
    const res = await apiClient.get("/bookings/me");
    return res.data;
  },

  getBookingById: async (id) => {
    const res = await apiClient.get(`/bookings/${id}`);
    return res.data;
  },

  cancelBooking: async (id) => {
    const res = await apiClient.patch(`/bookings/${id}/cancel`);
    return res.data;
  },
};
