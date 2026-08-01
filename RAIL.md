# Rail Design System

Rail is the design system for **Heard**, a restaurant software platform. Two products share it:

- **Guest**: consumer ordering. Phone-first web, no app. ~400,000 orders a week across 1,400 restaurants.
- **Line**: kitchen display system. A 15-inch pass display plus a server handheld. 1,400 restaurants.

One system, two surfaces. You never build separate components for Guest and Line — you configure the same twelve.

Rail is deliberately small. A system with forty components has an answer for everything, and you learn nothing from working inside it.

**This file is generated from the code.** Every class name below appears in a file under `rail/components/` and every token name below appears in `rail/tokens.css`, both checked mechanically. If you copy markup from here it will be styled. Where a class exists in Rail's markup but has no rule behind it, this file says so.

---

## Contents

- [Three axes](#three-axes)
- [Applying the axes](#applying-the-axes)
- [Tokens](#tokens)
- [The twelve components](#the-twelve-components)
- [The four patterns](#the-four-patterns)
- [Logo](#logo)
- [Layout and utility classes](#layout-and-utility-classes)
- [Contribution rules](#contribution-rules)
- [Source of truth](#source-of-truth)

---

## Three axes

Rail has three independent axes, applied as classes on a container. Components inside inherit whatever the container sets.

| Axis | Classes | What it controls |
|---|---|---|
| **Density** | `density-comfortable` · `density-compact` · `density-service` | Spacing and type size **only** |
| **Environment** | `env-standard` · `env-high-glare` | Target sizes, focus ring, contrast floor |
| **Surface** | *(default is Guest)* · `surface-line` | The whole semantic colour palette, plus radius |

### Where each is used

| Surface | Density | Environment | Extra |
|---|---|---|---|
| Guest phone | `density-comfortable` | `env-standard` | — |
| Guest desktop | `density-compact` | `env-standard` | — |
| Line pass display | `density-service` | `env-high-glare` | `surface-line` |
| Line server handheld | `density-service` | `env-high-glare` | `surface-line` |

**Line is `high-glare` on both devices.** The handheld goes out onto a bright floor, onto a patio, into a window seat at 5pm. It is not an indoor phone.

### Why density and environment are separate

**`target-min` moves with environment. It never moves with density.**

`density-compact` gets tighter spacing and smaller type and keeps exactly the same 44px target as `density-comfortable`. Record `--target-min` at all three densities and watch nothing happen. That is the whole point of the split.

Density answers *how much fits and how far away is the reader*. Environment answers *what does this room do to a person's hands and eyes*. Those are different questions with different answers, and folding them together teaches that a WCAG minimum is a style setting.

**Why the floor is 44 and not 24.** WCAG 2.2 SC 2.5.8 sets 24px as the AA minimum. Apple says 44pt, Google says 48dp, and a phone-first consumer ordering product that ships 24px targets fails in the real world while passing the audit. Rail's floor is 44 at `standard`, and the gap between "legal" and "actually works" is the thing worth seeing.

**Why `high-glare` exists.** The room is bright, the hands are gloved or wet, and the screen is often at an angle. 56px, a 3px focus ring, and a 7:1 contrast floor.

**Why `service` exists.** Nobody looks at the rail for more than a second. Body type is 24px because a pass display is read at arm's length across a hot kitchen. Shipping KDS products sit between 24 and 32. 18px looks generous on a laptop and is unreadable at four feet, which is exactly the mistake this mode exists to prevent.

**Hover does not fire on Line.** The pass display is touch-only and the handheld is a phone. Focus and active carry the weight that hover carries on Guest. Nothing may depend on hover to be usable.

---

## Applying the axes

```html
<!-- Guest phone -->
<div id="app" class="density-comfortable env-standard">
  …
</div>

<!-- Guest desktop -->
<div id="app" class="density-compact env-standard">
  …
</div>

<!-- Line — pass display and handheld both -->
<div id="app" class="density-service env-high-glare surface-line">
  …
</div>
```

`surface-line` also sets `color` and `background-color` on the container itself, and tightens `--radius-sm` and `--radius-md`. It does not touch density or environment — those are separate classes and you must set them yourself.

---

## Tokens

Never hardcode a colour, a space or a type size. Use `var(--token-name)`.

Token names use dashes where Figma uses slashes: Figma `space/inset/md` → CSS `var(--space-inset-md)`.

### Colour — primitives

Raw values. **Never reference these directly in a component.** Use the semantic tokens below.

| Scale | Tokens |
|---|---|
| Neutral (warm grey, Guest) | `--neutral-50` `--neutral-100` `--neutral-150` `--neutral-200` `--neutral-300` `--neutral-400` `--neutral-500` `--neutral-600` `--neutral-700` `--neutral-800` `--neutral-900` `--neutral-950` |
| Primary (paprika, Guest) | `--primary-50` … `--primary-900` |
| Accent (gold-amber, Guest) | `--accent-50` … `--accent-700` |
| Feedback hues | `--green-50/500/700` `--yellow-50/500/700` `--red-50/500/700` `--blue-50/500/700` |
| Line neutral (cool grey) | `--line-neutral-50` … `--line-neutral-950` |
| Line primary (muted indigo) | `--line-primary-50` … `--line-primary-900` |
| Service | see below |

### Colour — the `service` scale

**Line-specific, and the one that teaches the most.** Four states for how close a ticket is to being late.

| Token | Value | Use |
|---|---|---|
| `--service-ok` | `#4ADE80` | Inside target |
| `--service-approaching` | `#F5C518` | Getting close |
| `--service-late` | `#FB923C` | Past target |
| `--service-critical` | `#F87171` | Well past, and someone is already apologising |

Light-surface variants exist for the rare case where service state has to appear on a light background — a manager report, a Guest-side status:

`--service-ok-light` `#166534` · `--service-approaching-light` `#854D0E` · `--service-late-light` `#9A3412` · `--service-critical-light` `#991B1B`

> **`--interactive-default` is `--primary-600`, not `--primary-500`.** `--primary-500` `#E84E1A` is the brand colour and it is 3.79:1 against white — below the 4.5:1 floor this system documents. Interactive surfaces step one down the ramp so a button label passes. The brand ramp itself is unchanged.

**The scale has to work without colour.** It pairs with a shape, a word or a position signal in every component that uses it. See `--service-*` in `rail/components/Ticket.css`, where each elapsed band ships alongside a Badge with the band written on it.

### Colour — semantic

These are what components reference. The right-hand column is what they become under `surface-line`.

| Token | Guest | Line (`surface-line`) |
|---|---|---|
| `--text-primary` | `--neutral-900` | `--line-neutral-50` |
| `--text-secondary` | `--neutral-600` | `--line-neutral-200` |
| `--text-tertiary` | `--neutral-600` | `--line-neutral-400` |
| `--text-disabled` | `--neutral-400` | `--line-neutral-500` |
| `--text-on-brand` | `#FFFFFF` | `--line-neutral-50` |
| `--text-link` | `--primary-700` | `#85BFFF` |
| `--text-error` | `--red-700` | `#FCA5A5` |
| `--text-success` | `--green-700` | `#86EFAC` |
| `--surface-default` | `--neutral-50` | `--line-neutral-800` |
| `--surface-subtle` | `--neutral-100` | `--line-neutral-900` |
| `--surface-raised` | `#FFFFFF` | `--line-neutral-700` |
| `--surface-inverse` | `--neutral-950` | `--line-neutral-50` |
| `--surface-brand` | `--primary-500` | `--line-primary-700` |
| `--surface-brand-subtle` | `--primary-50` | `--line-primary-900` |
| `--surface-overlay` | `--neutral-900` | `--line-neutral-950` |
| `--border-default` | `--neutral-200` | `--line-neutral-400` |
| `--border-strong` | `--neutral-400` | `--line-neutral-400` |
| `--border-subtle` | `--neutral-150` | `--line-neutral-700` |
| `--border-focus` | `--primary-700` | `--line-primary-400` |
| `--border-error` | `--red-500` | `--red-500` |
| `--interactive-default` | `--primary-600` | `--line-primary-500` |
| `--interactive-hover` | `--primary-500` | `--line-primary-400` |
| `--interactive-pressed` | `--primary-700` | `--line-primary-700` |
| `--interactive-subtle` | `--primary-50` | `--line-primary-900` |
| `--interactive-disabled` | `--neutral-200` | `--line-neutral-700` |
| `--feedback-success` | `--green-500` | `--green-500` |
| `--feedback-success-subtle` | `--green-50` | `#0D2818` |
| `--feedback-warning` | `--yellow-500` | `--yellow-500` |
| `--feedback-warning-subtle` | `--yellow-50` | `#2D2004` |
| `--feedback-error` | `--red-500` | `--red-500` |
| `--feedback-error-subtle` | `--red-50` | `#2D0A0A` |
| `--feedback-info` | `--blue-500` | `--blue-500` |
| `--feedback-info-subtle` | `--blue-50` | `#0A1929` |

### Space

Three categories. Values change with density and with nothing else.

| Token | `comfortable` | `compact` | `service` |
|---|---|---|---|
| `--space-inset-sm` | 8px | 6px | 12px |
| `--space-inset-md` | 16px | 12px | 24px |
| `--space-inset-lg` | 24px | 16px | 32px |
| `--space-stack-sm` | 8px | 4px | 12px |
| `--space-stack-md` | 16px | 8px | 24px |
| `--space-stack-lg` | 20px | 16px | 32px |
| `--space-gap-sm` | 8px | 6px | 12px |
| `--space-inline-md` | 16px | 12px | 24px |

**Inset** is padding inside a component. **Stack** is the vertical gap between elements. **Inline** is the horizontal gap between elements.

> There is no `--space-inline-lg` and no `--space-stack-xl`. If you need a value the scale does not have, that is a decision with a cost — see [Contribution rules](#contribution-rules).

### Type

Six scales. Sizes change with density. The `weight` column does not change with density except where noted.

| Scale | Size (`comfortable` / `compact` / `service`) | Line-height | Weight | Family | Use |
|---|---|---|---|---|---|
| `--type-display-*` | 32 / 28 / 40 | 40 / 36 / 48 | 700, **600 at `service`** | DM Sans | Order totals, hero numbers |
| `--type-heading-*` | 20 / 18 / 28 | 28 / 24 / 36 | 600 | DM Sans | Section titles |
| `--type-body-*` | 16 / 14 / 24 | 24 / 22 / 32 | 400 | Inter | Paragraphs, item names |
| `--type-label-*` | 14 / 13 / 20 | 20 / 18 / 28 | 500 | Inter | Form labels, buttons, metadata |
| `--type-caption-*` | 13 / 12 / 18 | 18 / 16 / 24 | 400 | Inter | Helper text, timestamps |
| `--type-mono-*` | 14 / 13 / 20 | 20 / 18 / 28 | 400 | JetBrains Mono | Prices, order numbers, elapsed time |

Each scale is three tokens: `--type-body-size`, `--type-body-line`, `--type-body-weight`.

`tokens.css` also ships helper classes that apply all three plus the font family in one go:

`.type-display` · `.type-heading` · `.type-body` · `.type-label` · `.type-caption` · `.type-mono`

### Environment

| Token | `env-standard` | `env-high-glare` |
|---|---|---|
| `--target-min` | 44px | 56px |
| `--target-comfortable` | 48px | 64px |
| `--focus-ring-width` | 2px | 3px |
| `--focus-ring-offset` | 2px | 2px |
| Contrast floor | 4.5:1 | 7:1 |

The contrast floor is documented, not enforced by CSS. Nothing stops you shipping below it. Check it.

### Radius

| Token | Guest | Line (`surface-line`) |
|---|---|---|
| `--radius-sm` | 6px | 4px |
| `--radius-md` | 12px | 8px |
| `--radius-full` | 9999px | 9999px |

There is no `--radius-lg`.

### Elevation

Two sets. Guest surfaces are light and take subtle shadows; Line surfaces are dark and need heavier ones.

| Guest | Value | | Line | Value |
|---|---|---|---|---|
| `--elevation-1` | `0 1px 2px rgba(0,0,0,.06)` | | `--elevation-none` | `none` |
| `--elevation-2` | `0 2px 8px rgba(0,0,0,.08)` | | `--elevation-low` | `0 2px 4px rgba(0,0,0,.3)` |
| `--elevation-3` | `0 8px 24px rgba(0,0,0,.12)` | | `--elevation-mid` | `0 4px 12px rgba(0,0,0,.4)` |
| `--elevation-4` | `0 16px 48px rgba(0,0,0,.16)` | | `--elevation-high` | `0 8px 24px rgba(0,0,0,.5)` |

There is no `--elevation-0`.

### Icons

| Token | Value |
|---|---|
| `--icon-xs` | 12px |
| `--icon-sm` | 16px |
| `--icon-md` | 20px |
| `--icon-lg` | 24px |
| `--icon-xl` | 32px |

### Component density tokens

Set by density, consumed by one component each. You rarely reference these directly, but they are why a Stepper is the right size in a cart and the right size on a pass display.

| Token | `comfortable` | `compact` | `service` |
|---|---|---|---|
| `--button-height` | 48px | 44px | 56px |
| `--button-height-lg` | — | — | 64px |
| `--button-min-width` | 120px | 100px | 140px |
| `--input-height` | 48px | 44px | 56px |
| `--stepper-button-size` | 44px | 44px | 56px |
| `--stepper-value-width` | 40px | 32px | 48px |
| `--stepper-total-width` | 128px | 120px | 160px |
| `--checkbox-size` | 20px | 18px | 32px |
| `--switch-track-w` | 44px | 40px | 72px |
| `--switch-track-h` | 24px | 22px | 40px |
| `--switch-thumb` | 20px | 18px | 32px |
| `--badge-height` | 24px | 20px | 32px |
| `--badge-count-size` | 20px | 18px | 28px |
| `--card-padding` | 16px | 12px | 24px |
| `--card-image-height` | 180px | 140px | 180px |
| `--card-image-width` | 100px | 80px | 100px |
| `--card-gap` | 8px | 4px | 12px |
| `--list-row-min-height` | 56px | 44px | 56px |
| `--list-row-leading-size` | 48px | 40px | 56px |
| `--dialog-body-padding` | 24px | 16px | 32px |
| `--toast-min-height` | 48px | 40px | 64px |
| `--tab-height` | 48px | 40px | 56px |
| `--tab-height-segmented` | 40px | 36px | 40px |

Where a cell repeats the `comfortable` value at `service`, that mode does not redefine the token and inherits it.

---

## The twelve components

One file each in `rail/components/`. Every file carries example markup in a comment at the top — open the file and copy it.

Class names are BEM: `.rail-button` is the block, `.rail-button--primary` a modifier, `.rail-button__icon` an element.

---

### 1 · Button — `Button.css`

```html
<button class="rail-button rail-button--primary">Place order</button>
```

| Class | What it is |
|---|---|
| `.rail-button` | Base. Height from `--button-height`. |
| `.rail-button--primary` | Filled. `--interactive-default` on `--text-on-brand`. |
| `.rail-button--secondary` | Outlined, `--border-default`. |
| `.rail-button--tertiary` | Text only, no border, no min-width. |
| `.rail-button--destructive` | Filled `--feedback-error`. |
| `.rail-button--icon-leading` | Icon before the label. |
| `.rail-button--icon-only` | Square, one icon. **Needs `aria-label`.** |
| `.rail-button--full-width` | `width: 100%`. |
| `.rail-button--disabled` | Pair with the `disabled` attribute. |
| `.rail-button--loading` | Pair with `disabled` and a spinner. |
| `.rail-button__icon` | Icon slot, `--icon-md`. |
| `.rail-button__spinner` | Spinner element for the loading state. |

States: default · hover · active · focus-visible · disabled · loading.

> There is no `.rail-button__label`. Put the label text directly inside the button.

---

### 2 · Input — `Input.css`

```html
<div class="rail-input">
  <label class="rail-input__label" for="phone">Phone number</label>
  <input class="rail-input__field" id="phone" type="tel">
  <span class="rail-input__helper">We text your order confirmation</span>
</div>
```

| Class | What it is |
|---|---|
| `.rail-input` | Wrapper. The state modifiers go here. |
| `.rail-input__label` | Label. Always present, even if visually hidden. |
| `.rail-input__field` | The `input`. Height from `--input-height`. |
| `.rail-input__field--textarea` | Multi-line. Add to the field, on a `textarea`. |
| `.rail-input__helper` | Helper text under the field. |
| `.rail-input__helper--error` | Helper in `--text-error`. |
| `.rail-input__helper--success` | Helper in `--text-success`. |
| `.rail-input__footer` | Row holding helper and character count. |
| `.rail-input__char-count` | "0 / 200". Use it whenever there is a limit. |
| `.rail-input--filled` | Value present. |
| `.rail-input--error` | Pair with `aria-invalid` and `aria-describedby`. |
| `.rail-input--success` | Validated. |
| `.rail-input--disabled` | Pair with the `disabled` attribute. |

> There is no `.rail-input-group` and no `.rail-input--search`. The wrapper is `.rail-input` and the control is `.rail-input__field`.

---

### 3 · Stepper — `Stepper.css`

Quantity control. Every Guest cart needs one.

```html
<div class="rail-stepper">
  <button class="rail-stepper__button rail-stepper__button--decrement" aria-label="Decrease quantity">−</button>
  <span class="rail-stepper__value" aria-live="polite">2</span>
  <button class="rail-stepper__button rail-stepper__button--increment" aria-label="Increase quantity">+</button>
</div>
```

| Class | What it is |
|---|---|
| `.rail-stepper` | Container, width from `--stepper-total-width`. |
| `.rail-stepper__button` | A step button. Floors at `--target-min`. |
| `.rail-stepper__button--decrement` | Minus. |
| `.rail-stepper__button--increment` | Plus. |
| `.rail-stepper__value` | The number. Give it `aria-live="polite"`. |
| `.rail-stepper--min-reached` | Decrement is off. |
| `.rail-stepper--max-reached` | Increment is off. |
| `.rail-stepper--disabled` | Whole control off. |

---

### 4 · Select — `Select.css`

A trigger styled like an input, plus a dropdown panel.

```html
<div class="rail-select">
  <label class="rail-select__label" for="party">Party size</label>
  <button class="rail-select__trigger" id="party" aria-haspopup="listbox" aria-expanded="false">
    <span class="rail-select__value">2 guests</span>
    <span class="rail-select__chevron" aria-hidden="true">▾</span>
  </button>
  <ul class="rail-select__dropdown" role="listbox" aria-labelledby="party">
    <li class="rail-select__option" role="option">1 guest</li>
    <li class="rail-select__option rail-select__option--selected" role="option" aria-selected="true">2 guests</li>
  </ul>
</div>
```

| Class | What it is |
|---|---|
| `.rail-select` | Wrapper, positioned for the dropdown. |
| `.rail-select__label` | Label. |
| `.rail-select__trigger` | The closed control. |
| `.rail-select__value--placeholder` | Placeholder styling for the value span. |
| `.rail-select__chevron` | Rotates when open. |
| `.rail-select__dropdown` | The panel. Hidden until `.rail-select--open` is on the wrapper. |
| `.rail-select__option` | One row. |
| `.rail-select__option--selected` | Current value. |
| `.rail-select__option--disabled` | Not choosable. |
| `.rail-select__helper` | Helper text. |
| `.rail-select__helper--error` | Helper in `--text-error`. |
| `.rail-select--open` | Shows the dropdown. Toggle it in JS. |
| `.rail-select--error` | Error border. |
| `.rail-select--disabled` | Control off. |

The dropdown does not open by itself. `.rail-select--open` is a class you add.

> Rail styles the value span only through `.rail-select__value--placeholder`. The bare `rail-select__value` in the markup above is a hook with no rule behind it — it inherits from the trigger. There is no `.rail-select--native`.

---

### 5 · Checkbox — `Checkbox.css`

```html
<label class="rail-checkbox">
  <input class="rail-checkbox__input" type="checkbox">
  <span class="rail-checkbox__box" aria-hidden="true"></span>
  <span class="rail-checkbox__label">Include napkins and utensils</span>
</label>
```

| Class | What it is |
|---|---|
| `.rail-checkbox` | The `label` wrapper. |
| `.rail-checkbox__input` | The real `input`. Visually hidden, still focusable. |
| `.rail-checkbox__box` | The drawn box. Size from `--checkbox-size`. |
| `.rail-checkbox__label` | Label text. |
| `.rail-checkbox--disabled` | Pair with the `disabled` attribute. |
| `.rail-checkbox--error` | Error border and label. |
| `.rail-checkbox-group` | A `fieldset` of checkboxes. |
| `.rail-checkbox-group__legend` | The `legend`. |

The native input stays in the DOM, so keyboard and screen readers work without help. Do not replace it with a `div`.

---

### 6 · Switch — `Switch.css`

Binary on/off, applied immediately. Use it for 86'ing an item — that has to be one tap or it will not happen mid-service.

```html
<label class="rail-switch">
  <input class="rail-switch__input" type="checkbox" role="switch">
  <span class="rail-switch__track" aria-hidden="true">
    <span class="rail-switch__thumb"></span>
  </span>
  <span class="rail-switch__label">Baja Fish Taco</span>
</label>
```

| Class | What it is |
|---|---|
| `.rail-switch` | The `label` wrapper. |
| `.rail-switch__input` | The real `input`. Give it `role="switch"`. |
| `.rail-switch__track` | Track. `--switch-track-w` × `--switch-track-h`. |
| `.rail-switch__thumb` | Thumb, `--switch-thumb`. |
| `.rail-switch__label` | Label text. |
| `.rail-switch--disabled` | Pair with the `disabled` attribute. |

**Switch, not Checkbox, when the change takes effect immediately.** Checkbox is for a choice you submit.

> It is called Switch. There is no `.rail-toggle`.

---

### 7 · Badge — `Badge.css`

```html
<span class="rail-badge rail-badge--label rail-badge--success">Ready</span>
```

| Class | What it is |
|---|---|
| `.rail-badge` | Base, height from `--badge-height`. |
| `.rail-badge--count` | Circular number, `--badge-count-size`. |
| `.rail-badge--status` | An 8px dot. **Never on its own** — pair it with text. |
| `.rail-badge--label` | Pill with words in it. |
| `.rail-badge--removable` | Label with a remove button. |
| `.rail-badge__remove` | The remove button. Needs `aria-label`. |
| `.rail-badge--brand` | Intent. |
| `.rail-badge--success` | Intent. |
| `.rail-badge--warning` | Intent. |
| `.rail-badge--error` | Intent. |
| `.rail-badge--info` | Intent. |

Intents apply to `.rail-badge--label`, `.rail-badge--removable` and `.rail-badge--status`. Badge is not interactive; the remove button inside `.rail-badge--removable` is.

**A Badge is how you stop colour carrying meaning alone.** A status tint plus a Badge with the status written in it satisfies WCAG 1.4.1. A tint on its own does not.

---

### 8 · Card — `Card.css`

```html
<div class="rail-card">
  <div class="rail-card__body">
    <h3 class="rail-card__title">Al Pastor Taco</h3>
    <p class="rail-card__description">Spit-roasted pork, pineapple, onion, cilantro.</p>
    <div class="rail-card__meta"><span>$4.25</span></div>
  </div>
</div>
```

| Class | What it is |
|---|---|
| `.rail-card` | Base. `--surface-raised`, `--radius-md`, `--elevation-1`. |
| `.rail-card__body` | Content, padded by `--card-padding`. |
| `.rail-card__title` | Title. Label type. |
| `.rail-card__description` | Description. Caption type. |
| `.rail-card__meta` | Metadata row — price, time. |
| `.rail-card__image` | Image slot. |
| `.rail-card--image-top` | Image above the body. |
| `.rail-card--image-leading` | Image to the left. |
| `.rail-card__actions` | Action row. |
| `.rail-card__action` | A text action inside that row. |
| `.rail-card--disabled` | Pair with `aria-disabled`. |
| `.rail-card--loading` | Skeleton. Pair with `aria-busy="true"`. |
| `.rail-card__skeleton` | A shimmering block. |
| `.rail-card__skeleton--title` | Title-sized. |
| `.rail-card__skeleton--text` | Text-sized. |

> The content slot is `.rail-card__body`. There is no `.rail-card__content`, no `--flat` and no `--interactive`.

**Loading and empty are states, not components.** An empty state is a Card with an icon, a line of text and a Button.

---

### 9 · List Row — `ListRow.css`

```html
<div class="rail-list-row" role="listitem">
  <div class="rail-list-row__content">
    <span class="rail-list-row__primary">Order #A4471</span>
    <span class="rail-list-row__secondary">4 items · 12 min ago</span>
  </div>
  <div class="rail-list-row__trailing">$26.98</div>
</div>
```

| Class | What it is |
|---|---|
| `.rail-list-row` | Base. Min height from `--list-row-min-height`. |
| `.rail-list-row__leading` | Circular leading slot, `--list-row-leading-size`. |
| `.rail-list-row__content` | Text column. |
| `.rail-list-row__primary` | Primary text. **Truncates with an ellipsis.** |
| `.rail-list-row__secondary` | Secondary text. **Truncates.** |
| `.rail-list-row__trailing` | Trailing slot — value, chevron, action. |
| `.rail-list-row__action` | Icon button in the trailing slot, sized `--target-min`. |
| `.rail-list-row--selected` | Brand tint plus a 3px left border. |
| `.rail-list-row--disabled` | Pair with `aria-disabled`. |

Primary and secondary truncate to one line by design — that is right for a rail and wrong for a receipt. If your content must wrap, override `white-space` in your own layout CSS, not in `rail/`.

> It is called List Row. There is no `.rail-list-item` and no `.rail-list-row--two-line`.

---

### 10 · Dialog — `Dialog.css`

```html
<div class="rail-dialog-backdrop"></div>
<dialog class="rail-dialog rail-dialog--confirmation" aria-labelledby="t" aria-modal="true" open>
  <div class="rail-dialog__body">
    <h2 class="rail-dialog__title" id="t">Void this ticket?</h2>
    <p>This cancels the order outright and cannot be undone.</p>
  </div>
  <div class="rail-dialog__footer">
    <button class="rail-dialog__btn rail-dialog__btn--secondary">Cancel</button>
    <button class="rail-dialog__btn rail-dialog__btn--destructive">Void the ticket</button>
  </div>
</dialog>
```

| Class | What it is |
|---|---|
| `.rail-dialog-backdrop` | The scrim. A sibling element, not a pseudo-element. |
| `.rail-dialog` | The container. Max-width 480px, full-width under 480px. |
| `.rail-dialog__header` | Header row, for the standard variant. |
| `.rail-dialog__title` | Heading. |
| `.rail-dialog__close` | Close button, `--target-min`. Needs `aria-label`. |
| `.rail-dialog__body` | Body, padded by `--dialog-body-padding`. |
| `.rail-dialog__footer` | Action row, right-aligned. |
| `.rail-dialog__btn` | A footer button, height `--target-min`. |
| `.rail-dialog__btn--primary` | Confirming action. |
| `.rail-dialog__btn--secondary` | Cancel. |
| `.rail-dialog__btn--destructive` | Unrecoverable action. |
| `.rail-dialog--confirmation` | No header; the title moves into the body. |

**Rail does not trap focus for you.** `showModal()` gives you the focus trap and the Escape key for free; if you use the `open` attribute instead, you own both.

**Put the dialog inside your axis container.** `showModal()` promotes it to the browser's top layer, but custom properties inherit down the DOM tree, not the top layer — a dialog placed as a sibling of your `surface-line` container renders in Guest's colours.

> It is called Dialog. There is no `.rail-modal`, no `.rail-dialog--sheet` and no `.rail-dialog--fullscreen`.

---

### 11 · Toast — `Toast.css`

```html
<div class="rail-toast-region" role="status" aria-live="polite" aria-label="Notifications">
  <div class="rail-toast rail-toast--success" role="alert">
    <div class="rail-toast__icon" aria-hidden="true">●</div>
    <div class="rail-toast__content">
      <span class="rail-toast__message">Al Pastor Taco added to your order.</span>
    </div>
    <button class="rail-toast__dismiss" aria-label="Dismiss">×</button>
  </div>
</div>
```

| Class | What it is |
|---|---|
| `.rail-toast-region` | Live region. Top-right; top-centre under 480px. |
| `.rail-toast` | One toast. |
| `.rail-toast--success` · `.rail-toast--error` · `.rail-toast--info` · `.rail-toast--warning` | Variants. Coloured left border plus a subtle background. |
| `.rail-toast__icon` | Icon slot. |
| `.rail-toast__content` | Text column. |
| `.rail-toast__message` | The message. |
| `.rail-toast__dismiss` | Dismiss button. Needs `aria-label`. |
| `.rail-toast--exiting` | Exit animation. Add it, then remove the node. |

A toast is not a substitute for putting the information on the screen. **On Line, treat toasts as unavailable** — nobody is watching a corner of a shared display for 4 seconds mid-service.

---

### 12 · Tabs — `Tabs.css`

```html
<div class="rail-tabs rail-tabs--underline" role="tablist" aria-label="Menu sections">
  <button class="rail-tab rail-tab--active" role="tab" aria-selected="true">Tacos</button>
  <button class="rail-tab" role="tab" aria-selected="false" tabindex="-1">Sides</button>
</div>
<div class="rail-tab-panel" role="tabpanel">…</div>
```

| Class | What it is |
|---|---|
| `.rail-tabs` | The tab list. |
| `.rail-tabs--underline` | Active tab gets a bottom border. |
| `.rail-tabs--segmented` | Pill container, raised active segment. |
| `.rail-tab` | One tab. Height `--tab-height`, or `--tab-height-segmented`. |
| `.rail-tab--active` | Current tab. |
| `.rail-tab--disabled` | Not selectable. |
| `.rail-tab-panel` | Panel. Respects the `hidden` attribute. |

Rail styles Tabs. It does not wire the roving `tabindex` or the arrow keys — that is yours.

> It is called Tabs. There is no `.rail-tabs--pill`.

---

### What Rail does not have

Worth knowing before you plan around something that isn't there.

- **No Radio group.** Single-select needs a Select, or a group of Buttons with `role="radio"` styled in your own CSS.
- **No Header or app bar.** Compose one from layout classes and a Button.
- **No Tooltip, no Popover, no Accordion, no Table, no Pagination, no Avatar, no Breadcrumb.**
- **No Empty state and no Loading component**: those are states every component already has.

If your design needs one of these, that is a contribution proposal, not a workaround. See below.

---

## The four patterns

Patterns are documented arrangements of components. Three are documentation only. **Ticket is documented *and* coded**, because six of the twelve backlog items redesign it and the Week 5 drift audit needs something authoritative to compare an AI build against.

### Form layout

Label above field, helper below, one column, actions at the bottom left-to-right with the confirming action last.

Uses **Input**, **Select**, **Checkbox**, **Switch**, **Button**, plus `.form-layout` from `layouts/page.css`.

Rules: every field has a visible `.rail-input__label`. Errors go in `.rail-input__helper--error` *and* set `aria-invalid` and `aria-describedby`. Never rely on a placeholder as a label. If a field has a limit, `.rail-input__char-count` shows it before the user hits it, not after.

### Confirm destructive

An unrecoverable action opens a **Dialog** with `.rail-dialog--confirmation`. The title names the object and the consequence. The confirming button uses `.rail-dialog__btn--destructive` and its label is the verb, not "OK".

Rules: recoverable actions do not get a dialog — they get an undo. The destructive button is never the default focus. A destructive control never sits adjacent to, or looks like, a recoverable one.

### List to detail

A list of **List Row**s; selecting one opens detail. On phone the detail is a new screen with a back control. On desktop it is a two-pane split — `.list-detail-layout` in `layouts/page.css`.

Rules: the selected row keeps `.rail-list-row--selected`. Back returns you to the list *at the position you left it*, not at the top.

### Ticket — `rail/components/Ticket.css`

The Line composition: **Card** + **List Row** + **Badge**, plus **Button** for the actions.

Requires `density-service env-high-glare surface-line` on an ancestor. Ticket width derives from the viewport so six land on a 1366px pass display and a seventh does not.

| Class | What it is |
|---|---|
| `.rail-ticket-rail` | The rail. Six across, horizontal scroll past that. |
| `.rail-ticket` | The ticket. Add it to a `.rail-card`. |
| `.rail-ticket--incoming` · `.rail-ticket--started` · `.rail-ticket--ready` · `.rail-ticket--bumped` · `.rail-ticket--recalled` | Status tint. **Always pair with a Badge carrying the word.** |
| `.rail-ticket__header` | Identifiers plus the status Badge. |
| `.rail-ticket__ids` | Number and source column. |
| `.rail-ticket__number` | Ticket number, mono. |
| `.rail-ticket__source` | Table 12, Heard Guest, Bar 2. |
| `.rail-ticket__timing` | Elapsed time plus its band Badge. |
| `.rail-ticket__elapsed` | The number, heading size. |
| `.rail-ticket__elapsed--ok` · `.rail-ticket__elapsed--approaching` · `.rail-ticket__elapsed--late` · `.rail-ticket__elapsed--critical` | The service scale. |
| `.rail-ticket__items` | Scrolling item list. |
| `.rail-ticket__item` | One item. Add it to a `.rail-list-row`. |
| `.rail-ticket__item-name` | Item name. Wraps — overrides List Row's truncation. |
| `.rail-ticket__qty` | Quantity, mono. |
| `.rail-ticket__mods` | Modifier group, with a rule down the side. |
| `.rail-ticket__mod` | One modifier. Its own colour and weight. |
| `.rail-ticket__mod--critical` | An allergy or anything the kitchen cannot get wrong. |
| `.rail-ticket__actions` | Action column. |
| `.rail-ticket__action` | Base for a ticket action. |
| `.rail-ticket__action--bump` | Bump. `--target-comfortable`, 64px. |
| `.rail-ticket__action--recall` | Recall. `--target-min`, 56px. |
| `.rail-ticket__danger` | Separator holding the unrecoverable action. |
| `.rail-ticket__action--void` | Void. Separated, and coloured away from the other two. |

`--rail-ticket-width` is set on `.rail-ticket-rail` and scoped to the pattern. It is not a system token and it is not in `tokens.css`.

Rules: bump is the action expo performs a few hundred times a shift, so it gets the comfortable target. Void is unrecoverable, so it is separated and never lands under a thumb aimed at bump. A taller ticket takes a ticket off the rail — if you want room, take it from somewhere.

**The vertical budget, because it decides most Line arguments.** The rail gets about 620px under the header on a 1366×768 pass display. Of the ~572px that leaves a ticket:

| | |
|---|---:|
| Header — number, source, status badge | ~77px |
| Timing — elapsed and its band badge | ~80px |
| **Actions — bump 64, recall 56, void 56, plus separators** | **~237px (41%)** |
| Items | ~178px, about five lines at 24px |

Three stacked targets at the `high-glare` floor cost more than a third of the ticket, and a five-item order already scrolls. That is not a bug to fix in this file — it is the collision HEARD-156 and HEARD-178 are both standing on. Every proposal that adds to a ticket has to say what comes off it.

---

## Logo

`rail/components/Logo.css`, with the geometry in `rail/assets/`.

A torn kitchen ticket with the acknowledgment knocked out. The check's long arm leaves the ticket at the right edge and turns from negative to positive as it crosses: inside the ticket it is a hole, outside it is a solid stroke. That transition is the mark, so do not clip it or box it in.

**Two forms.** The **lockup** is mark plus wordmark, for anywhere the reader may not know the brand: marketing, decks, invoices, splash, onboarding, first boot on the pass display. The **mark** stands alone where the brand is already established or there is no room: app icon, favicon, persistent Line chrome, equipment badge, avatars. The mark is never the first branded thing a new user sees.

**Two treatments.** `Solid` is the default. `Outline` drops the ticket to a hairline and fills the check, for embroidery, laser etching and thermal receipts, where a knocked-out channel closes up.

**Three sizes, three drawings.** Never scale one to produce another.

| Size | Notches | Tail |
|---|---|---|
| 48 and up | 5 | breaks the edge |
| 24 | 4 | breaks the edge |
| 16 | 3 | contained |
| under 16 | no mark | use a solid `--brand-mark` fill at the platform's badge geometry |

Notch pitch never drops below 4px and depth is always half the pitch. The counts fall out of that rule.

**Colour comes from `--brand-mark`.** Same hue on both surfaces; only the step on the ramp moves — `primary-600` on Guest at 4.80:1 against `surface/default`, `primary-400` on Line at 5.25:1 against its own `surface/default`. Do not draw the logo with `--interactive-default`: on Line it resolves to indigo, so the mark would change colour with the surface, and a brand mark that uses the interactive colour reads as a control.

**The check is brand-only.** Line's job is marking tickets complete, and the obvious way to build that state is an orange check — which would put the logo and a functional status indicator in the same shape and colour on the same screen, four feet from a moving cook. The squared-terminal check does not go in the product icon set. Completion on Line is a bump or a filled bar.

**Clearspace.** Base unit `N` = ticket width ÷ 5. Mark: `2N` on all sides, measured from the tear peaks. Lockup: `1C` on all sides, where `C` is wordmark cap height. App icons and favicons are exempt; the platform supplies its own.

**App icons.** Size to height, not width. The mark is portrait, so in a square frame the ticket should sit at `0.72` of the frame height, which lands its width near `0.48`. Sizing to width leaves the glyph looking lost in the tile. Build foreground-on-field: iOS masks to a squircle and forbids transparency, so the outer silhouette is never notched.

**The wordmark is DM Sans Bold but is not bound to the Display style.** A logotype must not move when the type scale is retuned. Shipped assets carry it outlined.

**The paths are exported from Figma, not redrawn.** If code and Figma disagree here, the asset is stale. Re-export; do not hand-edit the path.

---

## Layout and utility classes

From `rail/layouts/page.css` and `rail/utilities/reset.css`. Not components, but real and usable.

| Class | What it does |
|---|---|
| `.page-header` | Padded header with a bottom border. |
| `.page-main` | Centred content column, max 1200px. |
| `.page-section` | Padded section; consecutive sections get a top border. |
| `.form-layout` | Vertical form, `--space-stack-md` gaps. |
| `.form-layout__section` | Group inside a form. |
| `.form-layout__actions` | Action row at the end of a form. |
| `.stack` `.stack--sm` `.stack--md` `.stack--lg` | Vertical flex with a `--space-stack-*` gap. |
| `.inline` `.inline--sm` `.inline--md` | Horizontal flex with a gap. |
| `.full-width` | `width: 100%`. |
| `.card-grid` | 1 / 2 / 3 columns at 0 / 768 / 1024px. |
| `.list-detail-layout` | Two-pane split at ≥768px. |
| `.list-detail-layout__list` | The list pane. |
| `.list-detail-layout__detail` | The detail pane. |
| `.visually-hidden` | Hidden on screen, present for screen readers. |

`reset.css` also gives every focusable element a `:focus-visible` ring from `--focus-ring-width` and `--border-focus`, and honours `prefers-reduced-motion`.

---

## Contribution rules

Marisol owns the system. These are hers.

> **Extend before you create.** A new variant costs a review; a new component costs maintenance forever.
>
> **The rule of three.** Have you needed this in three places? If not, it is a local one-off and it stays local.
>
> **Every addition needs four things:** the problem, why an existing component cannot cover it, what it costs, and who else would use it.
>
> **Marisol reviews additions at the start of each sprint.** She says no by default.
>
> **Colour never carries meaning alone.** Not on Guest, and especially not on Line.
>
> **`service` and `high-glare` are not suggestions.** If your Line screen looks roomy on a laptop, it is right.
>
> **The rail shows six tickets at once** on the 15-inch pass display. Anything that makes a ticket taller takes tickets off the rail.
>
> **The pass display is a shared screen with no sign-in.** It does not know who is standing at it.

### How to propose something

There is no issue tracker for this. Write the proposal — problem, why the existing components cannot cover it, cost, who else would use it — and bring it to Marisol. The **Contribution Proposal** template has the shape.

### Building locally in the meantime

If you genuinely need something Rail does not have, build it **in your own screens**, in your own CSS, with your own class prefix. Not in `rail/`.

**Every class beginning `rail-` belongs to the system.** Never add one. `"I edited the system"` is a different conversation from `"I built it locally and here is the case for adding it"`, and only one of those goes well.

---

## Source of truth

Figma and code will disagree. When they do:

| Question | Winner | Why |
|---|---|---|
| A colour value | **Figma** | The library is the origin for the palette. |
| A type size, line-height or weight | **Figma** | Same. |
| A token's **name** | **Figma** | A rename in code is the fix. Adding an alias leaves two names for one value, which is worse than the bug. |
| A space value | **Figma** | |
| Anything computed at runtime | **Code** | Resolved density values, resolved environment values, focus behaviour, what a state actually does, what a component does at a breakpoint. Figma cannot express these; the browser is the answer. |
| Whether a component exists at all | **Code** | If it is not in `rail/components/`, you cannot use it, whatever the library shows. |

**Where this matters.** Every token name in Figma should have a match in `tokens.css` with the same value. It does not, in a small number of places, and finding them is Week 1's job. Record both sides. Then name which side you would trust and why, citing this table.

A value mismatch eventually shows up as a visual bug somebody notices. **A name mismatch silently breaks handoff forever** — the designer says "use `space/inline/sm`" and the engineer cannot find it, so they hardcode 8px and move on. That is how systems rot, and it is the one most people skip checking for, because a value check passes.

---

*Generated from `rail/tokens.css` and `rail/components/*.css`. If this file and the code disagree about a class name or a token name, the code is right and this file is stale — say so.*
