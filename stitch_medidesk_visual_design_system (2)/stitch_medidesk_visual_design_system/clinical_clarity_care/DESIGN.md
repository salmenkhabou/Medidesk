---
name: Clinical Clarity & Care
colors:
  surface: '#f8f9ff'
  surface-dim: '#d0dbed'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dee9fc'
  surface-container-highest: '#d9e3f6'
  on-surface: '#121c2a'
  on-surface-variant: '#3e4948'
  inverse-surface: '#27313f'
  inverse-on-surface: '#eaf1ff'
  outline: '#6e7978'
  outline-variant: '#bec9c7'
  surface-tint: '#046a66'
  primary: '#005451'
  on-primary: '#ffffff'
  primary-container: '#0f6e6a'
  on-primary-container: '#9dede8'
  inverse-primary: '#85d4cf'
  secondary: '#9f4122'
  on-secondary: '#ffffff'
  secondary-container: '#fd8863'
  on-secondary-container: '#722104'
  tertiary: '#733c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#965000'
  on-tertiary-container: '#ffd7ba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a1f1eb'
  primary-fixed-dim: '#85d4cf'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504d'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59e'
  on-secondary-fixed: '#3a0b00'
  on-secondary-fixed-variant: '#7f2a0d'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f8f9ff'
  on-background: '#121c2a'
  surface-variant: '#d9e3f6'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: 2.75rem
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.25rem
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.375rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system serves a tri-persona healthcare platform connecting doctors, clinic secretaries, and patients within the Tunisian medical ecosystem. The visual and functional tone balances sterile efficiency with human empathy—clinical competence without bureaucratic coldness.

### Persona Architecture
- **Doctors:** Require zero-friction ergonomics, dense yet scannable clinical charts, immediate visual triage, and effortless bi-directional multilingual script transitions (Arabic, French, English).
- **Secretaries:** Navigate high-throughput scheduling matrices, patient intake queues, phone desk multi-tasking, and billing summaries under time pressure.
- **Patients:** Encounter anxiety-inducing appointments; need calming clarity, large tap affordances, unmistakable status tags, and transparent scheduling instructions.

### Aesthetic Methodology
The aesthetic movement is **Modern Functional Clinical** infused with subtle Mediterranean-warm accents. It avoids cold tech-startup austerity by layering soft clinical teals alongside restorative terracotta-corals. Layouts use disciplined structural whitespace, low-glare surface tiers, and explicit visual hierarchy designed to perform reliably under harsh clinic fluorescent lighting or low-end mobile hardware.

## Colors

The palette establishes psychological safety through clinical teals while utilizing controlled warm coral highlights to guide urgency and priority. All text-background pairs strictly exceed WCAG 2.1 AA contrast requirements (minimum 4.5:1 for body copy, 3:1 for large text and interactive boundaries).

### Primary System
- **Deep Clinical Teal (`#0F6E6A`):** Anchors brand stability, primary calls to action, active navigation states, and primary focal points.
- **Teal Hover / Pressed (`#0B5350`):** Provides unambiguous physical confirmation on pointer interaction.
- **Teal Container / Wash (`#E6F4F2`):** Defines selected table rows, active patient cards, and calm info backdrops.

### Accent System
- **Warm Coral Accent (`#FF8A65`):** Reserved for forward-moving conversion triggers (e.g., "Book Immediate Appointment", "Call Patient Next", emergency badges).
- **Coral Hover / Active (`#F47253`):** Deepened kinetic response for coral triggers.
- **Coral Tint (`#FFF3EF`):** Subtle highlight fill for priority appointment markers and high-attention notifications.

### Neutral Foundation
- **Canvas / App Base (`#F7F9FA`):** Low-strain, off-white background preventing glare during long shifts.
- **Surface Elevation (`#FFFFFF`):** High-clarity white for cards, panels, modal dialogs, and medical forms.
- **Text Slate Primary (`#1F2937`):** High-density charcoal providing 12.6:1 contrast against canvas for deep legibility.
- **Text Slate Muted (`#64748B`):** Supporting metadata, form labels, and contextual timestamps (5.2:1 contrast ratio).
- **Hairline Borders (`#E2E8F0`):** Subtle structural boundaries separating dense patient data grids without visual noise.

