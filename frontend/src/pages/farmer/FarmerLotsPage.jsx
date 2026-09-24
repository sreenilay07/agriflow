import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { lotApi } from "../../services/api/lot.api";
import { PlusCircle, ChevronRight, Boxes } from "lucide-react";

export const FarmerLotsPage = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLots = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await lotApi.getFarmerLots();
      setLots(res.data || []);
    } catch (err) {
      console.error("Failed to load farmer lots", err);
      setError(
        "Unable to load your produce lots. Please verify your connection.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const columns = [
    {
      header: "Lot Identifier",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900 tracking-tight">
            {row.lotNumber}
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
      header: "Produce & Variety",
      accessor: (row) => (
        <div>
          <span className="font-bold text-slate-800">
            {row.cropId?.name || "Produce"}
          </span>
          <span className="block text-[10px] text-slate-500">
            Farm: {row.farmId?.farmName || "Primary Farm"}
          </span>
        </div>
      ),
    },
    {
      header: "Declared Volume",
      accessor: (row) => (
        <span className="font-semibold text-slate-800">
          {row.declaredQuantity?.toLocaleString()} {row.unit || "kg"}
        </span>
      ),
    },
    {
      header: "Accepted Volume",
      accessor: (row) => (
        <span className="font-semibold text-emerald-800">
          {row.acceptedQuantity !== undefined && row.acceptedQuantity !== null
            ? `${row.acceptedQuantity.toLocaleString()} ${row.unit || "kg"}`
            : "—"}
        </span>
      ),
    },
    {
      header: "Quality Grade",
      accessor: (row) => {
        const grade = row.qualityInspectionId?.assignedGrade;
        if (!grade) {
          return (
            <span className="text-[11px] text-slate-400 font-medium">
              Pending test
            </span>
          );
        }
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-black bg-amber-50 text-amber-900 border border-amber-200">
            Grade {grade}
          </span>
        );
      },
    },
    {
      header: "Status",
      accessor: (row) => <StatusBadge status={row.status} size="sm" />,
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (row) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "CREATED" && (
            <Link
              to="/farmer/book"
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200"
            >
              Book Slot
            </Link>
          )}
          <Link
            to={`/farmer/lots/${row._id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 inline-flex items-center gap-0.5"
          >
            <span>Details</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AppShell
      title="My Produce Lots"
      subtitle="Register harvested crops, monitor lab inspection grading, and track batch traceability from farm to buyer."
      breadcrumbs={[
        { label: "Farmer", href: "/farmer/dashboard" },
        { label: "Produce Lots" },
      ]}
      actions={
        <Link to="/farmer/lots/new">
          <Button
            icon={<PlusCircle size={16} />}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
          >
            Register Produce Lot
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={fetchLots} />}

        {!error && !isLoading && lots.length === 0 ? (
          <EmptyState
            icon={<Boxes size={24} className="text-slate-400" />}
            title="No Produce Lots Registered Yet"
            description="Create a digital produce lot for your harvested crops to schedule arrival at a procurement centre and receive lab-verified quality certificates."
            actionLabel="Register Produce Lot"
            onAction={() => navigate("/farmer/lots/new")}
          />
        ) : (
          <DataTable
            columns={columns}
            data={lots}
            loading={isLoading}
            searchPlaceholder="Search lots by number, crop, or status..."
            pageSize={10}
            onRowClick={(row) => navigate(`/farmer/lots/${row._id}`)}
          />
        )}
      </div>
    </AppShell>
  );
};
