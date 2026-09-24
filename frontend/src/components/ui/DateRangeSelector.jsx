import React from "react";
import { Calendar } from "lucide-react";

export const DateRangeSelector = ({ value, onChange }) => {
  const options = [
    { label: "Today", value: "today" },
    { label: "7 Days", value: "7d" },
    { label: "30 Days", value: "30d" },
    { label: "90 Days", value: "90d" },
    { label: "This Year", value: "this_year" },
  ];

  return (
    <div className="inline-flex items-center p-1 bg-slate-900/80 border border-slate-800 rounded-xl shadow-inner">
      <div className="px-2.5 text-slate-400">
        <Calendar size={14} />
      </div>
      <div className="flex gap-1">
        {options.map((opt) => {
          const isActive = value === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
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
