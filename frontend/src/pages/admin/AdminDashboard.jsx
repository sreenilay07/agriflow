import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppShell } from "../../components/layout/AppShell";
import { Button } from "../../components/ui/Button";
import { ApprovalCard } from "../../components/ui/ApprovalCard";
import { approvalApi } from "../../services/api/approval.api";
import { reportApi } from "../../services/api/report.api";
import {
  Users,
  ShieldAlert,
  FileSpreadsheet,
  UserCheck,
  CheckCircle2,
  Sliders,
  Boxes,
  Building2,
} from "lucide-react";

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchPendingDistrictAdmins();
  }, []);

  const fetchPendingDistrictAdmins = async () => {
    setIsLoading(true);
    try {
      const res = await approvalApi.getPendingDistrictAdmins();
      if (res.success) setPendingRequests(res.data || []);
    } catch (err) {
      console.warn("Failed to load pending district admin approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const res = await approvalApi.approveRequest(
        id,
        "Approved by Super Admin",
      );
      if (res.success) {
        setActionMessage("District Administrator approved successfully.");
        fetchPendingDistrictAdmins();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve request.");
    }
  };

  const handleReject = async (id, reason) => {
    try {
      const res = await approvalApi.rejectRequest(id, reason);
      if (res.success) {
        setActionMessage("District Administrator request rejected.");
        fetchPendingDistrictAdmins();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject request.");
    }
  };

  return (
    <AppShell
      title="Platform Operations Console"
      subtitle="Enterprise system governance, staff approvals, multi-tenant organization management, and security audit logs."
      breadcrumbs={[
        { label: "Admin", href: "/admin/dashboard" },
        { label: "Platform Console" },
      ]}
      actions={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate("/admin/platform")}
            icon={<Sliders size={15} />}
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs"
          >
            Platform Governance
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate("/admin/users")}
            icon={<Users size={15} />}
            className="text-xs font-bold"
          >
            User Directory
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {actionMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-700" />{" "}
            {actionMessage}
          </div>
        )}

        {/* Governance Modules Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={() => navigate("/admin/platform")}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-600/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 w-fit">
              <Building2 size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Organizations & Regions
            </h4>
            <p className="text-[11px] text-slate-500">
              Multi-tenant hierarchy & district config
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-600/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="p-2 rounded-xl bg-blue-100 text-blue-800 w-fit">
              <Users size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">User Directory</h4>
            <p className="text-[11px] text-slate-500">
              RBAC roles, active staff, & farmers
            </p>
          </div>

          <div
            onClick={() => navigate("/manager/inventory")}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-600/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="p-2 rounded-xl bg-purple-100 text-purple-800 w-fit">
              <Boxes size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Warehouse Stock
            </h4>
            <p className="text-[11px] text-slate-500">
              Global bay utilization & stock ledger
            </p>
          </div>

          <div
            onClick={() => navigate("/admin/audit-logs")}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs hover:border-emerald-600/50 cursor-pointer transition-all space-y-1.5"
          >
            <div className="p-2 rounded-xl bg-rose-100 text-rose-800 w-fit">
              <ShieldAlert size={18} />
            </div>
            <h4 className="font-bold text-slate-900 text-sm">
              Security Audit Trail
            </h4>
            <p className="text-[11px] text-slate-500">
              Immutable operational change logs
            </p>
          </div>
        </div>

        {/* Staff Approval Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="text-emerald-700" size={18} />
              <span>
                Pending District Administrator Approvals (
                {pendingRequests.length})
              </span>
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchPendingDistrictAdmins}
              className="text-xs font-bold"
            >
              Refresh Queue
            </Button>
          </div>

          {isLoading ? (
            <p className="text-xs font-bold text-slate-500 py-4">
              Loading approval requests...
            </p>
          ) : pendingRequests.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-semibold bg-white rounded-2xl border border-slate-200">
              No pending District Administrator registration requests.
            </div>
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

        {/* Quick Report Downloads */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Procurement Aggregate Reports
              </h3>
              <p className="text-xs text-slate-500">
                Download system-wide crop intake and procurement ledger data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              onClick={() => reportApi.downloadExcel()}
              className="bg-blue-800 hover:bg-blue-900 text-white font-bold text-xs"
            >
              Export Excel (.xlsx)
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => reportApi.downloadCSV()}
              className="border-slate-300 text-slate-700 text-xs font-bold"
            >
              Export CSV
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
