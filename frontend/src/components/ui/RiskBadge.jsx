import React from "react";
import { AlertTriangle, CheckCircle, Info, AlertOctagon } from "lucide-react";

export const RiskBadge = ({ level, size = "sm" }) => {
  const norm = (level || "LOW").toUpperCase();

  const config = {
    LOW: {
      bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      icon: CheckCircle,
      label: "Low Risk",
    },
    MEDIUM: {
      bg: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      icon: Info,
      label: "Medium Risk",
    },
    HIGH: {
      bg: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      icon: AlertTriangle,
      label: "High Risk",
    },
    CRITICAL: {
      bg: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      icon: AlertOctagon,
      label: "Critical",
    },
  }[norm] || {
    bg: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    icon: Info,
    label: norm,
  };

  const Icon = config.icon;
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${sizeClasses}`}
    >
      <Icon size={size === "sm" ? 12 : 14} />
      <span>{config.label}</span>
    </span>
  );
};
