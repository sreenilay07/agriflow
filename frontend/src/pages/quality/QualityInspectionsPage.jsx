import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { qualityApi } from "../../services/api/quality.api";
import { lotApi } from "../../services/api/lot.api";
import {
  ClipboardCheck,
  Search,
  ArrowRight,
  Clock,
  CheckCircle2,
} from "lucide-react";

export const QualityInspectionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("PENDING");
  const [pendingLots, setPendingLots] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lotsRes, inspRes] = await Promise.all([
        lotApi.getLots({ status: "RECEIVED" }),
        qualityApi.listInspections(),
      ]);
      setPendingLots(lotsRes.data || []);
      setInspections(inspRes.data || []);
    } catch (err) {
      console.error("Failed to load quality inspections", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPending = pendingLots.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.lotNumber?.toLowerCase().includes(q) ||
      l.cropId?.name?.toLowerCase().includes(q) ||
      l.farmerId?.fullName?.toLowerCase().includes(q)
    );
  });

  const filteredInspections = inspections.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.inspectionNumber?.toLowerCase().includes(q) ||
      i.assignedGrade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ClipboardCheck size={22} className="text-emerald-800" />
                Quality Inspection Management
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Manage live inspection queues and review historical laboratory
                certifications.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-3 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search lot, crop, farmer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-emerald-600 w-64 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 gap-4">
            <button
              onClick={() => setActiveTab("PENDING")}
              className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === "PENDING"
                  ? "border-emerald-800 text-emerald-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Clock size={16} />
              Awaiting Inspection ({pendingLots.length})
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
                activeTab === "COMPLETED"
                  ? "border-emerald-800 text-emerald-900"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <CheckCircle2 size={16} />
              Completed Inspections ({inspections.length})
            </button>
          </div>

          {/* Active Tab View */}
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading inspection records...
            </div>
          ) : activeTab === "PENDING" ? (
            <div className="space-y-3">
              {filteredPending.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-3.5">Lot Number</th>
                        <th className="p-3.5">Farmer</th>
                        <th className="p-3.5">Crop</th>
                        <th className="p-3.5">Received Weight</th>
                        <th className="p-3.5">Intake Time</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredPending.map((lot) => (
                        <tr
                          key={lot._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-slate-900">
                            {lot.lotNumber}
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {lot.farmerId?.fullName || "Farmer"}
                          </td>
                          <td className="p-3.5 font-semibold text-emerald-900">
                            {lot.cropId?.name || "Produce"}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {(
                              lot.receivedQuantity || lot.declaredQuantity
                            ).toLocaleString()}{" "}
                            kg
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(lot.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-3.5 text-right">
                            <Button
                              onClick={() =>
                                navigate(`/quality/inspections/${lot._id}`)
                              }
                              className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs py-1.5 px-3"
                              icon={<ArrowRight size={13} />}
                            >
                              Inspect
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card className="p-8 text-center text-slate-500 border border-slate-200">
                  <p className="font-bold text-slate-700">
                    No lots awaiting inspection
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredInspections.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
                      <tr>
                        <th className="p-3.5">Inspection #</th>
                        <th className="p-3.5">Assigned Grade</th>
                        <th className="p-3.5">Quality Score</th>
                        <th className="p-3.5">Moisture</th>
                        <th className="p-3.5">Foreign Matter</th>
                        <th className="p-3.5">Accepted Weight</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInspections.map((i) => (
                        <tr
                          key={i._id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="p-3.5 font-bold text-slate-900">
                            {i.inspectionNumber || i._id}
                          </td>
                          <td className="p-3.5">
                            <span className="font-extrabold px-2 py-0.5 rounded-md text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {i.assignedGrade}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            {i.qualityScore} / 100
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {i.moisturePercentage}%
                          </td>
                          <td className="p-3.5 font-medium text-slate-700">
                            {i.foreignMatterPercentage}%
                          </td>
                          <td className="p-3.5 font-mono font-bold text-emerald-900">
                            {(i.acceptedQuantity || 0).toLocaleString()} kg
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {new Date(i.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Card className="p-8 text-center text-slate-500 border border-slate-200">
                  <p className="font-bold text-slate-700">
                    No inspection records found
                  </p>
                </Card>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
