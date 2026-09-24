import React from "react";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Truck,
  ShieldCheck,
  Building2,
  Boxes,
  Ban,
  PackageCheck,
  RefreshCw,
  Award,
} from "lucide-react";

export const StatusBadge = ({
  status,
  size = "md",
  showIcon = true,
  className = "",
}) => {
  const normalized = (status || "").toUpperCase().trim();

  // Size configurations
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-semibold",
    md: "text-xs px-2.5 py-1 gap-1.5 font-bold",
    lg: "text-sm px-3 py-1.5 gap-2 font-bold",
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  // Map status to semantic colors and icons
  let bgClass = "bg-slate-100 text-slate-700 border-slate-300";
  let IconComponent = Clock;
  let displayLabel = normalized.replace(/_/g, " ");

  switch (normalized) {
    // Green / Success states
    case "ACCEPTED":
    case "VERIFIED":
    case "APPROVED":
    case "DELIVERED":
    case "SETTLED":
    case "RESOLVED":
    case "COMPLETED":
    case "GRADE_A":
    case "A":
      bgClass =
        "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800";
      IconComponent =
        normalized === "GRADE_A" || normalized === "A" ? Award : CheckCircle2;
      break;

    // Blue / Info / Operations states
    case "CREATED":
    case "SCHEDULED":
    case "RECEIVED":
    case "STORED":
    case "ALLOCATED":
    case "GRADE_B":
    case "B":
      bgClass =
        "bg-sky-50 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800";
      IconComponent =
        normalized === "STORED"
          ? Boxes
          : normalized === "SCHEDULED"
            ? Building2
            : Clock;
      break;

    // Purple / Indigo / Logistics states
    case "DISPATCHED":
    case "IN_TRANSIT":
    case "ARRIVED":
      bgClass =
        "bg-indigo-50 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800";
      IconComponent = normalized === "ARRIVED" ? PackageCheck : Truck;
      break;

    // Amber / Warning / In-Progress states
    case "PENDING":
    case "UNDER_INSPECTION":
    case "PARTIALLY_ACCEPTED":
    case "RAISED":
    case "GRADE_C":
    case "C":
      bgClass =
        "bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800";
      IconComponent =
        normalized === "UNDER_INSPECTION" ? RefreshCw : AlertCircle;
      break;

    // Red / Danger states
    case "REJECTED":
    case "CANCELLED":
    case "DISMISSED":
    case "REJECT":
      bgClass =
        "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800";
      IconComponent = normalized === "CANCELLED" ? Ban : XCircle;
      break;

    default:
      bgClass = "bg-slate-100 text-slate-700 border-slate-300";
      IconComponent = ShieldCheck;
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-2xs tracking-wide transition-colors ${sizeClasses} ${bgClass} ${className}`}
    >
      {showIcon && <IconComponent size={iconSizes} className="shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  );
};
