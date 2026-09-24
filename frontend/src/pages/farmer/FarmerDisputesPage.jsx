import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNavigation } from "../../components/layout/BottomNavigation";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { disputeApi } from "../../services/api/dispute.api";
import { ShieldAlert, PlusCircle, AlertCircle } from "lucide-react";

export const FarmerDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [category, setCategory] = useState("GRADE_DISPUTE");
  const [referenceType, setReferenceType] = useState("PRODUCE_LOT");
  const [referenceId, setReferenceId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const fetchDisputes = async () => {
    try {
      setIsLoading(true);
      const res = await disputeApi.getDisputes();
      setDisputes(res.data || []);
    } catch (err) {
      console.error("Failed to load disputes", err);
      setError("Unable to load disputes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleLodgeDispute = async (e) => {
    e.preventDefault();
    setError("");

    if (!referenceId || !reason || !description) {
      setError("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await disputeApi.createDispute({
        category,
        referenceType,
        referenceId,
        reason,
        description,
      });

      if (res.success) {
        setShowAddForm(false);
        setReferenceId("");
        setReason("");
        setDescription("");
        fetchDisputes();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to lodge dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <AppHeader />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-rose-700" size={22} />
              <span>Grievances & Disputes</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Lodge inquiries for grading re-evaluations, weight
              reconciliations, or settlement questions.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={<PlusCircle size={16} />}
            className="bg-rose-800 hover:bg-rose-900 text-white font-bold"
          >
            {showAddForm ? "Cancel" : "Lodge Dispute"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {showAddForm && (
          <Card className="border-t-4 border-t-rose-800 shadow-md">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Lodge a Formal Grievance
            </h2>
            <form onSubmit={handleLodgeDispute} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Grievance Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  >
                    <option value="GRADE_DISPUTE">Quality Grade Dispute</option>
                    <option value="WEIGHT_DISCREPANCY">
                      Weight Measurement Discrepancy
                    </option>
                    <option value="DEDUCTION_QUERY">Deductions Query</option>
                    <option value="PAYMENT_DELAY">Payment Delay</option>
                    <option value="REJECTION_APPEAL">Rejection Appeal</option>
                    <option value="OTHER">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                    Reference Type
                  </label>
                  <select
                    value={referenceType}
                    onChange={(e) => setReferenceType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  >
                    <option value="PRODUCE_LOT">Produce Lot Number</option>
                    <option value="QUALITY_INSPECTION">
                      Inspection Number
                    </option>
                    <option value="SETTLEMENT">Settlement Invoice</option>
                    <option value="BOOKING">Booking Reference</option>
                  </select>
                </div>
              </div>

              <Input
                label="Reference Number (e.g. MM-2026-09-000101 or QI-2026-09-000104)"
                placeholder="Enter exact reference code"
                value={referenceId}
                onChange={(e) => setReferenceId(e.target.value)}
                required
              />

              <Input
                label="Dispute Summary / Reason"
                placeholder="e.g. Moisture tester reading discrepancy"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Detailed Explanation
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide complete context and details for the grievance reviewer..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-600"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs"
                >
                  Submit Dispute
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
            Loading grievance records...
          </div>
        ) : disputes.length === 0 ? (
          <Card className="text-center py-8 space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No active grievances or disputes
            </p>
            <p className="text-xs text-slate-500">
              You can lodge a dispute if you disagree with any grading or
              settlement calculation.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {disputes.map((disp) => (
              <Card key={disp._id} className="shadow-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {disp.disputeNumber}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-0.5">
                      {disp.reason}
                    </h3>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      disp.status === "RESOLVED"
                        ? "bg-emerald-100 text-emerald-900"
                        : disp.status === "OPEN"
                          ? "bg-amber-100 text-amber-900"
                          : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {disp.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  {disp.description}
                </p>
                {disp.resolution && (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900">
                    <strong>Official Resolution:</strong> {disp.resolution}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