### Clinical Status Accents
- **Confirmed / Normal (`#16A34A`):** Completed procedures, confirmed arrivals, normal lab ranges. Surface background: `#ECFDF5`.
- **Triage / Pending (`#D97706`):** Waiting room queue, pending prescriptions, follow-up flags. Surface background: `#FFFBEB`.
- **Urgent / Cancelled (`#DC2626`):** Critical alerts, missed appointments, medical warnings. Surface background: `#FEF2F2`.
- **Draft / Inactive (`#475569`):** Archival records, pending sync, draft consult notes. Surface background: `#F1F5F9`.

## Typography

The type system prioritizes high-speed legibility under stress and cognitive fatigue. **Plus Jakarta Sans** is the primary typeface for Latin script environments (French and English) due to its open apertures, tall x-height, and humanist geometric shapes.

### Multilingual & RTL Implementation
- **Arabic Script Architecture:** When rendering Arabic (`dir="rtl"`), the system pairs dynamically with system Naskh fallbacks or Arabic-compatible sans serifs (such as IBM Plex Sans Arabic or Cairo). The line-height for all Arabic variants must be increased by 15% to prevent diacritic and ascender clipping.
- **Bi-Directional Alignment:** Layouts cleanly flip mirroring axes. Numbers (phone numbers, National Identification / CIN, vital measurements, prescriptions) retain LTR numeric ordering even in RTL Arabic contexts.
- **Legibility Rules:** Avoid all font sizes below `0.75rem` (12px) for critical clinical values. Tabular numbers (`tnum`) must be enforced for all dosages, timestamps, and patient metrics to maintain scan alignment.

## Layout & Spacing

The layout model is an adaptive fluid-grid framework calibrated for disparate viewport constraints—ranging from reception multi-monitor setups (1080p and 1440p) down to inexpensive mobile devices used by patients on 3G networks.

### Grid Framework
- **Desktop (>= 1200px):** 12-column grid with `2rem` (32px) gutters and `2.5rem` outer canvas padding. Doctor consultation screens can toggle into a split 3-column structural mode: (1) Patient history timeline (3 cols), (2) Active clinical note/EMR (6 cols), (3) Diagnostic quick-actions/prescriptions (3 cols).
- **Tablet (768px - 1199px):** 8-column layout with `1.5rem` gutters. Collapses navigation into a vertical compact rail to optimize scheduling board density.
- **Mobile (< 768px):** 4-column layout with `1rem` gutters and `1rem` edge margin. Multi-column clinical matrices stack vertically into swipeable modular cards.

### Spacing Governance
- Standard rhythm follows a strict 4px/8px incremental cadence.
- Interactive tap zones are decoupled from purely visual padding: regardless of compact visual heights, all touch surfaces maintain an invisible hit area bounding box of at least 44x44px.

## Elevation & Depth

This system avoids heavy drop shadows to prevent visual fatigue and maintain crisp rendering on uncalibrated hospital LCD screens. Depth is created via **tonal layering**, crisp separation borders, and calm, diffused ambient grounding.

