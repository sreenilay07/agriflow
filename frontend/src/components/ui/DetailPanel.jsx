import React from "react";
import { Copy, Check } from "lucide-react";

export const DetailPanel = ({
  title,
  subtitle,
  badge,
  action,
  fields,
  columns = 3,
  className = "",
  children,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState(null);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const getColSpanClass = (span) => {
    if (span === 4) return "col-span-1 sm:col-span-2 lg:col-span-4";
    if (span === 3) return "col-span-1 sm:col-span-2 lg:col-span-3";
    if (span === 2) return "col-span-1 sm:col-span-2";
    return "col-span-1";
  };

  const getGridColsClass = () => {
    if (columns === 4) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    if (columns === 2) return "grid-cols-1 sm:grid-cols-2";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs ${className}`}
    >
      {(title || action || badge) && (
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              {title && (
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  {title}
                </h3>
              )}
              {badge}
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`p-4 sm:p-5 grid gap-4 sm:gap-5 ${getGridColsClass()}`}>
        {fields.map((field, idx) => (
          <div
            key={idx}
            className={`${getColSpanClass(field.colSpan)} space-y-1`}
          >
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {field.label}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-xs sm:text-sm font-semibold text-slate-900 break-words">
                {field.value ?? (
                  <span className="text-slate-400 font-normal">—</span>
                )}
              </div>
              {field.badge}
              {field.copyable && field.copyText && (
                <button
                  type="button"
                  onClick={() => handleCopy(field.copyText, idx)}
                  className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                  title="Copy to clipboard"
                >
                  {copiedIndex === idx ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              )}
            </div>
            {field.hint && (
              <p className="text-[10px] text-slate-400 font-medium">
                {field.hint}
              </p>
            )}
          </div>
        ))}
      </div>

      {children && (
        <div className="p-4 sm:p-5 border-t border-slate-100">{children}</div>
      )}
    </div>
  );
};
