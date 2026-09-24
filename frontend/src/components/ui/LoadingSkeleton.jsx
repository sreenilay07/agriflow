import React from "react";

export const LoadingSkeleton = ({
  variant = "cards",
  count = 4,
  className = "",
}) => {
  if (variant === "metrics") {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse ${className}`}
      >
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-slate-200 rounded w-24"></div>
              <div className="w-8 h-8 rounded-xl bg-slate-100"></div>
            </div>
            <div className="h-7 bg-slate-200 rounded w-32"></div>
            <div className="h-3 bg-slate-100 rounded w-40"></div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={`bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse ${className}`}
      >
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-8 bg-slate-100 rounded-xl w-48"></div>
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: count || 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center gap-4">
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-36"></div>
              <div className="h-4 bg-slate-100 rounded flex-1 hidden sm:block"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
              <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={`space-y-6 animate-pulse ${className}`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
          <div className="h-6 bg-slate-200 rounded w-64"></div>
          <div className="h-4 bg-slate-100 rounded w-96"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-full"></div>
              <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
              <div className="h-3.5 bg-slate-100 rounded w-4/6"></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <div className="h-4 bg-slate-200 rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded w-full"></div>
              <div className="h-3.5 bg-slate-100 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "form") {
    return (
      <div
        className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-5 animate-pulse ${className}`}
      >
        <div className="h-5 bg-slate-200 rounded w-48"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-20"></div>
            <div className="h-9 bg-slate-100 rounded-xl w-full"></div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-24"></div>
            <div className="h-9 bg-slate-100 rounded-xl w-full"></div>
          </div>
        </div>
        <div className="h-9 bg-slate-200 rounded-xl w-32"></div>
      </div>
    );
  }

  // Default 'cards'
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse ${className}`}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
        >
          <div className="h-4 bg-slate-200 rounded w-32"></div>
          <div className="h-3 bg-slate-100 rounded w-full"></div>
          <div className="h-3 bg-slate-100 rounded w-4/5"></div>
          <div className="pt-2 flex justify-between">
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
