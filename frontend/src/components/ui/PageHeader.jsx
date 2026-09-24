import React from "react";
import { Breadcrumbs } from "./Breadcrumbs";

export const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  className = "",
  children,
}) => {
  return (
    <div className={`mb-6 space-y-2.5 ${className}`}>
      {/* Breadcrumb row */}
      <Breadcrumbs items={breadcrumbs} />

      {/* Main Title & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3.5 pt-1">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h1>
            {badge && <div className="inline-flex items-center">{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="pt-2">{children}</div>}
    </div>
  );
};
