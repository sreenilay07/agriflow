import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export function DataTable({
  columns,
  data,
  searchPlaceholder = "Search records...",
  pageSize = 10,
  loading = false,
  emptyMessage = "No records found",
  emptySubtext = "Try refining your search or add a new entry to get started.",
  onRowClick,
  headerAction,
  title,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((row) => {
      return columns.some((col) => {
        if (col.accessor) {
          if (typeof col.accessor === "function") {
            return false;
          }
          const val = row[col.accessor];
          if (val !== undefined && val !== null) {
            return String(val).toLowerCase().includes(term);
          }
        }
        return false;
      });
    });
  }, [data, columns, searchTerm]);

  // Paginate filtered data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Table Header Bar */}
      {(title || searchPlaceholder || headerAction) && (
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-slate-50/50">
          {title && (
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {searchPlaceholder && (
              <div className="relative flex-1 sm:w-64">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-1.5 bg-white text-xs text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all placeholder:text-slate-400"
                />
              </div>
            )}
            {headerAction}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100/75 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              {columns.map((col, idx) => (
                <th key={idx} className={`py-3.5 px-4 ${col.className || ""}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Loading Skeleton
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={columns.length} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="p-3 bg-slate-100 text-slate-400 rounded-2xl mb-3 border border-slate-200">
                      <Inbox size={28} />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {emptySubtext}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Rows
              paginatedData.map((row, rIdx) => (
                <tr
                  key={row.id || row._id || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3.5 px-4 text-slate-700 ${col.className || ""}`}
                    >
                      {col.cell
                        ? col.cell(row)
                        : typeof col.accessor === "function"
                          ? col.accessor(row)
                          : col.accessor
                            ? row[col.accessor]
                            : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {!loading && filteredData.length > pageSize && (
        <div className="p-3 sm:px-5 sm:py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 text-xs text-slate-600">
          <span>
            Showing{" "}
            <strong className="text-slate-900">
              {(currentPage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-900">
              {Math.min(currentPage * pageSize, filteredData.length)}
            </strong>{" "}
            of <strong className="text-slate-900">{filteredData.length}</strong>{" "}
            results
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-bold text-slate-900">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
