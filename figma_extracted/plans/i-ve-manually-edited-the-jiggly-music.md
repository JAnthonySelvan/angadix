# Plan: Regenerate ANGADIX Homepage Using Design System CSS Variables

## Context

The user attached a wireframe/mockup image (`Gemini_Generated_Image_s1lyl6s1lyl6s1ly.png`) of the ANGADIX e-commerce homepage. It shows the same 21-section homepage structure that was previously implemented, but with two critical new constraints:

1. **All styling must use CSS variables** from the design system (no hardcoded hex values like `#0266C8` or the palette object `P`). Every color, spacing, border, and radius must reference a token.
2. **Typography must only use font faces defined in the CSS** — Plus Jakarta Sans and Outfit (already imported in `fonts.css`). Font families must be applied via CSS variables, not hardcoded strings in JSX.

The `globals.css` is empty. All design tokens live in `src/styles/theme.css`. The image confirms the full ANGADIX homepage layout: announcement bar, sticky header, nav, hero (3-slide), service highlights, categories, flash sale, today's deals, trending products, best sellers, new arrivals, featured products, AI recommendations, top brands, promotional banners, recently viewed, customer reviews, why choose us, mobile app promo, newsletter, and footer.

---

## Files to Modify

1. **`src/styles/theme.css`** — Add font-family CSS variables and their `@theme inline` mappings
2. **`src/app/App.tsx`** — Full rewrite removing all hardcoded hex values; use Tailwind token classes and CSS variables throughout

`src/styles/fonts.css` and `src/styles/index.css` require no changes.

---

## Step 1 — Extend `src/styles/theme.css`

Add to the `:root` block (before the closing brace):
```css
--font-heading: 'Outfit', sans-serif;
--font-body: 'Plus Jakarta Sans', sans-serif;
```

Add to the `@theme inline` block:
```css
--font-heading: var(--font-heading);
--font-body: var(--font-body);
```

This enables `font-heading` and `font-body` as Tailwind utility classes throughout the app.

---

## Step 2 — Rewrite `src/app/App.tsx`

### Key structural changes from the previous implementation:

**Remove**: The `P` palette object (`const P = { 50: "#E1F5FE", ... }`). No more hardcoded hex in component code.

**Replace all color usage with Tailwind CSS variable tokens:**

| Old (hardcoded)                            | New (design system)                          |
|--------------------------------------------|----------------------------------------------|
| `style={{ color: P[800] }}`               | `className="text-primary"`                   |
| `style={{ background: P[50] }}`           | `className="bg-secondary"`                   |
| `style={{ background: P[800] }}`          | `className="bg-primary"`                     |
| `style={{ color: P[700] }}`               | `className="text-muted-foreground"`          |
| Gradient bg with hex                       | `style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}` |
| Glassmorphism rgba                         | `style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}` |
| `className="bg-blue-50"` etc.              | `className="bg-secondary"` or `"bg-muted"`   |

**Typography: apply font families via Tailwind classes:**
- Root `<div>` wrapping the whole app gets `className="font-body"` — ensures body text uses Plus Jakarta Sans
- Section headings, brand name, hero titles, section heads → `className="font-heading"`
- Never use `fontFamily: 'Outfit'` inline — reference the CSS variable: `fontFamily: 'var(--font-heading)'` if inline is unavoidable

**Token mapping reference (what to use where):**

| Token                    | Tailwind class              | Use case                          |
|--------------------------|-----------------------------|-----------------------------------|
| `--background`           | `bg-background`             | Page background                   |
| `--foreground`           | `text-foreground`           | Body text                         |
| `--primary`              | `bg-primary`, `text-primary`| CTAs, active states, logo accent  |
| `--primary-foreground`   | `text-primary-foreground`   | Text on primary backgrounds       |
| `--secondary`            | `bg-secondary`              | Light blue fills, input bg        |
| `--secondary-foreground` | `text-secondary-foreground` | Text on secondary                 |
| `--muted`                | `bg-muted`                  | Subdued fills, card accents       |
| `--muted-foreground`     | `text-muted-foreground`     | Secondary text, captions          |
| `--accent`               | `bg-accent`, `text-accent`  | Badges, highlights, tags          |
| `--accent-foreground`    | `text-accent-foreground`    | Text on accent                    |
| `--card`                 | `bg-card`                   | Product cards, panels             |
| `--card-foreground`      | `text-card-foreground`      | Card body text                    |
| `--border`               | `border-border`             | All borders                       |
| `--ring`                 | `ring-ring`                 | Focus rings                       |
| `--radius`               | `rounded-lg`                | Cards (1rem)                      |
| `--radius-xl`            | `rounded-xl`                | Large panels (1.25rem)            |
| `--radius-sm`            | `rounded-sm`                | Chips, badges                     |
| `--destructive`          | `text-destructive`          | Error states, sale badges          |

**Opacity modifier usage (Tailwind v4 supports these on CSS var colors):**
- `bg-primary/10` → semi-transparent primary for glassmorphism overlays
- `bg-primary/20` → hover fill on nav items
- `border-border` → subtle dividers

### Section-by-section token application:

- **Announcement bar**: `style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}`, text `text-primary-foreground`
- **Header**: `bg-card` base, scrolled → `bg-card/80` with backdrop-blur
- **Nav links**: `text-foreground` default, `text-primary` active/hover
- **Hero**: gradient via CSS vars, cards `bg-card/80` glassmorphism
- **Service highlights**: `bg-card`, icon wrappers `bg-secondary`, icon color `text-primary`
- **Categories**: card `bg-card` → hover `bg-secondary`, icon `text-primary`
- **Flash Sale section**: `style={{ background: 'linear-gradient(135deg, var(--primary), var(--muted-foreground))' }}`
- **Product cards**: `bg-card`, border `border-border`, badge `bg-accent text-accent-foreground` or `bg-destructive text-destructive-foreground`
- **Section headers**: `font-heading text-foreground`
- **CTA buttons (primary)**: `bg-primary text-primary-foreground hover:bg-primary/90`
- **CTA buttons (secondary/outline)**: `border border-primary text-primary hover:bg-secondary`
- **Countdown digits**: `bg-foreground text-background` (dark blocks)
- **Footer**: `style={{ background: 'var(--foreground)' }}`, text `text-background`

### Preserved from previous implementation:
- All 21 sections and their data arrays (CATEGORIES, PRODUCTS, FLASH, etc.)
- `useCountdown` hook (pure logic, no color coupling)
- `Stars`, `Chip`, `SectionHead`, `TimeDig`, `ProdCard`, `Carousel` sub-components
- All lucide-react icon imports (verified working set)
- Mobile hamburger menu, sticky header scroll behavior
- Live countdown timer, carousel navigation, wishlist / add-to-cart state
- Newsletter success state
- Responsive layout (sm/md/lg breakpoints)

---

## Verification

After writing the files:
1. Visually confirm all 21 sections render in the preview
2. Confirm no `#` hex literals remain in App.tsx (except potentially in data URLs or unavoidable places)
3. Confirm font-heading and font-body classes apply Outfit and Plus Jakarta Sans respectively
4. Confirm Tailwind token classes (bg-primary, text-foreground, etc.) compile correctly
5. Confirm countdown timer ticks, carousels navigate, wishlist toggles, newsletter submits
