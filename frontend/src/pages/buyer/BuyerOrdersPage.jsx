import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import { ShoppingBag, ChevronRight, Boxes } from "lucide-react";

export const BuyerOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await purchaseOrderApi.getPOs({
        status: statusFilter || undefined,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("Failed to load purchase orders", err);
      setError("Unable to load your procurement purchase orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const columns = [
    {
      header: "PO Identifier",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {row.poNumber}
          </span>
          <span className="block text-[10px] text-slate-400">
            {new Date(row.createdAt).toLocaleDateString([], {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      ),
    },
    {
      header: "Produce Item(s)",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-900">
            {row.items?.[0]?.crop?.name || "Produce"}
          </span>
          {row.items && row.items.length > 1 && (
            <span className="block text-[10px] text-slate-500 font-medium">
              +{row.items.length - 1} additional crop items
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Order Volume",
      accessor: (row) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.totalQuantityKg?.toLocaleString()} kg
        </span>
      ),
    },
    {
      header: "Total Order Value",
      accessor: (row) => (
        <span className="font-black text-emerald-800 tabular-nums text-sm">
          ₹{row.totalValue?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Target Delivery",
      accessor: (row) => (
        <span className="text-slate-600 font-mono text-xs">
          {row.requestedDeliveryDate
            ? new Date(row.requestedDeliveryDate).toLocaleDateString([], {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Immediate"}
        </span>
      ),
    },
    {
      header: "Procurement Status",
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Link
          to={`/buyer/orders/${row._id}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs font-bold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-0.5"
        >
          <span>View Order</span>
          <ChevronRight size={14} />
        </Link>
      ),
    },
  ];

  return (
    <AppShell
      title="Procurement Purchase Orders"
      subtitle="Track your institutional purchase orders from approval and warehouse lot allocation to dispatch manifests and delivery receipts."
      breadcrumbs={[
        { label: "Buyer", href: "/buyer/dashboard" },
        { label: "Purchase Orders" },
      ]}
      actions={
        <div className="flex items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-2xs cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="FULLY_ALLOCATED">Allocated</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="DELIVERED">Delivered</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <Link to="/buyer/marketplace">
            <Button
              icon={<ShoppingBag size={15} />}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
            >
              New Procurement
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={fetchOrders} />}

        {!error && !isLoading && orders.length === 0 ? (
          <EmptyState
            icon={<Boxes size={24} className="text-slate-400" />}
            title="No Purchase Orders Recorded"
            description="You have not placed any orders matching your filter criteria. Explore available produce batches in the marketplace to create an order."
            actionLabel="Browse Marketplace"
            onAction={() => navigate("/buyer/marketplace")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            loading={isLoading}
            searchPlaceholder="Search orders by PO number or crop..."
            pageSize={10}
            onRowClick={(row) => navigate(`/buyer/orders/${row._id}`)}
          />
        )}
      </div>
    </AppShell>
  );
};
