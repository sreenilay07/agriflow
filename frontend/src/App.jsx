import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { ProtectedRoute } from "./routes/ProtectedRoute";

// Loading fallback component
const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div className="flex flex-col items-center space-y-3">
      <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-medium text-slate-500 tracking-wider uppercase">
        Loading Agriflow Portal...
      </p>
    </div>
  </div>
);

// Helper for dynamic imports supporting both named and default exports
const lazyLoad = (importFn, name) =>
  lazy(async () => {
    const mod = await importFn();
    if (name && mod[name]) {
      return { default: mod[name] };
    }
    return { default: mod.default || Object.values(mod)[0] };
  });

// Public Pages
const LandingPage = lazyLoad(
  () => import("./pages/LandingPage"),
  "LandingPage",
);
const LoginPage = lazyLoad(() => import("./pages/auth/LoginPage"), "LoginPage");
const RegisterPage = lazyLoad(
  () => import("./pages/auth/RegisterPage"),
  "RegisterPage",
);
const VerifyOtpPage = lazyLoad(
  () => import("./pages/auth/VerifyOtpPage"),
  "VerifyOtpPage",
);
const AccountPendingPage = lazyLoad(
  () => import("./pages/auth/AccountPendingPage"),
  "AccountPendingPage",
);

// Farmer Pages
const FarmerDashboard = lazyLoad(
  () => import("./pages/farmer/FarmerDashboard"),
  "FarmerDashboard",
);
const BookSlotPage = lazyLoad(
  () => import("./pages/farmer/BookSlotPage"),
  "BookSlotPage",
);
const FarmerQueuePage = lazyLoad(
  () => import("./pages/farmer/FarmerQueuePage"),
  "FarmerQueuePage",
);
const FarmerTokenPage = lazyLoad(
  () => import("./pages/farmer/FarmerTokenPage"),
  "FarmerTokenPage",
);
const FarmerProcurementPage = lazyLoad(
  () => import("./pages/farmer/FarmerProcurementPage"),
  "FarmerProcurementPage",
);
const FarmerQRCodesPage = lazyLoad(
  () => import("./pages/farmer/FarmerQRCodesPage"),
  "FarmerQRCodesPage",
);
const FarmerDocumentsPage = lazyLoad(
  () => import("./pages/farmer/FarmerDocumentsPage"),
  "FarmerDocumentsPage",
);
const FarmerPaymentPage = lazyLoad(
  () => import("./pages/farmer/FarmerPaymentPage"),
  "FarmerPaymentPage",
);
const FarmerProfilePage = lazyLoad(
  () => import("./pages/farmer/FarmerProfilePage"),
  "FarmerProfilePage",
);
const FarmerLotsPage = lazyLoad(
  () => import("./pages/farmer/FarmerLotsPage"),
  "FarmerLotsPage",
);
const CreateLotPage = lazyLoad(
  () => import("./pages/farmer/CreateLotPage"),
  "CreateLotPage",
);
const LotDetailPage = lazyLoad(
  () => import("./pages/farmer/LotDetailPage"),
  "LotDetailPage",
);
const FarmerFarmsPage = lazyLoad(
  () => import("./pages/farmer/FarmerFarmsPage"),
  "FarmerFarmsPage",
);
const FarmerSettlementsPage = lazyLoad(
  () => import("./pages/farmer/FarmerSettlementsPage"),
  "FarmerSettlementsPage",
);
const FarmerDisputesPage = lazyLoad(
  () => import("./pages/farmer/FarmerDisputesPage"),
  "FarmerDisputesPage",
);
const FarmerPurchaseOrdersPage = lazyLoad(
  () => import("./pages/farmer/FarmerPurchaseOrdersPage"),
  "FarmerPurchaseOrdersPage",
);

// Officer Pages
const OfficerDashboard = lazyLoad(
  () => import("./pages/officer/OfficerDashboard"),
  "OfficerDashboard",
);
const OfficerScanPage = lazyLoad(
  () => import("./pages/officer/OfficerScanPage"),
  "OfficerScanPage",
);
const OfficerProcurementDetail = lazyLoad(
  () => import("./pages/officer/OfficerProcurementDetail"),
  "OfficerProcurementDetail",
);
const CentreLotsPage = lazyLoad(
  () => import("./pages/officer/CentreLotsPage"),
  "CentreLotsPage",
);

// Dedicated Quality Inspector Workstation Pages
const QualityDashboard = lazyLoad(
  () => import("./pages/quality/QualityDashboard"),
  "QualityDashboard",
);
const QualityInspectionsPage = lazyLoad(
  () => import("./pages/quality/QualityInspectionsPage"),
  "QualityInspectionsPage",
);
const QualityInspectionDetailPage = lazyLoad(
  () => import("./pages/quality/QualityInspectionDetailPage"),
  "QualityInspectionDetailPage",
);

