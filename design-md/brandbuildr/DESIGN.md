---
version: alpha
name: BrandBuildr
description: >
  Strategic brand-building SaaS: logic harness and P1 product UI. Visual identity
  pairs a dark persistent shell with light content (default) or optional dark content
  mode. Primary interaction accent is indigo; phase colours follow Core/Grow/Scale/Legacy.
  Behaviour and component states are governed by SYS-UI-0.1; this file is the visual
  token and composition source aligned with the React implementation and UX-P1 scope.

colors:
  text-primary: "#0F172A"
  text-muted: "#64748B"
  page-bg: "#F8FAFC"
  card-bg: "#FFFFFF"
  border-default: "#E2E8F0"
  border-muted: "#F1F5F9"
  accent-indigo: "#6366F1"
  accent-indigo-hover: "#4F46E5"
  destructive-red: "#DC2626"
  on-destructive: "#FFFFFF"
  shell-bg: "#020617"
  content-bg-light: "#F8FAFC"
  content-text-light: "#0F172A"
  content-bg-dark: "#020617"
  content-text-dark: "#E2E8F0"
  button-primary-bg: "#4F46E5"
  button-primary-text: "#FFFFFF"
  button-secondary-bg: "transparent"
  button-secondary-text: "#0F172A"
  button-secondary-border: "#0F172A"
  dark-slate: "#1E293B"
  dark-slate-text: "#F8FAFC"
  phase-core: "#10B981"
  phase-grow: "#0EA5E9"
  phase-scale: "#6366F1"
  phase-legacy: "#8B5CF6"
  consensus-teal: "#14B8A6"
  primary: "{colors.text-primary}"
  secondary: "{colors.text-muted}"
  surface: "{colors.page-bg}"
  surface-card: "{colors.card-bg}"
  border: "{colors.border-default}"
  accent: "{colors.accent-indigo}"
  destructive: "{colors.destructive-red}"

typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.4
  h3:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  section-label:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: 0.08em
  subtitle:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
  mono-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.2
  export-serif-h1:
    fontFamily: Georgia
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em

rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  page-top: 32px
  page-side: 48px
  title-to-content: 24px
  subtitle-gap: 4px
  content-max-width: 1200px

components:
  button-primary:
    backgroundColor: "{colors.button-primary-bg}"
    textColor: "{colors.button-primary-text}"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.button-secondary-bg}"
    textColor: "{colors.button-secondary-text}"
    rounded: "{rounded.md}"
    padding: 12px
  button-destructive:
    backgroundColor: "{colors.destructive-red}"
    textColor: "{colors.on-destructive}"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  shell-sidebar:
    backgroundColor: "{colors.shell-bg}"
    textColor: "{colors.content-text-dark}"
    borderColor: "#1E293B"
  shell-content-light:
    backgroundColor: "{colors.content-bg-light}"
    textColor: "{colors.content-text-light}"
  shell-content-dark:
    backgroundColor: "{colors.content-bg-dark}"
    textColor: "{colors.content-text-dark}"
  phase-pill:
    rounded: "{rounded.full}"
    padding: 4px
    typography: "{typography.section-label}"
  brand-card:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
  brand-avatar:
    rounded: "{rounded.sm}"
    size: 32px
  filter-bar:
    backgroundColor: "transparent"
    padding: 0px
  context-menu:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.md}"
  table-row:
    backgroundColor: "transparent"
    padding: 12px
  breadcrumb:
    typography: "{typography.body-sm}"
    textColor: "{colors.text-muted}"
  modal-confirmation:
    backgroundColor: "{colors.card-bg}"
    rounded: "{rounded.lg}"
  dark-canvas:
    backgroundColor: "{colors.dark-slate}"
    textColor: "{colors.dark-slate-text}"
  dark-canvas-button:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.dark-slate}"
    rounded: "{rounded.md}"
    padding: 12px
  stage-indicator-bar:
    backgroundColor: "#0F172A"
    borderColor: "#1E293B"
    activeAccent: "{colors.accent-indigo}"
  facilitator-message:
    accentColor: "{colors.accent-indigo}"
    typography: "{typography.body-md}"
  board-consensus-panel:
    accentColor: "{colors.consensus-teal}"
    labelTypography: "{typography.section-label}"
  session-pillar-sidebar:
    backgroundColor: "{colors.shell-bg}"
    activePillarDot: "{colors.accent-indigo}"
