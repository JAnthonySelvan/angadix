# Angadix Project Style Guidelines & Rules

## Figma Design System & Backend API Preservation Rule

1. **Design System Tokens (Figma Exact Specifications)**:
   - Page Background: `#f0f8ff` (Soft Alice Ice Blue) in Light Mode, `oklch(0.145 0 0)` in Dark Mode.
   - Text Foreground: `#0a2540` (Deep Dark Blue) in Light Mode.
   - Card Background: `#ffffff` (Pure White Containers) with border `rgba(2, 102, 200, 0.12)` and `--radius: 1rem`.
   - Primary Accent: `#0266C8` (Angadix Royal Blue).
   - Secondary / Muted Surfaces: `#E1F5FE` & `#BAE6FD`.
   - Typography: Heading font `'Outfit', sans-serif`, Body font `'Plus Jakarta Sans', sans-serif`.

2. **Frontend-Backend Integration Guarantee**:
   - Never remove or alter Redux Toolkit thunks (`fetchHomepageProducts`, `fetchCategories`, `fetchBrands`, `fetchProductsList`, `fetchProductBySlug`) or API response payload mappings when updating UI components or styling.
   - All dynamic components (Hero, Categories, Trending, Best Sellers, Flash Sale, Brands) must maintain real-time backend API data connections.
