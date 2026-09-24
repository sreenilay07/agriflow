import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Globe, LogOut, ShieldCheck, Radio } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useLanguageStore } from "../../store/useLanguageStore";
import { GlobalSearch } from "../ui/GlobalSearch";
import { NotificationCenter } from "../notifications/NotificationCenter";

export const AppHeader = ({ showLanguageSelector = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { language, openLanguageModal } = useLanguageStore();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getLanguageLabel = (lang) => {
    if (lang === "te") return "తెలుగు";
    if (lang === "hi") return "हिन्दी";
    return "English";
  };

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case "FARMER":
        return "bg-emerald-800/80 text-emerald-200 border-emerald-600/50";
      case "BUYER":
        return "bg-indigo-800/80 text-indigo-200 border-indigo-600/50";
      case "LOGISTICS_COORDINATOR":
        return "bg-purple-800/80 text-purple-200 border-purple-600/50";
      case "SUPER_ADMIN":
        return "bg-rose-800/80 text-rose-200 border-rose-600/50";
      default:
        return "bg-amber-800/80 text-amber-200 border-amber-600/50";
    }
  };

  return (
    <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-xs select-none">
      {/* Top Enterprise Banner */}
      <div className="bg-slate-900/90 text-slate-400 text-[11px] px-4 py-1 flex items-center justify-between border-b border-slate-800/70">
        <div className="flex items-center space-x-2">
          <ShieldCheck size={13} className="text-emerald-400 shrink-0" />
          <span className="font-semibold tracking-wide">
            Agriflow • Saath Kisan Ka, Har Kadam Par
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Socket.IO Realtime Indicator */}
          <div className="hidden sm:flex items-center space-x-1 text-emerald-400 font-bold">
            <Radio size={12} className="animate-pulse" />
            <span className="text-[10px] tracking-wider uppercase">
              Live Operations
            </span>
          </div>

          {showLanguageSelector && (
            <button
              onClick={openLanguageModal}
              className="flex items-center space-x-1 text-slate-300 hover:text-emerald-400 font-medium cursor-pointer transition-colors"
            >
              <Globe size={12} className="text-slate-400" />
              <span>{getLanguageLabel(language)}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-4 py-2.5 max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Identity */}
        <Link to="/" className="flex items-center space-x-3 group">
          <img
            src="/logo.png"
            alt="Agriflow Logo"
            className="w-9 h-9 rounded-lg object-contain bg-white/10"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-emerald-300 transition-colors">
                Agriflow
              </span>
              {user?.role && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider border ${getRoleBadgeStyle(
                    user.role,
                  )}`}
                >
                  {user.role.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-300 font-medium -mt-0.5">
              Farm Produce Procurement & Supply Chain
            </p>
          </div>
        </Link>

        {/* User Workspace Actions */}
        <div className="flex items-center space-x-2.5">
          {user && (
            <>
              {/* Global Entity Search */}
              <GlobalSearch />

              {/* Realtime Notification Center */}
              <NotificationCenter />

              {/* User Profile Pill */}
              <div className="hidden sm:flex items-center pl-3 border-l border-slate-800 text-left">
                <div className="mr-2.5">
                  <p className="text-xs font-bold text-white line-clamp-1">
                    {user.fullName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {user.phoneNumber || user.email}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-900/40 cursor-pointer transition-colors"
                title="Sign Out"
              >
                <LogOut size={17} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
