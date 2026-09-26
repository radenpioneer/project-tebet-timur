---
name: Project Tebet Timur
description: A warm, direct visual system for a public KAMMI aspiration poll.
colors:
  primary: "oklch(0.841 0.238 128.85)"
  primary-foreground: "oklch(0.405 0.101 131.063)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.153 0.006 107.1)"
  secondary: "oklch(0.967 0.001 286.375)"
  muted: "oklch(0.966 0.005 106.5)"
  muted-foreground: "oklch(0.58 0.031 107.3)"
  border: "oklch(0.93 0.007 106.5)"
  destructive: "oklch(0.577 0.245 27.325)"
  popover: "oklch(1 0 0)"
typography:
  display:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "clamp(1.75rem, 5vw, 2.25rem)"
    fontWeight: 500
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    lineHeight: 1.5
rounded:
  control: "2.5rem"
  card: "1rem"
  item: "0.75rem"
spacing:
  compact: "0.75rem"
  section: "1.5rem"
  page: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.control}"
    height: "2.25rem"
    padding: "0 0.75rem"
  card:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "1.5rem"
  select-trigger:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.control}"
    height: "2.25rem"
    padding: "0 0.75rem"
---

# Design System: Project Tebet Timur

## Overview

**Creative North Star: "The Open Forum Signal"**

The interface should feel like a clear public notice from a community: open, practical, and easy to act on. Fresh green gives the central action an optimistic signal, while quiet gray neutrals keep the vote form and detailed results legible. The mood is warm and community-minded without borrowing the gloss or spectacle of a campaign identity.

The current page places a focused response card ahead of a broader results area. Its controls are soft and tactile, with rounded silhouettes; the card remains calm and the select menu gains the strongest lift when it opens. Preserve this balance across future screens: direct information first, friendly interaction second.

**Key Characteristics:**
- Public and direct, with community warmth
- Fresh green used as a functional signal
- Quiet, slightly warm neutrals for reading and structure
- Softly rounded controls and restrained surface depth

## Colors

Fresh Green + Quiet Gray: a vivid lime primary sits against near-white surfaces and low-chroma warm neutrals. The frontmatter records the light theme values; `.dark` in `src/react-app/index.css` supplies the corresponding dark surfaces, text, borders, and a slightly deeper green primary.

### Primary
- **Fresh Green** (`oklch(0.841 0.238 128.85)`): Main action and active signal. Keep it tied to useful interaction rather than broad decorative fills.
- **Deep Green Ink** (`oklch(0.405 0.101 131.063)`): Foreground paired with the light primary surface.

### Neutral
- **Open Paper** (`oklch(1 0 0)`): Page, card, and popover surface in the light theme.
- **Quiet Ink** (`oklch(0.153 0.006 107.1)`): Default text and high-contrast content.
- **Soft Gray** (`oklch(0.967 0.001 286.375)`): Secondary controls and supporting surfaces.
- **Warm Mist** (`oklch(0.966 0.005 106.5)`): Muted and accent surface for low-emphasis states.
- **Stone Text** (`oklch(0.58 0.031 107.3)`): Supporting copy and placeholders.
- **Fine Border** (`oklch(0.93 0.007 106.5)`): Dividers, input edges, and table rules.

### Tertiary
- **Clear Error Red** (`oklch(0.577 0.245 27.325)`): Validation and destructive feedback only.

**The Signal Color Rule.** Use green to identify the action or selected state; let neutral surfaces carry the reading load.

## Typography

**Display Font:** Geist Variable (with sans-serif fallback)

**Body Font:** Geist Variable (with sans-serif fallback)

**Character:** Compact, contemporary sans-serif typography keeps instructions and tabular data matter-of-fact. The title adds a tight display size and tracking shift, while labels stay clear and functional.

### Hierarchy
- **Display** (500, `clamp(1.75rem, 5vw, 2.25rem)`, normal line-height): Poll title, scaling with the viewport.
- **Headline** (500, `1rem`): Section headings and prominent result labels, following the component-library scale.
- **Title** (500, `1rem`): Card and control titles.
- **Body** (400, `0.875rem`, `1.5` line-height): Form descriptions, status, and table content.
- **Label** (500, `0.875rem`): Field labels; uppercase eyebrow text uses `0.75rem`, weight 700, and `0.08em` tracking.

