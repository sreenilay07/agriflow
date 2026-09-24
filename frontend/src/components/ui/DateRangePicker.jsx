import React from "react";
import { Calendar } from "lucide-react";
import { DateRangeSelector } from "./DateRangeSelector";

export const DateRangePicker = ({
  value,
  onChange,
  variant = "light",
  className = "",
}) => {
  if (variant === "dark") {
    return <DateRangeSelector value={value} onChange={onChange} />;
  }

  const options = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "This Year", value: "this_year" },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl shadow-2xs ${className}`}
    >
      <div className="px-2 text-slate-400">
        <Calendar size={13} />
      </div>
      <div className="flex gap-1">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-emerald-800 shadow-2xs border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
