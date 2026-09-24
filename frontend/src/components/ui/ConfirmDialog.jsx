import React from "react";
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant,
  isDanger = false,
  isLoading = false,
  children,
}) => {
  const effectiveVariant = variant || (isDanger ? "danger" : "primary");

  const getIcon = () => {
    switch (effectiveVariant) {
      case "danger":
        return <ShieldAlert className="text-rose-600" size={24} />;
      case "warning":
        return <AlertTriangle className="text-amber-600" size={24} />;
      case "info":
        return <Info className="text-blue-600" size={24} />;
      default:
        return <CheckCircle2 className="text-emerald-700" size={24} />;
    }
  };

  const getIconBg = () => {
    switch (effectiveVariant) {
      case "danger":
        return "bg-rose-50 border-rose-200";
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-emerald-50 border-emerald-200";
    }
  };

  const bodyText = message || description;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="flex-1 pt-0.5">
            {bodyText && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {bodyText}
              </p>
            )}
            {children}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={effectiveVariant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export { ConfirmDialog as ConfirmationDialog };
