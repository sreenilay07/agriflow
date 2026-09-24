import React, { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { exportApi } from "../../services/api/export.api";

export const ExportButton = ({
  resource,
  label = "Export CSV",
  size = "md",
}) => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  const handleExport = () => {
    setDownloading(true);
    exportApi.downloadCsv(resource);
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    }, 1000);
  };

  const sizeClasses =
    size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm";

  return (
    <button
      onClick={handleExport}
      disabled={downloading}
      className={`inline-flex items-center gap-2 rounded-xl font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm ${sizeClasses}`}
      title={`Export ${resource} as CSV spreadsheet`}
    >
      {downloading ? (
        <Loader2 size={14} className="animate-spin text-emerald-400" />
      ) : done ? (
        <Check size={14} className="text-emerald-400" />
      ) : (
        <Download
          size={14}
          className="text-slate-400 group-hover:text-emerald-400"
        />
      )}
      <span>{done ? "Exported!" : label}</span>
    </button>
  );
};
