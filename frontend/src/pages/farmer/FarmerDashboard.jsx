import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TraceabilityTimeline } from "../../components/ui/TraceabilityTimeline";
import { Button } from "../../components/ui/Button";
import { farmerApi } from "../../services/api/farmer.api";
import { lotApi } from "../../services/api/lot.api";
import { settlementApi } from "../../services/api/settlement.api";
import { useAuthStore } from "../../store/useAuthStore";
import { initSocketClient } from "../../services/socket";
import { useTranslation } from "../../locales/translations";
import {
  Sprout,
  Boxes,
  Scale,
  CreditCard,
  CalendarPlus,
  PlusCircle,
  QrCode,
  ArrowRight,
  Clock,
  Building2,
  ReceiptText,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const [queueData, setQueueData] = useState(null);
  const [lots, setLots] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [qRes, lotsRes, setRes] = await Promise.allSettled([
        farmerApi.getQueueDetails(),
        lotApi.getFarmerLots(),
        settlementApi.getFarmerSettlements(),
      ]);

      if (qRes.status === "fulfilled" && qRes.value?.data) {
        setQueueData(qRes.value.data);
      }
      if (lotsRes.status === "fulfilled" && lotsRes.value?.data) {
        setLots(lotsRes.value.data);
      }
      if (setRes.status === "fulfilled" && setRes.value?.data) {
        setSettlements(setRes.value.data);
      }
    } catch (err) {
      console.error("Failed to load farmer dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const socket = initSocketClient();
    if (socket) {
      socket.on("queue:updated", () => fetchData());
      socket.on("stage:completed", () => fetchData());
      socket.on("procurement:completed", () => fetchData());
      socket.on("lot:status_changed", () => fetchData());
      socket.on("settlement:created", () => fetchData());
    }

    return () => {
      if (socket) {
        socket.off("queue:updated");
        socket.off("stage:completed");
        socket.off("procurement:completed");
        socket.off("lot:status_changed");
        socket.off("settlement:created");
      }
    };
  }, []);

  // Compute KPI metrics
  const activeLots = lots.filter(
    (l) => !["SETTLED", "CANCELLED"].includes(l.status),
  );
  const acceptedKg = lots.reduce(
    (acc, l) => acc + (l.acceptedQuantity || 0),
    0,
  );
  const pendingSettlementAmount = settlements
    .filter((s) => s.paymentStatus !== "PAID")
    .reduce((acc, s) => acc + (s.netAmount || 0), 0);
  const totalPaidAmount = settlements
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((acc, s) => acc + (s.netAmount || 0), 0);

  // Determine Priority Next Action
  const getNextAction = () => {
    if (queueData?.hasActiveToken) {
      return {
        title: `Active Queue Token #${queueData.myToken.tokenNumber}`,
        desc: `You are in line at ${queueData.centre?.name || "Mandi Yard"}. Current position: #${queueData.queuePosition}. Estimated wait: ${queueData.estimatedWaitTimeMinutes || 10} mins.`,
        cta: "View Live Queue Token",
        link: "/farmer/queue",
        icon: QrCode,
        variant: "warning",
      };
    }

    const unscheduledLot = lots.find((l) => l.status === "CREATED");
    if (unscheduledLot) {
      return {
        title: `Produce Lot ${unscheduledLot.lotNumber} Ready for Scheduling`,
        desc: `Your declared lot of ${unscheduledLot.declaredQuantity} ${unscheduledLot.unit || "kg"} (${unscheduledLot.cropId?.name}) needs a booked arrival slot at your nearest collection centre.`,
        cta: "Book Intake Slot Now",
        link: "/farmer/book",
        icon: CalendarPlus,
        variant: "info",
      };
    }

    const inspectedLot = lots.find((l) => l.status === "ACCEPTED");
    if (inspectedLot) {
      return {
        title: `Quality Inspection Completed for ${inspectedLot.lotNumber}`,
        desc: `Your produce was graded and stored. Review lab test metrics, moisture analysis, and warehouse allocation.`,
        cta: "View Inspection Certificate",
        link: `/farmer/lots/${inspectedLot._id}`,
        icon: Scale,
        variant: "success",
      };
    }

    if (pendingSettlementAmount > 0) {
      return {
        title: `Pending Payout of ₹${pendingSettlementAmount.toLocaleString()}`,
        desc: `Bank transfer verification in progress for your recently procured produce batches.`,
        cta: "View Settlement Statements",
        link: "/farmer/settlements",
        icon: ReceiptText,
        variant: "success",
      };
    }

    return {
      title: "Ready for Your Next Harvest",
      desc: "Create a new produce lot to record acreage harvest data, generate lot numbers, and schedule Mandi intake.",
      cta: "Register New Produce Lot",
      link: "/farmer/lots/new",
      icon: PlusCircle,
      variant: "default",
    };
  };

  const nextAction = getNextAction();

  // Supply chain lifecycle journey steps
  const journeySteps = [
    {
      id: "created",
      label: "Harvest Lot",
      status: lots.length > 0 ? "COMPLETED" : "ACTIVE",
      description: "Digital lot creation",
    },
    {
      id: "scheduled",
      label: "Slot Booking",
      status: queueData?.hasActiveToken ? "COMPLETED" : "PENDING",
      description: "Scheduled Mandi arrival",
    },
    {
      id: "received",
      label: "Mandi Intake",
      status: lots.some((l) =>
        [
          "RECEIVED",
          "UNDER_INSPECTION",
          "ACCEPTED",
          "STORED",
          "SETTLED",
        ].includes(l.status),
      )
        ? "COMPLETED"
        : "PENDING",
      description: "Gross tare weighment & QR",
    },
    {
      id: "quality",
      label: "Quality Grading",
      status: lots.some((l) =>
        ["ACCEPTED", "STORED", "SETTLED"].includes(l.status),
      )
        ? "COMPLETED"
        : "PENDING",
      description: "Moisture, purity & Grade A/B",
    },
    {
      id: "stored",
      label: "Warehouse Bin",
      status: lots.some((l) => ["STORED", "SETTLED"].includes(l.status))
        ? "COMPLETED"
        : "PENDING",
      description: "Barcoded digital storage",
    },
    {
      id: "allocated",
      label: "B2B Allocation",
      status: lots.some((l) => l.status === "SETTLED")
        ? "COMPLETED"
        : "PENDING",
      description: "Matched to Purchase Order",
    },
    {
      id: "settlement",
      label: "Bank Settlement",
      status: lots.some((l) => l.status === "SETTLED")
        ? "COMPLETED"
        : "PENDING",
      description: "Direct DBT bank payout",
    },
  ];

  return (
    <AppShell
      title={`Welcome back, ${user?.fullName || "Farmer"}`}
      subtitle="Operational hub for farm produce registration, lab inspection verification, warehouse storage, and bank payouts."
      badge={
        <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
          <ShieldCheck size={13} /> Verified Producer
        </span>
      }
      actions={
        <div className="flex items-center gap-2 flex-wrap">
          <Link to="/farmer/lots/new">
            <Button
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
              icon={<PlusCircle size={15} />}
            >
              Register Produce Lot
            </Button>
          </Link>
          <Link to="/farmer/book">
            <Button
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              icon={<CalendarPlus size={15} />}
            >
              {t("bookSlot")}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Next Action Priority Banner */}
        <div
          className={`p-5 sm:p-6 rounded-2xl border transition-all shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            nextAction.variant === "warning"
              ? "bg-amber-500/10 border-amber-300/80 text-amber-950"
              : nextAction.variant === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`p-3 rounded-xl border shrink-0 ${
                nextAction.variant === "warning"
                  ? "bg-amber-500 text-slate-950 border-amber-400"
                  : "bg-emerald-800 text-white border-emerald-700"
              }`}
            >
              <nextAction.icon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white">
                  Next Operational Action
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-1">
                {nextAction.title}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5 max-w-2xl leading-relaxed">
                {nextAction.desc}
              </p>
            </div>
          </div>

          <Link to={nextAction.link} className="shrink-0">
            <Button
              size="sm"
              className={
                nextAction.variant === "warning"
                  ? "bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs"
                  : "bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
              }
              icon={<ArrowRight size={14} />}
            >
              {nextAction.cta}
            </Button>
          </Link>
        </div>

        {/* Operational KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Produce Lots"
            value={activeLots.length}
            subtitle="In procurement pipeline"
            icon={Boxes}
            variant="emerald"
            loading={isLoading}
          />

          <MetricCard
            title="Accepted Volume"
            value={`${acceptedKg.toLocaleString()} kg`}
            subtitle="Quality approved produce"
            icon={Scale}
            variant="blue"
            loading={isLoading}
          />

          <MetricCard
            title="Pending Settlement"
            value={`₹${pendingSettlementAmount.toLocaleString()}`}
            subtitle="Under bank verification"
            icon={Clock}
            variant="amber"
            loading={isLoading}
          />

          <MetricCard
            title="Disbursed Payouts"
            value={`₹${totalPaidAmount.toLocaleString()}`}
            subtitle="Credited to bank account"
            icon={CreditCard}
            variant="emerald"
            loading={isLoading}
          />
        </div>

        {/* The Produce Journey Lifecycle Visualizer */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Sprout size={18} className="text-emerald-700" />
                <span>The Agriflow Produce Journey</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit-tracked lifecycle connecting your harvest directly to lab
                grading, warehouse binning, and B2B settlements.
              </p>
            </div>
          </div>

          <TraceabilityTimeline steps={journeySteps} />
        </div>

        {/* Active Lots & Quick Action Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Active Lots (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col justify-between">
            <div>
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Recent Produce Lots
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track current status and quality inspection outcomes
                  </p>
                </div>
                <Link
                  to="/farmer/lots"
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1"
                >
                  View All Lots <ArrowRight size={13} />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Lot ID</th>
                      <th className="py-3 px-4">Produce</th>
                      <th className="py-3 px-4">Volume</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {lots.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-slate-400 text-xs"
                        >
                          No produce lots registered yet.
                        </td>
                      </tr>
                    ) : (
                      lots.slice(0, 5).map((lot) => (
                        <tr
                          key={lot._id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {lot.lotNumber}
                          </td>
                          <td className="py-3 px-4 text-slate-800 font-bold">
                            {lot.cropId?.name || "Produce"}
                          </td>
                          <td className="py-3 px-4 text-slate-700">
                            {lot.declaredQuantity} {lot.unit || "kg"}
                          </td>
                          <td className="py-3 px-4">
                            <StatusBadge status={lot.status} size="sm" />
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              to={`/farmer/lots/${lot._id}`}
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-0.5"
                            >
                              <span>Inspect</span>
                              <ChevronRight size={14} />
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
                to="/farmer/lots/new"
                className="text-xs font-bold text-emerald-800 hover:underline"
              >
                + Register another produce lot
              </Link>
            </div>
          </div>

          {/* Farmer Quick Services Hub (1 Col) */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                <span>Producer Operations Hub</span>
              </h3>

              <div className="space-y-2">
                <button
                  onClick={() => navigate("/farmer/farms")}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500/50 bg-slate-50 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                        My Farm Plots
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Acreage, survey numbers & crops
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 group-hover:text-emerald-700"
                  />
                </button>

                <button
                  onClick={() => navigate("/farmer/purchase-orders")}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500/50 bg-slate-50 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                        Procurement Records
                      </p>
                      <p className="text-[10px] text-slate-500">
                        B2B purchase order allocations
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 group-hover:text-blue-700"
                  />
                </button>

                <button
                  onClick={() => navigate("/farmer/settlements")}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-emerald-500/50 bg-slate-50 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                      <ReceiptText size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900">
                        Settlements & Payouts
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Bank transfer advice & invoices
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 group-hover:text-amber-700"
                  />
                </button>

                <button
                  onClick={() => navigate("/farmer/disputes")}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-rose-500/50 bg-slate-50 hover:bg-rose-50/40 text-left transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-rose-100 text-rose-800">
                      <AlertTriangle size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-rose-900">
                        Disputes & Appeals
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Quality reinspection requests
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={14}
                    className="text-slate-400 group-hover:text-rose-700"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
