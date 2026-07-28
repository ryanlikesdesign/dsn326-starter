# Rail Starter — Heard Design System

Code starter for DSN 326. Fork it, then build your feature inside it.

No framework, no build step, no install. Plain HTML, CSS and vanilla JavaScript.

## Quick Start

1. **Fork this repo on GitHub.** Rename it something a stranger could read.
2. **Open it in Bolt:** go to `bolt.new/github.com/YOUR-USERNAME/YOUR-REPO`. Bolt imports the whole thing — `tokens.css`, the twelve components, the Ticket pattern, `RAIL.md`, and the legacy flows.
3. **Point the AI at the system.** Tell it `rail/tokens.css` and `rail/components/` are the only sources it may use.

To just look at the files, open `gallery.html` on GitHub Pages, or click any file in the GitHub web editor. You never need a terminal in this course.

## What's Inside

```
rail/
  tokens.css              ← Every design token Rail uses
  components/             ← The 12 Rail components + the Ticket pattern
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
    Ticket.css            ← A pattern, not a thirteenth component
  layouts/page.css        ← Page-level layout helpers
  utilities/reset.css     ← Browser reset

legacy/
  guest/                  ← Heard Guest checkout as it ships today
  line/                   ← Heard Line expo rail as it ships today

index.html                ← App shell — start here
gallery.html              ← All components at every density
RAIL.md                   ← System documentation. The tie-breaker.
DECISIONS.md              ← Your decisions, with dates and reasons
EVIDENCE.md               ← Your raw findings
.claude/CLAUDE.md         ← AI tool context (auto-loaded by Claude Code)
```

## The Legacy Flows

`legacy/` is the current version of each surface. It runs. Open it, click through it, and be annoyed by it — that's the point. It's what you write your Week 1 task script against, what you test in Week 2, and what everything in Week 6 is measured against.

| Flow | Open | Notes |
|---|---|---|
| Guest checkout | `legacy/guest/` | Phone width. menu → cart → time → tip → pay → confirmation |
| Guest, office order | `legacy/guest/?demo=group` | Pre-fills a 22-item group order |
| Line pass display | `legacy/line/` | Best at 1366 × 768, landscape |
| Line handheld | `legacy/line/?view=handheld` | Phone width |
| Line terminal | `legacy/line/?view=terminal` | Also reachable by walking there from the handheld |

**Don't fix them.** They are the baseline. Changing them makes your Week 6 comparison meaningless.

## Density + Environment

Rail has three independent axes. Set the first two on your outermost container, plus the surface class on Line.

| Surface | Density class | Environment class | Extra |
|---------|--------------|-------------------|-------|
| Guest phone | `density-comfortable` | `env-standard` | — |
| Guest desktop | `density-compact` | `env-standard` | — |
| Line (pass **and** handheld) | `density-service` | `env-high-glare` | `surface-line` |

```html
<!-- Guest phone -->
<div id="app" class="density-comfortable env-standard">

<!-- Guest desktop -->
<div id="app" class="density-compact env-standard">

<!-- Line -->
<div id="app" class="density-service env-high-glare surface-line">
```

**Density** changes spacing and type sizes. **Environment** changes target sizes, focus rings and the contrast floor. **Surface** swaps the whole colour palette. They are independent — that's the whole point. See `RAIL.md` for why.

## Using Components

Every component file has HTML examples in a comment at the top. Open the file, copy the markup.

```html
<!-- Primary button -->
<button class="rail-button rail-button--primary">Add to cart</button>

<!-- Input with label and helper text -->
<div class="rail-input">
  <label class="rail-input__label" for="phone">Phone number</label>
  <input class="rail-input__field" id="phone" type="tel" inputmode="tel">
  <span class="rail-input__helper">We text your order confirmation</span>
</div>

<!-- Card -->
<div class="rail-card">
  <div class="rail-card__body">
    <h3 class="rail-card__title">Margherita Pizza</h3>
    <p class="rail-card__description">Fresh mozzarella, basil</p>
  </div>
</div>
```

## Using with Bolt.new

1. Go to `bolt.new/github.com/YOUR-USERNAME/YOUR-REPO`
2. Bolt imports the whole repo
3. Point the AI at `rail/tokens.css` and `rail/components/`
4. Say: "Use ONLY these components and tokens. Do not invent values."

Building against the actual component directory is a build in Rail. Building from a pasted token file is a build that happens to use some of Rail's colours, and the Week 5 drift audit has nothing to compare against.

## Using with Claude

1. Open claude.ai
2. Paste `tokens.css` and the component file(s) you need
3. Ask for a single self-contained `index.html` using those tokens
4. Check that it uses `var(--token-name)`, not hardcoded values

## The Rules

- Use only tokens from `tokens.css` — never hardcode colours, spacing or type sizes
- Use only the twelve components — never build from scratch what Rail already has
- Set the correct density and environment for your surface
- Colour never carries meaning alone — pair it with an icon, a label or a position
- Touch targets: 44px minimum at `standard`, 56px minimum at `high-glare`
- Don't edit anything in `rail/`. If your design needs something Rail doesn't have, that's a decision with a cost — it goes in `DECISIONS.md` and eventually in a contribution proposal

## Fonts

Loaded from Google Fonts in each page's `<head>`:

- **DM Sans** — headings and display text
- **Inter** — body and UI text
- **JetBrains Mono** — prices, order numbers, time displays

---

<details>
<summary><strong>Instructor only</strong> — running this locally</summary>

Students never need this. Nothing in the course requires a terminal.

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
cd YOUR-REPO
python3 -m http.server 8000
```

Then open `http://localhost:8000`. There is no `npm install` and no build step; `package.json` carries metadata only.

</details>
