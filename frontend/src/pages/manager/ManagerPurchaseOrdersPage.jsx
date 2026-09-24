import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { ShoppingBag, CheckCircle2, AlertCircle } from "lucide-react";

export const ManagerPurchaseOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const [reviewAction, setReviewAction] = useState("APPROVE");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await purchaseOrderApi.getPOs();
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load manager POs", err);
      setError("Unable to load purchase orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReviewSubmit = async () => {
    if (!selectedPo) return;
    setIsSubmitting(true);
    setError("");
    setActionMessage("");
    try {
      await purchaseOrderApi.reviewPO(
        selectedPo._id,
        reviewAction,
        rejectionReason,
      );
      setActionMessage(
        `Purchase Order ${selectedPo.poNumber} has been ${reviewAction === "APPROVE" ? "approved" : "rejected"}.`,
      );
      setReviewModalOpen(false);
      await fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update PO status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                B2B Purchase Order Approvals
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Review incoming buyer procurement contracts, approve delivery
                schedules, and manage allocations.
              </p>
            </div>
            <Link to="/manager/allocations">
              <Button className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold">
                Lot Allocations
              </Button>
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {actionMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Table */}
          <Card className="shadow-xs bg-white">
            {isLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                Loading purchase orders...
              </p>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag
                  className="mx-auto text-slate-300 mb-2"
                  size={36}
                />
                <h3 className="text-sm font-bold text-slate-700">
                  No Purchase Orders
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  No procurement requests currently registered.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Buyer Organization</th>
                      <th className="p-3">Items & Quantity</th>
                      <th className="p-3">Order Value</th>
                      <th className="p-3">Allocated Qty</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map((po) => (
                      <tr key={po._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {po.poNumber}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {po.buyerProfile?.organizationName ||
                            po.buyer?.fullName ||
                            "Buyer"}
                        </td>
                        <td className="p-3 text-slate-700">
                          {po.totalQuantityKg.toLocaleString()} kg (
                          {po.items?.[0]?.crop?.name})
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          ₹{po.totalValue.toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold text-slate-900">
                          {po.allocatedQuantityKg.toLocaleString()} /{" "}
                          {po.totalQuantityKg.toLocaleString()} kg
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              po.status === "APPROVED"
                                ? "bg-indigo-100 text-indigo-800"
                                : po.status === "FULLY_ALLOCATED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : po.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : po.status === "REJECTED"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="p-3 text-right flex items-center justify-end gap-2">
                          {["SUBMITTED", "UNDER_REVIEW"].includes(
                            po.status,
                          ) && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedPo(po);
                                setReviewAction("APPROVE");
                                setRejectionReason("");
                                setReviewModalOpen(true);
                              }}
                              className="bg-emerald-700 text-white font-bold"
                            >
                              Review
                            </Button>
                          )}
                          <Link to={`/buyer/orders/${po._id}`}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-slate-200 text-slate-700 font-bold"
                            >
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedPo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl rounded-2xl">
            <h3 className="text-base font-black text-slate-900 mb-2">
              Review Purchase Order
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              PO {selectedPo.poNumber} from{" "}
              {selectedPo.buyerProfile?.organizationName || "Buyer"} for{" "}
              {selectedPo.totalQuantityKg.toLocaleString()} kg.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Decision *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={reviewAction === "APPROVE" ? "primary" : "outline"}
                    onClick={() => setReviewAction("APPROVE")}
                    className={
                      reviewAction === "APPROVE"
                        ? "bg-emerald-700 text-white font-bold"
                        : ""
                    }
                  >
                    Approve Order
                  </Button>
                  <Button
                    type="button"
                    variant={reviewAction === "REJECT" ? "primary" : "outline"}
                    onClick={() => setReviewAction("REJECT")}
                    className={
                      reviewAction === "REJECT"
                        ? "bg-rose-700 text-white font-bold"
                        : ""
                    }
                  >
                    Reject Order
                  </Button>
                </div>
              </div>

              {reviewAction === "REJECT" && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Rejection Reason *
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejecting this PO..."
                    className="w-full p-2.5 border border-slate-200 rounded-xl"
                    required
                  />
                </div>
              )}

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  onClick={() => setReviewModalOpen(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleReviewSubmit}
                  isLoading={isSubmitting}
                  size="sm"
                  className="bg-slate-900 text-white font-bold"
                >
                  Confirm Decision
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