**The Plain-Language Type Rule.** Use hierarchy and weight to organize information; keep labels readable and avoid ornamental display typography.

## Layout

The poll page is a centered, single-column composition with a minimum viewport-height canvas, a `2rem 1rem` outer inset, and `2rem` vertical separation. The response card is capped at `38rem`; results may expand to `72rem` so their filters and cross-tabulation can be scanned without forcing the form to grow equally wide. Filter controls use an auto-fitting grid with a `12rem` minimum column and `0.75rem` gaps. On narrow screens, the grid collapses naturally and the table scrolls horizontally rather than compressing its values.

Use `1.5rem` around major card sections, `1.75rem` between field groups, and `0.75rem` for compact filter and table-cell spacing where the current styles establish those values. Keep the form and results as distinct reading zones.

## Elevation & Depth

The system is mostly flat. Cards use a faint outline to separate them from the page; menus use a pronounced soft shadow and a subtle ring so the open selection layer reads above the form. Depth signals interaction and stacking, not decoration.

### Shadow Vocabulary
- **Open Menu:** Tailwind `shadow-2xl` on select popups, paired with a low-opacity foreground ring. Reserve this lift for floating menus.

**The Menu Lift Rule.** Keep resting surfaces quiet; use stronger elevation only for overlays that need to sit above the page.

## Shapes

Controls use generous pill-like corners (the shared radius resolves to `2.5rem` for `rounded-4xl`). Cards and menus use a softer `1rem` radius; option rows use `0.75rem`. Thin neutral borders and rings define component edges. The shape language is rounded but restrained: avoid adding decorative outlines, badges, or clipped silhouettes without a real interaction role.

## Components

### Buttons
- **Character:** A compact, confident action with a soft pill silhouette.
- **Shape:** `2.5rem` radius; default height `2.25rem`.
- **Primary:** Fresh Green fill with Deep Green Ink text and `0.75rem` horizontal padding.
- **Hover / Focus:** The primary fill softens on hover; keyboard focus adds a visible ring. Active press shifts down by one pixel; disabled actions reduce opacity and stop pointer interaction.
- **Secondary / Outline / Ghost:** Use semantic secondary or muted surfaces, or a neutral border. Keep destructive red reserved for destructive meaning.

### Cards / Containers
- **Corner Style:** Soft `1rem` outer corners, with nested headers following the card's geometry.
- **Background:** Open Paper in light theme and the semantic card surface in dark theme.
- **Shadow Strategy:** A faint foreground ring separates the card; do not give resting cards the menu's heavy shadow.
- **Internal Padding:** `1.5rem` by default; compact card variants use `1rem`.

### Inputs / Fields
- **Style:** Full-width select triggers in the poll form use a translucent input surface, a subtle border, pill corners, and `0.75rem` horizontal padding.
- **Focus:** Shift the border to the semantic ring and add a visible `3px` focus halo.
- **Error / Disabled:** Errors use the destructive semantic color. Disabled controls reduce opacity and show a not-allowed cursor.
- **Open menu:** The popup aligns to the trigger width, has `1rem` corners, and uses the stronger menu elevation. Focused options use the semantic accent surface.

### Results Table
- **Character:** Dense but readable; results remain plain data rather than decorative cards.
- **Structure:** Left-aligned columns, collapsed borders, and a `0.75rem` cell inset.
- **Responsive behavior:** Preserve each value on one line and allow horizontal scrolling at narrow widths.

## Do's and Don'ts

### Do:
- **Do** use semantic theme tokens so light and dark modes stay aligned.
- **Do** keep the poll action visually clear and the supporting privacy/context copy easy to read.
- **Do** preserve the wide results region and horizontal table overflow behavior.
- **Do** use a visible focus treatment for keyboard-operated controls.

### Don't:
- **Don't** turn the interface into a corporate campaign identity or add campaign-style spectacle.
- **Don't** use the primary green as a large decorative background when it weakens text contrast or action hierarchy.
- **Don't** apply the open-menu shadow to every resting card or control.
- **Don't** compress result columns until values become difficult to scan; allow horizontal scrolling instead.
