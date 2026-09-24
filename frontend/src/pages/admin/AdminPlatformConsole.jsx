import React, { useState, useEffect } from "react";
import { AppHeader } from "../../components/layout/AppHeader";
import { Sidebar } from "../../components/layout/Sidebar";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ApprovalCard } from "../../components/ui/ApprovalCard";
import { approvalApi } from "../../services/api/approval.api";
import { organizationApi } from "../../services/api/organization.api";
import { regionApi } from "../../services/api/region.api";
import { categoryApi } from "../../services/api/category.api";
import { configApi } from "../../services/api/config.api";
import {
  Building2,
  MapPin,
  Tags,
  Sliders,
  UserCheck,
  CheckCircle2,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export const AdminPlatformConsole = () => {
  const [activeTab, setActiveTab] = useState("approvals");
  const [actionMessage, setActionMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Approvals State
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(false);

  // Organizations State
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: "",
    code: "",
    type: "PROCUREMENT_NETWORK",
    contactEmail: "",
  });

  // Regions State
  const [regions, setRegions] = useState([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [newRegion, setNewRegion] = useState({ name: "", code: "", state: "" });

  // Categories State
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Config State
  const [config, setConfig] = useState(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const showNotify = (msg) => {
    setActionMessage(msg);
    setErrorMessage("");
    setTimeout(() => setActionMessage(""), 5000);
  };

  const showError = (msg) => {
    setErrorMessage(msg);
    setActionMessage("");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  // Approvals Actions
  const fetchPendingApprovals = async () => {
    setIsLoadingApprovals(true);
    try {
      const res = await approvalApi.getPendingDistrictAdmins();
      if (res.success) setPendingRequests(res.data || []);
    } catch {
      showError("Failed to load pending administrator approvals");
    } finally {
      setIsLoadingApprovals(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approvalApi.approveRequest(
        id,
        "Approved by Platform Admin",
      );
      if (res.success) {
        showNotify("Administrator approved successfully.");
        fetchPendingApprovals();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await approvalApi.rejectRequest(id, reason);
      if (res.success) {
        showNotify("Administrator request rejected.");
        fetchPendingApprovals();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to reject request.");
    }
  };

  // Organization Actions
  const fetchOrganizations = async () => {
    setIsLoadingOrgs(true);
    try {
      const res = await organizationApi.getOrganizations();
      if (res.success) setOrganizations(res.data || []);
    } catch {
      showError("Failed to load organizations.");
    } finally {
      setIsLoadingOrgs(false);
    }
  };

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (!newOrg.name || !newOrg.code)
      return showError("Name and Code are required");
    try {
      const res = await organizationApi.createOrganization(newOrg);
      if (res.success) {
        showNotify("Organization registered successfully.");
        setShowOrgModal(false);
        setNewOrg({
          name: "",
          code: "",
          type: "PROCUREMENT_NETWORK",
          contactEmail: "",
        });
        fetchOrganizations();
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Failed to create organization.",
      );
    }
  };

  // Region Actions
  const fetchRegions = async () => {
    setIsLoadingRegions(true);
    try {
      const res = await regionApi.getRegions();
      if (res.success) setRegions(res.data || []);
    } catch {
      showError("Failed to load regions.");
    } finally {
      setIsLoadingRegions(false);
    }
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    if (!newRegion.name || !newRegion.code || !newRegion.state)
      return showError("Name, code and state are required");
    try {
      const res = await regionApi.createRegion(newRegion);
      if (res.success) {
        showNotify("Region created successfully.");
        setShowRegionModal(false);
        setNewRegion({ name: "", code: "", state: "" });
        fetchRegions();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create region.");
    }
  };

  // Category Actions
  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const res = await categoryApi.getCategories();
      if (res.success) setCategories(res.data || []);
    } catch {
      showError("Failed to load produce categories.");
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.code)
      return showError("Name and code are required");
    try {
      const res = await categoryApi.createCategory(newCategory);
      if (res.success) {
        showNotify("Produce category created successfully.");
        setShowCategoryModal(false);
        setNewCategory({ name: "", code: "", description: "" });
        fetchCategories();
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to create category.");
    }
  };

  // Config Actions
  const fetchConfig = async () => {
    setIsLoadingConfig(true);
    try {
      const res = await configApi.getConfig();
      if (res.success) setConfig(res.data);
    } catch {
      showError("Failed to load platform configuration.");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSavingConfig(true);
    try {
      const res = await configApi.updateConfig(config);
      if (res.success) {
        showNotify("Platform configuration saved successfully.");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Failed to save configuration.");
    } finally {
      setIsSavingConfig(false);
    }
  };

  useEffect(() => {
    if (activeTab === "approvals") fetchPendingApprovals();
    if (activeTab === "organizations") fetchOrganizations();
    if (activeTab === "regions") fetchRegions();
    if (activeTab === "categories") fetchCategories();
    if (activeTab === "config") fetchConfig();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <AppHeader />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-emerald-600">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold uppercase rounded">
                  Enterprise
                </span>
                <span className="text-xs text-slate-400">Platform Admin</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight mt-1 text-white">
                Agriflow Management Console
              </h1>
              <p className="text-xs text-slate-300 font-normal mt-0.5">
                Centralized administration for Organizations, Region
                Hierarchies, Produce Categories, Quality & Pricing Settings.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                onClick={() => {
                  if (activeTab === "approvals") fetchPendingApprovals();
                  if (activeTab === "organizations") fetchOrganizations();
                  if (activeTab === "regions") fetchRegions();
                  if (activeTab === "categories") fetchCategories();
                  if (activeTab === "config") fetchConfig();
                }}
              >
                <RefreshCw size={14} className="mr-1" /> Sync
              </Button>
            </div>
          </div>

          {/* Alert Messages */}
          {actionMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2
                size={16}
                className="text-emerald-600 flex-shrink-0"
              />{" "}
              {actionMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-rose-50 text-rose-800 border border-rose-200 font-semibold text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 flex-shrink-0" />{" "}
              {errorMessage}
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActiveTab("approvals")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "approvals"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <UserCheck size={15} />
              Approvals ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab("organizations")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "organizations"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Building2 size={15} />
              Organizations
            </button>
            <button
              onClick={() => setActiveTab("regions")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "regions"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <MapPin size={15} />
              Regions & Hierarchy
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "categories"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Tags size={15} />
              Produce Categories
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                activeTab === "config"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Sliders size={15} />
              Platform Configuration
            </button>
          </div>

          {/* TAB 1: APPROVALS */}
          {activeTab === "approvals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Pending Administrator Approvals
                  </h2>
                  <p className="text-xs text-slate-500">
                    Review staff, collection center operators, and regional
                    administrator access requests
                  </p>
                </div>
              </div>

              {isLoadingApprovals ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading approval queue...
                </div>
              ) : pendingRequests.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
                  No pending administrator approval requests in the platform
                  queue.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRequests.map((req) => (
                    <ApprovalCard
                      key={req._id}
                      request={req}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ORGANIZATIONS */}
          {activeTab === "organizations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Organizations
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage procurement networks, buyer corporations, logistics
                    partners, and operators
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1"
                  onClick={() => setShowOrgModal(true)}
                >
                  <Plus size={14} /> Add Organization
                </Button>
              </div>

              {showOrgModal && (
                <Card className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Register New Organization
                  </h3>
                  <form
                    onSubmit={handleCreateOrg}
                    className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Organization Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newOrg.name}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, name: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Apex Agri Procurement"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Unique Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={newOrg.code}
                        onChange={(e) =>
                          setNewOrg({
                            ...newOrg,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white uppercase"
                        placeholder="e.g. ORG-APEX"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Organization Type
                      </label>
                      <select
                        value={newOrg.type}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, type: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                      >
                        <option value="PROCUREMENT_NETWORK">
                          Procurement Network
                        </option>
                        <option value="BUYER_ORGANIZATION">
                          Buyer Organization
                        </option>
                        <option value="WAREHOUSE_OPERATOR">
                          Warehouse Operator
                        </option>
                        <option value="LOGISTICS_PROVIDER">
                          Logistics Provider
                        </option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={newOrg.contactEmail}
                        onChange={(e) =>
                          setNewOrg({ ...newOrg, contactEmail: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="contact@org.com"
                      />
                    </div>
                    <div className="md:col-span-4 flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setShowOrgModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        type="submit"
                        className="bg-emerald-700 text-white"
                      >
                        Save Organization
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {isLoadingOrgs ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading organizations...
                </div>
              ) : organizations.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
                  No organizations configured yet. Click 'Add Organization' to
                  create the primary procurement network.
                </Card>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {organizations.map((org) => (
                        <tr key={org._id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            {org.code}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {org.name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                              {org.type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {org.contactEmail || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                org.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {org.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {new Date(org.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REGIONS */}
          {activeTab === "regions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Regional Hierarchy
                  </h2>
                  <p className="text-xs text-slate-500">
                    Configure States, Regions, and associated Districts for
                    geographical governance
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1"
                  onClick={() => setShowRegionModal(true)}
                >
                  <Plus size={14} /> Add Region
                </Button>
              </div>

              {showRegionModal && (
                <Card className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Create New Region
                  </h3>
                  <form
                    onSubmit={handleCreateRegion}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Region Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRegion.name}
                        onChange={(e) =>
                          setNewRegion({ ...newRegion, name: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Telangana Central"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Region Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRegion.code}
                        onChange={(e) =>
                          setNewRegion({
                            ...newRegion,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white uppercase"
                        placeholder="e.g. REG-TS-CEN"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={newRegion.state}
                        onChange={(e) =>
                          setNewRegion({ ...newRegion, state: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Telangana"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setShowRegionModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        type="submit"
                        className="bg-emerald-700 text-white"
                      >
                        Save Region
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {isLoadingRegions ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading regions...
                </div>
              ) : regions.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
                  No regional units registered yet. Click 'Add Region' to
                  establish the regional hierarchy.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regions.map((r) => (
                    <Card
                      key={r._id}
                      className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {r.code}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 mt-1">
                            {r.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            State: {r.state}
                          </p>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                          {r.status}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-600 block mb-1">
                          Associated Districts:
                        </span>
                        {r.districts && r.districts.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {r.districts.map((d) => (
                              <span
                                key={d._id}
                                className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] border border-slate-200 font-medium"
                              >
                                {d.name} ({d.code})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            No districts directly linked yet
                          </span>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PRODUCE CATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Produce Categories
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage agricultural classifications, crops taxonomy, and
                    grading baselines
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1"
                  onClick={() => setShowCategoryModal(true)}
                >
                  <Plus size={14} /> Add Category
                </Button>
              </div>

              {showCategoryModal && (
                <Card className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-xl space-y-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Add Produce Category
                  </h3>
                  <form
                    onSubmit={handleCreateCategory}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs"
                  >
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Pulses & Legumes"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={newCategory.code}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white uppercase"
                        placeholder="e.g. PULSES"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={newCategory.description}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        placeholder="e.g. Chickpeas, lentils, green gram"
                      />
                    </div>
                    <div className="md:col-span-3 flex justify-end gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        type="button"
                        onClick={() => setShowCategoryModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        type="submit"
                        className="bg-emerald-700 text-white"
                      >
                        Save Category
                      </Button>
                    </div>
                  </form>
                </Card>
              )}

              {isLoadingCategories ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading categories...
                </div>
              ) : categories.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-xs bg-white border border-slate-200 rounded-xl">
                  No produce categories configured. Click 'Add Category' to
                  populate crop taxonomy.
                </Card>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Category Name</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {categories.map((cat) => (
                        <tr key={cat._id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono font-bold text-slate-900">
                            {cat.code}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {cat.name}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {cat.description || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              {cat.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                            {new Date(cat.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PLATFORM CONFIGURATION */}
          {activeTab === "config" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Platform Thresholds & Governance Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Fine-tune quality inspection parameters, grading
                    bonuses/penalties, warehouse alerts, and payment terms
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1"
                  disabled={isSavingConfig || !config}
                  onClick={handleSaveConfig}
                >
                  {isSavingConfig ? "Saving..." : "Save Configuration"}
                </Button>
              </div>

              {isLoadingConfig || !config ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Loading platform settings...
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Quality Thresholds */}
                  <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      Quality Inspection Thresholds
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Max Moisture %
                        </label>
                        <input
                          type="number"
                          value={config.qualityThresholds.maxMoisturePercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              qualityThresholds: {
                                ...config.qualityThresholds,
                                maxMoisturePercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Max Foreign Matter %
                        </label>
                        <input
                          type="number"
                          value={
                            config.qualityThresholds.maxForeignMatterPercent
                          }
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              qualityThresholds: {
                                ...config.qualityThresholds,
                                maxForeignMatterPercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Max Damage %
                        </label>
                        <input
                          type="number"
                          value={config.qualityThresholds.maxDamagePercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              qualityThresholds: {
                                ...config.qualityThresholds,
                                maxDamagePercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Min Score Grade A
                        </label>
                        <input
                          type="number"
                          value={config.qualityThresholds.minScoreGradeA}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              qualityThresholds: {
                                ...config.qualityThresholds,
                                minScoreGradeA: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Grading Multipliers */}
                  <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      Grading Price Multipliers
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Grade A Premium Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.gradingRules.gradeAMultiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              gradingRules: {
                                ...config.gradingRules,
                                gradeAMultiplier: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />

                        <span className="text-[10px] text-slate-400">
                          e.g. 1.05 = +5% bonus
                        </span>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Grade B Standard Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.gradingRules.gradeBMultiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              gradingRules: {
                                ...config.gradingRules,
                                gradeBMultiplier: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />

                        <span className="text-[10px] text-slate-400">
                          1.0 = Base agreed price
                        </span>
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Grade C Fair Multiplier
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={config.gradingRules.gradeCMultiplier}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              gradingRules: {
                                ...config.gradingRules,
                                gradeCMultiplier: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />

                        <span className="text-[10px] text-slate-400">
                          e.g. 0.88 = -12% discount
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Warehouse Thresholds */}
                  <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      Warehouse Capacity & Aging Alerts
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Near Capacity (%)
                        </label>
                        <input
                          type="number"
                          value={config.warehouseThresholds.nearCapacityPercent}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              warehouseThresholds: {
                                ...config.warehouseThresholds,
                                nearCapacityPercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Critical Capacity (%)
                        </label>
                        <input
                          type="number"
                          value={
                            config.warehouseThresholds.criticalCapacityPercent
                          }
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              warehouseThresholds: {
                                ...config.warehouseThresholds,
                                criticalCapacityPercent: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 font-semibold mb-1">
                          Max Holding Days
                        </label>
                        <input
                          type="number"
                          value={config.warehouseThresholds.maxHoldingDays}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              warehouseThresholds: {
                                ...config.warehouseThresholds,
                                maxHoldingDays: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full px-3 py-1.5 border border-slate-300 rounded bg-white"
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Procurement & Settlement Rules */}
                  <Card className="p-5 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      Procurement & Settlement Rules
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          Allow Partial Acceptance on Lots
                        </span>
                        <input
                          type="checkbox"
                          checked={
                            config.procurementSettings.allowPartialAcceptance
                          }
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              procurementSettings: {
                                ...config.procurementSettings,
                                allowPartialAcceptance: e.target.checked,
                              },
                            })
                          }
                          className="rounded text-emerald-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          Auto-Calculate Settlement upon Lot Acceptance
                        </span>
                        <input
                          type="checkbox"
                          checked={
                            config.procurementSettings
                              .autoGenerateSettlementOnAcceptance
                          }
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              procurementSettings: {
                                ...config.procurementSettings,
                                autoGenerateSettlementOnAcceptance:
                                  e.target.checked,
                              },
                            })
                          }
                          className="rounded text-emerald-600"
                        />
                      </div>
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          Settlement Payment Terms (Days)
                        </span>
                        <input
                          type="number"
                          value={config.settlementSettings.paymentTermsDays}
                          onChange={(e) =>
                            setConfig({
                              ...config,
                              settlementSettings: {
                                ...config.settlementSettings,
                                paymentTermsDays: Number(e.target.value),
                              },
                            })
                          }
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-right bg-white"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default AdminPlatformConsole;