// Manager Pages
const ManagerDashboard = lazyLoad(
  () => import("./pages/manager/ManagerDashboard"),
  "ManagerDashboard",
);
const ManagerCountersPage = lazyLoad(
  () => import("./pages/manager/ManagerCountersPage"),
  "ManagerCountersPage",
);
const ManagerCapacityPage = lazyLoad(
  () => import("./pages/manager/ManagerCapacityPage"),
  "ManagerCapacityPage",
);
const WarehouseInventoryPage = lazyLoad(
  () => import("./pages/manager/WarehouseInventoryPage"),
  "WarehouseInventoryPage",
);
const ManagerPurchaseOrdersPage = lazyLoad(
  () => import("./pages/manager/ManagerPurchaseOrdersPage"),
  "ManagerPurchaseOrdersPage",
);
const ManagerAllocationsPage = lazyLoad(
  () => import("./pages/manager/ManagerAllocationsPage"),
  "ManagerAllocationsPage",
);

// Buyer Pages
const BuyerDashboard = lazyLoad(
  () => import("./pages/buyer/BuyerDashboard"),
  "BuyerDashboard",
);
const MarketplacePage = lazyLoad(
  () => import("./pages/buyer/MarketplacePage"),
  "MarketplacePage",
);
const MarketplaceDetailPage = lazyLoad(
  () => import("./pages/buyer/MarketplaceDetailPage"),
  "MarketplaceDetailPage",
);
const BuyerOrdersPage = lazyLoad(
  () => import("./pages/buyer/BuyerOrdersPage"),
  "BuyerOrdersPage",
);
const BuyerOrderDetailPage = lazyLoad(
  () => import("./pages/buyer/BuyerOrderDetailPage"),
  "BuyerOrderDetailPage",
);

// Logistics Pages
const LogisticsDashboard = lazyLoad(
  () => import("./pages/logistics/LogisticsDashboard"),
  "LogisticsDashboard",
);
const ShipmentsPage = lazyLoad(
  () => import("./pages/logistics/ShipmentsPage"),
  "ShipmentsPage",
);
const ShipmentDetailPage = lazyLoad(
  () => import("./pages/logistics/ShipmentDetailPage"),
  "ShipmentDetailPage",
);
const VehiclesPage = lazyLoad(
  () => import("./pages/logistics/VehiclesPage"),
  "VehiclesPage",
);

// District Pages
const DistrictDashboard = lazyLoad(
  () => import("./pages/district/DistrictDashboard"),
  "DistrictDashboard",
);
const DistrictReportsPage = lazyLoad(
  () => import("./pages/district/DistrictReportsPage"),
  "DistrictReportsPage",
);

// Admin Pages
const AdminDashboard = lazyLoad(
  () => import("./pages/admin/AdminDashboard"),
  "AdminDashboard",
);
const AdminPlatformConsole = lazyLoad(
  () => import("./pages/admin/AdminPlatformConsole"),
  "AdminPlatformConsole",
);
const AdminUserManagement = lazyLoad(
  () => import("./pages/admin/AdminUserManagement"),
  "AdminUserManagement",
);
const AdminAuditLogsPage = lazyLoad(
  () => import("./pages/admin/AdminAuditLogsPage"),
  "AdminAuditLogsPage",
);

// Shared Pages
const NotificationsPage = lazyLoad(
  () => import("./pages/NotificationsPage"),
  "NotificationsPage",
);
const NotFoundPage = lazyLoad(
  () => import("./pages/NotFoundPage"),
  "NotFoundPage",
);

// Root Dispatcher based on authenticated role
const RootDispatcher = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (user.status === "PENDING") {
    return <Navigate to="/account/pending" replace />;
  }

  switch (user.role) {
    case "FARMER":
      return <Navigate to="/farmer/dashboard" replace />;
    case "QUALITY_INSPECTOR":
      return <Navigate to="/quality/dashboard" replace />;
    case "CENTER_OPERATOR":
    case "PROCUREMENT_OFFICER":
      return <Navigate to="/officer/dashboard" replace />;
    case "CENTER_MANAGER":
    case "CENTRE_MANAGER":
    case "COLLECTION_CENTRE_MANAGER":
      return <Navigate to="/manager/dashboard" replace />;
    case "BUYER":
      return <Navigate to="/buyer/dashboard" replace />;
    case "LOGISTICS_COORDINATOR":
      return <Navigate to="/logistics/dashboard" replace />;
    case "DISTRICT_ADMIN":
    case "DISTRICT_OFFICER":
      return <Navigate to="/district/dashboard" replace />;
    case "SUPER_ADMIN":
    case "PLATFORM_ADMIN":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/farmer/dashboard" replace />;
  }
};

