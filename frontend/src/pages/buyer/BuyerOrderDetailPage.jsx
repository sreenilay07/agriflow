import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { logisticsApi } from "../../services/api/logistics.api";
import { ArrowLeft, Truck, Boxes, AlertCircle } from "lucide-react";

export const BuyerOrderDetailPage = () => {
  const { id } = useParams();
  const [po, setPo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Delivery confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState("");
  const [deliveredQty, setDeliveredQty] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [condition, setCondition] = useState("EXCELLENT");
  const [confirmNotes, setConfirmNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchOrderDetail = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await purchaseOrderApi.getPODetail(id);
      setPo(res.data);
    } catch (err) {
      console.error("Failed to load purchase order details", err);
      setError("Unable to load purchase order details.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const handleDeliveryConfirmSubmit = async () => {
    if (!selectedShipmentId) return;
    const qty = Number(deliveredQty);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid delivered weight.");
      return;
    }
    if (!receiverName.trim()) {
      setError("Receiver name is required.");
      return;
    }

    setIsConfirming(true);
    setError("");
    try {
      await logisticsApi.confirmDelivery({
        shipmentId: selectedShipmentId,
        deliveredQuantityKg: qty,
        condition,
        receiverName,
        notes: confirmNotes,
      });
      setShowConfirmModal(false);
      await fetchOrderDetail();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to record delivery confirmation.",
      );
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-5xl mx-auto w-full px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400 mt-2">
            Loading order details & traceability...
          </p>
        </div>
      </div>
    );
  }

  if (!po) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-5xl mx-auto w-full px-4 py-16 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-2" size={36} />
          <h2 className="text-base font-bold text-slate-800">
            Order Not Found
          </h2>
          <Link to="/buyer/orders">
            <Button
              size="sm"
              className="mt-4 bg-emerald-700 text-white font-bold"
            >
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="max-w-5xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Top Navigation & Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Link
            to="/buyer/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black ${
              po.status === "COMPLETED"
                ? "bg-emerald-100 text-emerald-800"
                : po.status === "DISPATCHED"
                  ? "bg-blue-100 text-blue-800"
                  : po.status === "APPROVED"
                    ? "bg-indigo-100 text-indigo-800"
                    : po.status === "REJECTED"
                      ? "bg-rose-100 text-rose-800"
                      : "bg-amber-100 text-amber-800"
            }`}
          >
            Status: {po.status}
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Order Header Card */}
        <Card className="shadow-xs bg-white p-6 rounded-2xl border border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline border-b border-slate-100 pb-4 mb-4 gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Purchase Order
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-mono">
                {po.poNumber}
              </h1>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-500 block">
                Placed on {new Date(po.createdAt).toLocaleDateString()}
              </span>
              <span className="text-lg font-black text-emerald-700">
                ₹{po.totalValue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">
                Buyer Organization
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {po.buyerProfile?.organizationName || "Verified Buyer"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">
                Total Quantity
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {po.totalQuantityKg.toLocaleString()} kg
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">
                Allocated Quantity
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {po.allocatedQuantityKg.toLocaleString()} kg
              </span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">
                Delivered Quantity
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {po.deliveredQuantityKg.toLocaleString()} kg
              </span>
            </div>
          </div>
        </Card>

        {/* Traceability: Allocated Warehouse Lots */}
        <Card className="shadow-xs bg-white">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <Boxes size={18} className="text-emerald-700" />
            <span>Allocated Produce Lots ({po.allocations?.length || 0})</span>
          </h2>
          {!po.allocations || po.allocations.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">
              Lots will be matched and allocated by Mandi Operations once the PO
              is approved.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Lot Number</th>
                    <th className="p-3">Origin Warehouse</th>
                    <th className="p-3">Farmer Region</th>
                    <th className="p-3">Allocated Qty</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {po.allocations.map((alloc) => (
                    <tr key={alloc._id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-slate-900">
                        {alloc.produceLot?.lotNumber}
                      </td>
                      <td className="p-3 text-slate-700">
                        {alloc.warehouse?.name}
                      </td>
                      <td className="p-3 text-slate-500">
                        {alloc.produceLot?.farmer?.district ||
                          "Certified Mandi"}
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {alloc.allocatedQuantityKg.toLocaleString()} kg
                      </td>
                      <td className="p-3 text-slate-700">
                        ₹{alloc.unitPricePerKg}/kg
                      </td>
                      <td className="p-3 font-bold text-emerald-700">
                        ₹{alloc.totalAmount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {alloc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Logistics & Shipments */}
        <Card className="shadow-xs bg-white">
          <h2 className="text-base font-black text-slate-900 mb-3 flex items-center gap-2">
            <Truck size={18} className="text-emerald-700" />
            <span>Shipments & Delivery ({po.shipments?.length || 0})</span>
          </h2>
          {!po.shipments || po.shipments.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">
              No shipments registered yet. Logistics fleet will be assigned once
              lots are allocated.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {po.shipments.map((shp) => (
                <div
                  key={shp._id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {shp.shipmentNumber}
                      </span>
                      <span className="text-slate-500 ml-2">
                        Vehicle: {shp.vehicle?.vehicleNumber} ({shp.driverName})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        {shp.status}
                      </span>
                      {["DISPATCHED", "IN_TRANSIT", "ARRIVED"].includes(
                        shp.status,
                      ) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedShipmentId(shp._id);
                            setDeliveredQty(String(shp.totalWeightKg));
                            setShowConfirmModal(true);
                          }}
                          className="bg-emerald-700 text-white font-bold"
                        >
                          Confirm Delivery
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-600">
                    <div>Cargo: {shp.totalWeightKg.toLocaleString()} kg</div>
                    <div>Origin: {shp.originWarehouse?.name}</div>
                    <div>
                      Destination: {shp.destinationAddress?.district},{" "}
                      {shp.destinationAddress?.state}
                    </div>
                    <div>Driver Contact: {shp.driverPhone}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Delivery Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-w-md w-full p-6 bg-white shadow-xl rounded-2xl">
              <h3 className="text-base font-black text-slate-900 mb-2">
                Confirm Produce Delivery
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Record actual weighbridge received quantity and cargo condition
                at your facility gate.
              </p>

              <div className="flex flex-col gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Delivered Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={deliveredQty}
                    onChange={(e) => setDeliveredQty(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Condition of Produce
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="EXCELLENT">
                      Excellent - Premium Quality
                    </option>
                    <option value="GOOD">Good - Standard Sealed Bags</option>
                    <option value="DAMAGED_PARTIAL">
                      Partial Damage / Spillage
                    </option>
                    <option value="REJECTED">
                      Rejected - Moisture/Quality Issue
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Receiver Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Gate Inward Officer Name"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Inspection Notes
                  </label>
                  <textarea
                    rows={2}
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    placeholder="e.g. Weighbridge slip verified, gunny bags intact"
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-between items-center mt-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmModal(false)}
                    size="sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeliveryConfirmSubmit}
                    isLoading={isConfirming}
                    size="sm"
                    className="bg-emerald-700 text-white font-bold"
                  >
                    Confirm & Complete
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
