import React from "react";

export const Card = ({ children, className = "", onClick, header, footer }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden ${
        onClick ? "cursor-pointer hover:border-slate-300 transition-colors" : ""
      } ${className}`}
    >
      {header && (
        <div className="px-5 py-4 border-b border-slate-100 font-bold bg-slate-50/50">
          {header}
        </div>
      )}
      <div className="p-5">{children}</div>
      {footer && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-sm">
          {footer}
        </div>
      )}
    </div>
  );
};
