import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Loader2,
  X,
  ArrowRight,
  Package,
  ShoppingBag,
  Truck,
  Warehouse,
  User,
  Sprout,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { searchApi } from "../../services/api/search.api";

export const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchApi.search(query);
        setResults(res);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    setQuery("");
    navigate(item.link);
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "ProduceLot":
        return <Package size={16} className="text-emerald-400" />;
      case "PurchaseOrder":
        return <ShoppingBag size={16} className="text-indigo-400" />;
      case "Shipment":
        return <Truck size={16} className="text-purple-400" />;
      case "Warehouse":
        return <Warehouse size={16} className="text-amber-400" />;
      case "Farm":
        return <Sprout size={16} className="text-teal-400" />;
      default:
        return <User size={16} className="text-blue-400" />;
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Search trigger button in header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-all cursor-pointer shadow-inner"
      >
        <Search size={14} className="text-slate-500" />
        <span className="hidden sm:inline">Search lots, POs, shipments...</span>
        <span className="sm:hidden">Search</span>
        <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
          ⌘K
        </kbd>
      </button>

      {/* Modal / Popover Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-950/60">
              <Search size={18} className="text-emerald-400 mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by lot number, PO, shipment, farmer, warehouse..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-hidden"
              />

              {loading && (
                <Loader2
                  size={16}
                  className="animate-spin text-slate-400 mr-2"
                />
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 divide-y divide-slate-800/40">
              {results.length > 0 ? (
                results.map((item) => (
                  <div
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelect(item)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/80 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700">
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white group-hover:text-emerald-300">
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={15}
                      className="text-slate-600 group-hover:text-emerald-400 transition-colors"
                    />
                  </div>
                ))
              ) : query.trim() && !loading ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  No matching records found for "{query}".
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-500">
                  Type to search across lots, purchase orders, shipments,
                  farmers, and warehouses.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
