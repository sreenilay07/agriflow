import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/ui/DataTable";
import { FilterBar } from "../../components/ui/FilterBar";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { marketplaceApi } from "../../services/api/marketplace.api";
import {
  Award,
  MapPin,
  ArrowRight,
  Boxes,
  Table,
  LayoutGrid,
} from "lucide-react";

export const MarketplacePage = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState([]);
  const [filters, setFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter States
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table");

  const fetchLots = async () => {
    try {
      setIsLoading(true);
      setError("");
      const [lotsRes, filtersRes] = await Promise.all([
        marketplaceApi.getMarketplaceLots({
          cropId: selectedCrop || undefined,
          grade: selectedGrade || undefined,
          district: selectedDistrict || undefined,
          search: searchQuery || undefined,
          sortBy,
        }),
        marketplaceApi.getFilters(),
      ]);
      setLots(lotsRes.data || []);
      setFilters(filtersRes.data || null);
    } catch (err) {
      console.error("Failed to load marketplace lots", err);
      setError("Unable to load available produce batches.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, [selectedCrop, selectedGrade, selectedDistrict, sortBy]);

  const filterOptions = useMemo(() => {
    return [
      {
        id: "crop",
        label: "Crops",
        value: selectedCrop,
        onChange: setSelectedCrop,
        options:
          filters?.crops?.map((c) => ({ label: c.name, value: c._id })) || [],
      },
      {
        id: "grade",
        label: "Grades",
        value: selectedGrade,
        onChange: setSelectedGrade,
        options: [
          { label: "Grade A (Premium)", value: "GRADE_A" },
          { label: "Grade B (Standard)", value: "GRADE_B" },
          { label: "Grade C", value: "GRADE_C" },
        ],
      },
      {
        id: "district",
        label: "Regions",
        value: selectedDistrict,
        onChange: setSelectedDistrict,
        options: filters?.districts?.map((d) => ({ label: d, value: d })) || [],
      },
      {
        id: "sort",
        label: "Sort By",
        value: sortBy,
        onChange: setSortBy,
        options: [
          { label: "Newest Batches", value: "newest" },
          { label: "Price: Low to High", value: "price_asc" },
          { label: "Price: High to Low", value: "price_desc" },
          { label: "Quantity: High to Low", value: "qty_desc" },
        ],
      },
    ];
  }, [filters, selectedCrop, selectedGrade, selectedDistrict, sortBy]);

  const activeFilterCount =
    (selectedCrop ? 1 : 0) +
    (selectedGrade ? 1 : 0) +
    (selectedDistrict ? 1 : 0) +
    (sortBy !== "newest" ? 1 : 0);

  const handleResetFilters = () => {
    setSelectedCrop("");
    setSelectedGrade("");
    setSelectedDistrict("");
    setSortBy("newest");
    setSearchQuery("");
  };

  const columns = [
    {
      header: "Lot / Batch ID",
      accessor: (row) => (
        <div>
          <span className="font-mono font-bold text-slate-900">
            {row.lotNumber}
          </span>
          <span className="block text-[10px] text-slate-400">
            {row.warehouseName}, {row.region}
          </span>
        </div>
      ),
    },
    {
      header: "Produce Crop",
      accessor: (row) => (
        <span className="font-bold text-slate-900">{row.cropName}</span>
      ),
    },
    {
      header: "Grade & Verification",
      accessor: (row) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
              row.qualityGrade === "GRADE_A"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-blue-50 text-blue-800 border border-blue-200"
            }`}
          >
            <Award size={12} /> {row.qualityGrade.replace("_", " ")}
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            Score: {row.qualityScore}/100
          </span>
        </div>
      ),
    },
    {
      header: "Moisture / Foreign",
      accessor: (row) => (
        <div className="text-[11px] text-slate-600 font-mono">
          <span>M: {row.qualityMetrics?.moisturePercentage ?? "—"}%</span>
          <span className="mx-1">•</span>
          <span>FM: {row.qualityMetrics?.foreignMatterPercentage ?? "—"}%</span>
        </div>
      ),
    },
    {
      header: "Available Stock",
      accessor: (row) => (
        <span className="font-black text-slate-900 tabular-nums">
          {row.availableQuantityKg?.toLocaleString()} {row.unit || "kg"}
        </span>
      ),
    },
    {
      header: "Indicative Rate",
      accessor: (row) => (
        <div>
          <span className="font-black text-emerald-800 text-sm tabular-nums">
            ₹{row.unitPricePerKg}
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            {" "}
            /{row.unit || "kg"}
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      className: "text-right",
      cell: (row) => (
        <Link
          to={`/buyer/marketplace/${row.inventoryId}`}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
          >
            <span>Procure Lot</span>
            <ArrowRight size={13} className="ml-1" />
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <AppShell
      title="B2B Produce Procurement Marketplace"
      subtitle="Explore lab-inspected, grade-certified agricultural produce batches stored across registered regional warehouse facilities."
      breadcrumbs={[
        { label: "Buyer", href: "/buyer/dashboard" },
        { label: "Marketplace" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400"
              }`}
              title="Table View"
            >
              <Table size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400"
              }`}
              title="Card View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <Link to="/buyer/orders">
            <Button
              variant="outline"
              className="border-slate-300 font-bold text-slate-700 text-xs"
            >
              My Purchase Orders
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {error && <ErrorState message={error} onRetry={fetchLots} />}

        {/* Filter Bar */}
        <FilterBar
          search={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search by crop, lot number, or region..."
          filters={filterOptions}
          activeFilterCount={activeFilterCount}
          onReset={handleResetFilters}
        />

        {/* Lots Display */}
        {!error && !isLoading && lots.length === 0 ? (
          <EmptyState
            icon={<Boxes size={24} className="text-slate-400" />}
            title="No Produce Batches Matching Filters"
            description="There are currently no stored batches matching your filters. Try resetting the filters or searching for another crop."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : viewMode === "table" ? (
          <DataTable
            columns={columns}
            data={lots}
            loading={isLoading}
            searchPlaceholder=""
            pageSize={10}
            onRowClick={(row) =>
              navigate(`/buyer/marketplace/${row.inventoryId}`)
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {lots.map((lot) => (
              <div
                key={lot.inventoryId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {lot.lotNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black flex items-center gap-1 ${
                        lot.qualityGrade === "GRADE_A"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-blue-50 text-blue-800 border border-blue-200"
                      }`}
                    >
                      <Award size={12} /> {lot.qualityGrade.replace("_", " ")}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-black text-slate-900">
                      {lot.cropName}
                    </h3>
                    <span className="text-base font-black text-emerald-800">
                      ₹{lot.unitPricePerKg}
                      <span className="text-xs font-normal text-slate-400">
                        /{lot.unit}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {lot.warehouseName}, {lot.region}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Quality Score:</span>
                      <span className="font-bold text-slate-800">
                        {lot.qualityScore}/100
                      </span>
                    </div>
                    {lot.qualityMetrics?.moisturePercentage !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Moisture:</span>
                        <span className="font-bold text-slate-800">
                          {lot.qualityMetrics.moisturePercentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">
                      Available
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {lot.availableQuantityKg?.toLocaleString()} {lot.unit}
                    </span>
                  </div>
                  <Link to={`/buyer/marketplace/${lot.inventoryId}`}>
                    <Button
                      size="sm"
                      className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs"
                    >
                      <span>Procure</span>
                      <ArrowRight size={13} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};
