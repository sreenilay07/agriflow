import { create } from "zustand";

export const useAuthStore = create((set) => {
  const savedUser =
    localStorage.getItem("Agriflow_user") ||
    localStorage.getItem("agriflow_user");
  const savedProfile =
    localStorage.getItem("Agriflow_profile") ||
    localStorage.getItem("agriflow_profile");
  const savedToken =
    localStorage.getItem("Agriflow_token") ||
    localStorage.getItem("agriflow_token");
  const savedRefresh =
    localStorage.getItem("Agriflow_refresh") ||
    localStorage.getItem("agriflow_refresh");

  return {
    user: savedUser ? JSON.parse(savedUser) : null,
    farmerProfile: savedProfile ? JSON.parse(savedProfile) : null,
    accessToken: savedToken || null,
    refreshToken: savedRefresh || null,
    isAuthenticated: !!savedToken,

    setAuth: (user, tokens, profile = null) => {
      localStorage.setItem("Agriflow_user", JSON.stringify(user));
      localStorage.setItem("Agriflow_token", tokens.accessToken);
      localStorage.setItem("Agriflow_refresh", tokens.refreshToken);
      if (profile) {
        localStorage.setItem("Agriflow_profile", JSON.stringify(profile));
      }

      set({
        user,
        farmerProfile: profile || null,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      });
    },

    setUser: (user) => {
      localStorage.setItem("Agriflow_user", JSON.stringify(user));
      set({ user });
    },

    logout: () => {
      localStorage.removeItem("Agriflow_user");
      localStorage.removeItem("Agriflow_profile");
      localStorage.removeItem("Agriflow_token");
      localStorage.removeItem("Agriflow_refresh");
      localStorage.removeItem("agriflow_user");
      localStorage.removeItem("agriflow_profile");
      localStorage.removeItem("agriflow_token");
      localStorage.removeItem("agriflow_refresh");

      set({
        user: null,
        farmerProfile: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },
  };
});
