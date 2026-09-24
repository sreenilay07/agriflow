import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { lotApi } from "../../services/api/lot.api";
import { qualityApi } from "../../services/api/quality.api";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";

export const QualityDashboard = () => {
  const navigate = useNavigate();
  const [queueLots, setQueueLots] = useState([]);
  const [recentInspections, setRecentInspections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [lotsRes, inspRes] = await Promise.all([
          lotApi.getLots({ status: "RECEIVED" }),
          qualityApi.listInspections(),
        ]);
        setQueueLots(lotsRes.data || []);
        setRecentInspections(inspRes.data || []);
      } catch (err) {
        console.error("Failed to load quality dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalInspected = recentInspections.length;
  const gradeACount = recentInspections.filter(
    (i) => i.assignedGrade === "GRADE_A",
  ).length;
  const rejectedCount = recentInspections.filter(
    (i) =>
      i.assignedGrade === "REJECTED" ||
      (i.rejectedQuantity && i.rejectedQuantity > 0),
  ).length;

  return (
    <AppShell
      title="Quality Assessment Workstation"
      subtitle="Scientific laboratory grading, physical parameter moisture analysis, and verified mandi lot quality certification."
      breadcrumbs={[
        { label: "Quality", href: "/quality/dashboard" },
        { label: "Inspection Queue" },
      ]}
      actions={
        <Button
          onClick={() => navigate("/quality/inspections")}
          className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
          icon={<Layers size={14} />}
        >
          View Full Inspection Records ({totalInspected})
        </Button>
      }
    >
      <div className="space-y-6">
        {/* KPI Cards Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Awaiting Inspection"
            value={queueLots.length}
            subtitle="Lots received at gate"
            icon={Clock}
            variant="amber"
            loading={loading}
          />

          <MetricCard
            title="Total Appraised"
            value={totalInspected}
            subtitle="Verified appraisals on record"
            icon={CheckCircle2}
            variant="emerald"
            loading={loading}
          />

          <MetricCard
            title="Grade A Yield"
            value={gradeACount}
            subtitle={
              totalInspected
                ? `${Math.round((gradeACount / totalInspected) * 100)}% of total lots`
                : "0% yield"
            }
            icon={Award}
            variant="blue"
            loading={loading}
          />

          <MetricCard
            title="Rejections / Defective"
            value={rejectedCount}
            subtitle="Sub-standard or high moisture"
            icon={AlertTriangle}
            variant="amber"
            loading={loading}
          />
        </div>

        {/* Main Operational Workstation Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Immediate Queue */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-amber-600" />
                <span>Immediate Lab Inspection Queue</span>
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                Sorted by gate arrival sequence
              </span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 animate-pulse">
                Loading gate intake queue...
              </div>
            ) : queueLots.length > 0 ? (
              <div className="space-y-3">
                {queueLots.map((lot) => (
                  <div
                    key={lot._id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-emerald-600/50 shadow-2xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">
                          {lot.lotNumber}
                        </span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          GATE RECEIVED
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Produce:{" "}
                        <strong className="text-slate-900">
                          {lot.cropId?.name || "Produce"}
                        </strong>{" "}
                        • Farmer:{" "}
                        <strong className="text-slate-900">
                          {lot.farmerId?.fullName || "Farmer"}
                        </strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Net Weighed Volume:{" "}
                        <span className="font-mono font-bold text-slate-900">
                          {(
                            lot.receivedQuantity || lot.declaredQuantity
                          )?.toLocaleString()}{" "}
                          kg
                        </span>
                      </p>
                    </div>

                    <Button
                      onClick={() =>
                        navigate(`/quality/inspections/${lot._id}`)
                      }
                      className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 shadow-2xs"
                      icon={<ArrowRight size={14} />}
                    >
                      Conduct Inspection
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ClipboardCheck size={24} className="text-slate-400" />}
                title="Inspection Queue Clear"
                description="All currently received produce lots at the mandi gate have been graded and transferred to warehouse bays."
              />
            )}
          </div>

          {/* Right 1 Col: Quality Standards & Reference Guide */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-700" />
              <span>Prescribed Quality Standards</span>
            </h3>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3">
                <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs">
                  <Award size={14} /> Grade A (Premium Export)
                </span>
                <p className="text-slate-500 mt-1">
                  Moisture ≤ 12%, Foreign matter &lt; 1%, Defective grains &lt;
                  2%. Eligible for top mandi rate.
                </p>
              </div>

              <div className="border-b border-slate-100 pb-3">
                <span className="font-bold text-blue-800 flex items-center gap-1.5 text-xs">
                  <CheckCircle2 size={14} /> Grade B (Standard B2B)
                </span>
                <p className="text-slate-500 mt-1">
                  Moisture 12% - 14%, Foreign matter &lt; 3%, Minor
                  discoloration. Baseline MSP pricing.
                </p>
              </div>

              <div>
                <span className="font-bold text-rose-800 flex items-center gap-1.5 text-xs">
                  <AlertTriangle size={14} /> Grade C / Rejection
                </span>
                <p className="text-slate-500 mt-1">
                  Moisture &gt; 14%, Pest damage or high foreign matter. Subject
                  to price discount or rejection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
