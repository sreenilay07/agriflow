import { useEffect } from "react";
import { initSocketClient, getSocketClient } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";

export const useRealtime = (events) => {
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socket = initSocketClient();
    if (!socket) return;

    if (events) {
      Object.entries(events).forEach(([eventName, handler]) => {
        socket.on(eventName, handler);
      });
    }

    return () => {
      const activeSocket = getSocketClient();
      if (activeSocket && events) {
        Object.entries(events).forEach(([eventName, handler]) => {
          activeSocket.off(eventName, handler);
        });
      }
    };
  }, [isAuthenticated, user, events]);
};
