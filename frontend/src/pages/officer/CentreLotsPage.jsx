import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { lotApi } from "../../services/api/lot.api";
import { Scale, Search, CheckCircle2, AlertCircle, QrCode } from "lucide-react";

export const CentreLotsPage = () => {
  const navigate = useNavigate();
  const [lotNumberSearch, setLotNumberSearch] = useState("");
  const [searchedLot, setSearchedLot] = useState(null);
  const [receivedQty, setReceivedQty] = useState("");
  const [notes, setNotes] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!lotNumberSearch.trim()) return;
    setError("");
    setSuccessMessage("");
    setSearchedLot(null);
    setIsSearching(true);

    try {
      const res = await lotApi.getLotByNumber(lotNumberSearch.trim());
      setSearchedLot(res.data);
      setReceivedQty(String(res.data.declaredQuantity));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Produce lot not found with this lot number.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleReceive = async () => {
    if (!searchedLot) return;
    const qty = Number(receivedQty);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid received quantity greater than 0.");
      return;
    }

    setIsReceiving(true);
    setError("");
    try {
      const res = await lotApi.receiveLot(searchedLot._id, {
        receivedQuantity: qty,
        notes,
      });
      if (res.success) {
        setSuccessMessage(
          `Lot ${searchedLot.lotNumber} successfully weighed (${qty} kg) and moved to Quality Inspection!`,
        );
        setSearchedLot(null);
        setLotNumberSearch("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to record lot weighment.",
      );
    } finally {
      setIsReceiving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 max-w-4xl space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Scale className="text-emerald-700" size={24} />
                <span>Collection Centre Intake & Receiving</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Scan or enter farmer produce lot numbers to verify weighbridge
                measurement and start intake.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/officer/scan")}
              icon={<QrCode size={16} />}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              Scan QR Pass
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold rounded-xl flex items-center gap-2 shadow-xs">
              <CheckCircle2 size={20} className="text-emerald-700" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Search Lot Form */}
          <Card className="shadow-xs">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                label="Produce Lot Number"
                placeholder="e.g. MM-2026-09-000101"
                value={lotNumberSearch}
                onChange={(e) => setLotNumberSearch(e.target.value)}
                leftIcon={<Search size={18} />}
                required
              />

              <div className="pt-6">
                <Button
                  type="submit"
                  isLoading={isSearching}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
                >
                  Lookup Lot
                </Button>
              </div>
            </form>
          </Card>

          {/* Searched Lot Intake Verification Card */}
          {searchedLot && (
            <Card className="border-t-4 border-t-emerald-800 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-sm font-black text-slate-900">
                    {searchedLot.lotNumber}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Farmer: <strong>{searchedLot.farmerId?.fullName}</strong> (
                    {searchedLot.farmerId?.phoneNumber})
                  </p>
                </div>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                  Status: {searchedLot.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block font-medium">
                    Crop:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {searchedLot.cropId?.name} ({searchedLot.cropId?.code})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">
                    Declared Quantity:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {searchedLot.declaredQuantity} {searchedLot.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">
                    Harvest Farm:
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {searchedLot.farmId?.farmName || "General Field"}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Input
                  label="Verified Scale Weight / Received Quantity (KG)"
                  type="number"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                  min="1"
                  required
                />

                <Input
                  label="Weighbridge Notes / Quality Observations"
                  placeholder="e.g. Clean bags, Weighbridge #2 verified"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />

                <Button
                  fullWidth
                  onClick={handleReceive}
                  isLoading={isReceiving}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 mt-2"
                >
                  Confirm Weighment & Queue for Quality Inspection
                </Button>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
};
