import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNavigation } from "../../components/layout/BottomNavigation";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { lotApi } from "../../services/api/lot.api";
import { farmApi } from "../../services/api/farm.api";
import { centreApi } from "../../services/api/centre.api";
import {
  Sprout,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Calendar,
} from "lucide-react";

export const CreateLotPage = () => {
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [centres, setCentres] = useState([]);

  const [selectedCropId, setSelectedCropId] = useState("");
  const [declaredQuantity, setDeclaredQuantity] = useState("");
  const [selectedFarmId, setSelectedFarmId] = useState("");
  const [selectedCentreId, setSelectedCentreId] = useState("");
  const [harvestDate, setHarvestDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [successLot, setSuccessLot] = useState(null);

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        setIsFetchingData(true);
        const [cropsRes, farmsRes, centresRes] = await Promise.all([
          centreApi.getCrops(),
          farmApi.getFarmerFarms(),
          centreApi.getCentres(),
        ]);
        setCrops(cropsRes.data || []);
        if (cropsRes.data && cropsRes.data.length > 0) {
          setSelectedCropId(cropsRes.data[0]._id);
        }

        setFarms(farmsRes.data || []);
        if (farmsRes.data && farmsRes.data.length > 0) {
          setSelectedFarmId(farmsRes.data[0]._id);
        }

        setCentres(centresRes.data || []);
        if (centresRes.data && centresRes.data.length > 0) {
          setSelectedCentreId(centresRes.data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load produce lot prerequisites", err);
        setError("Failed to load crop and centre lists.");
      } finally {
        setIsFetchingData(false);
      }
    };
    loadPrerequisites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const qty = Number(declaredQuantity);
    if (isNaN(qty) || qty <= 0) {
      setError("Please enter a valid declared quantity greater than 0.");
      return;
    }

    if (!selectedCropId) {
      setError("Please select a crop category.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await lotApi.createLot({
        cropId: selectedCropId,
        declaredQuantity: qty,
        farmId: selectedFarmId || undefined,
        collectionCentreId: selectedCentreId || undefined,
        harvestDate: harvestDate || undefined,
        unit: "KG",
      });

      if (res.success && res.data) {
        setSuccessLot(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create produce lot.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <AppHeader />

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/farmer/lots")}
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to My Produce Lots
          </button>
        </div>

        {successLot ? (
          <Card className="text-center py-8 space-y-4 border-2 border-emerald-600">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-3xl">
              <CheckCircle2 size={36} className="text-emerald-700" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              Produce Lot Registered!
            </h2>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-sm mx-auto font-mono">
              <p className="text-xs text-slate-500 uppercase font-bold">
                Official Lot Number
              </p>
              <p className="text-lg font-black text-emerald-800 mt-0.5">
                {successLot.lotNumber}
              </p>
              <p className="text-xs text-slate-600 mt-2">
                Declared Quantity:{" "}
                <strong>{successLot.declaredQuantity} KG</strong>
              </p>
            </div>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your produce lot is now ready. You can book an arrival slot at a
              collection centre to receive your digital token.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row justify-center gap-2">
              <Link to="/farmer/book">
                <Button className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs">
                  Proceed to Book Arrival Slot
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => navigate(`/farmer/lots/${successLot._id}`)}
                className="text-xs font-bold"
              >
                View Lot Details
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="shadow-md">
            <div className="border-b border-slate-100 pb-4 mb-4">
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Sprout className="text-emerald-700" size={22} />
                <span>Register Harvested Produce Lot</span>
              </h1>
              <p className="text-xs text-slate-600 mt-1">
                Declare your harvested crop quantity to generate an auditable
                Agriflow produce batch.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {isFetchingData ? (
              <div className="py-8 text-center text-xs text-slate-500 animate-pulse">
                Loading crop catalog and farm records...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Crop Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Crop / Produce Category{" "}
                    <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={selectedCropId}
                    onChange={(e) => setSelectedCropId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  >
                    {crops.map((crop) => (
                      <option key={crop._id} value={crop._id}>
                        {crop.name} ({crop.code}) — Base ₹
                        {crop.basePricePerKg || 25}/kg
                      </option>
                    ))}
                  </select>
                </div>

                {/* Declared Quantity */}
                <Input
                  label="Declared Quantity (in Kilograms)"
                  type="number"
                  placeholder="e.g. 2500"
                  value={declaredQuantity}
                  onChange={(e) => setDeclaredQuantity(e.target.value)}
                  min="1"
                  required
                />

                {/* Farm Selection */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Harvest Farm Land (Optional)
                    </label>
                    <Link
                      to="/farmer/farms"
                      className="text-xs text-emerald-700 font-bold hover:underline"
                    >
                      + Add New Farm
                    </Link>
                  </div>
                  <select
                    value={selectedFarmId}
                    onChange={(e) => setSelectedFarmId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">-- No specific farm specified --</option>
                    {farms.map((farm) => (
                      <option key={farm._id} value={farm._id}>
                        {farm.farmName} ({farm.acreage} Acres, {farm.village})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harvest Date */}
                <Input
                  label="Harvest Date"
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  leftIcon={<Calendar size={18} />}
                  required
                />

                {/* Preferred Collection Centre */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Designated Collection Centre
                  </label>
                  <select
                    value={selectedCentreId}
                    onChange={(e) => setSelectedCentreId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    {centres.map((centre) => (
                      <option key={centre._id} value={centre._id}>
                        {centre.name} ({centre.code}) — {centre.village}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <Button
                    fullWidth
                    type="submit"
                    isLoading={isLoading}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3"
                  >
                    Register Produce Lot
                  </Button>
                </div>
              </form>
            )}
          </Card>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
