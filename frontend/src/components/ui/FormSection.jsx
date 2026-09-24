import React from "react";

export const FormSection = ({
  title,
  description,
  badge,
  icon,
  columns = 2,
  children,
  className = "",
}) => {
  const getGridCols = () => {
    if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    if (columns === 1) return "grid-cols-1";
    return "grid-cols-1 sm:grid-cols-2";
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5 ${className}`}
    >
      <div className="border-b border-slate-100 pb-3 flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
            {badge}
          </div>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className={`grid gap-4 sm:gap-5 ${getGridCols()}`}>{children}</div>
    </div>
  );
};
