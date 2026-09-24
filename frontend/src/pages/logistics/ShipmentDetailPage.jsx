import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { logisticsApi } from "../../services/api/logistics.api";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MapPin,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export const ShipmentDetailPage = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Transit Update Modal
  const [showTransitModal, setShowTransitModal] = useState(false);
  const [transitStatus, setTransitStatus] = useState("IN_TRANSIT");
  const [transitLocation, setTransitLocation] = useState("");
  const [transitNotes, setTransitNotes] = useState("");

  const fetchDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await logisticsApi.getShipmentDetail(id);
      setShipment(res.data);
    } catch (err) {
      console.error("Failed to load shipment detail", err);
      setError("Unable to load shipment details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDispatch = async () => {
    if (!shipment) return;
    setIsUpdating(true);
    setError("");
    try {
      await logisticsApi.dispatchShipment(
        shipment._id,
        "Outbound weighbridge cleared",
      );
      await fetchDetail();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to dispatch shipment.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTransitStatusSubmit = async () => {
    if (!shipment) return;
    setIsUpdating(true);
    setError("");
    try {
      await logisticsApi.updateTransitStatus(shipment._id, {
        status: transitStatus,
        location: transitLocation,
        notes: transitNotes,
      });
      setShowTransitModal(false);
      await fetchDetail();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update transit status.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-5xl mx-auto w-full px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400 mt-2">
            Loading shipment tracking...
          </p>
        </div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-5xl mx-auto w-full px-4 py-16 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-2" size={36} />
          <h2 className="text-base font-bold text-slate-800">
            Shipment Not Found
          </h2>
          <Link to="/logistics/shipments">
            <Button
              size="sm"
              className="mt-4 bg-slate-900 text-white font-bold"
            >
              Back to Shipments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-5xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Link
              to="/logistics/shipments"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} /> Back to Shipments
            </Link>
            <div className="flex items-center gap-2">
              {["PLANNED", "READY_FOR_DISPATCH"].includes(shipment.status) && (
                <Button
                  onClick={handleDispatch}
                  isLoading={isUpdating}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  Dispatch Vehicle Now
                </Button>
              )}
              {["DISPATCHED", "IN_TRANSIT", "DELAYED"].includes(
                shipment.status,
              ) && (
                <Button
                  onClick={() => setShowTransitModal(true)}
                  className="bg-slate-900 text-white text-xs font-bold"
                >
                  Update Milestone
                </Button>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Shipment Overview Card */}
          <Card className="shadow-xs bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-slate-100 pb-4 mb-4 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Logistics Manifest
                </span>
                <h1 className="text-2xl font-black text-slate-900 font-mono">
                  {shipment.shipmentNumber}
                </h1>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800">
                {shipment.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">
                  Purchase Order
                </span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                  {shipment.purchaseOrder?.poNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">
                  Assigned Vehicle
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {shipment.vehicle?.vehicleNumber} ({shipment.vehicle?.type})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">
                  Driver Contact
                </span>
                <span className="font-bold text-slate-900 mt-0.5 block">
                  {shipment.driverName} ({shipment.driverPhone})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">
                  Total Cargo Weight
                </span>
                <span className="font-bold text-emerald-700 mt-0.5 block">
                  {shipment.totalWeightKg.toLocaleString()} kg
                </span>
              </div>
            </div>
          </Card>

          {/* Tracking Milestone Timeline */}
          <Card className="shadow-xs bg-white">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-emerald-700" />
              <span>Milestone Tracking History</span>
            </h2>
            <div className="flex flex-col gap-4">
              {shipment.trackingEvents?.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="flex-1 pb-3 border-b border-slate-100">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">
                        {event.status}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {event.location && (
                      <span className="text-slate-500 block mt-0.5 flex items-center gap-1">
                        <MapPin size={12} /> {event.location}
                      </span>
                    )}
                    <span className="text-slate-600 block mt-1">
                      {event.notes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Delivery Receipt (if completed) */}
          {shipment.deliveryConfirmation && (
            <Card className="shadow-xs bg-emerald-50 border border-emerald-200">
              <h2 className="text-base font-black text-emerald-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-700" />
                <span>Verified Delivery Confirmation Receipt</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-emerald-900">
                <div>
                  <span className="text-emerald-700 block font-medium">
                    Delivered Weight
                  </span>
                  <span className="font-black text-base">
                    {shipment.deliveryConfirmation.deliveredQuantityKg.toLocaleString()}{" "}
                    kg
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 block font-medium">
                    Condition
                  </span>
                  <span className="font-bold">
                    {shipment.deliveryConfirmation.condition}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 block font-medium">
                    Receiver Name
                  </span>
                  <span className="font-bold">
                    {shipment.deliveryConfirmation.receiverName}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-700 block font-medium">
                    Receipt Date
                  </span>
                  <span className="font-bold">
                    {new Date(
                      shipment.deliveryConfirmation.confirmedAt,
                    ).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </main>
      </div>

      {/* Transit Modal */}
      {showTransitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl rounded-2xl">
            <h3 className="text-base font-black text-slate-900 mb-2">
              Update Transit Milestone
            </h3>
            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Milestone *
                </label>
                <select
                  value={transitStatus}
                  onChange={(e) => setTransitStatus(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                >
                  <option value="IN_TRANSIT">In Transit (On Highway)</option>
                  <option value="ARRIVED">
                    Arrived at Buyer Facility Gate
                  </option>
                  <option value="DELAYED">Delayed / Traffic / Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Current Location (e.g. NH44 Toll Plaza)
                </label>
                <input
                  type="text"
                  placeholder="Location landmark or town"
                  value={transitLocation}
                  onChange={(e) => setTransitLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Status Notes
                </label>
                <textarea
                  rows={2}
                  value={transitNotes}
                  onChange={(e) => setTransitNotes(e.target.value)}
                  placeholder="e.g. Crossed Jadcherla toll gate, ETA 2 hours"
                  className="w-full p-2.5 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  onClick={() => setShowTransitModal(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleTransitStatusSubmit}
                  isLoading={isUpdating}
                  size="sm"
                  className="bg-slate-900 text-white font-bold"
                >
                  Save Milestone
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
