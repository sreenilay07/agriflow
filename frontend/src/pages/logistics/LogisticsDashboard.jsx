import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { Button } from "../../components/ui/Button";
import { logisticsApi } from "../../services/api/logistics.api";
import {
  Truck,
  Clock,
  CheckCircle2,
  ArrowRight,
  AlertCircle,
  PackageCheck,
  ChevronRight,
  ShieldCheck,
  Users,
} from "lucide-react";

export const LogisticsDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [metricRes, shipmentRes] = await Promise.all([
          logisticsApi.getDashboardMetrics(),
          logisticsApi.getShipments({ limit: 5 }),
        ]);
        setMetrics(metricRes.data);
        setRecentShipments(shipmentRes.data || []);
      } catch (err) {
        console.error("Failed to load logistics metrics", err);
        setError("Unable to load logistics dashboard data.");
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
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck size={13} /> Fleet & Dispatch Control Centre
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Logistics Coordination Hub
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Logistics & Fleet Operations
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Coordinate vehicle fleet, generate digital dispatch manifests,
                log route milestones, and record delivery receipts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/logistics/vehicles">
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
                  icon={<Users size={16} />}
                >
                  Manage Fleet
                </Button>
              </Link>
              <Link to="/logistics/shipments">
                <Button
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm"
                  icon={<Truck size={16} />}
                >
                  All Shipments
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

          {/* KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Ready For Dispatch"
              value={metrics?.readyForDispatch ?? 0}
              subtitle="Loaded at collection bay"
              icon={Clock}
              variant="blue"
              loading={isLoading}
            />

            <MetricCard
              title="In Transit"
              value={metrics?.inTransit ?? 0}
              subtitle="En-route to buyer destination"
              icon={Truck}
              variant="amber"
              loading={isLoading}
            />

            <MetricCard
              title="Delivered Today"
              value={metrics?.deliveredToday ?? 0}
              subtitle="Acknowledged with receipt"
              icon={CheckCircle2}
              variant="emerald"
              loading={isLoading}
            />

            <MetricCard
              title="Active Fleet Vehicles"
              value={metrics?.totalVehicles ?? 0}
              subtitle="Registered transport trucks"
              icon={PackageCheck}
              variant="purple"
              loading={isLoading}
            />
          </div>

          {/* Recent Shipments Manifests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Truck size={16} className="text-purple-700" />
                    <span>Active Dispatches & Shipments</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time status of assigned vehicles and transit manifests
                  </p>
                </div>
                <Link
                  to="/logistics/shipments"
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                >
                  View All Shipments <ArrowRight size={13} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Shipment Number</th>
                      <th className="py-3 px-4">PO Ref</th>
                      <th className="py-3 px-4">Vehicle / Driver</th>
                      <th className="py-3 px-4">Origin Mandi</th>
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentShipments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          No shipments created yet.
                        </td>
                      </tr>
                    ) : (
                      recentShipments.map((s) => (
                        <tr
                          key={s._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {s.shipmentNumber}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-600">
                            {s.purchaseOrder?.poNumber || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-slate-700 font-semibold">
                            {s.vehicle?.vehicleNumber || "Vehicle Assigned"}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {s.driverName || "Driver Assigned"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {s.originWarehouse?.name || "Mandi WH"}
                          </td>
                          <td className="py-3 px-4 text-slate-600 truncate max-w-xs">
                            {s.destinationAddress?.city || "Buyer Facility"},{" "}
                            {s.destinationAddress?.state || ""}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={s.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/logistics/shipments/${s._id}`}
                              className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                            >
                              Details <ChevronRight size={13} />
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
                to="/logistics/shipments"
                className="text-xs font-bold text-purple-700 hover:underline"
              >
                Manage all route manifests & transit updates →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
