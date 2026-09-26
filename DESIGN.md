---
name: Project Tebet Timur
description: In-progress Vite scaffold with an olive-neutral shadcn theme and lime accent tokens.
colors:
  primary: "oklch(0.841 0.238 128.85)"
  primary-foreground: "oklch(0.405 0.101 131.063)"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.153 0.006 107.1)"
  secondary: "oklch(0.967 0.001 286.375)"
  secondary-foreground: "oklch(0.21 0.006 285.885)"
  muted: "oklch(0.966 0.005 106.5)"
  muted-foreground: "oklch(0.58 0.031 107.3)"
  accent: "oklch(0.966 0.005 106.5)"
  accent-foreground: "oklch(0.228 0.013 107.4)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.93 0.007 106.5)"
  ring: "oklch(0.737 0.021 106.9)"
  starter-button: "#1a1a1a"
  starter-link: "#646cff"
typography:
  body:
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
  heading:
    fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
    fontSize: "3.2em"
    fontWeight: 400
    lineHeight: 1.1
rounded:
  sm: "calc(var(--radius) * 0.6)"
  md: "calc(var(--radius) * 0.8)"
  lg: "var(--radius)"
  xl: "calc(var(--radius) * 1.4)"
  base: "0.625rem"
components:
  starter-button:
    backgroundColor: "{colors.starter-button}"
    rounded: "8px"
    padding: "0.6em 1.2em"
    typography: "500 1em Inter, system-ui, sans-serif"
  starter-card:
    padding: "2em"
---

# Design System: Project Tebet Timur

## Overview

**Creative North Star: "The Lime Accent System"**

This name describes the accent in the current token scaffold; it is not an approved identity for the polling product. The repository combines a shadcn olive-and-lime theme with mostly untouched Vite starter styles. Treat those as implementation evidence, not as a finished or unified visual language.

The token layer provides semantic light and dark palettes, with a vivid lime primary and restrained olive neutrals. The visible starter layer still supplies generic typography, links, buttons, and spacing. No product-specific interface, brand asset, or distinctive component pattern is implemented yet. There is no confirmed anti-reference.

**Key Characteristics:**
- Lime primary token over muted olive-neutral semantic colors.
- Generic Vite starter controls remain alongside shadcn theme tokens.
- Geist Variable is loaded and mapped to the sans theme, while the root stylesheet explicitly sets an Inter/system font stack.
- Current UI styling is a scaffold, not an approved product direction.

## Colors

The theme source uses OKLCH semantic variables in `src/react-app/index.css`; the Vite starter still adds a small number of independent hex colors. Token values in the frontmatter are normative for the extracted theme.

### Primary
- **Bright Lime Primary** (`oklch(0.841 0.238 128.85)`): The shadcn light-theme primary token. No implemented UI component currently uses it.

### Secondary
- **Cool Gray Secondary** (`oklch(0.967 0.001 286.375)`): The secondary surface token has a faint cool cast, distinct from the warmer olive neutral family.

### Tertiary
- **Signal Red** (`oklch(0.577 0.245 27.325)`): Semantic destructive/error token. No product-specific status palette has been established.
- **Starter Link Blue** (`#646cff`): The generic Vite link color and button hover border. Keep it identified as starter styling.

### Neutral
- **White Canvas** (`oklch(1 0 0)`): The light background and card surface token.
- **Deep Olive Ink** (`oklch(0.153 0.006 107.1)`): The semantic foreground for light surfaces.
- **Starter Charcoal** (`#1a1a1a`): The generic starter button background; this is a template style, not a product brand color.
- **Soft Olive Mist** (`oklch(0.966 0.005 106.5)`): Muted and accent surfaces.
- **Olive Gray Text** (`oklch(0.58 0.031 107.3)`): Muted foreground text.
- **Olive Hairline** (`oklch(0.93 0.007 106.5)`): Borders and input outlines.

**The Scaffold Boundary Rule.** Preserve the distinction between semantic theme tokens and template colors; do not present starter blue or charcoal as product identity.

## Typography

**Display Font:** Inter (with system-ui, Avenir, Helvetica, Arial fallbacks)
**Body Font:** Inter (with system-ui, Avenir, Helvetica, Arial fallbacks)

**Character:** The root stylesheet sets a conventional system sans stack. Geist Variable is imported and assigned to Tailwind's sans token, but the root's direct font declaration means the scaffold's actual base typography remains Inter-first.

### Hierarchy
- **Headline** (400 inherited, `3.2em`, line-height `1.1`): The starter `h1` size. Tailwind Preflight resets heading weight to inherit; no product headline scale exists.
- **Body** (400, `16px`, line-height `1.5`): The root default for body copy.
- **Button label** (500, inherited size, line-height inherited): The generic starter button uses a medium weight and the inherited font family.

**The Single Source Rule.** Treat the root font declaration as the current base; do not assume the imported Geist font is visibly active without changing the cascade.

## Layout

The starter centers a single content column in a maximum-width root container (`1280px`) with `2rem` outer padding and centered text. The page body fills at least the viewport height. There is no authored responsive grid or breakpoint behavior in the app stylesheet; preserve the starter's fluid width and avoid describing it as a finished polling layout.

Spacing is currently expressed as local values (`2rem` at the root, `2em` in cards, and `0.6em 1.2em` in buttons), not as a confirmed shared spacing scale.

## Elevation & Depth

The current scaffold is flat: the app stylesheet defines no box shadows or elevation scale. Depth comes only from the semantic surface colors and borders in the theme. The `card` class adds padding but no card surface treatment.

## Shapes

The shadcn theme provides a base radius of `0.625rem` and derived rounded steps. The generic Vite button independently uses an `8px` radius. Cards have no defined corners, borders, or clipping. These are current scaffold values, not a settled product-wide shape language.

## Components

The repository has no installed shadcn UI components yet. The only recurring examples are generic starter controls; treat them as implementation references rather than product patterns.

### Buttons
- **Character:** Plain browser-like starter button with a dark fill.
- **Shape:** Gently rounded corners (`8px`).
- **Primary:** Charcoal background (`#1a1a1a`), inherited foreground color, and compact proportional padding (`0.6em 1.2em`).
- **Hover / Focus:** Hover changes the border to starter link blue; focus uses the browser's automatic outline (`4px auto`). No custom motion or product state treatment is defined.

### Cards / Containers
- **Character:** Unframed starter content group, not a designed surface component.
- **Corner Style:** No card radius is defined.
- **Background:** Inherits its parent surface.
- **Shadow Strategy:** None.
- **Border:** None.
- **Internal Padding:** `2em`.

## Do's and Don'ts

### Do:
- **Do** use semantic theme tokens such as primary, background, foreground, muted, and border when extending the existing shadcn theme.
- **Do** keep lime, olive, and neutral values in OKLCH where they are already defined.
- **Do** describe existing button and card examples as generic starter patterns.
- **Do** treat this document as a record of the current scaffold until product UI establishes a more complete visual system.

### Don't:
- **Don't** present the starter blue or charcoal button as an approved product brand color.
- **Don't** assume the dark theme is active; the `.dark` token set exists, but no theme switch is implemented.
- **Don't** claim a shared spacing scale, elevation system, navigation, form, or installed shadcn component library; none is present in the current app UI.
