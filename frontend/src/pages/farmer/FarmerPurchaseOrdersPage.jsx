import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { BottomNavigation } from "../../components/layout/BottomNavigation";
import { Card } from "../../components/ui/Card";
import { farmerApi } from "../../services/api/farmer.api";
import { ShoppingBag, Package } from "lucide-react";

export const FarmerPurchaseOrdersPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await farmerApi.getProcurementOrders();
        setRecords(res.data || []);
      } catch (err) {
        console.error("Failed to load farmer procurement orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalSoldKg = records.reduce(
    (acc, r) => acc + (r.allocatedQuantityKg || 0),
    0,
  );
  const totalValue = records.reduce((acc, r) => acc + (r.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <AppHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 max-w-5xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="border-b border-slate-200 pb-4">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag size={22} className="text-emerald-800" />
              Produce Sales & Procurement Orders
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Trace how your stored mandi produce lots are purchased, allocated,
              and fulfilled by institutional buyers.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            <Card className="p-4 border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Allocated to Orders
              </span>
              <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                {totalSoldKg.toLocaleString()} kg
              </p>
              <span className="text-[10px] text-slate-400">
                Sold through mandi network
              </span>
            </Card>

            <Card className="p-4 border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Gross Sales Value
              </span>
              <p className="text-xl md:text-2xl font-black text-emerald-800 mt-1">
                ₹{totalValue.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">
                Total contracted procurement
              </span>
            </Card>

            <Card className="p-4 border border-slate-200 bg-white col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Contracts
              </span>
              <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">
                {records.length}
              </p>
              <span className="text-[10px] text-slate-400">
                Institutional allocations
              </span>
            </Card>
          </div>

          {/* Procurement Records List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package size={16} className="text-emerald-700" />
              Contract Allocations ({records.length})
            </h3>

            {loading ? (
              <Card className="p-8 text-center text-slate-500 text-xs">
                Loading sales and procurement fulfillment records...
              </Card>
            ) : records.length > 0 ? (
              <div className="space-y-3">
                {records.map((item) => (
                  <Card
                    key={item.allocationId}
                    className="p-4 border border-slate-200 hover:border-emerald-600/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {item.poNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {item.poStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          Fulfilled from Lot:{" "}
                          <strong className="text-slate-900">
                            {item.lotNumber}
                          </strong>{" "}
                          • Warehouse:{" "}
                          <span className="text-slate-700">
                            {item.warehouseName}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Allocated Date:{" "}
                          {new Date(item.allocatedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                        <span className="text-base font-black text-emerald-800 font-mono">
                          ₹{item.totalAmount.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {item.allocatedQuantityKg.toLocaleString()} kg @ ₹
                          {item.unitPricePerKg}/kg
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center text-slate-500 border-dashed border-2 border-slate-200">
                <ShoppingBag
                  size={32}
                  className="mx-auto text-slate-400 mb-2"
                />
                <p className="font-bold text-slate-700 text-sm">
                  No procurement orders yet
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  When institutional B2B buyers purchase your verified warehouse
                  stock, contracted order allocations will appear here.
                </p>
              </Card>
            )}
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
};
