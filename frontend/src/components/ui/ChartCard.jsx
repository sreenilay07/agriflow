import React from "react";

export const ChartCard = ({
  title,
  subtitle,
  filterAction,
  summaryMetrics,
  children,
  className = "",
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          {summaryMetrics && summaryMetrics.length > 0 && (
            <div className="hidden md:flex items-center gap-4 border-r border-slate-100 pr-4">
              {summaryMetrics.map((sm, idx) => (
                <div key={idx} className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    {sm.label}
                  </p>
                  <p className="text-xs font-black text-slate-800 tabular-nums">
                    {sm.value}{" "}
                    {sm.change && (
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {sm.change}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

          {filterAction}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="w-full overflow-hidden">{children}</div>
    </div>
  );
};
