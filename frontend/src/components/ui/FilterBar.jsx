import React from "react";
import { Filter, RotateCcw } from "lucide-react";
import { SearchInput } from "./SearchInput";

export const FilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = "Filter records...",
  filters = [],
  onReset,
  activeFilterCount = 0,
  actions,
  children,
  className = "",
}) => {
  const hasActiveFilters = activeFilterCount > 0 || Boolean(search?.trim());

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-2xs space-y-3 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search & Select Filters */}
        <div className="flex items-center flex-wrap gap-2.5 flex-1">
          {onSearchChange !== undefined && (
            <div className="w-full sm:w-64 md:w-72">
              <SearchInput
                value={search || ""}
                onChange={onSearchChange}
                placeholder={searchPlaceholder}
              />
            </div>
          )}

          {filters.map((f) => (
            <div key={f.id} className="relative min-w-[140px]">
              <select
                value={f.value}
                onChange={(e) => f.onChange(e.target.value)}
                className="w-full pl-3 pr-8 py-2 bg-white text-xs font-semibold text-slate-700 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 cursor-pointer transition-all shadow-2xs appearance-none"
              >
                <option value="">All {f.label}</option>
                {f.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Filter size={12} />
              </div>
            </div>
          ))}

          {children}

          {hasActiveFilters && onReset && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Optional Action / Export Slot */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
