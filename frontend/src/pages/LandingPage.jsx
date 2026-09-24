import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useLanguageStore } from "../store/useLanguageStore";
import { useTranslation } from "../locales/translations";
import {
  ShieldCheck,
  Globe,
  ArrowRight,
  ChevronRight,
  Sprout,
  Building2,
  Scale,
  Warehouse,
  ShoppingBag,
  Truck,
  FileCheck,
  Receipt,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
  Bell,
  CheckCircle2,
} from "lucide-react";

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const getDashboardRoute = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "FARMER":
        return "/farmer/dashboard";
      case "QUALITY_INSPECTOR":
        return "/quality/dashboard";
      case "CENTER_OPERATOR":
      case "PROCUREMENT_OFFICER":
        return "/officer/dashboard";
      case "CENTER_MANAGER":
      case "CENTRE_MANAGER":
      case "COLLECTION_CENTRE_MANAGER":
        return "/manager/dashboard";
      case "BUYER":
        return "/buyer/dashboard";
      case "LOGISTICS_COORDINATOR":
        return "/logistics/dashboard";
      case "DISTRICT_ADMIN":
      case "DISTRICT_OFFICER":
        return "/district/dashboard";
      case "SUPER_ADMIN":
      case "PLATFORM_ADMIN":
        return "/admin/dashboard";
      default:
        return "/farmer/dashboard";
    }
  };

  const lifecycleSteps = [
    {
      num: "01",
      title: "Farm",
      desc: "Farmer registers plot acreage, crop variety, and declares harvest quantity.",
      icon: Sprout,
    },
    {
      num: "02",
      title: "Collection",
      desc: "Lot received at centre with weighbridge verification and intake logging.",
      icon: Building2,
    },
    {
      num: "03",
      title: "Quality",
      desc: "Moisture, impurities, and damage measured. Official grade (A/B/C) assigned.",
      icon: Scale,
    },
    {
      num: "04",
      title: "Warehouse",
      desc: "Accepted lots binned into structured storage with real-time stock ledgers.",
      icon: Warehouse,
    },
    {
      num: "05",
      title: "Buyer",
      desc: "Institutional buyers discover verified lots and issue authoritative POs.",
      icon: ShoppingBag,
    },
    {
      num: "06",
      title: "Logistics",
      desc: "Fleet vehicles and drivers dispatched with digital transport manifests.",
      icon: Truck,
    },
    {
      num: "07",
      title: "Delivery",
      desc: "Buyer confirms delivery condition, received weight, and logs discrepancies.",
      icon: FileCheck,
    },
    {
      num: "08",
      title: "Settlement",
      desc: "Server-authoritative calculation: accepted qty × agreed rate - deductions.",
      icon: Receipt,
    },
  ];

  const roleWorkspaces = [
    {
      role: "Farmers",
      desc: "Declare harvested produce lots, view quality test scorecards, track procurement status, and review settlement breakdowns.",
      icon: Sprout,
      points: [
        "Produce Lot Registration",
        "Quality Scorecards",
        "Procurement Orders",
        "Transparent Settlements",
      ],
    },
    {
      role: "Quality Inspectors",
      desc: "Dedicated inspection workstation to evaluate physical parameters, calculate quality scores, assign grades, and record rationale.",
      icon: Scale,
      points: [
        "Moisture & Purity Testing",
        "Grading Criteria Evaluation",
        "Defect Assessment",
        "Official Grade Slips",
      ],
    },
    {
      role: "Collection Centre Managers",
      desc: "Supervise daily produce arrivals, monitor warehouse capacity utilization, allocate inventory, and manage counter staff.",
      icon: Building2,
      points: [
        "Weighbridge Intake",
        "Capacity Management",
        "Stock Ledgers",
        "Dispatch Authorization",
      ],
    },
    {
      role: "Institutional Buyers",
      desc: "Discover verified agricultural lots by grade and origin, issue Purchase Orders, track allocation, and confirm dispatches.",
      icon: ShoppingBag,
      points: [
        "Verified Marketplace",
        "Purchase Order Workflow",
        "Lot Traceability",
        "Delivery Verification",
      ],
    },
    {
      role: "Logistics Coordinators",
      desc: "Organize transport operations, register fleet vehicles, generate electronic manifests, and log transit milestones.",
      icon: Truck,
      points: [
        "Vehicle Registry",
        "Dispatch Manifests",
        "Operational Milestones",
        "Delivery Receipts",
      ],
    },
    {
      role: "Platform Administrators",
      desc: "Govern multi-tenant organizations, regional hierarchies, crop categories, quality thresholds, and inspect security audit logs.",
      icon: ShieldCheck,
      points: [
        "Organization Governance",
        "Regional Hierarchies",
        "Produce Categories",
        "System Configuration",
      ],
    },
  ];

  const coreCapabilities = [
    {
      title: "Farm Management",
      desc: "Digitally map farm plots, acreage, soil types, and active cultivation cycles.",
      icon: Sprout,
    },
    {
      title: "Produce Lots",
      desc: "Full lifecycle tracking from declaration to final settlement with strict state machine validation.",
      icon: Layers,
    },
    {
      title: "Quality Inspection",
      desc: "Standardized laboratory inspection covering moisture %, foreign matter %, and grain damage.",
      icon: Scale,
    },
    {
      title: "Warehouse Inventory",
      desc: "Bin-level inventory ledgers, reservation tracking, and capacity headroom alerts.",
      icon: Warehouse,
    },
    {
      title: "B2B Procurement",
      desc: "Catalog of verified produce lots with verified grading criteria and indicative pricing.",
      icon: ShoppingBag,
    },
    {
      title: "Purchase Orders",
      desc: "Multi-item purchase orders with approval workflows, line item allocations, and status tracking.",
      icon: FileSpreadsheet,
    },
    {
      title: "Lot Allocation",
      desc: "Deterministic multi-lot reservation allocating warehouse stock to confirmed purchase orders.",
      icon: Layers,
    },
    {
      title: "Logistics & Manifests",
      desc: "Fleet registry, driver assignment, digital gate passes, and milestone tracking.",
      icon: Truck,
    },
    {
      title: "Delivery Confirmation",
      desc: "Formal receiving inspection with discrepancy reporting and electronic acknowledgement.",
      icon: FileCheck,
    },
    {
      title: "Settlement Calculations",
      desc: "Server-authoritative calculation: accepted quantity × agreed rate + adjustments - deductions.",
      icon: Receipt,
    },
    {
      title: "Disputes & Appeals",
      desc: "Multi-reference dispute management allowing farmers and buyers to resolve discrepancies.",
      icon: AlertTriangle,
    },
    {
      title: "Realtime Notifications",
      desc: "Instant system and operational alerts across lot transitions, quality checks, and dispatches.",
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-emerald-700 selection:text-white">
      {/* Top Banner */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-slate-300">
              Agriflow Enterprise Platform • Saath Kisan Ka, Har Kadam Par
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <Globe className="w-3 h-3 text-slate-400 ml-1.5 mr-1" />
              {["en", "te", "hi"].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-0.5 font-bold rounded text-[11px] transition-all ${
                    language === lang
                      ? "bg-emerald-700 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lang === "en" ? "EN" : lang === "te" ? "తెలుగు" : "हिन्दी"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Agriflow Logo"
              className="w-10 h-10 object-contain rounded-lg bg-white/10"
            />
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Agriflow
              </span>
              <span className="text-[11px] text-slate-400 block font-normal -mt-0.5">
                Saath Kisan Ka, Har Kadam Par
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a
              href="#lifecycle"
              className="hover:text-emerald-400 transition-colors"
            >
              Procurement Lifecycle
            </a>
            <a
              href="#workspaces"
              className="hover:text-emerald-400 transition-colors"
            >
              Role Workspaces
            </a>
            <a
              href="#capabilities"
              className="hover:text-emerald-400 transition-colors"
            >
              Capabilities
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate(getDashboardRoute())}
                className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Operational Workspace</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <span>Register</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-20 border-b border-slate-800 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
            <span>Verified Digital Procurement Workflow</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            From Farm to Buyer, One Connected Supply Chain.
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Agriflow connects farmers, collection centres, quality teams,
            warehouses, buyers and logistics operations through one traceable
            procurement workflow.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={isAuthenticated ? getDashboardRoute() : "/login"}
              className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-all"
            >
              <span>
                {isAuthenticated
                  ? "Go to Operational Workspace"
                  : "Sign In to Portal"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/register"
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs px-5 py-3 rounded-lg transition-all"
            >
              Register New Organization / User
            </Link>
          </div>

          {/* Connected Supply Chain Lifecycle Strip */}
          <div id="lifecycle" className="pt-12 max-w-6xl mx-auto text-left">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                  The End-to-End Agriflow Lifecycle
                </span>
                <span className="text-[11px] text-emerald-400 font-mono font-medium">
                  State-Machine Governed
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {lifecycleSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.num}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-slate-400 mb-2">
                          <span className="font-mono text-[10px] font-bold text-emerald-400">
                            {step.num}
                          </span>
                          <Icon size={16} className="text-slate-300" />
                        </div>
                        <p className="font-bold text-white text-xs">
                          {step.title}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Workspaces Section */}
      <section
        id="workspaces"
        className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Role-Scoped Operational Workspaces
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-normal">
            Every participant accesses a purpose-built workstation tailored to
            their operational responsibilities with organization- and
            region-scoped access control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roleWorkspaces.map((ws, idx) => {
            const Icon = ws.icon;
            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {ws.role}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {ws.desc}
                  </p>
                  <div className="space-y-1.5 pt-2 border-t border-slate-900">
                    {ws.points.map((pt, pIdx) => (
                      <div
                        key={pIdx}
                        className="flex items-center gap-2 text-[11px] text-slate-300"
                      >
                        <CheckCircle2
                          size={13}
                          className="text-emerald-500 shrink-0"
                        />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comprehensive Capabilities Section */}
      <section
        id="capabilities"
        className="py-16 bg-slate-950/70 border-t border-b border-slate-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Platform Domain Capabilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Fully implemented backend services and web workstations supporting
              every phase of agricultural supply chain execution.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {coreCapabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2 text-emerald-400">
                      <Icon size={17} />
                      <h4 className="text-xs font-bold text-white">
                        {cap.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {cap.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Agriflow Logo"
              className="w-8 h-8 object-contain rounded bg-white/10"
            />
            <div>
              <span className="font-bold text-slate-200">
                Agriflow Platform
              </span>
              <p className="text-[11px] text-slate-500">
                Saath Kisan Ka, Har Kadam Par
              </p>
            </div>
          </div>
          <div className="text-center md:text-right text-[11px] text-slate-500">
            <p>
              © {new Date().getFullYear()} Agriflow Enterprise. All rights
              reserved.
            </p>
            <p className="mt-0.5">
              Region- and Organization-Scoped Agricultural Supply Chain Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
