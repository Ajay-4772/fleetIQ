# VEHYRON — Enterprise Telematics Design System

**Version**: 2.0.0 (Production Hardening)  
**Philosophy**: Precision, Trust, Clarity, Information Density, Low Visual Noise  
**Audience**: Fleet Operations Managers, Dispatchers, Fleet Analysts, Enterprise Administrators  

---

## 1. Design Direction: Operational Enterprise Console

VEHYRON is a critical infrastructure software product. It is NOT an AI SaaS marketing landing page, nor a Dribbble mock dashboard.
The visual identity communicates stability and situational awareness through:
- High data density with scannable tabular typography.
- Restrained, semantic use of color (color indicates operational status, not decoration).
- Subtle, functional borders rather than heavy floating drop shadows.
- Zero non-functional or dead UI elements (three-dot menus with no actions, decorative orbs, fake counters).

---

## 2. Color System & Semantic Tokens

### 2.1 Surfaces & Neutrals
- **Application Canvas**: `bg-[#f8fafc]` (Slate 50) — neutral, cool, low-fatigue workspace background.
- **Card & Table Surface**: `bg-white` (`#ffffff`) — crisp contrast against the slate canvas.
- **Subtle Surface Accent**: `bg-slate-50` (`#f8fafc`) — table headers, input backgrounds, subtle dividers.
- **Borders & Rules**: `border-slate-200/80` (`#e2e8f0`) — clean, distinct structural separation.

### 2.2 Text & Typography
- **Primary Headings & Key Data**: `text-slate-900` (`#0f172a`, font-weight 700/800).
- **Body & Operational Labels**: `text-slate-700` (`#334155`, font-weight 500/600).
- **Secondary & Helper Text**: `text-slate-500` (`#64748b`, font-weight 400/500).
- **Muted Metadata & Timestamps**: `text-slate-400` (`#94a3b8`, font-mono or font-sans).

### 2.3 Semantic Operational Status
- **Critical / Immediate Action**:
  - Badge: `bg-rose-600 text-white` (High contrast, bold).
  - Subtle Border Accent: `border-l-4 border-l-rose-600`.
  - Text: `text-rose-700`.
  - *Rule*: Never render the entire card or table row in solid red/pink. Severity color belongs on the badge and indicator.
- **Warning / Degraded / High Priority**:
  - Badge: `bg-amber-50 text-amber-700 border border-amber-200`.
  - Indicator: `bg-amber-500`.
- **Nominal / Live / Healthy**:
  - Badge: `bg-emerald-50 text-emerald-700 border border-emerald-200`.
  - Live Dot: `bg-emerald-500` with subtle single-ping animation.
- **Informational / Primary Interactive**:
  - Button / Active Tab: `bg-blue-600 hover:bg-blue-500 text-white`.
  - Accent / Focus Ring: `focus:ring-2 focus:ring-blue-500/30`.

---

## 3. Typography & Numerical Formatting

- **Font Family**: Modern system sans-serif stack (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`).
- **Monospace Stack**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` for VINs, DTC Fault Codes, Correlation IDs, and Odometer kilometers.
- **Numeric Alignment**:
  - Currency: `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`. Always right-aligned in tables.
  - Health & SoH: Bold percentage integer with small `%` symbol.
  - Odometers: Formatted with locale thousands separators (e.g. `108,798 km`).

---

## 4. Layout & Spacing Primitives

- **Grid System**:
  - Top Navigation: Sticky header, height 56px (`h-14`), clean border bottom.
  - Sidebar: Width 240px (`w-60`) expanded, 64px (`w-16`) collapsed, smooth transition (`transition-all duration-200`).
  - Analytics Dashboard: Full-width Operational Health chart (`w-full`), followed by a 2-column responsive grid for widgets (`grid grid-cols-1 md:grid-cols-2 gap-6`).
  - AI Copilot: Full-bleed conversational canvas occupying 100% available viewport height and width.

- **Border Radius Hierarchy**:
  - Standard Cards & Panels: `rounded-xl` (12px).
  - Buttons & Inputs: `rounded-lg` (8px).
  - Status Badges & Pills: `rounded-full` (strictly for status pills and avatar circles).
  - *Rule*: Eliminate `rounded-3xl` (24px) floating bubble containers.

---

## 5. Interaction & State Rules

1. **No Dead Buttons**: If a button exists, it must have a valid `onClick` handler performing an API request, opening a modal, or navigating.
2. **Accessible Icons**: Every Lucide icon must include `aria-hidden="true"`. Icon-only buttons must include accessible `title` and `aria-label` attributes.
3. **Empty States**: Must provide helpful operational guidance (e.g., "No vehicles match the selected criteria. Try adjusting your filters.") rather than blank or simulator-specific text.
4. **Loading States**: Clean skeleton placeholders matching the target layout dimensions. No spinning orbs or pulsing radio waves.
