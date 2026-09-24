# MANDI MITHRA — FRONTEND DESIGN SYSTEM SPECIFICATION

## Overview
**Mandi Mithra** (Intelligent Farm Produce Procurement & Supply Chain Platform) employs a unified, high-contrast, professional design system tailored for agricultural enterprise, mandi collection centre operations, quality laboratory inspection, institutional B2B procurement, logistics fleet tracking, and farmer enablement.

---

## 1. Brand Identity & Design Tokens

### Primary Palette: Deep Forest Agricultural Green
- `--color-primary-50`: `#f0fdf4` (Background highlights & soft tags)
- `--color-primary-100`: `#dcfce7` (Accent badge backgrounds)
- `--color-primary-200`: `#bbf7d0` (Soft borders)
- `--color-primary-600`: `#16a34a` (Brand buttons, active icons)
- `--color-primary-700`: `#15803d` (Primary CTA buttons, interactive hover)
- `--color-primary-800`: `#166534` (Headers, high-emphasis text)
- `--color-primary-950`: `#052e16` (Deep hero and sidebar accents)

### Natural Slate & Charcoal Neutrals
- `--color-bg-base`: `#f8fafc` (Application background)
- `--color-surface-card`: `#ffffff` (Card & panel surface)
- `--color-border-subtle`: `#e2e8f0` (Default element border)
- `--color-border-strong`: `#cbd5e1` (Input & table border)
- `--color-text-primary`: `#0f172a` (Charcoal primary text)
- `--color-text-secondary`: `#475569` (Secondary descriptors)
- `--color-text-muted`: `#64748b` (Meta labels, timestamps)

### Semantic State Tokens
- **Success / Accepted / Settled / Delivered**: Emerald (`bg-emerald-50`, `text-emerald-800`, `border-emerald-300`)
- **Info / Created / Stored / Allocated**: Sky / Blue (`bg-sky-50`, `text-sky-800`, `border-sky-300`)
- **Warning / Inspection / Pending / Grade C**: Amber (`bg-amber-50`, `text-amber-800`, `border-amber-300`)
- **Logistics / In Transit / Dispatched**: Indigo / Purple (`bg-indigo-50`, `text-indigo-800`, `border-indigo-300`)
- **Danger / Rejected / Cancelled**: Rose / Red (`bg-rose-50`, `text-rose-800`, `border-rose-300`)

---

## 2. Typography Scale
The typography system uses modern system sans-serif with strict line-height and letter-spacing definitions:

- **Display (Hero Titles)**: `text-4xl` to `text-6xl`, `font-black`, `tracking-tight`
- **H1 (Page Titles)**: `text-2xl` to `text-3xl`, `font-black`, `text-slate-900`
- **H2 (Section Headings)**: `text-lg` to `text-xl`, `font-bold`, `text-slate-900`
- **H3 (Card Headings)**: `text-sm` to `text-base`, `font-bold`, `text-slate-900`
- **Body Text**: `text-xs` to `text-sm`, `font-normal` or `font-medium`, `text-slate-600`
- **KPI Numeric Highlights**: `text-2xl` to `text-3xl`, `font-extrabold`, `text-slate-900`, `font-mono` / `tabular-nums`
- **Labels & Badges**: `text-[10px]` to `text-xs`, `font-bold`, `uppercase`, `tracking-wider`

---

## 3. Core Reusable UI Component Library

### `StatusBadge` (`frontend/src/components/ui/StatusBadge.tsx`)
Standardized semantic badge renderer supporting all 25+ domain states:
- **Produce Lot**: `CREATED`, `SCHEDULED`, `RECEIVED`, `UNDER_INSPECTION`, `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED`, `STORED`, `ALLOCATED`, `DISPATCHED`, `IN_TRANSIT`, `DELIVERED`, `SETTLED`, `CANCELLED`
- **Purchase Order**: `CREATED`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`, `ALLOCATED`, `PARTIALLY_ALLOCATED`, `DISPATCHED`, `DELIVERED`, `COMPLETED`, `CANCELLED`
- **Quality Grading**: `GRADE_A`, `GRADE_B`, `GRADE_C`, `REJECT`
- **Verification**: `VERIFIED`, `UNVERIFIED`

### `MetricCard` (`frontend/src/components/ui/MetricCard.tsx`)
Enterprise KPI metric container featuring:
- High-contrast number display
- Color-coded variant icon badges (`emerald`, `blue`, `amber`, `purple`, `default`)
- Optional positive/negative trend pills
- Built-in pulse skeleton loader state

### `DataTable` (`frontend/src/components/ui/DataTable.tsx`)
High-density data table supporting:
- Client-side real-time substring filtering across columns
- Column header formatting and custom renderers
- Built-in pagination controls with dynamic page sizing
- Empty state with informative icons and action buttons
- Loading skeleton rows

### `TraceabilityTimeline` (`frontend/src/components/ui/TraceabilityTimeline.tsx`)
Visual lifecycle pipeline component providing:
- Desktop horizontal connecting step bar with icons
- Mobile responsive vertical timeline with color-coded dot states (`COMPLETED`, `ACTIVE`, `PENDING`, `REJECTED`)
- Timestamp and actor annotations

---

## 4. Application Shell & Navigation Architecture

### Desktop Layout
- **AppHeader**: Top enterprise bar with live Socket.IO connection status (`● Live`), global language selector (`EN`, `తె`, `हि`), unread notification bell, and user profile drawer.
- **Sidebar**: Dark slate role-aware navigation showing only permitted views per role with active route highlight indicators and category grouping.
- **Main Canvas**: Centered container (`max-w-7xl`) with generous padding (`p-6` to `p-8`) and standard header/metric/table/action hierarchy.

### Mobile Layout
- **Farmer Navigation**: One-handed bottom navigation bar (`Home`, `Queue`, `Stages`, `Alerts`, `Profile`).
- **Responsive Tables**: Horizontal scroll with sticky headers or mobile card fallbacks.

---

## 5. Public Landing Page Architecture (`/` and `/landing`)
1. **Top Enterprise Banner**: Network credentials and platform scope.
2. **Sticky Responsive Navbar**: Brand identity, multilingual toggle, login and registration CTAs.
3. **Hero Section**: Value proposition with visual connected supply chain pipeline strip.
4. **Trust Bar**: 6 verification pillars (no fabricated numeric claims).
5. **Problem vs. Solution Section**: Factual side-by-side comparison of traditional vs. Mandi Mithra procurement.
6. **Interactive 8-Stage Lifecycle Explorer**: Clickable stage buttons revealing actor details and captured parameters.
7. **Role Workspaces Showcase**: Dedicated feature cards for all 6 stakeholder personas.
8. **End-to-End Traceability Section**: Visual connection linking Purchase Orders to Lot IDs, Weighbridge records, Quality Certificates, Trucks, and Farmer Payouts.
9. **Comprehensive Features Grid**: 12 industrial-grade modules.
10. **Conversion CTA & Rich Product Footer**: Multilingual links, terms, and legal notices.
