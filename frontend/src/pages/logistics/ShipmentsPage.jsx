import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { Modal } from "../../components/ui/Modal";
import { logisticsApi } from "../../services/api/logistics.api";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { allocationApi } from "../../services/api/allocation.api";
import { PlusCircle, ChevronRight, Truck } from "lucide-react";

export const ShipmentsPage = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Create Shipment Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [poList, setPoList] = useState([]);
  const [selectedPoId, setSelectedPoId] = useState("");
  const [allocations, setAllocations] = useState([]);
  const [selectedAllocIds, setSelectedAllocIds] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await logisticsApi.getShipments({
        status: statusFilter || undefined,
      });
      setShipments(res.data || []);
    } catch (err) {
      console.error("Failed to load shipments", err);
      setError("Unable to load logistics shipments.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const openCreateModal = async () => {
    setError("");
    setShowCreateModal(true);
    try {
      const [poRes, vehRes] = await Promise.all([
        purchaseOrderApi.getPOs({ status: "FULLY_ALLOCATED" }),
        logisticsApi.getVehicles({ status: "ACTIVE" }),
      ]);
      setPoList(poRes.data || []);
      setVehicles(vehRes.data || []);
      if (poRes.data?.length > 0) {
        setSelectedPoId(poRes.data[0]._id);
        loadAllocationsForPo(poRes.data[0]._id);
      }
      if (vehRes.data?.length > 0) {
        setSelectedVehicleId(vehRes.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to load POs/Vehicles for shipment modal", err);
    }
  };

  const loadAllocationsForPo = async (poId) => {
    try {
      const allocRes = await allocationApi.getAllocations({
        purchaseOrderId: poId,
        status: "ALLOCATED",
      });
      setAllocations(allocRes.data || []);
      setSelectedAllocIds((allocRes.data || []).map((a) => a._id));
    } catch (err) {
      console.error("Failed to load allocations for PO", err);
    }
  };

  const handlePoChange = (poId) => {
    setSelectedPoId(poId);
    loadAllocationsForPo(poId);
  };

  const handleCreateShipmentSubmit = async () => {
    if (!selectedPoId || !selectedVehicleId || selectedAllocIds.length === 0) {
      setError("Please select a PO, vehicle, and at least one allocated lot.");
      return;
    }

    setIsCreating(true);
    setError("");
    try {
      await logisticsApi.createShipment({
        purchaseOrderId: selectedPoId,
        vehicleId: selectedVehicleId,
        allocationIds: selectedAllocIds,
      });
      setShowCreateModal(false);
      await fetchShipments();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shipment.");
    } finally {
      setIsCreating(false);
    }
  };

  const columns = [
    {
      header: "Shipment Manifest",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {row.shipmentNumber}
          </span>
          <span className="block text-[10px] text-slate-400">
            PO: {row.purchaseOrder?.poNumber || "—"}
          </span>
        </div>
      ),
    },
    {
      header: "Origin Warehouse",
      accessor: (row) => (
        <span className="font-semibold text-slate-800">
          {row.originWarehouse?.name || "Mandi Warehouse"}
        </span>
      ),
    },
    {
      header: "Fleet Truck & Driver",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {row.vehicle?.vehicleNumber || "Unassigned"}
          </span>
          <span className="block text-[10px] text-slate-500">
            {row.driverName
              ? `${row.driverName} (${row.driverPhone})`
              : "Driver pending"}
          </span>
        </div>
      ),
    },
    {
      header: "Payload Cargo",
      accessor: (row) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.totalWeightKg?.toLocaleString()} kg
        </span>
      ),
    },
    {
      header: "Logistics Status",
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Link
          to={`/logistics/shipments/${row._id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-0.5"
        >
          <span>Track</span>
          <ChevronRight size={14} />
        </Link>
      ),
    },
  ];

  return (
    <AppShell
      title="Shipments & Logistics Control Board"
      subtitle="Dispatch scheduled freight manifests, assign transport fleet trucks, track transit waypoints, and record delivery handovers."
      breadcrumbs={[
        { label: "Logistics", href: "/logistics/dashboard" },
        { label: "Shipments" },
      ]}
      actions={
        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="READY_FOR_DISPATCH">Ready for Dispatch</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="ARRIVED">Arrived</option>
            <option value="DELIVERED">Delivered</option>
          </select>

          <Button
            onClick={openCreateModal}
            icon={<PlusCircle size={15} />}
            className="bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs"
          >
            Create Manifest
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={fetchShipments} />}

        {!error && !isLoading && shipments.length === 0 ? (
          <EmptyState
            icon={<Truck size={24} className="text-slate-400" />}
            title="No Freight Shipments Found"
            description="There are currently no active or historical shipments matching your filter criteria. Allocate purchase orders to schedule a new delivery."
            actionLabel="Schedule Shipment"
            onAction={openCreateModal}
          />
        ) : (
          <DataTable
            columns={columns}
            data={shipments}
            loading={isLoading}
            searchPlaceholder="Search manifests by number, PO, or vehicle..."
            pageSize={10}
            onRowClick={(row) => navigate(`/logistics/shipments/${row._id}`)}
          />
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Logistics Freight Manifest"
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-500">
              Schedule road transport for allocated purchase orders and assign
              an active fleet truck.
            </p>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Allocated Purchase Order *
              </label>
              <select
                value={selectedPoId}
                onChange={(e) => handlePoChange(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700"
              >
                {poList.length === 0 ? (
                  <option value="">
                    No fully allocated POs ready for dispatch
                  </option>
                ) : (
                  poList.map((po) => (
                    <option key={po._id} value={po._id}>
                      {po.poNumber} — {po.totalQuantityKg?.toLocaleString()} kg
                      ({po.buyerProfile?.organizationName || "Buyer"})
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Select Active Fleet Vehicle *
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-emerald-700"
              >
                {vehicles.length === 0 ? (
                  <option value="">No active vehicles registered</option>
                ) : (
                  vehicles.map((veh) => (
                    <option key={veh._id} value={veh._id}>
                      {veh.vehicleNumber} ({veh.type} — Max Cap:{" "}
                      {veh.capacityKg?.toLocaleString()} kg)
                    </option>
                  ))
                )}
              </select>
            </div>

            {allocations.length > 0 && (
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Allocated Produce Lots ({allocations.length})
                </label>
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2.5 space-y-1.5 bg-slate-50">
                  {allocations.map((alloc) => (
                    <label
                      key={alloc._id}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAllocIds.includes(alloc._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAllocIds([
                              ...selectedAllocIds,
                              alloc._id,
                            ]);
                          } else {
                            setSelectedAllocIds(
                              selectedAllocIds.filter((id) => id !== alloc._id),
                            );
                          }
                        }}
                        className="rounded text-emerald-700 focus:ring-emerald-600"
                      />

                      <span className="font-mono text-slate-900 font-bold">
                        {alloc.produceLot?.lotNumber ||
                          alloc.inventory?.batchNumber ||
                          alloc._id}
                      </span>
                      <span className="text-slate-500">
                        ({alloc.allocatedQuantityKg?.toLocaleString()} kg)
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold"
                onClick={handleCreateShipmentSubmit}
                isLoading={isCreating}
                disabled={
                  !selectedPoId ||
                  !selectedVehicleId ||
                  selectedAllocIds.length === 0
                }
              >
                Generate Manifest
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
};
