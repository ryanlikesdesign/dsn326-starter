# Rail Starter — Heard Design System

Code starter for DSN 326. Fork this repo, then build your feature inside it.

## Quick Start

```bash
# 1. Fork this repo on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR-USERNAME/rail-starter.git
cd rail-starter

# 3. Install and run
npm install
npm run dev

# 4. Open http://localhost:5173
```

No framework. Plain HTML, CSS, and vanilla JS. Vite handles the dev server.

## What's Inside

```
rail/
  tokens.css              ← Every design token Rail uses
  components/             ← The 12 Rail components (CSS + HTML examples)
    Button.css
    Input.css
    Stepper.css
    Select.css
    Checkbox.css
    Switch.css
    Badge.css
    Card.css
    ListRow.css
    Dialog.css
    Toast.css
    Tabs.css
  layouts/page.css        ← Page-level layout helpers
  utilities/reset.css     ← Browser reset

index.html                ← App shell — start here
gallery.html              ← All components at every density
RAIL.md                   ← System documentation
.claude/CLAUDE.md         ← AI tool context (auto-loaded by Claude Code)
```

## Density + Environment

Rail has two independent axes. Set both on your outermost container.

| Surface | Density class | Environment class | Extra |
|---------|--------------|-------------------|-------|
| Guest phone | `density-comfortable` | `env-standard` | — |
| Guest desktop | `density-compact` | `env-standard` | — |
| Line (all) | `density-service` | `env-high-glare` | `surface-line` |

```html
<!-- Guest phone -->
<div id="app" class="density-comfortable env-standard">

<!-- Guest desktop -->
<div id="app" class="density-compact env-standard">

<!-- Line -->
<div id="app" class="density-service env-high-glare surface-line">
```

**Density** changes spacing and type sizes. **Environment** changes target sizes and contrast floor. They are independent — that's the whole point.

## Using Components

Every component file has HTML examples in comments at the top. Open the file, copy the markup.

```html
<!-- Primary button -->
<button class="rail-button rail-button--primary">
  <span class="rail-button__label">Add to Cart</span>
</button>

<!-- Input with label -->
<div class="rail-input-group">
  <label class="rail-input__label" for="phone">Phone number</label>
  <input class="rail-input" type="tel" id="phone" inputmode="tel">
  <span class="rail-input__helper">We'll text your order confirmation</span>
</div>

<!-- Card -->
<div class="rail-card">
  <div class="rail-card__content">
    <h3 class="rail-card__title">Margherita Pizza</h3>
    <p class="rail-card__description">Fresh mozzarella, basil</p>
  </div>
</div>
```

## Using with Bolt.new

1. Go to `bolt.new/github.com/YOUR-USERNAME/rail-starter`
2. Bolt imports the whole repo
3. Point the AI at `rail/tokens.css` and `rail/components/`
4. Say: "Use ONLY these components and tokens. Do not invent values."

## Using with Claude

1. Open claude.ai
2. Paste `tokens.css` and the component file(s) you need
3. Ask it to build a single HTML file using those tokens
4. Check that it uses `var(--token-name)`, not hardcoded values

## The Rules

- Use only tokens from `tokens.css` — never hardcode colors, spacing, or type sizes
- Use only the 12 components — never build from scratch what Rail already has
- Set the correct density and environment for your surface
- Color never carries meaning alone — pair with icon, label, or position
- Touch targets: 44px minimum (standard), 56px minimum (high-glare)

## Fonts

Loaded via Google Fonts in `index.html`:
- **DM Sans** — headings and display text
- **Inter** — body and UI text
- **JetBrains Mono** — prices, order numbers, time displays
