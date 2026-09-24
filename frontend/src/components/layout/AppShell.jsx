import React, { useState } from "react";
import { AppHeader } from "./AppHeader";
import { Sidebar } from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import { PageHeader } from "../ui/PageHeader";
import { useAuthStore } from "../../store/useAuthStore";
import { Menu, X } from "lucide-react";

export const AppShell = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  actions,
  maxWidth = "7xl",
  children,
}) => {
  const { user } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case "full":
        return "max-w-none";
      case "6xl":
        return "max-w-6xl";
      default:
        return "max-w-7xl";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Header */}
      <AppHeader />

      {/* Main Layout Area */}
      <div className="flex-1 flex relative">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Mobile Sidebar Drawer Modal */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-72 max-w-[80vw] bg-slate-900 h-full flex flex-col z-10 shadow-2xl">
              <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Agriflow Navigation
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Sidebar mobile />
              </div>
            </div>
          </div>
        )}

        {/* Content Viewport */}
        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto ${
            user?.role === "FARMER" ? "pb-24 md:pb-8" : ""
          }`}
        >
          {/* Mobile Drawer Trigger Bar */}
          <div className="md:hidden mb-4 flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu size={16} className="text-emerald-700" />
              <span>Workspace Menu</span>
            </button>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {user?.role?.replace(/_/g, " ")}
            </span>
          </div>

          <div className={`mx-auto ${getMaxWidthClass()}`}>
            {/* Standard Page Header if title or breadcrumbs are provided */}
            {(title || breadcrumbs || actions) && (
              <PageHeader
                title={title || ""}
                subtitle={subtitle}
                badge={badge}
                breadcrumbs={breadcrumbs}
                actions={actions}
              />
            )}

            {/* Page Body */}
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation for Farmer role */}
      {user?.role === "FARMER" && <BottomNavigation />}
    </div>
  );
};
