import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { BottomNavigation } from "../../components/layout/BottomNavigation";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TraceabilityTimeline } from "../../components/ui/TraceabilityTimeline";
import { Button } from "../../components/ui/Button";
import { lotApi } from "../../services/api/lot.api";
import {
  ArrowLeft,
  Scale,
  AlertCircle,
  ReceiptText,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const LotDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLot = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const res = await lotApi.getLotById(id);
        setLot(res.data);
      } catch (err) {
        console.error("Failed to load produce lot", err);
        setError("Unable to load produce lot details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLot();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">
              Loading lot traceability record...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!lot || error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <AppHeader />
        <div className="flex-1 p-4 max-w-md mx-auto flex items-center">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3 w-full shadow-2xs">
            <AlertCircle size={36} className="text-rose-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900">
              Produce Lot Not Found
            </h2>
            <p className="text-xs text-slate-500">
              {error || "The requested produce lot does not exist."}
            </p>
            <Button
              onClick={() => navigate("/farmer/lots")}
              className="text-xs font-bold w-full"
            >
              Back to Produce Lots
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Construct structured timeline steps
  const steps = [
    {
      id: "created",
      label: "Lot Harvested",
      status: "COMPLETED",
      timestamp: lot.createdAt,
      description: `Declared ${lot.declaredQuantity} ${lot.unit || "kg"} on ${new Date(lot.createdAt).toLocaleDateString()}`,
    },
    {
      id: "scheduled",
      label: "Slot Booked",
      status: [
        "SCHEDULED",
        "RECEIVED",
        "UNDER_INSPECTION",
        "ACCEPTED",
        "REJECTED",
        "STORED",
        "SETTLED",
      ].includes(lot.status)
        ? "COMPLETED"
        : "PENDING",
      description: lot.bookingId
        ? `Scheduled for Mandi arrival`
        : "Pending schedule",
    },
    {
      id: "received",
      label: "Mandi Weighed",
      status: [
        "RECEIVED",
        "UNDER_INSPECTION",
        "ACCEPTED",
        "REJECTED",
        "STORED",
        "SETTLED",
      ].includes(lot.status)
        ? "COMPLETED"
        : "PENDING",
      description:
        lot.receivedQuantity !== undefined && lot.receivedQuantity !== null
          ? `Gross Intake: ${lot.receivedQuantity} ${lot.unit || "kg"}`
          : "Awaiting weighment",
    },
    {
      id: "quality",
      label: "Quality Inspection",
      status:
        lot.status === "REJECTED"
          ? "REJECTED"
          : ["ACCEPTED", "STORED", "SETTLED"].includes(lot.status)
            ? "COMPLETED"
            : lot.status === "UNDER_INSPECTION"
              ? "ACTIVE"
              : "PENDING",
      description: lot.qualityInspectionId
        ? `Grade ${lot.qualityInspectionId.assignedGrade || "A"} (${lot.acceptedQuantity || 0} kg approved)`
        : "Awaiting inspector evaluation",
    },
    {
      id: "stored",
      label: "Warehouse Stock",
      status: ["STORED", "SETTLED"].includes(lot.status)
        ? "COMPLETED"
        : "PENDING",
      description: lot.warehouseId
        ? `Stored in ${lot.warehouseId.name || "Warehouse WH-01"}`
        : "Pending bay allocation",
    },
    {
      id: "settlement",
      label: "Bank Settlement",
      status: lot.status === "SETTLED" ? "COMPLETED" : "PENDING",
      description: lot.settlementId
        ? `Disbursed ₹${lot.settlementId.netAmount?.toLocaleString()} (${lot.settlementId.paymentStatus})`
        : "Awaiting financial closure",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <AppHeader />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/farmer/lots")}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
            >
              <ArrowLeft size={14} /> Back to Produce Lots
            </button>

            <Link
              to="/farmer/disputes"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <ShieldAlert size={14} /> Raise Grievance / Appeal
            </Link>
          </div>

          {/* Primary Header Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                    {lot.cropId?.name || "Produce Lot"}
                  </span>
                  <StatusBadge status={lot.status} size="sm" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
                  {lot.lotNumber}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Registered on{" "}
                  {new Date(lot.createdAt).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Intake Volume
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900">
                  {lot.declaredQuantity.toLocaleString()} {lot.unit || "kg"}
                </span>
                {lot.acceptedQuantity ? (
                  <span className="block text-xs font-bold text-emerald-700 mt-0.5">
                    Accepted: {lot.acceptedQuantity.toLocaleString()}{" "}
                    {lot.unit || "kg"}
                  </span>
                ) : null}
              </div>
            </div>

            {/* Structured Property Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">
                  Farm Origin
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">
                  {lot.farmId?.farmName || "Default Farm"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">
                  Collection Centre
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">
                  {lot.collectionCentreId?.name || "Assigned Mandi"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">
                  Quality Grade
                </span>
                <span className="font-bold text-emerald-800 mt-0.5 block">
                  {lot.qualityInspectionId?.assignedGrade
                    ? `Grade ${lot.qualityInspectionId.assignedGrade}`
                    : "Pending Evaluation"}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-slate-500 font-medium block">
                  Warehouse Storage
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block truncate">
                  {lot.warehouseId?.name || "Pending Storage"}
                </span>
              </div>
            </div>
          </div>

          {/* Visual End-to-End Traceability Timeline */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Full Produce Lifecycle & Traceability Tracker</span>
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit chain verifying intake, quality grading, storage,
              and financial payout.
            </p>

            <TraceabilityTimeline steps={steps} currentStatus={lot.status} />
          </div>

          {/* Quality & Financial Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quality Certificate Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Scale size={16} className="text-amber-600" />
                  <span>Quality Inspection Certificate</span>
                </h3>
                {lot.qualityInspectionId?.assignedGrade && (
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Grade {lot.qualityInspectionId.assignedGrade}
                  </span>
                )}
              </div>

              {lot.qualityInspectionId ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                    <span className="text-amber-900 font-medium block">
                      Moisture Level
                    </span>
                    <span className="text-lg font-black text-slate-900 mt-0.5 block">
                      {lot.qualityInspectionId.moisturePercentage}%
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-200">
                    <span className="text-amber-900 font-medium block">
                      Quality Score
                    </span>
                    <span className="text-lg font-black text-slate-900 mt-0.5 block">
                      {lot.qualityInspectionId.qualityScore} / 100
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                    <span className="text-emerald-900 font-medium block">
                      Accepted Volume
                    </span>
                    <span className="text-lg font-black text-emerald-800 mt-0.5 block">
                      {lot.acceptedQuantity} {lot.unit || "kg"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-200">
                    <span className="text-rose-900 font-medium block">
                      Rejected Volume
                    </span>
                    <span className="text-lg font-black text-rose-800 mt-0.5 block">
                      {lot.rejectedQuantity || 0} {lot.unit || "kg"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Clock size={24} className="mx-auto mb-2 text-slate-300" />
                  Produce lot has not undergone quality inspection yet.
                </div>
              )}
            </div>

            {/* Financial Settlement Breakdown Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ReceiptText size={16} className="text-emerald-600" />
                  <span>Settlement & Direct Payout</span>
                </h3>
                {lot.settlementId?.paymentStatus && (
                  <StatusBadge
                    status={lot.settlementId.paymentStatus}
                    size="sm"
                  />
                )}
              </div>

              {lot.settlementId ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Approved Quantity:</span>
                    <span className="font-bold text-slate-900">
                      {lot.settlementId.acceptedQuantity ||
                        lot.acceptedQuantity}{" "}
                      {lot.unit || "kg"}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Rate Applied:</span>
                    <span className="font-bold text-slate-900">
                      ₹{lot.settlementId.effectiveRatePerKg || 25}/kg
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Gross Payable:</span>
                    <span className="font-bold text-slate-900">
                      ₹{lot.settlementId.grossAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-rose-700">
                    <span>Statutory / Mandi Deductions:</span>
                    <span className="font-bold">
                      - ₹
                      {lot.settlementId.totalDeductions?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2.5 border-t border-slate-200">
                    <span>Net Disbursed Amount:</span>
                    <span className="text-emerald-700 text-base font-black">
                      ₹{lot.settlementId.netAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ReceiptText
                    size={24}
                    className="mx-auto mb-2 text-slate-300"
                  />
                  Settlement will be automatically generated once produce is
                  quality-cleared and stored.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <BottomNavigation />
    </div>
  );
};
