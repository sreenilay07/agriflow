import React from "react";
import { CheckCircle2, Clock, AlertCircle, CircleDot } from "lucide-react";

export const ActivityTimeline = ({ events, title, className = "" }) => {
  const getStatusIcon = (event) => {
    if (event.icon) return event.icon;
    switch (event.status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-emerald-700" />;
      case "current":
        return (
          <CircleDot size={16} className="text-emerald-600 animate-pulse" />
        );
      case "failed":
        return <AlertCircle size={16} className="text-rose-600" />;
      default:
        return <Clock size={16} className="text-slate-300" />;
    }
  };

  const getStatusLine = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-600";
      case "current":
        return "bg-emerald-300";
      case "failed":
        return "bg-rose-300";
      default:
        return "bg-slate-200";
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts) return null;
    const date = typeof ts === "string" ? new Date(ts) : ts;
    if (isNaN(date.getTime())) return String(ts);
    return date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs ${className}`}
    >
      {title && (
        <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {events.length} Milestones
          </span>
        </div>
      )}

      <div className="relative pl-6 space-y-6">
        {events.map((evt, idx) => {
          const isLast = idx === events.length - 1;
          return (
            <div key={evt.id || idx} className="relative group">
              {/* Vertical connector line */}
              {!isLast && (
                <span
                  className={`absolute -left-6 top-5 bottom-0 w-0.5 -translate-x-1/2 ${getStatusLine(
                    evt.status,
                  )}`}
                  aria-hidden="true"
                />
              )}

              {/* Status bullet icon */}
              <div className="absolute -left-6 top-0.5 -translate-x-1/2 bg-white rounded-full p-0.5">
                {getStatusIcon(evt)}
              </div>

              {/* Event Content */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {evt.title}
                  </h4>
                  {evt.badge}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium flex-wrap">
                  {evt.timestamp && (
                    <span>{formatTimestamp(evt.timestamp)}</span>
                  )}
                  {evt.actor && (
                    <>
                      <span>•</span>
                      <span className="text-slate-600 font-semibold">
                        {evt.actor}
                      </span>
                    </>
                  )}
                </div>

                {evt.description && (
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {evt.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
