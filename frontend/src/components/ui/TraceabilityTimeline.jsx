import React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Sprout,
  Calendar,
  Building2,
  Scale,
  Boxes,
  Truck,
  FileCheck,
  CheckCheck,
} from "lucide-react";

export const TraceabilityTimeline = ({ steps, className = "" }) => {
  const getStepIcon = (id, status) => {
    if (status === "REJECTED")
      return <AlertCircle size={16} className="text-rose-600" />;
    if (status === "COMPLETED")
      return <CheckCircle2 size={16} className="text-emerald-600" />;

    switch (id.toLowerCase()) {
      case "created":
      case "farm":
        return (
          <Sprout
            size={16}
            className={
              status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
            }
          />
        );
      case "scheduled":
      case "booking":
        return (
          <Calendar
            size={16}
            className={status === "ACTIVE" ? "text-sky-600" : "text-slate-400"}
          />
        );
      case "received":
      case "centre":
        return (
          <Building2
            size={16}
            className={status === "ACTIVE" ? "text-sky-600" : "text-slate-400"}
          />
        );
      case "quality":
      case "inspection":
        return (
          <Scale
            size={16}
            className={
              status === "ACTIVE" ? "text-amber-600" : "text-slate-400"
            }
          />
        );
      case "stored":
      case "warehouse":
        return (
          <Boxes
            size={16}
            className={
              status === "ACTIVE" ? "text-indigo-600" : "text-slate-400"
            }
          />
        );
      case "logistics":
      case "shipment":
        return (
          <Truck
            size={16}
            className={
              status === "ACTIVE" ? "text-indigo-600" : "text-slate-400"
            }
          />
        );
      case "delivered":
        return (
          <CheckCheck
            size={16}
            className={
              status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
            }
          />
        );
      case "settlement":
        return (
          <FileCheck
            size={16}
            className={
              status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
            }
          />
        );
      default:
        return (
          <Clock
            size={16}
            className={
              status === "ACTIVE" ? "text-emerald-600" : "text-slate-400"
            }
          />
        );
    }
  };

  return (
    <div className={`py-4 ${className}`}>
      {/* Desktop Horizontal View */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Continuous Connecting Line */}
        <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-200 z-0" />

        {steps.map((step, idx) => {
          const isCompleted = step.status === "COMPLETED";
          const isActive = step.status === "ACTIVE";
          const isRejected = step.status === "REJECTED";

          let circleBg = "bg-white border-2 border-slate-300 text-slate-400";
          if (isCompleted)
            circleBg =
              "bg-emerald-50 border-2 border-emerald-600 text-emerald-600 shadow-2xs";
          if (isActive)
            circleBg =
              "bg-sky-50 border-2 border-sky-600 text-sky-600 ring-4 ring-sky-100 animate-pulse";
          if (isRejected)
            circleBg = "bg-rose-50 border-2 border-rose-600 text-rose-600";

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center text-center relative z-10 px-2"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${circleBg}`}
              >
                {getStepIcon(step.id, step.status)}
              </div>

              <div className="mt-2.5 space-y-0.5">
                <p
                  className={`text-xs font-bold leading-tight ${
                    isCompleted || isActive
                      ? "text-slate-900"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-[10px] text-slate-400 font-medium">
                    {new Date(step.timestamp).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                )}
                {step.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-1">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical View */}
      <div className="md:hidden space-y-6 relative pl-6 border-l-2 border-slate-200 ml-4">
        {steps.map((step, idx) => {
          const isCompleted = step.status === "COMPLETED";
          const isActive = step.status === "ACTIVE";
          const isRejected = step.status === "REJECTED";

          let dotBg = "bg-white border-2 border-slate-300";
          if (isCompleted)
            dotBg =
              "bg-emerald-600 border-2 border-white ring-2 ring-emerald-500";
          if (isActive)
            dotBg =
              "bg-sky-600 border-2 border-white ring-4 ring-sky-200 animate-pulse";
          if (isRejected)
            dotBg = "bg-rose-600 border-2 border-white ring-2 ring-rose-500";

          return (
            <div key={idx} className="relative">
              <div
                className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full ${dotBg}`}
              />

              <div>
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-xs font-bold ${
                      isCompleted || isActive
                        ? "text-slate-900"
                        : "text-slate-500"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-[10px] text-slate-400">
                      {new Date(step.timestamp).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {step.description && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {step.description}
                  </p>
                )}
                {step.actor && (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                    By {step.actor}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