export const App = () => {
  return (
    <Router>
      <Suspense fallback={<PageLoadingSkeleton />}>
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/account/pending" element={<AccountPendingPage />} />

          {/* App Dispatcher Route */}
          <Route path="/app" element={<RootDispatcher />} />
          <Route path="/app/*" element={<RootDispatcher />} />

          {/* Farmer Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["FARMER"]} />}>
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/lots" element={<FarmerLotsPage />} />
            <Route path="/farmer/lots/new" element={<CreateLotPage />} />
            <Route path="/farmer/lots/:id" element={<LotDetailPage />} />
            <Route path="/farmer/farms" element={<FarmerFarmsPage />} />
            <Route
              path="/farmer/purchase-orders"
              element={<FarmerPurchaseOrdersPage />}
            />
            <Route
              path="/farmer/settlements"
              element={<FarmerSettlementsPage />}
            />
            <Route path="/farmer/disputes" element={<FarmerDisputesPage />} />
            <Route path="/farmer/book" element={<BookSlotPage />} />
            <Route path="/farmer/queue" element={<FarmerQueuePage />} />
            <Route path="/farmer/token" element={<FarmerTokenPage />} />
            <Route
              path="/farmer/procurement"
              element={<FarmerProcurementPage />}
            />
            <Route path="/farmer/qr" element={<FarmerQRCodesPage />} />
            <Route path="/farmer/documents" element={<FarmerDocumentsPage />} />
            <Route path="/farmer/payment" element={<FarmerPaymentPage />} />
            <Route path="/farmer/profile" element={<FarmerProfilePage />} />
          </Route>

          {/* Dedicated Quality Inspector Workstation Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "QUALITY_INSPECTOR",
                  "SUPER_ADMIN",
                  "PLATFORM_ADMIN",
                ]}
              />
            }
          >
            <Route path="/quality/dashboard" element={<QualityDashboard />} />
            <Route
              path="/quality/inspections"
              element={<QualityInspectionsPage />}
            />
            <Route
              path="/quality/inspections/:id"
              element={<QualityInspectionDetailPage />}
            />
          </Route>

          {/* Procurement Officer Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "PROCUREMENT_OFFICER",
                  "CENTER_OPERATOR",
                  "CENTRE_MANAGER",
                  "SUPER_ADMIN",
                ]}
              />
            }
          >
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route path="/officer/scan" element={<OfficerScanPage />} />
            <Route path="/officer/receiving" element={<CentreLotsPage />} />
            <Route
              path="/officer/inspections"
              element={<QualityInspectionsPage />}
            />
            <Route
              path="/officer/procurement/:id"
              element={<OfficerProcurementDetail />}
            />
          </Route>

          {/* Centre Manager Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "CENTRE_MANAGER",
                  "CENTER_MANAGER",
                  "COLLECTION_CENTRE_MANAGER",
                  "SUPER_ADMIN",
                ]}
              />
            }
          >
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/counters" element={<ManagerCountersPage />} />
            <Route path="/manager/capacity" element={<ManagerCapacityPage />} />
            <Route
              path="/manager/inventory"
              element={<WarehouseInventoryPage />}
            />
            <Route
              path="/manager/purchase-orders"
              element={<ManagerPurchaseOrdersPage />}
            />
            <Route
              path="/manager/allocations"
              element={<ManagerAllocationsPage />}
            />
            <Route
              path="/warehouse/inventory"
              element={<WarehouseInventoryPage />}
            />
          </Route>

          {/* Buyer Protected Routes */}
          <Route
            element={<ProtectedRoute allowedRoles={["BUYER", "SUPER_ADMIN"]} />}
          >
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route path="/buyer/marketplace" element={<MarketplacePage />} />
            <Route
              path="/buyer/marketplace/:id"
              element={<MarketplaceDetailPage />}
            />
            <Route path="/buyer/orders" element={<BuyerOrdersPage />} />
            <Route
              path="/buyer/orders/:id"
              element={<BuyerOrderDetailPage />}
            />
          </Route>

          {/* Logistics Coordinator Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "LOGISTICS_COORDINATOR",
                  "CENTRE_MANAGER",
                  "SUPER_ADMIN",
                ]}
              />
            }
          >
            <Route
              path="/logistics/dashboard"
              element={<LogisticsDashboard />}
            />
            <Route path="/logistics/shipments" element={<ShipmentsPage />} />
            <Route
              path="/logistics/shipments/:id"
              element={<ShipmentDetailPage />}
            />
            <Route path="/logistics/vehicles" element={<VehiclesPage />} />
          </Route>

          {/* District Officer Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={[
                  "DISTRICT_OFFICER",
                  "DISTRICT_ADMIN",
                  "CENTRE_MANAGER",
                  "SUPER_ADMIN",
                ]}
              />
            }
          >
            <Route path="/district/dashboard" element={<DistrictDashboard />} />
            <Route path="/district/reports" element={<DistrictReportsPage />} />
          </Route>

          {/* Platform / Super Admin Protected Routes */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["SUPER_ADMIN", "PLATFORM_ADMIN"]}
              />
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/platform" element={<AdminPlatformConsole />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
          </Route>

          {/* Shared Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
