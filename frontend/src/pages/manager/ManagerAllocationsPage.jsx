import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { allocationApi } from "../../services/api/allocation.api";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { marketplaceApi } from "../../services/api/marketplace.api";
import { Boxes, PlusCircle, CheckCircle2, AlertCircle } from "lucide-react";

export const ManagerAllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  // Allocate Lot Modal
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [poList, setPoList] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [availableLots, setAvailableLots] = useState([]);
  const [selectedLotInventoryId, setSelectedLotInventoryId] = useState("");
  const [allocatedQty, setAllocatedQty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAllocations = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await allocationApi.getAllocations();
      setAllocations(res.data || []);
    } catch (err) {
      console.error("Failed to load allocations", err);
      setError("Unable to load allocations.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  const openAllocateModal = async () => {
    setError("");
    setShowAllocateModal(true);
    try {
      const [poRes, lotRes] = await Promise.all([
        purchaseOrderApi.getPOs({ status: "APPROVED" }),
        marketplaceApi.getMarketplaceLots(),
      ]);
      setPoList(poRes.data || []);
      setAvailableLots(lotRes.data || []);
      if (poRes.data?.length > 0) {
        setSelectedPoId(poRes.data[0]._id);
      }
      if (lotRes.data?.length > 0) {
        setSelectedLotInventoryId(lotRes.data[0].inventoryId);
        setAllocatedQty(String(lotRes.data[0].availableQuantityKg));
      }
    } catch (err) {
      console.error("Failed to load POs or lots for allocation modal", err);
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPoId || !selectedLotInventoryId || !allocatedQty) {
      setError("Please select a PO, produce lot, and allocation quantity.");
      return;
    }

    const selectedPo = poList.find((p) => p._id === selectedPoId);
    const selectedLot = availableLots.find(
      (l) => l.inventoryId === selectedLotInventoryId,
    );

    if (!selectedPo || !selectedLot) {
      setError("Invalid PO or produce lot selection.");
      return;
    }

    const poItemId = selectedPo.items?.[0]?._id;
    if (!poItemId) {
      setError("Purchase Order does not contain valid line items.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setActionMessage("");
    try {
      await allocationApi.allocateLot({
        purchaseOrderId: selectedPo._id,
        purchaseOrderItemId: poItemId,
        produceLotId: selectedLot.lotId,
        inventoryId: selectedLot.inventoryId,
        allocatedQuantityKg: Number(allocatedQty),
      });
      setActionMessage(
        `Successfully allocated ${allocatedQty} kg from lot ${selectedLot.lotNumber} to PO ${selectedPo.poNumber}.`,
      );
      setShowAllocateModal(false);
      await fetchAllocations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to allocate lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAllocation = async (allocationId) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel this allocation and release reserved inventory?",
      )
    )
      return;
    setError("");
    setActionMessage("");
    try {
      await allocationApi.cancelAllocation(
        allocationId,
        "Cancelled by manager",
      );
      setActionMessage(
        "Allocation cancelled and inventory released to available stock.",
      );
      await fetchAllocations();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel allocation.");
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
                Lot Allocations & Order Fulfillment
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Map stored warehouse inventory batches to approved buyer
                purchase orders with atomic reservations.
              </p>
            </div>
            <Button
              onClick={openAllocateModal}
              icon={<PlusCircle size={16} />}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
            >
              Allocate Lot to PO
            </Button>
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

          {/* Allocations Table */}
          <Card className="shadow-xs bg-white">
            {isLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                Loading allocations...
              </p>
            ) : allocations.length === 0 ? (
              <div className="text-center py-12">
                <Boxes className="mx-auto text-slate-300 mb-2" size={36} />
                <h3 className="text-sm font-bold text-slate-700">
                  No Allocations Recorded
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Allocate stored produce lots to approved purchase orders.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">PO Number</th>
                      <th className="p-3">Produce Lot</th>
                      <th className="p-3">Origin Warehouse</th>
                      <th className="p-3">Allocated Qty</th>
                      <th className="p-3">Unit Price</th>
                      <th className="p-3">Total Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allocations.map((alloc) => (
                      <tr key={alloc._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {alloc.purchaseOrder?.poNumber}
                        </td>
                        <td className="p-3 font-mono text-slate-700">
                          {alloc.produceLot?.lotNumber}
                        </td>
                        <td className="p-3 text-slate-600">
                          {alloc.warehouse?.name}
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
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              alloc.status === "ALLOCATED"
                                ? "bg-blue-100 text-blue-800"
                                : alloc.status === "DISPATCHED"
                                  ? "bg-indigo-100 text-indigo-800"
                                  : alloc.status === "DELIVERED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {alloc.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {alloc.status === "ALLOCATED" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelAllocation(alloc._id)}
                              className="text-rose-700 border-rose-200 font-bold"
                            >
                              Cancel Allocation
                            </Button>
                          )}
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

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl rounded-2xl">
            <h3 className="text-base font-black text-slate-900 mb-2">
              Allocate Warehouse Lot to PO
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Reserve available warehouse inventory for an approved purchase
              order.
            </p>

            <form
              onSubmit={handleAllocateSubmit}
              className="flex flex-col gap-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Approved Purchase Order *
                </label>
                <select
                  value={selectedPoId}
                  onChange={(e) => setSelectedPoId(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  required
                >
                  {poList.map((po) => (
                    <option key={po._id} value={po._id}>
                      {po.poNumber} — {po.totalQuantityKg.toLocaleString()} kg (
                      {po.buyerProfile?.organizationName || "Buyer"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Stored Produce Lot *
                </label>
                <select
                  value={selectedLotInventoryId}
                  onChange={(e) => {
                    setSelectedLotInventoryId(e.target.value);
                    const l = availableLots.find(
                      (lot) => lot.inventoryId === e.target.value,
                    );
                    if (l) setAllocatedQty(String(l.availableQuantityKg));
                  }}
                  className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  required
                >
                  {availableLots.map((l) => (
                    <option key={l.inventoryId} value={l.inventoryId}>
                      {l.cropName} ({l.qualityGrade}) — {l.lotNumber} (
                      {l.availableQuantityKg.toLocaleString()} kg available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantity to Allocate (kg) *
                </label>
                <Input
                  type="number"
                  value={allocatedQty}
                  onChange={(e) => setAllocatedQty(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="sm"
                  className="bg-emerald-700 text-white font-bold"
                >
                  Confirm Allocation
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
