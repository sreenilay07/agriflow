import React, { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { settlementApi } from "../../services/api/settlement.api";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { ReceiptText, CheckCircle2, Clock, Landmark } from "lucide-react";

export const FarmerSettlementsPage = () => {
  const [settlements, setSettlements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSettlements = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await settlementApi.getFarmerSettlements();
      setSettlements(res.data || []);
    } catch (err) {
      console.error("Failed to load settlements", err);
      setError(
        "Unable to load settlement statements. Please check your network connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
  }, []);

  const totalPaid = settlements
    .filter((s) => s.paymentStatus === "PAID")
    .reduce((acc, s) => acc + (s.netAmount || 0), 0);

  const totalPending = settlements
    .filter((s) => s.paymentStatus !== "PAID")
    .reduce((acc, s) => acc + (s.netAmount || 0), 0);

  return (
    <AppShell
      title="Settlements & Payouts"
      subtitle="View server-verified financial breakdowns, agreed mandi rates, deductions, and DBT bank account disbursements."
      breadcrumbs={[
        { label: "Farmer", href: "/farmer/dashboard" },
        { label: "Settlements" },
      ]}
      actions={
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Realized
            </span>
            <span className="text-sm font-black text-emerald-800">
              ₹{totalPaid.toLocaleString()}
            </span>
          </div>
          {totalPending > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-2xs text-right">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                Pending Verification
              </span>
              <span className="text-sm font-black text-amber-900">
                ₹{totalPending.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={fetchSettlements} />}

        {!error && !isLoading && settlements.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={24} className="text-slate-400" />}
            title="No Settlement Invoices Yet"
            description="When your produce lots are weighed, inspected, and accepted into the warehouse, the financial settlement invoice with rate breakdowns will appear here automatically."
          />
        ) : (
          <div className="space-y-4">
            {settlements.map((st) => (
              <div
                key={st._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-900 tracking-tight">
                        {st.settlementNumber}
                      </span>
                      <StatusBadge status={st.paymentStatus} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Produce Lot Ref:{" "}
                      <strong className="font-mono text-slate-800">
                        {st.lotId?.lotNumber || "N/A"}
                      </strong>{" "}
                      • {st.cropId?.name || "Produce"}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Net Bank Disbursement
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
                      ₹{st.netAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Structured Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Accepted Volume
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {st.acceptedQuantity?.toLocaleString()} {st.unit || "kg"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Agreed Mandi Rate
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      ₹{st.effectiveRatePerKg} / {st.unit || "kg"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Gross Procurement Total
                    </span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      ₹{st.grossAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">
                      Deductions & Levies
                    </span>
                    <span className="font-bold text-rose-700 text-sm mt-0.5 block">
                      - ₹{st.totalDeductions?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {/* Payment Status Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-1 gap-2">
                  <div className="flex items-center gap-1.5">
                    {st.paymentStatus === "PAID" ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-700" />
                        <span className="font-semibold text-emerald-800">
                          Disbursed directly via DBT to registered bank account
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock size={15} className="text-amber-600" />
                        <span className="font-semibold text-amber-800">
                          Awaiting finance officer approval & treasury batch
                          disbursement
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                    <Landmark size={13} />
                    <span>
                      Generated on{" "}
                      {new Date(st.createdAt).toLocaleDateString([], {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};
