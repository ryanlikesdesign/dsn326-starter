# Rail Design System

Rail is the design system for **Heard**, a restaurant software platform. It ships 12 components built on design tokens. Two products share the system:

- **Guest** -- consumer ordering app (phone-first, ~400K orders/week)
- **Line** -- kitchen display system (15" pass display + server handheld)

One system, two surfaces. Components adapt through density modes, environment modes, and surface classes. You never build separate components for Guest vs. Line -- you configure the same ones.

---

## Two Independent Axes

Rail has two configuration axes. They are **independent** -- density is not environment.

### Density

Controls spacing and type scale. Matches how close the user is and how much content fits.

| Mode | Where | Spacing (sm/md/lg) | Body size | Use case |
|------|-------|---------------------|-----------|----------|
| `density-comfortable` | Guest phone | 8 / 16 / 24 px | 16 px | Thumb-friendly ordering on a phone |
| `density-compact` | Guest desktop | 6 / 12 / 16 px | 14 px | More content visible on larger screens |
| `density-service` | Line (always) | 12 / 24 / 32 px | 24 px | Readable at 4 feet across a pass window |

### Environment

Controls target sizes, contrast floors, and focus indicators. Matches physical conditions.

| Mode | Min target | Focus ring | Contrast floor | Hover | Use case |
|------|-----------|------------|----------------|-------|----------|
| `env-standard` | 44 px | 2 px | 4.5:1 | Yes | Normal indoor lighting |
| `env-high-glare` | 56 px | 3 px | 7:1 | No | Kitchen pass, bright overhead lights |

High-glare disables hover states entirely. If you can't reliably hover, don't design for it.

### Combining Them

A Guest phone in normal lighting: `density-comfortable env-standard`
A Line pass display under kitchen lights: `density-service env-high-glare`
A Line handheld in a dim hallway: `density-service env-standard`

Any combination is valid. Pick density for the viewing distance, environment for the lighting.

---

## Applying Modes

Modes are applied via CSS classes on a container element. Components inside inherit the configuration.

```html
<!-- Guest phone -->
<div class="density-comfortable env-standard">
  ...components render at phone scale...
</div>

<!-- Line pass display -->
<div class="density-service env-high-glare surface-line">
  ...components render large, high-contrast, dark palette...
</div>
```

### Surface Switching

The `surface-line` class swaps the color palette to a dark background optimized for kitchen displays. It does not change density or environment -- those are set separately.

```html
<!-- Dark palette, but density and environment are their own classes -->
<div class="surface-line density-service env-high-glare">
```

---

## Token Groups

All component styling flows from tokens. Never hardcode values -- use tokens.

### Color (Semantic)

Tokens reference purpose, not hue. The palette shifts when `surface-line` is applied.

| Token | Standard surface | Line surface | Usage |
|-------|-----------------|-------------|-------|
| `--color-primary` | Blue 600 | Blue 300 | Primary actions, links |
| `--color-surface` | White | Gray 900 | Backgrounds |
| `--color-on-surface` | Gray 900 | Gray 50 | Text on backgrounds |
| `--color-error` | Red 600 | Red 300 | Errors, destructive actions |
| `--color-success` | Green 600 | Green 300 | Confirmations, done states |
| `--color-warning` | Amber 600 | Amber 300 | Alerts, time pressure |
| `--color-muted` | Gray 400 | Gray 500 | Secondary text, borders |
| `--color-overlay` | Black / 0.5 | Black / 0.7 | Modals, drawers |

Do not use primitive color values (e.g., `#2563EB`). Use semantic tokens so surfaces switch cleanly.

### Spacing

Three categories, three sizes. Values shift per density mode.

| Category | What it controls | Token pattern |
|----------|-----------------|---------------|
| **Inset** | Padding inside a component | `--space-inset-{sm/md/lg}` |
| **Stack** | Vertical gap between elements | `--space-stack-{sm/md/lg}` |
| **Inline** | Horizontal gap between elements | `--space-inline-{sm/md/lg}` |

Resolved values per density:

| Token | Comfortable | Compact | Service |
|-------|------------|---------|---------|
| `sm` | 8 px | 6 px | 12 px |
| `md` | 16 px | 12 px | 24 px |
| `lg` | 24 px | 16 px | 32 px |

### Type

Six scales. Sizes shift per density mode.

| Scale | Comfortable | Compact | Service | Weight | Usage |
|-------|------------|---------|---------|--------|-------|
| `display` | 32 px | 28 px | 48 px | 700 | Hero numbers, order totals |
| `heading` | 24 px | 20 px | 36 px | 600 | Section titles |
| `body` | 16 px | 14 px | 24 px | 400 | Paragraphs, descriptions |
| `label` | 14 px | 12 px | 20 px | 500 | Form labels, metadata |
| `caption` | 12 px | 11 px | 16 px | 400 | Timestamps, helper text |
| `mono` | 14 px | 12 px | 20 px | 400 | Order numbers, codes |

### Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4 px | Badges, chips |
| `--radius-md` | 8 px | Cards, inputs |
| `--radius-lg` | 12 px | Modals, sheets |
| `--radius-full` | 9999 px | Avatars, circular buttons |

### Elevation

| Token | Shadow | Usage |
|-------|--------|-------|
| `--elevation-0` | None | Flat elements |
| `--elevation-1` | 0 1px 2px | Cards, subtle lift |
| `--elevation-2` | 0 4px 8px | Dropdowns, popovers |
| `--elevation-3` | 0 8px 24px | Modals, drawers |

### Touch Targets

Minimum sizes shift per environment mode.

| Token | Standard | High-glare |
|-------|----------|-----------|
| `--target-min` | 44 px | 56 px |
| `--target-comfortable` | 48 px | 60 px |

### Icons

| Token | Value | Notes |
|-------|-------|-------|
| `--icon-sm` | 16 px | Inline with label text |
| `--icon-md` | 20 px | Default icon size |
| `--icon-lg` | 24 px | Standalone icon buttons |
| `--icon-xl` | 32 px | Service density primary actions |

Stroke weight: 1.5 px standard, 2 px in `env-high-glare`.

---

## The 12 Components

Every component uses a class prefix. Variants are modifier classes.

### 1. Button -- `rail-btn`

Primary action trigger. Respects target sizes from environment mode.

| Variant | Class | Notes |
|---------|-------|-------|
| Primary | `rail-btn--primary` | Filled background, high contrast |
| Secondary | `rail-btn--secondary` | Outlined, lower emphasis |
| Ghost | `rail-btn--ghost` | No border, text only |
| Destructive | `rail-btn--destructive` | Error color, confirms before acting |
| Icon-only | `rail-btn--icon` | Square, holds one icon |

### 2. Card -- `rail-card`

Content container with optional header, body, and footer slots.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-card` | Elevation 1, radius-md |
| Flat | `rail-card--flat` | No shadow, border only |
| Interactive | `rail-card--interactive` | Hover/press states (disabled in high-glare) |

### 3. Input -- `rail-input`

Text entry with label, helper text, and error states.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-input` | Single line |
| Textarea | `rail-input--textarea` | Multi-line |
| Search | `rail-input--search` | Includes search icon, clear button |

### 4. Select -- `rail-select`

Dropdown picker. Opens a scrollable list. In `env-high-glare`, opens a full-screen picker instead of a dropdown.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-select` | Standard dropdown |
| Native | `rail-select--native` | Uses OS-native picker on mobile |

### 5. Toggle -- `rail-toggle`

Binary on/off switch. Larger track in service density.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-toggle` | Standard toggle |
| With label | `rail-toggle--labeled` | Inline label left of track |

### 6. Badge -- `rail-badge`

Status indicator or count. Small, non-interactive.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-badge` | Neutral background |
| Status | `rail-badge--{success/warning/error}` | Semantic color |
| Count | `rail-badge--count` | Circular, holds a number |

### 7. Tab Bar -- `rail-tabs`

Horizontal navigation between views. Scrollable when tabs overflow.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-tabs` | Underline indicator |
| Pill | `rail-tabs--pill` | Filled indicator, rounded |

### 8. Modal -- `rail-modal`

Overlay dialog. Traps focus. Uses `--color-overlay` backdrop.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-modal` | Centered, radius-lg |
| Sheet | `rail-modal--sheet` | Slides up from bottom (phone) |
| Fullscreen | `rail-modal--fullscreen` | Covers viewport (high-glare default) |

### 9. Toast -- `rail-toast`

Temporary notification. Auto-dismisses. Stacks when multiple fire.

| Variant | Class | Notes |
|---------|-------|-------|
| Info | `rail-toast--info` | Neutral |
| Success | `rail-toast--success` | Green accent |
| Error | `rail-toast--error` | Red accent, longer display time |

### 10. List Item -- `rail-list-item`

Row in a scrollable list. Supports leading icon, trailing action, and swipe gestures on touch.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-list-item` | Single line |
| Two-line | `rail-list-item--two-line` | Title + subtitle |
| Action | `rail-list-item--action` | Trailing chevron or toggle |

### 11. Header -- `rail-header`

Top bar with title, back action, and optional trailing actions.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-header` | Standard top bar |
| Sticky | `rail-header--sticky` | Stays fixed on scroll |
| Transparent | `rail-header--transparent` | No background until scroll |

### 12. Stepper -- `rail-stepper`

Quantity selector. Plus/minus buttons around a numeric value. Critical for ordering flows.

| Variant | Class | Notes |
|---------|-------|-------|
| Default | `rail-stepper` | Inline +/- buttons |
| Compact | `rail-stepper--compact` | Smaller for dense lists |

---

## Personas

Design decisions reference these people. They are fictional but represent real usage patterns.

| Persona | Role | Product | Key constraint |
|---------|------|---------|---------------|
| **Tomas** | Regular customer | Guest | Orders lunch on his phone while walking, one-handed, 30 seconds or less |
| **Marcus** | Expo / line cook | Line | Reads the pass display from 4 feet away, hands are wet or gloved |
| **Jess** | Server | Line | Uses handheld to fire courses and mark items, moves fast between tables |
| **Renata** | Kitchen manager | Line | Monitors ticket times and 86'd items, needs at-a-glance status |

---

## Contribution Rules

### Extend Before You Create

Before proposing a new component, check whether an existing one can be extended with a new variant. Rail stays small on purpose.

### Rule of Three

A pattern must appear in three distinct contexts before it becomes a component. Until then, build it locally.

### Review

All additions and modifications go through **Marisol** (design systems lead). File an issue with:
- The problem the current system can't solve
- Which products and personas are affected
- A working prototype using existing tokens

---

## Quick Reference

### Class Summary

| Class | What it does |
|-------|-------------|
| `density-comfortable` | Phone spacing, 16 px body |
| `density-compact` | Desktop spacing, 14 px body |
| `density-service` | Kitchen spacing, 24 px body |
| `env-standard` | 44 px targets, 4.5:1 contrast |
| `env-high-glare` | 56 px targets, 7:1 contrast, no hover |
| `surface-line` | Dark palette for kitchen displays |

### Common Combinations

| Scenario | Classes |
|----------|---------|
| Guest on phone | `density-comfortable env-standard` |
| Guest on desktop | `density-compact env-standard` |
| Line pass display | `density-service env-high-glare surface-line` |
| Line server handheld | `density-service env-standard surface-line` |
| Line handheld, bright patio | `density-service env-high-glare surface-line` |
