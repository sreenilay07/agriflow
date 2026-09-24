import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { Button } from "../../components/ui/Button";
import { CounterToggleCard } from "../../components/manager/CounterToggleCard";
import { ApprovalCard } from "../../components/ui/ApprovalCard";
import { ProcurementPricingModal } from "../../components/manager/ProcurementPricingModal";
import { managerApi } from "../../services/api/manager.api";
import { centreApi } from "../../services/api/centre.api";
import { approvalApi } from "../../services/api/approval.api";
import { initSocketClient } from "../../services/socket";
import {
  Sliders,
  Building2,
  UserCheck,
  CheckCircle2,
  Tag,
  Users,
  Scale,
  Clock,
  Layers,
} from "lucide-react";

export const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [counters, setCounters] = useState([]);
  const [crops, setCrops] = useState([]);
  const [pendingOperators, setPendingOperators] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [actionMessage, setActionMessage] = useState("");
  const [showPricingModal, setShowPricingModal] = useState(false);

  const loadData = async () => {
    try {
      const res = await managerApi.getDashboard();
      setDashboardData(res.data);

      const cropRes = await centreApi.getCrops().catch(() => null);
      if (cropRes?.data) {
        setCrops(cropRes.data);
      }

      if (res.data?.centre?._id) {
        const cRes = await centreApi
          .getCounters(res.data.centre._id)
          .catch(() => null);
        setCounters(cRes?.data || []);
      }
    } catch (err) {
      console.warn("Failed to load manager dashboard", err);
    }
  };

  const loadPendingOperators = async () => {
    setIsLoadingApprovals(true);
    try {
      const res = await approvalApi.getPendingCentreOperators();
      if (res.success) setPendingOperators(res.data || []);
    } catch (err) {
      console.warn("Failed to load pending operator approvals");
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  useEffect(() => {
    loadData();
    loadPendingOperators();

    const socket = initSocketClient();
    if (socket) {
      socket.on("queue:updated", () => loadData());
      socket.on("counter:opened", () => loadData());
      socket.on("counter:closed", () => loadData());
      socket.on("pricing.updated", () => loadData());
    }

    return () => {
      if (socket) {
        socket.off("queue:updated");
        socket.off("counter:opened");
        socket.off("counter:closed");
        socket.off("pricing.updated");
      }
    };
  }, []);

  const handleApprove = async (id) => {
    try {
      const res = await approvalApi.approveRequest(
        id,
        "Approved by Centre Manager",
      );
      if (res.success) {
        setActionMessage("Centre Operator approved successfully.");
        loadPendingOperators();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve operator.");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await approvalApi.rejectRequest(id, reason);
      if (res.success) {
        setActionMessage("Centre Operator request rejected.");
        loadPendingOperators();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request.");
    }
  };

  const handleToggleCounter = async (counterId, currentStatus) => {
    try {
      if (currentStatus === "OPEN") {
        await centreApi.closeCounter(counterId);
      } else {
        await centreApi.openCounter(counterId);
      }
      await loadData();
    } catch (err) {
      console.error("Counter toggle failed", err);
    }
  };

  const metrics = dashboardData?.metrics;

  return (
    <AppShell
      title={dashboardData?.centre?.name || "Collection Centre Operations"}
      subtitle={`Centre Code: ${dashboardData?.centre?.code || "CC-01"} • Capacity: ${
        dashboardData?.centre?.capacityPerHour || 2000
      } kg/hr per counter • Operational Workstation`}
      breadcrumbs={[
        { label: "Collection Centre", href: "/manager/dashboard" },
        { label: "Overview" },
      ]}
      actions={
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => setShowPricingModal(true)}
            icon={<Tag size={15} />}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
          >
            Procurement Pricing
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/manager/capacity")}
            icon={<Building2 size={15} />}
            className="text-xs font-bold"
          >
            Capacity
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/manager/counters")}
            icon={<Sliders size={15} />}
            className="text-xs font-bold"
          >
            Staff & Counters
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {actionMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />{" "}
            {actionMessage}
          </div>
        )}

        {/* Operational Metrics Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Farmers Today"
              value={metrics.totalFarmersToday || 0}
              subtitle={`${metrics.waitingFarmers || 0} waiting in queue`}
              icon={Users}
              variant="default"
            />

            <MetricCard
              title="Active Counters"
              value={`${metrics.activeCounters || 0} / ${metrics.totalCounters || 0}`}
              subtitle="Open intake stations"
              icon={Layers}
              variant="emerald"
            />

            <MetricCard
              title="Volume Procured"
              value={`${((metrics.totalQuantityProcessedKG || 0) / 1000).toFixed(1)} T`}
              subtitle={`Expected: ${((metrics.totalQuantityExpectedKG || 0) / 1000).toFixed(1)} T`}
              icon={Scale}
              variant="blue"
            />

            <MetricCard
              title="Avg Processing Time"
              value={`${metrics.avgProcessingTimeMinutes || 15} min`}
              subtitle="Per farmer batch weighment"
              icon={Clock}
              variant="amber"
            />
          </div>
        )}

        {/* Staff / Operator Approval Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="text-emerald-700" size={18} />
              <span>
                Centre Operator Approval Queue ({pendingOperators.length})
              </span>
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={loadPendingOperators}
              className="text-xs font-bold"
            >
              Refresh Queue
            </Button>
          </div>

          {isLoadingApprovals ? (
            <p className="text-xs font-bold text-slate-500 py-2">
              Loading pending Centre Operator requests...
            </p>
          ) : pendingOperators.length === 0 ? (
            <div className="p-5 text-center text-slate-500 text-xs font-semibold bg-white rounded-2xl border border-slate-200">
              No pending Centre Operator registration requests for this centre.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingOperators.map((req) => (
                <ApprovalCard
                  key={req._id}
                  request={req}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>

        {/* Counters Management Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Live Intake Counter Stations
              </h3>
              <p className="text-xs text-slate-500">
                Opening or closing an intake counter station automatically
                recalculates queue wait times.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {counters.map((c) => (
              <CounterToggleCard
                key={c._id}
                counterId={c._id}
                counterNumber={c.counterNumber}
                status={c.status}
                assignedOfficerName={c.assignedOfficerId?.fullName}
                capacityPerHour={c.capacityPerHour}
                onToggle={handleToggleCounter}
              />
            ))}
          </div>
        </div>
      </div>

      {showPricingModal && dashboardData?.centre?._id && (
        <ProcurementPricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          centreId={dashboardData.centre._id}
          crops={crops}
          onPriceUpdated={loadData}
        />
      )}
    </AppShell>
  );
};
