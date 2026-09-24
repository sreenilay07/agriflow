import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export const ErrorState = ({
  title = "Failed to load operational data",
  message = "An unexpected network or service error occurred while retrieving records. Please verify your connection and try again.",
  onRetry,
  className = "",
  children,
}) => {
  return (
    <div
      className={`bg-rose-50/60 rounded-2xl border border-rose-200/80 p-6 sm:p-8 text-center max-w-lg mx-auto shadow-2xs ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto mb-3.5 shadow-2xs">
        <AlertCircle size={22} />
      </div>
      <h3 className="text-base font-bold text-rose-950 tracking-tight">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-rose-800/80 mt-1.5 leading-relaxed max-w-md mx-auto">
        {message}
      </p>

      {(onRetry || children) && (
        <div className="mt-5 flex items-center justify-center gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Retry Request</span>
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
};
