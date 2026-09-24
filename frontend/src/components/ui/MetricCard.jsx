import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  loading = false,
  className = "",
}) => {
  const iconVariants = {
    default: "bg-slate-100 text-slate-700 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    blue: "bg-sky-50 text-sky-700 border-sky-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  }[variant];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 bg-slate-200 rounded-md w-24"></div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-7 bg-slate-200 rounded-md w-32 mb-2"></div>
        <div className="h-3 bg-slate-100 rounded-md w-20"></div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl border shrink-0 ${iconVariants}`}>
          <Icon size={18} />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp size={12} className="mr-0.5" />
            ) : (
              <TrendingDown size={12} className="mr-0.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 font-medium mt-1.5 line-clamp-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};
