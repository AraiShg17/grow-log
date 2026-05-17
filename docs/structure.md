---
inclusion: always
---

# Project Structure

## Component Organization

Every component follows this pattern:

```
ComponentName/
  ├── ComponentName.tsx
  └── ComponentName.module.css
```

## Layout Structure Pattern

Use this three-layer container pattern consistently:

```tsx
<div className={styles.container}>
  {' '}
  {/* Full width wrapper */}
  <section className={styles.section}>
    {' '}
    {/* Logical section, 100% width */}
    <div className={styles.sectionInner}>
      {' '}
      {/* Content area with max-width + padding */}
      {/* Content here */}
    </div>
  </section>
</div>
```

### Container Rules

- `.container` - `width: stretch` (with vendor prefixes), no padding
- `.section` - 100% width, handles background colors/images
- `.sectionInner` - `max-width` + horizontal padding for content

## CSS Modules Conventions

- **File naming**: `ComponentName.module.css`
- **Class naming**: camelCase (`.plantCard`, `.sectionInner`, `.heroImage`)
- **Nesting**: Maximum 3 levels deep
- **Separation**: One CSS module per component

## Global CSS

Minimal global styles only:

- Reset/normalize
- Base typography
- CSS Variables (colors, spacing, typography)
- Safe area padding (on `body` only)

## Component Types

- **Server Components**: Stateless UI components (default)
- **Client Components**: Components with state, events, or browser APIs (mark with `'use client'`)

## Semantic HTML Structure

Required semantic elements:

- Single `<main>` per page
- `<header>`, `<footer>`, `<nav>` for navigation
- `<section>`, `<article>` for content grouping
- Skip link for accessibility ("メインへスキップ")

## Liquid Glass Components

When using SVG filters for Liquid Glass effects:

- Generate unique filter IDs (use React's `useId()`)
- Structure: `feTurbulence → feGaussianBlur → feSpecularLighting → feDisplacementMap`
- Always pair with `backdrop-filter` (include `-webkit-` prefix)
- Require textured/gradient backgrounds for visibility

## View Transitions

- Use `view-transition-name` for card-to-detail expansions
- Keep transition names consistent across related elements
- Example: `.image` on `PlantCard` and `.heroImage` on detail both use `view-transition-name: plant-hero`
