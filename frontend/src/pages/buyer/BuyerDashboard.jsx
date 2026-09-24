import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { buyerApi } from "../../services/api/buyer.api";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { useAuthStore } from "../../store/useAuthStore";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  Boxes,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  FileSpreadsheet,
  ChevronRight,
  CircleDollarSign,
} from "lucide-react";

export const BuyerDashboard = () => {
  const { user } = useAuthStore();
  const [metrics, setMetrics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [metricRes, orderRes] = await Promise.all([
          buyerApi.getDashboardMetrics(),
          purchaseOrderApi.getPOs({ limit: 5 }),
        ]);
        setMetrics(metricRes.data);
        setRecentOrders(orderRes.data || []);
      } catch (err) {
        console.error("Failed to load buyer dashboard data", err);
        setError("Unable to load your dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AppHeader />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Header Banner */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck size={13} /> Verified Institutional Buyer
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  B2B Procurement Gateway
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {user?.fullName || "Buyer"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Source verified, quality-graded bulk farm produce with complete
                supply chain traceability.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/buyer/marketplace">
                <Button
                  icon={<ShoppingBag size={16} />}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm"
                >
                  Browse Marketplace
                </Button>
              </Link>
              <Link to="/buyer/orders">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                  icon={<FileSpreadsheet size={16} />}
                >
                  My Purchase Orders
                </Button>
              </Link>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* KPI Summary Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Active Purchase Orders"
              value={metrics?.activeOrders ?? 0}
              subtitle="Under review & allocation"
              icon={Clock}
              variant="blue"
              loading={isLoading}
            />

            <MetricCard
              title="Shipments In Transit"
              value={metrics?.inTransitOrders ?? 0}
              subtitle="Dispatched from Mandi"
              icon={Truck}
              variant="amber"
              loading={isLoading}
            />

            <MetricCard
              title="Completed Orders"
              value={metrics?.completedOrders ?? 0}
              subtitle="Fulfilled & verified"
              icon={CheckCircle2}
              variant="emerald"
              loading={isLoading}
            />

            <MetricCard
              title="Procurement Value"
              value={`₹${(metrics?.totalProcurementValue || 0).toLocaleString()}`}
              subtitle={`${((metrics?.totalQuantityKg || 0) / 1000).toFixed(1)} Tonnes procured`}
              icon={CircleDollarSign}
              variant="purple"
              loading={isLoading}
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Purchase Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
              <div>
                <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Boxes size={16} className="text-emerald-700" />
                      <span>Recent Purchase Orders</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track PO allocations, dispatch manifests, and deliveries
                    </p>
                  </div>
                  <Link
                    to="/buyer/orders"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    View All Orders <ArrowRight size={13} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 px-4">PO Number</th>
                        <th className="py-3 px-4">Produce</th>
                        <th className="py-3 px-4">Quantity</th>
                        <th className="py-3 px-4">Total Value</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            No purchase orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map((po) => (
                          <tr
                            key={po._id}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            <td className="py-3 px-4 font-mono font-bold text-slate-900">
                              {po.poNumber}
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {po.items?.[0]?.crop?.name || "Produce"}{" "}
                              {po.items?.length > 1
                                ? `+${po.items.length - 1} more`
                                : ""}
                            </td>
                            <td className="py-3 px-4 text-slate-700 font-bold">
                              {po.totalQuantityKg.toLocaleString()} kg
                            </td>
                            <td className="py-3 px-4 font-bold text-emerald-700">
                              ₹{po.totalValue.toLocaleString()}
                            </td>
                            <td className="py-3 px-4">
                              <StatusBadge status={po.status} size="sm" />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link
                                to={`/buyer/orders/${po._id}`}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
                              >
                                View <ChevronRight size={13} />
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-right">
                <Link
                  to="/buyer/marketplace"
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  + Create a new purchase order
                </Link>
              </div>
            </div>

            {/* Right 1 Col: Traceability & Assurance Card */}
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 border border-emerald-800/40 shadow-md">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-black mb-4">
                  🌾
                </div>
                <h3 className="text-base font-black text-white">
                  Direct Farm Traceability
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Every lot in the Mandi Mithra marketplace is batch-tested for
                  moisture, foreign matter, and graded (Grade A/B) at accredited
                  Mandi Collection Centres with guaranteed electronic
                  weighbridge slips.
                </p>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-slate-200">
                      100% Quality Inspected
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-slate-200">
                      Multi-Lot Smart Reservation
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-400 shrink-0"
                    />
                    <span className="text-slate-200">
                      Integrated Fleet Dispatch
                    </span>
                  </div>
                </div>

                <Link to="/buyer/marketplace" className="mt-6 block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md">
                    Explore Live Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
