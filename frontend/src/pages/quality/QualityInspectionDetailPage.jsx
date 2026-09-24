import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { lotApi } from "../../services/api/lot.api";
import { qualityApi } from "../../services/api/quality.api";
import { aiApi } from "../../services/api/ai.api";
import {
  Check,
  X,
  ArrowLeft,
  Scale,
  Sparkles,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";

export const QualityInspectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Measurement parameters
  const [moisture, setMoisture] = useState("12.5");
  const [foreignMatter, setForeignMatter] = useState("0.8");
  const [brokenGrains, setBrokenGrains] = useState("2.0");
  const [damage, setDamage] = useState("0.5");
  const [sampleWeightGrams, setSampleWeightGrams] = useState("500");

  // Quantities & decisions
  const [acceptedQty, setAcceptedQty] = useState("");
  const [rejectedQty, setRejectedQty] = useState("0");
  const [assignedGrade, setAssignedGrade] = useState("GRADE_A");
  const [remarks, setRemarks] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  // AI Assistance observation state
  const [aiAssistantData, setAiAssistantData] = useState(null);
  const [calculatingAI, setCalculatingAI] = useState(false);

  useEffect(() => {
    const fetchLot = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await lotApi.getLotById(id);
        const lotData = res.data;
        setLot(lotData);
        const totalWeight =
          lotData.receivedQuantity || lotData.declaredQuantity;
        setAcceptedQty(String(totalWeight));
        setRejectedQty("0");
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load lot information.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLot();
  }, [id]);

  // Compute calculated quality score dynamically based on entered parameters
  const computedScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        100 -
          (Number(moisture) > 12 ? (Number(moisture) - 12) * 4 : 0) -
          Number(foreignMatter) * 5 -
          Number(brokenGrains) * 2 -
          Number(damage) * 6,
      ),
    ),
  );

  // Auto-suggest grade when measurements change
  useEffect(() => {
    if (
      computedScore >= 85 &&
      Number(moisture) <= 13 &&
      Number(foreignMatter) <= 1.5
    ) {
      setAssignedGrade("GRADE_A");
    } else if (
      computedScore >= 70 &&
      Number(moisture) <= 15 &&
      Number(foreignMatter) <= 3
    ) {
      setAssignedGrade("GRADE_B");
    } else if (computedScore >= 50) {
      setAssignedGrade("GRADE_C");
    } else {
      setAssignedGrade("REJECTED");
    }
  }, [computedScore, moisture, foreignMatter]);

  const handleFetchAiAssistance = async () => {
    if (!lot) return;
    try {
      setCalculatingAI(true);
      const res = await aiApi.interpretQuality({
        moisturePercentage: Number(moisture),
        foreignMatterPercentage: Number(foreignMatter),
        qualityScore: computedScore,
        assignedGrade,
        cropName: lot.cropId?.name,
        declaredQuantity: lot.declaredQuantity,
      });
      setAiAssistantData(res);
    } catch (err) {
      console.warn("AI assistance fallback", err);
    } finally {
      setCalculatingAI(false);
    }
  };

  const handleDecision = async (decision) => {
    if (!lot) return;
    setError("");

    const acc = decision === "REJECT" ? 0 : Number(acceptedQty);
    const rej =
      decision === "REJECT"
        ? Number(lot.receivedQuantity || lot.declaredQuantity)
        : Number(rejectedQty);
    const totalRec = Number(lot.receivedQuantity || lot.declaredQuantity);

    if (acc + rej > totalRec) {
      setError(
        `Accepted quantity (${acc} kg) + Rejected (${rej} kg) exceeds total received weight (${totalRec} kg).`,
      );
      return;
    }

    if (decision === "REJECT" && !rejectionReason.trim()) {
      setError(
        "Please provide a mandatory rejection reason for regulatory records.",
      );
      return;
    }

    setSubmitting(true);
    try {
      await qualityApi.submitInspection({
        lotId: lot._id,
        moisturePercentage: Number(moisture),
        foreignMatterPercentage: Number(foreignMatter),
        brokenGrainPercentage: Number(brokenGrains),
        damagePercentage: Number(damage),
        sampleWeightGrams: Number(sampleWeightGrams),
        qualityScore: computedScore,
        assignedGrade: decision === "REJECT" ? "REJECTED" : assignedGrade,
        acceptedQuantity: acc,
        rejectedQuantity: rej,
        rejectionReason: rej > 0 ? rejectionReason : undefined,
        remarks:
          remarks ||
          `Standard physical & laboratory appraisal conducted. Assigned ${decision === "REJECT" ? "REJECTED" : assignedGrade}.`,
      });

      navigate("/quality/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to submit quality inspection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center p-8 text-slate-500 text-sm">
          Loading lot appraisal workstation...
        </div>
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <AppHeader />
        <div className="flex flex-1 items-center justify-center p-8">
          <Card className="p-8 text-center max-w-md">
            <AlertTriangle size={32} className="mx-auto text-rose-600 mb-2" />
            <h2 className="font-bold text-slate-900 text-base">
              Lot Not Found
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {error || "Requested produce lot was not found."}
            </p>
            <Button
              onClick={() => navigate("/quality/dashboard")}
              className="text-xs font-bold bg-slate-800 text-white"
            >
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const totalReceivedWeight = lot.receivedQuantity || lot.declaredQuantity;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-6xl mx-auto w-full space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/quality/dashboard")}
                className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 cursor-pointer"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">
                    Inspection Worksheet #{lot.lotNumber}
                  </h1>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                    STATUS: {lot.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Collection Centre:{" "}
                  {lot.collectionCentreId?.name || "Mandi Intake Centre"} •
                  Token: #{lot.tokenId?.tokenNumber || "N/A"}
                </p>
              </div>
            </div>

            <Button
              onClick={handleFetchAiAssistance}
              isLoading={calculatingAI}
              variant="outline"
              className="border-slate-300 text-slate-700 text-xs font-bold"
              icon={<Sparkles size={14} className="text-emerald-700" />}
            >
              Consult AI Assistant
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Dual Column Layout: Left Lot Info, Right Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LOT INFORMATION */}
            <Card className="p-5 border border-slate-200 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileCheck2 size={18} className="text-emerald-800" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Lot Information
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Farmer
                  </span>
                  <span className="font-semibold text-slate-900 text-sm">
                    {lot.farmerId?.fullName || "Registered Farmer"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {lot.farmerId?.phoneNumber}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Produce Crop
                  </span>
                  <span className="font-semibold text-emerald-900 text-sm">
                    {lot.cropId?.name || "Agricultural Produce"}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    Season: {lot.cropId?.season || "Kharif"}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Declared Weight
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {lot.declaredQuantity.toLocaleString()} kg
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Weighbridge Received Weight
                  </span>
                  <span className="font-mono font-extrabold text-emerald-800 text-sm">
                    {totalReceivedWeight.toLocaleString()} kg
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Harvest Date
                  </span>
                  <span className="font-medium text-slate-700">
                    {new Date(lot.harvestDate).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <span className="font-bold text-slate-500 uppercase block">
                    Arrival Gate Timestamp
                  </span>
                  <span className="font-medium text-slate-700">
                    {new Date(lot.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-xl">
                <span className="text-[11px] font-bold text-slate-600 block mb-1">
                  Weighbridge Weight Verification:
                </span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  Gross intake recorded at Mandi Platform Weighbridge.
                  Inspection accepted and rejected kilograms must balance
                  precisely against received weight of{" "}
                  <strong>{totalReceivedWeight.toLocaleString()} kg</strong>.
                </p>
              </div>
            </Card>

            {/* QUALITY MEASUREMENTS */}
            <Card className="p-5 border border-slate-200 bg-white space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Scale size={18} className="text-emerald-800" />
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Laboratory Measurements
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Moisture Content (%) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                    required
                  />

                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Threshold: $\le 14\%$
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Foreign Matter (%) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={foreignMatter}
                    onChange={(e) => setForeignMatter(e.target.value)}
                    required
                  />

                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Threshold: $\le 2\%$
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Broken / Immature (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={brokenGrains}
                    onChange={(e) => setBrokenGrains(e.target.value)}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Insect Damaged (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={damage}
                    onChange={(e) => setDamage(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Total Test Sample Weight (Grams)
                  </label>
                  <Input
                    type="number"
                    value={sampleWeightGrams}
                    onChange={(e) => setSampleWeightGrams(e.target.value)}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* AI Observation Card (If Loaded) */}
          {aiAssistantData && (
            <Card className="p-4 border border-emerald-300 bg-emerald-50/50 rounded-2xl">
              <div className="flex items-start gap-3">
                <Sparkles
                  size={18}
                  className="text-emerald-800 mt-0.5 shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      AI Quality Observation
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.2 bg-emerald-200 text-emerald-900 rounded-md">
                      Risk Level: {aiAssistantData.riskLevel || "LOW"}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    {aiAssistantData.summary}
                  </p>
                  <p className="text-[11px] text-slate-500 italic mt-1">
                    {aiAssistantData.notice}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quality Score & Decision Card */}
          <Card className="p-6 border border-slate-200 bg-white space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Calculated Scientific Quality Score
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-black text-slate-900">
                    {computedScore}
                  </span>
                  <span className="text-sm font-bold text-slate-500">
                    / 100 Quality Points
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Assigned Grade
                </span>
                <div className="flex gap-2">
                  {["GRADE_A", "GRADE_B", "GRADE_C", "REJECTED"].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setAssignedGrade(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        assignedGrade === g
                          ? g === "REJECTED"
                            ? "bg-rose-700 text-white shadow-xs"
                            : "bg-emerald-800 text-white shadow-xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {g.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Split Quantities: Accepted vs Rejected */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accepted Quantity (kg) *
                </label>
                <Input
                  type="number"
                  value={acceptedQty}
                  onChange={(e) => {
                    const acc = Number(e.target.value);
                    setAcceptedQty(e.target.value);
                    if (acc <= totalReceivedWeight) {
                      setRejectedQty(
                        String(Math.max(0, totalReceivedWeight - acc)),
                      );
                    }
                  }}
                  required
                />

                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Produce passed for storage intake
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rejected Quantity (kg)
                </label>
                <Input
                  type="number"
                  value={rejectedQty}
                  onChange={(e) => {
                    const rej = Number(e.target.value);
                    setRejectedQty(e.target.value);
                    if (rej <= totalReceivedWeight) {
                      setAcceptedQty(
                        String(Math.max(0, totalReceivedWeight - rej)),
                      );
                    }
                  }}
                />

                <span className="text-[11px] text-slate-500 block mt-0.5">
                  Sub-grade or foreign matter quantity
                </span>
              </div>

              {Number(rejectedQty) > 0 && (
                <div className="col-span-full">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Moisture > 17%, foreign pebbles, mold contamination..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="col-span-full">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Inspector Remarks & Evidence Notes
                </label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Record laboratory tester ID, observation notes, or bag seal details..."
                  className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
              <Button
                fullWidth
                variant="outline"
                onClick={() => handleDecision("REJECT")}
                isLoading={submitting}
                className="border-rose-300 text-rose-800 hover:bg-rose-50 text-xs font-bold py-2.5"
                icon={<X size={16} />}
              >
                REJECT ENTIRE LOT
              </Button>

              <Button
                fullWidth
                onClick={() => handleDecision("ACCEPT")}
                isLoading={submitting}
                className="bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2.5"
                icon={<Check size={16} />}
              >
                CONFIRM QUALITY & ACCEPT LOT ({acceptedQty || 0} KG)
              </Button>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
};