---

## Overview

BrandBuildr is a strategic brand-building platform for brand leaders and agencies. The UI should feel like a trusted professional environment: calm authority with warmth, structured clarity without rigidity. The user’s strategic work—not chrome—should read as the hero.

**Implementation reality (P1 harness).** The app uses a **dark persistent shell** (`slate-950` / `#020617`) for global and brand sidebars, with a **theme-aware main column**: default **light content** (`slate-50` background, `slate-900` text) via `ThemeProvider`; optional **dark content** flips the main column to `slate-950` / `slate-200` text. Tailwind is loaded from CDN with **Inter** as `font-sans` and **JetBrains Mono** as `font-mono` ([`index.html`](../../index.html)). Extended palette tokens: `indigo.450` / `indigo.550`, `slate.850` / `slate.950`.

**Source-of-truth hierarchy.**

| Layer | Document / code |
| ----- | ---------------- |
| Component behaviour, states, copy rules | [SYS-UI-0.1 — UI Component Standards](2.%20Strategy%20Session%20(Discover%20-%20Diagnose)/0.0%20-%20System%20-%20Universal/0-UI-standards/0-UI-Standards%20or%200-Component-Standards.md) |
| P1 UX deltas (screens, copy, interaction) | [UX-P1-Implementation-Scope.md](../UX-P1-Implementation-Scope.md) |
| Visual tokens & composition | This `DESIGN.md` + YAML frontmatter |
| Pixel reference archive (UX Pilot HTML) | [../UX-Pilot/](../UX-Pilot/) (`brand-dark`, `brand-accent`, etc.) |

Where SYS-UI-0.1 defines **behaviour** and this file defines **look**, behaviour wins for states; use tokens here (and implementation) for colour, type, and spacing.

**Token drift.** Phase hues are **not yet single-sourced** in code: [`components/build/PhaseBadge.tsx`](../../components/build/PhaseBadge.tsx), [`components/dashboard/OperationalOverviewTable.tsx`](../../components/dashboard/OperationalOverviewTable.tsx), [`components/build/RoadmapStrategiesSection.tsx`](../../components/build/RoadmapStrategiesSection.tsx), and [`components/build/StrategyCard.tsx`](../../components/build/StrategyCard.tsx) each carry Tailwind class maps. The YAML `phase-*` tokens below are the **canonical targets** (emerald / sky / indigo / violet). Consolidate to one `phaseTokens` module in a future refactor.