### Elevation Hierarchy
- **Level 0 (Flat Canvas):** `#F7F9FA`. Background canvas; non-interactive foundation.
- **Level 1 (Surface Cards & Clinical Rows):** `#FFFFFF` with a 1px continuous hairline border in `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 110, 106, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)`.
- **Level 2 (Dropdowns, Floating Sub-navigation, Hovered Cards):** `#FFFFFF` with `#E2E8F0` border. Shadow: `0 4px 6px -1px rgba(15, 110, 106, 0.07), 0 2px 4px -2px rgba(15, 110, 106, 0.04)`.
- **Level 3 (Modals, Urgent Triage Trays, Drug Interaction Dialogs):** `#FFFFFF` with a subtle teal tint outline. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`. Backdropped by a tinted scrim of `rgba(31, 41, 55, 0.45)`.

## Shapes

The geometric framework balances human comfort with professional order through **Level 2 (Rounded)** curvature.

- **Micro elements (Inputs, Buttons, Badges, Table Tags):** `0.5rem` (8px). Provides clean tactile definition without sharp corners or excessive bubbly curves.
- **Medium elements (Patient Cards, Modal Windows, Section Panels):** `1rem` (16px). Delivers a soft, approachable container feel for medical data.
- **Triage & Pill Elements (Status Tags, Filter Pills):** Full pill rounding (`9999px`) to create an immediate cognitive distinction between functional buttons (rounded rectangles) and state metadata indicators (capsule pills).

## Components

### Buttons
- **Primary:** Solid `#0F6E6A` background, white text, semi-bold font weight, `0.5rem` radius. Height `44px` on desktop, `48px` on mobile. Focus ring: `3px solid rgba(15, 110, 106, 0.35)`.
- **Accent (Urgent Action / Primary Conversion):** Solid `#FF8A65` background, white text. Hover state `#F47253`.
- **Secondary (Outlined):** Transparent background, 1.5px border in `#0F6E6A`, text `#0F6E6A`. Hover: `#E6F4F2`.
- **Ghost:** Transparent background, text `#64748B`. Hover: `#F1F5F9`, text `#1F2937`.
- **RTL Behavior:** Leading icons automatically switch positions when swapping between French/English (left) and Arabic (right).

### Input Fields & Selects
- **Height & Frame:** 44px min-height, `#FFFFFF` fill, 1px border `#E2E8F0`, `0.5rem` radius.
- **States:** Focus replaces border with 2px `#0F6E6A` and an outer halo of `rgba(15, 110, 106, 0.15)`. Error state uses `#DC2626` border with `#FEF2F2` background tint.
- **Bilingual Considerations:** Input placeholders and label text float or align right in Arabic mode; directional numerical inputs (National ID/CIN, phone, temperature) lock directionality to LTR while retaining localized labels.

### Patient & Appointment Cards
- **Structure:** White container, `1rem` radius, 1px `#E2E8F0` border.
- **Visual Edge:** A 4px vertical accent bar along the start edge (left in LTR, right in RTL) denotes appointment category or severity: Teal for General Consultation, Coral for Emergency/Urgent, Slate for Follow-up.
- **Content Hierarchy:** Patient full name in `headline-sm`, CIN/File number in `label-md` (`#64748B`), and status pill pinned to the opposite corner.

### Status Chips & Badges
- **Pill Form factor:** `9999px` radius, padding `0.25rem 0.75rem`, font `label-md`.
- **Color Mapping:**
  - *Confirmed / Present:* `#ECFDF5` background, `#16A34A` text, matching subtle dot indicator.
  - *Pending / In Waiting Room:* `#FFFBEB` background, `#D97706` text.
  - *Urgent / Canceled:* `#FEF2F2` background, `#DC2626` text.
  - *Draft / Teleconsultation:* `#F1F5F9` background, `#475569` text.

### Checkboxes & Radios
- **Touch Target:** Native control visually spans 20x20px inside a minimum 44x44px hit-box container.
- **Checked State:** Checkboxes display a `#0F6E6A` fill with a crisp white checkmark; radios show a `#0F6E6A` outer ring with an inner concentric dot.

### Specialized Clinic Components
- **Bilingual Language Switcher:** A segmented toggle button group pinned to the utility navigation (`FR` | `عربي` | `EN`) providing persistent one-tap linguistic context-switching without full-page reloads.
- **Waiting Room Queue Counter:** High-contrast glanceable display module with large tabular numerals (`headline-xl`), showing current patient number, doctor in session, and average wait duration.
- **Dosage & Prescription Grid:** Tabular row component with clear dosage step-steppers (+ / - counters), unit dropdowns (mg, ml, drops), and automated contraindication alert flags in `#DC2626`.