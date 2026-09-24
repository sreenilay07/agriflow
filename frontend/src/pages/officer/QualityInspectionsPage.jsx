import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { qualityApi } from "../../services/api/quality.api";
import { lotApi } from "../../services/api/lot.api";
import {
  Scale,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";

export const QualityInspectionsPage = () => {
  const [lotNumber, setLotNumber] = useState("");
  const [searchedLot, setSearchedLot] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Inspection form states
  const [moisture, setMoisture] = useState("13");
  const [foreignMatter, setForeignMatter] = useState("1");
  const [brokenGrains, setBrokenGrains] = useState("2");
  const [damage, setDamage] = useState("0.5");
  const [assignedGrade, setAssignedGrade] = useState("GRADE_A");
  const [acceptedQuantity, setAcceptedQuantity] = useState("");
  const [rejectedQuantity, setRejectedQuantity] = useState("0");
  const [rejectionReason, setRejectionReason] = useState("");
  const [remarks, setRemarks] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [recentInspections, setRecentInspections] = useState([]);

  const loadRecentInspections = async () => {
    try {
      const res = await qualityApi.listInspections();
      setRecentInspections(res.data || []);
    } catch (err) {
      console.warn("Could not load inspections", err);
    }
  };

  useEffect(() => {
    loadRecentInspections();
  }, []);

  const handleSearchLot = async (e) => {
    e.preventDefault();
    if (!lotNumber.trim()) return;
    setError("");
    setSuccessMessage("");
    setSearchedLot(null);
    setIsSearching(true);

    try {
      const res = await lotApi.getLotByNumber(lotNumber.trim());
      setSearchedLot(res.data);
      const recQty = res.data.receivedQuantity || res.data.declaredQuantity;
      setAcceptedQuantity(String(recQty));
      setRejectedQuantity("0");
    } catch (err) {
      setError(err.response?.data?.message || "Lot not found.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitInspection = async (e) => {
    e.preventDefault();
    if (!searchedLot) return;
    setError("");

    const accQty = Number(acceptedQuantity);
    const rejQty = Number(rejectedQuantity || 0);
    const totalRec =
      searchedLot.receivedQuantity || searchedLot.declaredQuantity;

    if (accQty + rejQty > totalRec) {
      setError(
        `Accepted (${accQty} kg) + Rejected (${rejQty} kg) cannot exceed received weight (${totalRec} kg).`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await qualityApi.submitInspection({
        lotId: searchedLot._id,
        moisturePercentage: Number(moisture),
        foreignMatterPercentage: Number(foreignMatter),
        brokenGrainPercentage: Number(brokenGrains),
        damagePercentage: Number(damage),
        assignedGrade,
        acceptedQuantity: accQty,
        rejectedQuantity: rejQty,
        rejectionReason: rejQty > 0 ? rejectionReason : undefined,
        remarks,
      });

      if (res.success) {
        setSuccessMessage(
          `Quality Inspection completed! Grade ${assignedGrade} assigned to Lot ${searchedLot.lotNumber}.`,
        );
        setSearchedLot(null);
        setLotNumber("");
        loadRecentInspections();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit quality inspection.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-4xl space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Scale className="text-amber-700" size={24} />
              <span>Quality Inspection & Produce Grading</span>
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Evaluate physical samples, test moisture & foreign matter, and
              assign digital quality grade certifications.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs">
              <CheckCircle2 size={20} className="text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Search Lot */}
          <Card className="shadow-xs">
            <form onSubmit={handleSearchLot} className="flex gap-2">
              <Input
                label="Produce Lot Number to Inspect"
                placeholder="e.g. MM-2026-09-000103"
                value={lotNumber}
                onChange={(e) => setLotNumber(e.target.value)}
                leftIcon={<Search size={18} />}
                required
              />

              <div className="pt-6">
                <Button
                  type="submit"
                  isLoading={isSearching}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold"
                >
                  Load Lot
                </Button>
              </div>
            </form>
          </Card>

          {/* Inspection Evaluation Form */}
          {searchedLot && (
            <Card className="border-t-4 border-t-amber-600 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-sm font-black text-slate-900">
                    {searchedLot.lotNumber}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Crop: <strong>{searchedLot.cropId?.name}</strong> •
                    Received:{" "}
                    <strong>
                      {searchedLot.receivedQuantity ||
                        searchedLot.declaredQuantity}{" "}
                      KG
                    </strong>
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                  Ready for Inspection
                </span>
              </div>

              <form onSubmit={handleSubmitInspection} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Input
                    label="Moisture Content (%)"
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    required
                  />

                  <Input
                    label="Foreign Matter (%)"
                    type="number"
                    step="0.1"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(e.target.value)}
                    required
                  />

                  <Input
                    label="Broken Grains (%)"
                    type="number"
                    step="0.1"
                    value={brokenGrains}
                    onChange={(e) => setBrokenGrains(e.target.value)}
                    required
                  />

                  <Input
                    label="Damaged Grains (%)"
                    type="number"
                    step="0.1"
                    value={damage}
                    onChange={(e) => setDamage(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      Assigned Quality Grade
                    </label>
                    <select
                      value={assignedGrade}
                      onChange={(e) => setAssignedGrade(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-600"
                    >
                      <option value="GRADE_A">GRADE A (Premium Quality)</option>
                      <option value="GRADE_B">
                        GRADE B (Standard Commercial)
                      </option>
                      <option value="GRADE_C">GRADE C (Sub-Standard)</option>
                      <option value="REJECTED">
                        REJECTED (Non-Procureable)
                      </option>
                    </select>
                  </div>

                  <Input
                    label="Accepted Quantity (KG)"
                    type="number"
                    value={acceptedQuantity}
                    onChange={(e) => setAcceptedQuantity(e.target.value)}
                    required
                  />

                  <Input
                    label="Rejected Quantity (KG)"
                    type="number"
                    value={rejectedQuantity}
                    onChange={(e) => setRejectedQuantity(e.target.value)}
                  />
                </div>

                {Number(rejectedQuantity) > 0 && (
                  <Input
                    label="Rejection Reason / Defect Notes"
                    placeholder="e.g. Excess moisture, mold spores detected"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                )}

                <Input
                  label="Inspector Observations & Certification Remarks"
                  placeholder="e.g. Sample verified with digital grain analyzer"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />

                <Button
                  fullWidth
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-amber-800 hover:bg-amber-900 text-white font-bold py-3 mt-2"
                >
                  Certify Quality & Evaluate Lot Grade
                </Button>
              </form>
            </Card>
          )}

          {/* Recent Inspections Table */}
          <Card className="shadow-xs">
            <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-slate-600" />
              <span>Recent Quality Certifications</span>
            </h3>

            {recentInspections.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No quality inspection records found.
              </p>
            ) : (
              <div className="space-y-2">
                {recentInspections.slice(0, 5).map((ins) => (
                  <div
                    key={ins._id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">
                        {ins.inspectionNumber}
                      </span>
                      <span className="text-slate-500 block mt-0.5">
                        Lot: {ins.lotId?.lotNumber || "N/A"} • Crop:{" "}
                        {ins.cropId?.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 font-bold rounded-md bg-amber-100 text-amber-900">
                        {ins.assignedGrade}
                      </span>
                      <span className="block text-[11px] text-emerald-800 font-bold mt-0.5">
                        {ins.acceptedQuantity} KG Accepted
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
};
