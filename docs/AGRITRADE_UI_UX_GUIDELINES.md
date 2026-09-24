# AGRITRADE — UI/UX & DESIGN SYSTEM GUIDELINES

**Product Name**: AgriTrade  
**Descriptor**: Farm Produce Procurement & Supply Chain Platform  
**Target Atmosphere**: Enterprise, Trustworthy, Operational, Data-Driven, Clean Agricultural

---

## 1. Product Brand & Visual Identity

### 1.1 Brand Wordmark & Emblem
- Primary Wordmark: **AgriTrade**
- Primary Subtitle: **Farm Produce Procurement & Supply Chain**
- Emblem: Geometric, layered supply-chain cube mark rendered via clean SVG.
- **Prohibited**: Do NOT use a wheat emoji (`🌾`) as the primary brand logo. Do not use decorative AI robot avatars, sparkles (`✨`), or pulsing gradients for enterprise branding.

### 1.2 Color Palette
- **Deep Agricultural Green**: `#064e3b` / `#047857` (Primary actions, brand accents, approved statuses)
- **Muted Slate & Charcoal**: `#0f172a` / `#1e293b` (Enterprise header, sidebar, dark consoles)
- **Warm Off-White / Paper Surface**: `#f8fafc` / `#f1f5f9` (Workspace page backgrounds)
- **Restrained Amber**: `#b45309` / `#fef3c7` (Pending inspections, queue wait times)
- **Restrained Red**: `#be123c` / `#ffe4e6` (Rejections, disputes, critical capacity alerts)
- **Strictly Avoided**: Cyberpunk neons, glowing neon borders, giant decorative purple gradients, decorative floating blobs.

---

## 2. Typography & Numerical Formatting

- **Font Family**: Modern, clean geometric sans-serif (`Inter`, `system-ui`).
- **Hierarchy**:
  - `Display / Hero Title`: 48px - 60px, font-black, tight letter-spacing (`tracking-tight`).
  - `H1 (Page Header)`: 24px - 28px, font-bold or font-black.
  - `H2 (Section Header)`: 18px - 20px, font-bold.
  - `H3 (Card Title)`: 14px - 15px, font-semibold.
  - `Body`: 13px - 14px, font-normal.
  - `Metadata / Captions`: 11px - 12px, font-medium, slate-500.
- **Tabular Numerals**: All operational weights, amounts, and lot codes use monospace or tabular numbers (`font-mono`) to prevent visual jitter across tables.

---

## 3. Application Shell & Navigation

1. **Top Header**:
   - Institutional banner indicating platform environment and live feed status.
   - Global quick-search input with instant entity routing.
   - Real-time notification center popover.
   - User identity chip with role badge and logout control.
2. **Sidebar**:
   - Role-aware navigation tailored to each participant's workflow:
     - **Farmer**: Overview, My Produce Lots, Create Lot, My Farms, Procurement Records, Settlements, Disputes.
     - **Quality Inspector**: Inspection Queue, Inspection History.
     - **Collection Centre Manager**: Centre Overview, Warehouse Stock, Purchase Orders, Lot Allocations, Counters & Staff, Capacity Settings.
     - **Institutional Buyer**: Overview, Produce Marketplace, Purchase Orders.
     - **Logistics**: Overview, Shipments & Manifests, Fleet & Vehicles.
     - **Platform Admin**: Dashboard & Approvals, Platform Governance, User Directory, Warehouse Stock, Purchase Orders, Global Shipments, Security Audit Logs.

---

## 4. Workstation Design Principles

- **Clear Operational Purpose**: Different workflows receive purpose-built layouts rather than repeating the same 4 KPI cards.
- **Inspection Workstation**: Side-by-side lot specifications and parameter entry controls with live grading recalculation and mandatory inspector override confirmation.
- **Enterprise Tables**:
  - Dense row spacing for operational staff (Manager, Logistics, Inspector).
  - Multi-column filtering, sorting, and pagination.
  - Explicit status badge per row with semantic color and iconography.
- **Farmer Mobile First**: Bottom navigation bar, large touch targets, single-column cards, and offline token display.

---

## 5. Resilient UX States

Every page must implement 3 distinct states:
1. **Loading State**: Clean, animated CSS spinner with informative label (`Loading inspection queue...`, `Fetching lot ledger...`).
2. **Empty State**: Icon + clear title + actionable suggestion (e.g. *"No produce lots declared yet. Click 'Create Produce Lot' to register your first harvest."*).
3. **Error State**: Informative error banner with human-friendly message and immediate retry button.
