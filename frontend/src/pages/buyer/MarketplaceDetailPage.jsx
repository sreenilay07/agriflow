import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AppHeader } from "../../components/layout/AppHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { marketplaceApi } from "../../services/api/marketplace.api";
import { purchaseOrderApi } from "../../services/api/purchaseOrder.api";
import {
  ArrowLeft,
  Award,
  MapPin,
  ShieldCheck,
  AlertCircle,
  DollarSign,
} from "lucide-react";

export const MarketplaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lotData, setLotData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // PO Builder Form States
  const [step, setStep] = useState(1);
  const [requestedQty, setRequestedQty] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
  );
  const [facilityName, setFacilityName] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("Hyderabad");
  const [state, setState] = useState("Telangana");
  const [pincode, setPincode] = useState("500001");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const res = await marketplaceApi.getMarketplaceLotDetail(id);
        setLotData(res.data);
        if (res.data?.availableQuantityKg) {
          setRequestedQty(String(res.data.availableQuantityKg));
        }
      } catch (err) {
        console.error("Failed to load lot detail", err);
        setError("Unable to load produce lot details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-4xl mx-auto w-full px-4 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-emerald-600 border-t-transparent"></div>
          <p className="text-xs text-slate-400 mt-2">
            Loading produce lot specification...
          </p>
        </div>
      </div>
    );
  }

  if (!lotData) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
        <AppHeader />
        <div className="max-w-4xl mx-auto w-full px-4 py-16 text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-2" size={36} />
          <h2 className="text-base font-bold text-slate-800">
            Produce Lot Not Found
          </h2>
          <Link to="/buyer/marketplace">
            <Button
              size="sm"
              className="mt-4 bg-emerald-700 text-white font-bold"
            >
              Back to Marketplace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const qty = Number(requestedQty) || 0;
  const unitPrice = lotData.unitPricePerKg || 25;
  const subtotal = Number((qty * unitPrice).toFixed(2));
  const tax = Number((subtotal * 0.05).toFixed(2));
  const totalValue = Number((subtotal + tax).toFixed(2));

  const handleNextStep = () => {
    if (step === 1) {
      if (qty <= 0) {
        setError("Please enter a valid procurement quantity.");
        return;
      }
      if (qty > lotData.availableQuantityKg) {
        setError(
          `Quantity exceeds available stock of ${lotData.availableQuantityKg.toLocaleString()} kg.`,
        );
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!district || !state) {
        setError("Please specify the destination district and state.");
        return;
      }
      setError("");
      setStep(3);
    }
  };

  const handleCreatePurchaseOrder = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const res = await purchaseOrderApi.createPO({
        items: [
          {
            cropId: lotData.crop._id,
            requestedGrade:
              lotData.qualityInspection?.assignedGrade || "GRADE_A",
            requestedQuantityKg: qty,
            agreedUnitPricePerKg: unitPrice,
          },
        ],
        requestedDeliveryDate,
        deliveryAddress: {
          facilityName,
          street,
          district,
          state,
          pincode,
          contactPerson,
          contactPhone,
        },
        notes,
      });

      if (res.success && res.data?._id) {
        navigate(`/buyer/orders/${res.data._id}`);
      } else {
        navigate("/buyer/orders");
      }
    } catch (err) {
      console.error("Failed to create purchase order", err);
      setError(
        err.response?.data?.message ||
          "Failed to submit Purchase Order. Please ensure your buyer profile is verified.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <AppHeader />
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1 flex flex-col gap-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/buyer/marketplace"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to Marketplace
          </Link>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <ShieldCheck size={14} /> Verified Quality Lot
          </span>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Step Indicator */}
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? "text-emerald-700 font-bold" : "text-slate-400"}`}
          >
            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-xs">
              1
            </span>
            <span className="text-xs">Select Quantity</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200"></div>
          <div
            className={`flex items-center gap-2 ${step >= 2 ? "text-emerald-700 font-bold" : "text-slate-400"}`}
          >
            <span
              className={`w-6 h-6 rounded-full ${step >= 2 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"} flex items-center justify-center text-xs`}
            >
              2
            </span>
            <span className="text-xs">Delivery Details</span>
          </div>
          <div className="h-0.5 w-12 bg-slate-200"></div>
          <div
            className={`flex items-center gap-2 ${step >= 3 ? "text-emerald-700 font-bold" : "text-slate-400"}`}
          >
            <span
              className={`w-6 h-6 rounded-full ${step >= 3 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"} flex items-center justify-center text-xs`}
            >
              3
            </span>
            <span className="text-xs">Review & Submit PO</span>
          </div>
        </div>

        {/* Step 1: Lot Specification & Quantity Selection */}
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 shadow-xs bg-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
                    {lotData.lotNumber}
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 mt-2">
                    {lotData.crop?.name}
                  </h1>
                  <p className="text-xs text-slate-500">
                    {lotData.crop?.category} • Standard Mandi Standard
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Award size={14} />{" "}
                  {lotData.qualityInspection?.assignedGrade?.replace("_", " ")}
                </span>
              </div>

              {/* Quality Metrics */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                <h3 className="text-xs font-bold uppercase text-slate-600 mb-3">
                  Verified Quality Parameters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Quality Score
                    </span>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">
                      {lotData.qualityInspection?.qualityScore || 85}/100
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Moisture
                    </span>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">
                      {lotData.qualityInspection?.metrics?.moisturePercentage ??
                        13}
                      %
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">
                      Foreign Matter
                    </span>
                    <span className="text-base font-black text-slate-900 mt-0.5 block">
                      {lotData.qualityInspection?.metrics
                        ?.foreignMatterPercentage ?? 1}
                      %
                    </span>
                  </div>
                </div>
              </div>

              {/* Warehouse Location Info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-xs mb-6">
                <MapPin className="text-emerald-700 shrink-0" size={18} />
                <div>
                  <span className="font-bold text-slate-900 block">
                    {lotData.warehouse?.name}
                  </span>
                  <span className="text-slate-500">
                    {lotData.warehouse?.location}, {lotData.warehouse?.district}
                    , {lotData.warehouse?.state}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Procurement Quantity (in kg) *
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max={lotData.availableQuantityKg}
                    value={requestedQty}
                    onChange={(e) => setRequestedQty(e.target.value)}
                    className="font-bold text-base"
                    placeholder="Enter quantity in kg"
                  />

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setRequestedQty(String(lotData.availableQuantityKg))
                    }
                    className="text-xs font-bold text-emerald-700 border-emerald-200"
                  >
                    Max ({lotData.availableQuantityKg.toLocaleString()} kg)
                  </Button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Available in this warehouse batch:{" "}
                  {lotData.availableQuantityKg.toLocaleString()} kg
                </span>
              </div>
            </Card>

            {/* Price Summary Sticky Box */}
            <Card className="shadow-xs bg-white flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-700" /> Cost
                  Summary
                </h3>
                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agreed Price</span>
                    <span className="font-bold text-slate-900">
                      ₹{unitPrice}/kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quantity</span>
                    <span className="font-bold text-slate-900">
                      {qty.toLocaleString()} kg
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-bold text-slate-900">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      Mandi Cess / Tax (5%)
                    </span>
                    <span className="font-bold text-slate-900">
                      ₹{tax.toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-black text-slate-900 text-sm">
                      Estimated Total
                    </span>
                    <span className="font-black text-emerald-700 text-lg">
                      ₹{totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleNextStep}
                className="w-full mt-6 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Proceed to Delivery Info
              </Button>
            </Card>
          </div>
        )}

        {/* Step 2: Delivery Details Form */}
        {step === 2 && (
          <Card className="shadow-xs bg-white max-w-2xl mx-auto w-full p-6">
            <h2 className="text-lg font-black text-slate-900 mb-2">
              Delivery & Destination Requirements
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Specify your processing mill, packaging plant, or warehouse
              destination details.
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Requested Delivery Date *
                </label>
                <Input
                  type="date"
                  value={requestedDeliveryDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Destination Facility Name (e.g. AgroFresh Mill #2)
                </label>
                <Input
                  type="text"
                  placeholder="Facility or Mill Name"
                  value={facilityName}
                  onChange={(e) => setFacilityName(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Street Address / Plot No.
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Industrial Area Phase 2, Plot 45"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <Input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    State *
                  </label>
                  <Input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pincode
                  </label>
                  <Input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiver Contact Person
                  </label>
                  <Input
                    type="text"
                    placeholder="Manager Name"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Receiver Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Logistics & Unloading Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Standard 50kg gunny bags required, unloading dock open 8 AM - 6 PM"
                  className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNextStep}
                  className="bg-emerald-700 text-white font-bold text-xs"
                >
                  Review Purchase Order
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Final Order Review & Submit */}
        {step === 3 && (
          <Card className="shadow-xs bg-white max-w-2xl mx-auto w-full p-6">
            <h2 className="text-lg font-black text-slate-900 mb-2">
              Review & Confirm Purchase Order
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              Please verify all procurement parameters before official
              submission to Mandi Operations.
            </p>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3 text-xs mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">Produce:</span>
                <span className="font-bold text-slate-900">
                  {lotData.crop?.name} (
                  {lotData.qualityInspection?.assignedGrade})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Order Quantity:</span>
                <span className="font-bold text-slate-900">
                  {qty.toLocaleString()} kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Unit Price:</span>
                <span className="font-bold text-slate-900">
                  ₹{unitPrice}/kg
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Origin Warehouse:</span>
                <span className="font-bold text-slate-900">
                  {lotData.warehouse?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-bold text-slate-900">
                  {facilityName ? `${facilityName}, ` : ""}
                  {district}, {state}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Delivery Date:</span>
                <span className="font-bold text-slate-900">
                  {new Date(requestedDeliveryDate).toLocaleDateString()}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm">
                  Total PO Value (incl. 5% tax):
                </span>
                <span className="font-black text-emerald-700 text-base">
                  ₹{totalValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setStep(2)}
                className="text-xs font-bold"
              >
                Back to Delivery Info
              </Button>
              <Button
                onClick={handleCreatePurchaseOrder}
                isLoading={isSubmitting}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
              >
                Submit Purchase Order
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
