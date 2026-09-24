import React from "react";
import { Inbox, Plus } from "lucide-react";

export const EmptyState = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryAction,
  className = "",
  children,
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-2xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
        {icon || <Inbox size={22} className="text-slate-400" />}
      </div>
      <h3 className="text-base font-bold text-slate-900 tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed max-w-sm mx-auto">
          {description}
        </p>
      )}

      {(actionLabel || secondaryAction || children) && (
        <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <Plus size={14} />
              <span>{actionLabel}</span>
            </button>
          )}
          {secondaryAction}
          {children}
        </div>
      )}
    </div>
  );
};