This file follows the open [design.md format](https://github.com/google-labs-code/design.md) and [spec](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md): YAML tokens plus sections in the prescribed order.

## Colors

The palette is **semantic**: neutrals for structure, **indigo** for primary interactive emphasis (active nav, CTAs, stage progress), **teal / emerald** for board consensus and success-adjacent states where specified in UX-P1, **red** reserved for destructive actions, and **phase** hues for lifecycle (Core → Grow → Scale → Legacy) only in phase UI and shape system—not as generic decoration.

- **Shell (`#020617`):** Outer background and sidebars; matches Tailwind `slate-950` and is close to UX Pilot `brand-dark` (`#0D1117`).
- **Content light (`#F8FAFC` on `#0F172A` text):** Main column in default theme (`slate-50` / `slate-900`).
- **Content dark:** Main column in dark theme (`slate-950` / `slate-200`).
- **Borders:** Light surfaces use `#E2E8F0` (`slate-200`); dark chrome uses `slate-800` in components.
- **Accent indigo (`#6366F1` / hover `#4F46E5`):** Primary buttons, active indicators, roadmap “active” markers, stage indicator active node (see [`components/StageIndicator.tsx`](../../components/StageIndicator.tsx)).
- **Phase dots (canonical):** Core `#10B981`, Grow `#0EA5E9`, Scale `#6366F1`, Legacy `#8B5CF6` (Tailwind `emerald-500`, `sky-500`, `indigo-500`, `violet-500`).
- **Board consensus accent (`#14B8A6`):** Teal for Decide-phase “Board Consensus” chrome per UX-P1.
- **Destructive (`#DC2626`):** Delete and irreversible actions only; archive remains secondary outline per SYS-UI.

### Design Tokens

Token values in YAML frontmatter are normative hex for tools; the app often references **Tailwind utilities** with the same underlying palette ([`contexts/ThemeContext.tsx`](../../contexts/ThemeContext.tsx) maps theme to `bg-slate-*`, `text-slate-*`, etc.).

## Typography

**Primary typeface: Inter** (weights 300–700 loaded in `index.html`). **JetBrains Mono** is used for technical labels (e.g. stage indicator mono labels in [`StageIndicator.tsx`](../../components/StageIndicator.tsx)).

Align with SYS-UI-0.1 §13: **600 / 500 / 400** as the main weights; avoid extra-bold for Phase 1. Scale: **H1 24px semibold**, **H2 18px semibold**, **H3 15px semibold**, **body 14px regular**, **muted 13px regular**, **section labels 11px medium, all caps, 0.08em tracking**.

**Sentence case** for headings and body except section labels (all caps).

**Full Strategy Export:** Serif for strategy title and block headings only; platform UI remains Inter. SYS-UI-0.1 §13.12; implementation may use Georgia or export-specific serif—never for standard surfaces.

### Design Tokens

See `typography` in YAML (`h1`, `h2`, `body-md`, `section-label`, `mono-label`, `export-serif-h1`).

## Layout

**Content width:** SYS-UI standard **1200px max** with **48px** horizontal padding on key document pages ([`pages/StrategyOutputPage.tsx`](../../pages/StrategyOutputPage.tsx), [`pages/StrategyDocumentPage.tsx`](../../pages/StrategyDocumentPage.tsx) use `max-w-[1200px]` and `px-12`). Other views may use `max-w-4xl` / `max-w-7xl` for focused flows—prefer tightening toward 1200px for dashboard parity.

**Page title rhythm:** 32px top spacing above H1, 24px to first content block, 4px subtitle gap where subtitles exist (per SYS-UI).

**Shell layout:** [`components/layout/BrandLayout.tsx`](../../components/layout/BrandLayout.tsx) — `min-h-screen` shell, dark `MainSidebar` + dark `BrandSidebar`, main `Outlet` with theme-aware `contentClasses` and responsive `ml` for sidebar width / collapse (`sm:ml-[17rem]` vs `sm:ml-16`). [`components/layout/AppLayout.tsx`](../../components/layout/AppLayout.tsx) for non-brand routes: `sm:ml-16`, same light/dark content split.

**Brand avatar beside H1:** 32px rounded treatment per SYS-UI §5.

### Design Tokens

See `spacing` and `content-max-width` in YAML.

## Elevation & Depth

**Light content mode:** Depth is primarily **tonal** (page `slate-50` vs card `white`), with **light borders** (`slate-200`). Cards may use `shadow-sm` where the implementation calls for separation ([`contexts/ThemeContext.tsx`](../../contexts/ThemeContext.tsx) `shadow` in light theme).

**Overlays:** Modals and slide-over panels use stronger shadows (`shadow-2xl`) and rounded containers—see [`components/build/AIBoardPanel.tsx`](../../components/build/AIBoardPanel.tsx).

**Dark session areas:** Build session split views use dark `slate-950` / `slate-900` panels for immersion; aligns with UX Pilot “dark sidebar + content” patterns.

**UX Pilot reference:** Subtle `ambient` shadows in static HTML under [../UX-Pilot/](../UX-Pilot/); implement in Tailwind terms, not as a second system.

## Shapes

The **square / circle / triangle** system encodes **strategy model / initiative / task** across Operate, Operational Overview, and roadmap (SYS-UI-0.1 §4). **Stroke states** (muted, full, filled) encode planned / active / complete in **phase colour**.

**Pulsing:** Per SYS-UI-0.1 §4.4 (activation pulse vs current-focus pulse).

**Corner radius:** Interactive controls and cards use **8px (`md`)** as default; pills full radius; avatars **sm** rounded square.

### Design Tokens

See `rounded` in YAML.

## Components

Each item: **behaviour** in SYS-UI-0.1; **implementation** in cited files.

- **Global shell & nav:** Dark sidebars; active route highlighting with indigo; tertiary Operate nav with initiative list—[`BrandSidebar.tsx`](../../components/layout/BrandSidebar.tsx), [`MainSidebar.tsx`](../../components/layout/MainSidebar.tsx). Mobile: fixed header + drawer pattern in `BrandLayout` / `AppLayout`.
- **Phase pill / badge:** Read-only; four phases; [`PhaseBadge.tsx`](../../components/build/PhaseBadge.tsx). Source logic: SYS-UI-0.1 §3.
- **Brand card, avatar, three-dot menu:** SYS-UI §6–7; [`DashboardPage.tsx`](../../pages/DashboardPage.tsx) and related dashboard components.
- **Roadmap strategies:** Status icons (outline / dashed / filled indigo / emerald) per [UX-P1-Implementation-Scope.md](../UX-P1-Implementation-Scope.md) §2; [`RoadmapStrategiesSection.tsx`](../../components/build/RoadmapStrategiesSection.tsx).
- **Stage indicator (Discover → Deploy):** Sticky bar, indigo active node; [`StageIndicator.tsx`](../../components/StageIndicator.tsx); UX-P1 §6.
- **Facilitator & board chat:** Facilitator lightning avatar, YOU/FACILITATOR labels, board member left accent—[`FacilitatorChat.tsx`](../../components/build/FacilitatorChat.tsx), [`BoardMemberMessage.tsx`](../../components/build/BoardMemberMessage.tsx); UX-P1 §5.
- **Pillar sidebar (session):** Dark background; active pillar **indigo** dot per UX-P1 §5e—[`PillarSidebar.tsx`](../../components/build/PillarSidebar.tsx) (or session embed in `StrategySession`).
- **Decide — Board Consensus:** Teal / green header and accent bar—[`DecideResultView.tsx`](../../components/DecideResultView.tsx); UX-P1 §7.
- **Operational overview table:** Type / phase / progress columns; phase dots—[`OperationalOverviewTable.tsx`](../../components/dashboard/OperationalOverviewTable.tsx).
- **Operate pillar sidebar:** Indigo active rail—[`OperatePillarSidebar.tsx`](../../components/operate/OperatePillarSidebar.tsx).
- **Session hub / setup:** Light neutral layout target—[`StrategyHubPage.tsx`](../../pages/StrategyHubPage.tsx); UX-P1 §3.
- **Confirmation modals & danger zone:** SYS-UI §8–9; destructive red only for delete.

### Design Tokens

See `components` in YAML (`shell-sidebar`, `stage-indicator-bar`, `facilitator-message`, `board-consensus-panel`, etc.).

## Motion

**CSS transitions only**—no heavy animation libraries for standard UI ([UX-P1-Implementation-Scope.md](../UX-P1-Implementation-Scope.md) Design System Reference). Sidebar margin collapse, hover states, and stage indicator use short `transition-*` classes. Reserve elaborate motion for documented system-processing patterns (SYS-UI shape animation)—not for conversational typing indicators unless specified.

## Iconography

**Lucide React** icons across navigation and actions (e.g. [`BrandSidebar.tsx`](../../components/layout/BrandSidebar.tsx): Compass, Hammer, MonitorCog, Rocket). Default to **stroke** icons at 16–24px depending on density; align icon colour with `text-slate-400` / `text-slate-500` for inactive chrome and indigo or white for active states on dark sidebars.

## Do's and Don'ts

- Do use **SYS-UI-0.1** for component behaviour and copy rules before inventing new patterns.
- Do use **indigo** for primary CTAs and active progression; **phase colours** only for phase and shape system.
- Do keep the **dark shell + light content (default)** model consistent with [`BrandLayout.tsx`](../../components/layout/BrandLayout.tsx) and UX-P1.
- Do use **Inter** for UI; **JetBrains Mono** sparingly for labels/code; serif **only** in Full Strategy Export titles/headings.
- Do maintain **1200px** max width and **48px** horizontal padding on canonical dashboard/document pages.
- Do use **tonal separation** before heavy shadow on standard cards.
- Do show **three-dot menus** on hover/tap, not at rest (SYS-UI §6).
- Do place **destructive** actions in Danger Zone with confirmation (SYS-UI §8–9).
- Don’t scatter new **phase colour** mappings—normalize to YAML tokens and a single code module.
- Don’t use **destructive red** for archive or warnings.
- Don’t use **AI-affect** or **hedging** copy in system or board outputs (see existing guardrails in client docs / prompts).
- Don’t mix **inconsistent** breadcrumb or H1 treatments per page without logic-doc approval.
- Don’t add **bold** weights beyond the 600/500/400 system for Phase 1 except export/long-form exceptions.
