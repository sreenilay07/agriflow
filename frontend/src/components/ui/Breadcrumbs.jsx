import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const ROUTE_NAME_MAP = {
  farmer: "Farmer",
  dashboard: "Overview",
  lots: "Produce Lots",
  new: "Create Lot",
  farms: "My Farms",
  settlements: "Settlements",
  disputes: "Disputes",
  procurement: "Procurement",
  "purchase-orders": "Procurement Records",
  quality: "Quality",
  inspections: "Inspections",
  standards: "Standards",
  manager: "Centre Manager",
  intake: "Intake Queue",
  inventory: "Warehouse Stock",
  allocations: "Allocations",
  counters: "Counters & Staff",
  capacity: "Capacity Settings",
  officer: "Intake Operator",
  receiving: "Receive Lots",
  scan: "QR Scanner",
  buyer: "Buyer",
  marketplace: "Marketplace",
  orders: "Purchase Orders",
  logistics: "Logistics",
  shipments: "Shipments",
  vehicles: "Fleet & Vehicles",
  district: "District",
  reports: "Reports",
  admin: "Platform Admin",
  platform: "Platform Governance",
  users: "User Directory",
  "audit-logs": "Security Audit Logs",
};

export const Breadcrumbs = ({ items, className = "" }) => {
  const location = useLocation();

  const autoItems = React.useMemo(() => {
    if (items && items.length > 0) return items;

    const segments = location.pathname.split("/").filter(Boolean);
    const pathItems = [];

    let currentHref = "";
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      currentHref += `/${seg}`;

      // Check if it's an ID (like mongo ObjectId or numeric ID)
      const isId =
        /^[0-9a-fA-F]{24}$/.test(seg) ||
        (!isNaN(Number(seg)) && seg.length > 3);
      const label = isId
        ? "Detail"
        : ROUTE_NAME_MAP[seg] || seg.charAt(0).toUpperCase() + seg.slice(1);

      pathItems.push({
        label,
        href: i === segments.length - 1 ? undefined : currentHref,
      });
    }

    return pathItems;
  }, [items, location.pathname]);

  if (autoItems.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-xs text-slate-500 font-medium ${className}`}
    >
      <Link
        to="/"
        className="flex items-center text-slate-400 hover:text-emerald-700 transition-colors"
      >
        <Home size={13} className="shrink-0" />
      </Link>
      {autoItems.map((item, idx) => {
        const isLast = idx === autoItems.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight size={12} className="mx-2 text-slate-300 shrink-0" />
            {isLast || !item.href ? (
              <span
                className="text-slate-800 font-semibold truncate max-w-[200px]"
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-slate-500 hover:text-emerald-700 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
