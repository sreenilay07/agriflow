import React, { useState, useRef } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";

export const FileUpload = ({
  label,
  hint = "PDF, PNG, JPG up to 10MB",
  accept = ".pdf,.png,.jpg,.jpeg",
  maxSizeBytes = 10 * 1024 * 1024,
  onFileSelect,
  onFileRemove,
  isLoading = false,
  className = "",
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const inputRef = useRef(null);

  const validateAndHandle = (file) => {
    setErrorMessage(null);
    if (file.size > maxSizeBytes) {
      setErrorMessage(
        `File exceeds ${(maxSizeBytes / (1024 * 1024)).toFixed(0)}MB limit.`,
      );
      return;
    }
    setSelectedFile(file);
    if (onFileSelect) onFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndHandle(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setErrorMessage(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onFileRemove) onFileRemove();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          {label}
        </label>
      )}

      {!selectedFile ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none ${
            dragActive
              ? "border-emerald-600 bg-emerald-50/50"
              : "border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-500 flex items-center justify-center mx-auto mb-2.5 shadow-2xs">
            <UploadCloud size={20} className="text-emerald-700" />
          </div>
          <p className="text-xs font-bold text-slate-800">
            Click to upload or drag & drop inspection/evidence file
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <FileText size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 line-clamp-1">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {formatFileSize(selectedFile.size)} • Ready for verification
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={isLoading}
            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
            title="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
