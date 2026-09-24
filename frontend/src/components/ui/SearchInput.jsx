import React from "react";
import { Search, X } from "lucide-react";

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search by ID, name, or keywords...",
  className = "",
  autoFocus = false,
  disabled = false,
}) => {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search
        size={15}
        className="absolute left-3 text-slate-400 pointer-events-none shrink-0"
      />

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        className="w-full pl-9 pr-8 py-2 bg-white text-xs text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 transition-all placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed shadow-2xs"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          title="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
};
