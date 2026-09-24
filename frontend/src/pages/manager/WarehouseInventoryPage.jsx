import React, { useEffect, useState } from "react";
import { AppShell } from "../../components/layout/AppShell";
import { MetricCard } from "../../components/ui/MetricCard";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { DataTable } from "../../components/ui/DataTable";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { inventoryApi } from "../../services/api/inventory.api";
import { Boxes, ArrowRightLeft, Warehouse, Layers } from "lucide-react";

export const WarehouseInventoryPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [inventoryItems, setInventoryItems] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        const res = await inventoryApi.getWarehouses();
        const whList = res.data || [];
        setWarehouses(whList);
        if (whList.length > 0) {
          setSelectedWarehouseId(whList[0]._id);
        }
      } catch (err) {
        console.error("Failed to load warehouses", err);
        setError("Unable to load warehouse facilities.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (!selectedWarehouseId) return;

    const fetchInventoryData = async () => {
      try {
        const [invRes, movRes] = await Promise.all([
          inventoryApi.getWarehouseInventory(selectedWarehouseId),
          inventoryApi.getInventoryMovements({
            warehouseId: selectedWarehouseId,
          }),
        ]);
        setInventoryItems(invRes.data || []);
        setMovements(movRes.data || []);
      } catch (err) {
        console.error("Failed to load inventory for warehouse", err);
      }
    };
    fetchInventoryData();
  }, [selectedWarehouseId]);

  const currentWarehouse = warehouses.find(
    (w) => w._id === selectedWarehouseId,
  );
  const usedCap = currentWarehouse ? currentWarehouse.usedCapacityKg : 0;
  const totalCap = currentWarehouse ? currentWarehouse.totalCapacityKg : 1;
  const utilizationPct = Math.min(100, Math.round((usedCap / totalCap) * 100));

  const columns = [
    {
      header: "Batch Number",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {row.batchNumber}
          </span>
          <span className="block text-[10px] text-slate-400">
            {row.lotId
              ? `Lot: ${typeof row.lotId === "object" ? row.lotId.lotNumber : row.lotId}`
              : "Direct Stock"}
          </span>
        </div>
      ),
    },
    {
      header: "Produce Crop",
      accessor: (row) => (
        <span className="font-bold text-slate-800">
          {row.cropId?.name || "Produce"}
        </span>
      ),
    },
    {
      header: "Quality Grade",
      accessor: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-50 text-amber-900 border border-amber-200">
          Grade {row.grade}
        </span>
      ),
    },
    {
      header: "Available Stock",
      accessor: (row) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.availableQuantity?.toLocaleString()} {row.unit || "kg"}
        </span>
      ),
    },
    {
      header: "Storage Bay / Bin",
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
          {row.storageLocation || "Default Bay"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
  ];

  return (
    <AppShell
      title="Warehouse Storage & Inventory"
      subtitle="Real-time stock ledger, batch storage allocations, headroom monitoring, and immutable movement logs."
      breadcrumbs={[
        { label: "Operations", href: "/manager/dashboard" },
        { label: "Warehouse Stock" },
      ]}
      actions={
        warehouses.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Warehouse:</span>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs cursor-pointer"
            >
              {warehouses.map((w) => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        ) : null
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} />}

        {/* Capacity & Headroom Strip */}
        {currentWarehouse && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="Total Storage Capacity"
                value={`${(currentWarehouse.totalCapacityKg / 1000).toLocaleString()} Tonnes`}
                subtitle="Max allowable intake headroom"
                icon={Warehouse}
                variant="default"
                loading={isLoading}
              />

              <MetricCard
                title="Occupied Stock"
                value={`${(currentWarehouse.usedCapacityKg / 1000).toLocaleString()} Tonnes`}
                subtitle={`${utilizationPct}% space utilization`}
                icon={Layers}
                variant="emerald"
                loading={isLoading}
              />

              <MetricCard
                title="Available Headroom"
                value={`${Math.max(
                  0,
                  (currentWarehouse.totalCapacityKg -
                    currentWarehouse.usedCapacityKg) /
                    1000,
                ).toLocaleString()} Tonnes`}
                subtitle="Available intake capacity"
                icon={Boxes}
                variant="blue"
                loading={isLoading}
              />
            </div>

            {/* Visual Capacity Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-700">
                  Storage Capacity Utilization
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {utilizationPct}% (
                  {((currentWarehouse.usedCapacityKg || 0) / 1000).toFixed(1)} /{" "}
                  {((currentWarehouse.totalCapacityKg || 1) / 1000).toFixed(1)}{" "}
                  T)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    utilizationPct > 85
                      ? "bg-rose-600"
                      : utilizationPct > 70
                        ? "bg-amber-500"
                        : "bg-emerald-600"
                  }`}
                  style={{ width: `${utilizationPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Inventory Batches Table */}
        {!error && !isLoading && inventoryItems.length === 0 ? (
          <EmptyState
            icon={<Boxes size={24} className="text-slate-400" />}
            title="No Produce Batches In Storage"
            description="There are currently no graded produce batches stored in this warehouse facility. Inspected lots will be automatically allocated to bays here."
          />
        ) : (
          <DataTable
            title={`In-Stock Produce Batches (${inventoryItems.length})`}
            columns={columns}
            data={inventoryItems}
            loading={isLoading}
            searchPlaceholder="Search batches by number, crop, or bay..."
            pageSize={10}
          />
        )}

        {/* Movement Audit Log */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowRightLeft size={16} className="text-slate-700" />
            <span>Recent Inventory Movement Log</span>
          </h3>

          {movements.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No movement history recorded yet.
            </p>
          ) : (
            <div className="space-y-2">
              {movements.slice(0, 5).map((mov) => (
                <div
                  key={mov._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-900">
                      {mov.movementNumber}
                    </span>
                    <span className="text-slate-600 block mt-0.5">
                      {mov.movementType} • {mov.quantity?.toLocaleString()}{" "}
                      {mov.unit} ({mov.source} → {mov.destination})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(mov.createdAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
};
