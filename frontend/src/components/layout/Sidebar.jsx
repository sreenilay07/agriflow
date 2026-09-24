import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  QrCode,
  Sliders,
  FileSpreadsheet,
  Building2,
  ShieldAlert,
  Bell,
  Scale,
  Boxes,
  ShoppingBag,
  Truck,
  FileText,
  AlertTriangle,
  ReceiptText,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

export const Sidebar = ({ mobile = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!user) return null;

  const getMenuItems = () => {
    const role = user.role;

    if (role === "FARMER") {
      return [
        { path: "/farmer/dashboard", label: "Overview", icon: LayoutDashboard },
        { path: "/farmer/lots", label: "My Produce Lots", icon: Boxes },
        { path: "/farmer/lots/new", label: "Create Produce Lot", icon: Boxes },
        { path: "/farmer/farms", label: "My Farms", icon: Building2 },
        {
          path: "/farmer/purchase-orders",
          label: "Procurement Records",
          icon: FileSpreadsheet,
        },
        {
          path: "/farmer/settlements",
          label: "Settlements & Payouts",
          icon: ReceiptText,
        },
        {
          path: "/farmer/disputes",
          label: "Disputes & Appeals",
          icon: AlertTriangle,
        },
        { path: "/farmer/queue", label: "Arrival Queue Token", icon: QrCode },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "QUALITY_INSPECTOR") {
      return [
        { path: "/quality/dashboard", label: "Inspection Queue", icon: Scale },
        {
          path: "/quality/inspections",
          label: "Inspection Records",
          icon: FileText,
        },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "CENTER_OPERATOR" || role === "PROCUREMENT_OFFICER") {
      return [
        {
          path: "/officer/dashboard",
          label: "Intake Queue",
          icon: LayoutDashboard,
        },
        {
          path: "/officer/receiving",
          label: "Receive Produce Lots",
          icon: Scale,
        },
        { path: "/officer/scan", label: "Scan Intake QR", icon: QrCode },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (
      role === "CENTER_MANAGER" ||
      role === "CENTRE_MANAGER" ||
      role === "COLLECTION_CENTRE_MANAGER"
    ) {
      return [
        {
          path: "/manager/dashboard",
          label: "Centre Overview",
          icon: LayoutDashboard,
        },
        { path: "/manager/inventory", label: "Warehouse Stock", icon: Boxes },
        {
          path: "/manager/purchase-orders",
          label: "Purchase Orders",
          icon: FileSpreadsheet,
        },
        { path: "/manager/allocations", label: "Lot Allocations", icon: Boxes },
        { path: "/manager/counters", label: "Counters & Staff", icon: Sliders },
        {
          path: "/manager/capacity",
          label: "Daily Intake Settings",
          icon: Building2,
        },
        {
          path: "/district/reports",
          label: "Procurement Reports",
          icon: FileSpreadsheet,
        },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "BUYER") {
      return [
        {
          path: "/buyer/dashboard",
          label: "Procurement Overview",
          icon: LayoutDashboard,
        },
        {
          path: "/buyer/marketplace",
          label: "Produce Marketplace",
          icon: ShoppingBag,
        },
        { path: "/buyer/orders", label: "Purchase Orders", icon: FileText },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "LOGISTICS_COORDINATOR") {
      return [
        {
          path: "/logistics/dashboard",
          label: "Logistics Overview",
          icon: LayoutDashboard,
        },
        {
          path: "/logistics/shipments",
          label: "Shipments & Manifests",
          icon: Truck,
        },
        { path: "/logistics/vehicles", label: "Fleet & Vehicles", icon: Users },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "DISTRICT_ADMIN" || role === "DISTRICT_OFFICER") {
      return [
        {
          path: "/district/dashboard",
          label: "District Overview",
          icon: LayoutDashboard,
        },
        {
          path: "/district/reports",
          label: "District Reports",
          icon: FileSpreadsheet,
        },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    if (role === "SUPER_ADMIN" || role === "PLATFORM_ADMIN") {
      return [
        {
          path: "/admin/dashboard",
          label: "Dashboard & Approvals",
          icon: LayoutDashboard,
        },
        {
          path: "/admin/platform",
          label: "Platform Governance",
          icon: Sliders,
        },
        { path: "/admin/users", label: "User Directory", icon: Users },
        { path: "/manager/inventory", label: "Warehouse Stock", icon: Boxes },
        {
          path: "/manager/purchase-orders",
          label: "Purchase Orders",
          icon: FileSpreadsheet,
        },
        {
          path: "/logistics/shipments",
          label: "Global Shipments",
          icon: Truck,
        },
        {
          path: "/district/reports",
          label: "System Analytics",
          icon: FileSpreadsheet,
        },
        {
          path: "/admin/audit-logs",
          label: "Security Audit Logs",
          icon: ShieldAlert,
        },
        { path: "/notifications", label: "Notifications", icon: Bell },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <aside
      className={`w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-65px)] border-r border-slate-800 flex flex-col justify-between select-none ${
        mobile ? "w-full min-h-0" : "hidden md:flex"
      }`}
    >
      <div>
        {/* User Context Strip */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
          <p className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">
            Workspace Portal
          </p>
          <p className="text-sm font-bold text-white mt-0.5 truncate">
            {user.fullName}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[11px] text-emerald-400 font-bold tracking-wide">
              {user.role.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-900/60 text-emerald-200 shadow-2xs border-l-4 border-emerald-500"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <Icon
                  size={17}
                  className={`shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`}
                />

                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Note */}
      <div className="p-4 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
        <p className="font-semibold text-slate-400">Agriflow v3.0 Enterprise</p>
        <p className="text-slate-500 mt-0.5">Saath Kisan Ka, Har Kadam Par</p>
      </div>
    </aside>
  );
};
