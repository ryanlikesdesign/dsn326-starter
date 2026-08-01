# Rail Starter — AI Context

This is a design system starter project for **Heard**, a restaurant software company. You are building features within the **Rail** design system.

## Critical Rules

1. **Use ONLY the tokens defined in `rail/tokens.css`.** Never hardcode colors, spacing values, type sizes, or any other design value. Always use `var(--token-name)`.

2. **Use ONLY the 12 components in `rail/components/`.** Do not invent new components. If you need something Rail doesn't have, compose it from existing components (e.g., an empty state is a Card with an icon and text — not a new component).

3. **Respect density and environment modes.**
   - Guest phone: `density-comfortable` + `env-standard`
   - Guest desktop: `density-compact` + `env-standard`
   - Line (all devices): `density-service` + `env-high-glare` + `surface-line`

4. **Density controls spacing and type. Environment controls targets and contrast.** They are independent axes.

5. **Minimum touch targets:** 44px at `standard`, 56px at `high-glare`. These do NOT change with density — only with environment.

6. **Color never carries meaning alone.** Every color-coded state must pair with an icon, label, or position signal.

## File Structure

```
rail/
  tokens.css          — All design tokens
  components/         — 12 component CSS files with HTML examples in comments
    Button.css, Input.css, Stepper.css, Select.css,
    Checkbox.css, Switch.css, Badge.css, Card.css,
    ListRow.css, Dialog.css, Toast.css, Tabs.css
  layouts/page.css    — Page-level layout utilities
  utilities/reset.css — Reset and helpers
```

## The 12 Components

| Component | Class prefix | Variants |
|-----------|-------------|----------|
| Button | `.rail-button` | primary, secondary, tertiary, destructive |
| Input | `.rail-input` | single-line (default), multi-line (textarea) |
| Stepper | `.rail-stepper` | default |
| Select | `.rail-select` | default |
| Checkbox | `.rail-checkbox` | single, group |
| Switch | `.rail-switch` | default |
| Badge | `.rail-badge` | count, status, label, removable |
| Card | `.rail-card` | basic, with-image, with-actions, with-metadata |
| List Row | `.rail-list-row` | basic, detailed, with-leading, with-trailing |
| Dialog | `.rail-dialog` | standard, confirm-neutral, confirm-destructive |
| Toast | `.rail-toast` | success, error, info, warning |
| Tabs | `.rail-tabs` | underline, segmented |

## Token Naming

CSS custom properties use dashes instead of slashes:
- Figma: `space/inset/md` → CSS: `var(--space-inset-md)`
- Figma: `text/primary` → CSS: `var(--text-primary)`
- Figma: `type/body` → CSS: `var(--type-body-size)`, `var(--type-body-line)`, `var(--type-body-weight)`

## Two Surfaces

**Guest**: consumer ordering app. Phone-first, warm palette (paprika primary), light backgrounds.

**Line**: kitchen display + server handheld. Dark palette, cool grays, high contrast. Add `surface-line` class to swap semantic colors.

## What NOT to Do

- Don't hardcode values — use var(--token-name) for everything
- Don't create components with the `.rail-` prefix (system namespace)
- Don't add type scale steps or spacing tokens beyond sm/md/lg

## Contribution Rules

> Extend before you create. A new variant costs a review; a new component costs maintenance forever.
> The rule of three: have you needed this in three places?
> Marisol reviews additions. She says no by default.
