import React, { useEffect, useState } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { logisticsApi } from "../../services/api/logistics.api";
import { Truck, PlusCircle, AlertCircle } from "lucide-react";

export const VehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [type, setType] = useState("HEAVY_TRUCK_10T");
  const [capacityKg, setCapacityKg] = useState("10000");
  const [transporterName, setTransporterName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await logisticsApi.getVehicles();
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Failed to load vehicles", err);
      setError("Unable to load fleet vehicles.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !driverName.trim() || !driverPhone.trim()) {
      setError("Vehicle number, driver name, and driver phone are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await logisticsApi.createVehicle({
        vehicleNumber: vehicleNumber.toUpperCase().trim(),
        type,
        capacityKg: Number(capacityKg),
        transporterName,
        driverName,
        driverPhone,
        driverLicenseNumber,
      });
      setShowAddModal(false);
      // Reset form
      setVehicleNumber("");
      setDriverName("");
      setDriverPhone("");
      setDriverLicenseNumber("");
      await fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 flex flex-col gap-6 max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                Transport Fleet Registry
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Manage registered trucks, drivers, tare capacities, and active
                assignments.
              </p>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              icon={<PlusCircle size={16} />}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Add Fleet Vehicle
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Vehicles Table */}
          <Card className="shadow-xs bg-white">
            {isLoading ? (
              <p className="text-xs text-slate-400 py-12 text-center">
                Loading fleet...
              </p>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="mx-auto text-slate-300 mb-2" size={36} />
                <h3 className="text-sm font-bold text-slate-700">
                  No Vehicles Registered
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add your first transport truck to assign dispatches.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Vehicle Number</th>
                      <th className="p-3">Truck Type</th>
                      <th className="p-3">Payload Capacity</th>
                      <th className="p-3">Transporter</th>
                      <th className="p-3">Driver Name</th>
                      <th className="p-3">Driver Phone</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vehicles.map((veh) => (
                      <tr key={veh._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {veh.vehicleNumber}
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {veh.type.replace(/_/g, " ")}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">
                          {veh.capacityKg.toLocaleString()} kg
                        </td>
                        <td className="p-3 text-slate-600">
                          {veh.transporterName || "Self / Direct"}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {veh.driverName}
                        </td>
                        <td className="p-3 text-slate-600">
                          {veh.driverPhone}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              veh.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {veh.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="max-w-md w-full p-6 bg-white shadow-xl rounded-2xl">
            <h3 className="text-base font-black text-slate-900 mb-2">
              Register Transport Vehicle
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter vehicle registration details and assign a primary verified
              driver.
            </p>

            <form
              onSubmit={handleCreateVehicle}
              className="flex flex-col gap-3 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Vehicle Registration No *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. TS09AB1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="font-mono font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Truck Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="MINI_TRUCK_3T">Mini Truck (3 Ton)</option>
                    <option value="MEDIUM_TRUCK_7T">
                      Medium Truck (7 Ton)
                    </option>
                    <option value="HEAVY_TRUCK_10T">
                      Heavy Truck (10 Ton)
                    </option>
                    <option value="MULTI_AXLE_16T">Multi-Axle (16 Ton)</option>
                    <option value="TRAILER_25T">Trailer (25 Ton)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Capacity (kg) *
                  </label>
                  <Input
                    type="number"
                    value={capacityKg}
                    onChange={(e) => setCapacityKg(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Transporter / Agency Name
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Deccan Logistics Fleet"
                  value={transporterName}
                  onChange={(e) => setTransporterName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Driver Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Driver Phone *
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit phone"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Driver Commercial License No
                </label>
                <Input
                  type="text"
                  placeholder="e.g. DL-0420110012345"
                  value={driverLicenseNumber}
                  onChange={(e) => setDriverLicenseNumber(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center mt-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  size="sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  size="sm"
                  className="bg-slate-900 text-white font-bold"
                >
                  Save Vehicle
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
