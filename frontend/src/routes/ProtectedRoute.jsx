import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LanguageSelectorModal } from "../components/layout/LanguageSelectorModal";

export const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // REDIRECT PENDING OR INACTIVE USERS AWAY FROM OPERATIONAL DASHBOARDS
  if (
    user.status &&
    ["PENDING", "REJECTED", "SUSPENDED"].includes(user.status)
  ) {
    return <Navigate to="/account/pending" replace />;
  }

  if (allowedRoles) {
    const expandedAllowed = allowedRoles.flatMap((r) => {
      if (r === "CENTER_OPERATOR" || r === "PROCUREMENT_OFFICER")
        return ["CENTER_OPERATOR", "PROCUREMENT_OFFICER"];
      if (r === "QUALITY_INSPECTOR") return ["QUALITY_INSPECTOR"];
      if (
        r === "CENTER_MANAGER" ||
        r === "CENTRE_MANAGER" ||
        r === "COLLECTION_CENTRE_MANAGER"
      )
        return [
          "CENTER_MANAGER",
          "CENTRE_MANAGER",
          "COLLECTION_CENTRE_MANAGER",
        ];
      if (r === "DISTRICT_ADMIN" || r === "DISTRICT_OFFICER")
        return ["DISTRICT_ADMIN", "DISTRICT_OFFICER"];
      if (r === "SUPER_ADMIN" || r === "PLATFORM_ADMIN")
        return ["SUPER_ADMIN", "PLATFORM_ADMIN"];
      return [r];
    });

    if (!expandedAllowed.includes(user.role)) {
      switch (user.role) {
        case "FARMER":
          return <Navigate to="/farmer/dashboard" replace />;
        case "QUALITY_INSPECTOR":
          return <Navigate to="/quality/dashboard" replace />;
        case "CENTER_OPERATOR":
        case "PROCUREMENT_OFFICER":
          return <Navigate to="/officer/dashboard" replace />;
        case "CENTER_MANAGER":
        case "CENTRE_MANAGER":
        case "COLLECTION_CENTRE_MANAGER":
          return <Navigate to="/manager/dashboard" replace />;
        case "DISTRICT_ADMIN":
        case "DISTRICT_OFFICER":
          return <Navigate to="/district/dashboard" replace />;
        case "SUPER_ADMIN":
        case "PLATFORM_ADMIN":
          return <Navigate to="/admin/dashboard" replace />;
        case "BUYER":
          return <Navigate to="/buyer/dashboard" replace />;
        case "LOGISTICS_COORDINATOR":
          return <Navigate to="/logistics/dashboard" replace />;
        default:
          return <Navigate to="/login" replace />;
      }
    }
  }

  return (
    <>
      <Outlet />
      <LanguageSelectorModal />
    </>
  );
};
