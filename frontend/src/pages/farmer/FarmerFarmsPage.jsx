import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { BottomNavigation } from "../../components/layout/BottomNavigation";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { farmApi } from "../../services/api/farm.api";
import { MapPin, PlusCircle, AlertCircle } from "lucide-react";

export const FarmerFarmsPage = () => {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [farmName, setFarmName] = useState("");
  const [village, setVillage] = useState("");
  const [mandal, setMandal] = useState("");
  const [district, setDistrict] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [acreage, setAcreage] = useState("");

  const fetchFarms = async () => {
    try {
      setIsLoading(true);
      const res = await farmApi.getFarmerFarms();
      setFarms(res.data || []);
    } catch (err) {
      console.error("Failed to load farms", err);
      setError("Unable to load your farm records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleAddFarm = async (e) => {
    e.preventDefault();
    setError("");

    const acres = Number(acreage);
    if (isNaN(acres) || acres <= 0) {
      setError("Please enter a valid acreage greater than 0.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await farmApi.createFarm({
        farmName,
        village,
        mandal,
        district,
        surveyNumber,
        acreage: acres,
      });

      if (res.success) {
        setShowAddForm(false);
        setFarmName("");
        setVillage("");
        setMandal("");
        setDistrict("");
        setSurveyNumber("");
        setAcreage("");
        fetchFarms();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add farm.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 font-sans">
      <AppHeader />

      <main className="max-w-3xl mx-auto p-4 space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MapPin className="text-emerald-700" size={22} />
              <span>My Cultivated Farms</span>
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Manage your agricultural land holdings and survey acreage.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
            icon={<PlusCircle size={16} />}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold"
          >
            {showAddForm ? "Cancel" : "Add Farm"}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-sm font-semibold rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {showAddForm && (
          <Card className="border-t-4 border-t-emerald-800 shadow-md">
            <h2 className="text-base font-bold text-slate-900 mb-3">
              Register New Agricultural Land / Farm
            </h2>
            <form onSubmit={handleAddFarm} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Farm Name / Identifier"
                  placeholder="e.g. North Field or Lake View Farm"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  required
                />

                <Input
                  label="Acreage (in Acres)"
                  type="number"
                  placeholder="e.g. 5.5"
                  value={acreage}
                  onChange={(e) => setAcreage(e.target.value)}
                  step="0.1"
                  min="0.1"
                  required
                />

                <Input
                  label="Survey Number"
                  placeholder="e.g. SY-128/B"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                />

                <Input
                  label="Village"
                  placeholder="Village name"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                />

                <Input
                  label="Mandal"
                  placeholder="Mandal name"
                  value={mandal}
                  onChange={(e) => setMandal(e.target.value)}
                />

                <Input
                  label="District"
                  placeholder="District name"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs"
                >
                  Save Farm
                </Button>
              </div>
            </form>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-xs text-slate-500 animate-pulse">
            Loading farm records...
          </div>
        ) : farms.length === 0 ? (
          <Card className="text-center py-8 space-y-2">
            <p className="text-sm font-bold text-slate-700">
              No farms added yet
            </p>
            <p className="text-xs text-slate-500">
              Register your farm fields to attach them to future produce lots.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {farms.map((farm) => (
              <Card
                key={farm._id}
                className="hover:border-emerald-600 shadow-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {farm.farmName}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {farm.village}, {farm.mandal || farm.district}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300">
                    {farm.acreage} Acres
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600 flex justify-between">
                  <span>
                    Survey: <strong>{farm.surveyNumber || "N/A"}</strong>
                  </span>
                  <span>
                    Ownership: <strong>{farm.ownershipType}</strong>
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <BottomNavigation />
    </div>
  );
};
