# Implementation Plan - Mobile Product Layouts

Implement the proposed mobile-first product layouts to enhance the dedicated mobile homepage experience.

## User Review Required
> [!IMPORTANT]
> This will modify the `ProductGridSection` component to support multiple layout modes. Existing grids will default to the standard 'grid' layout, so no breaking changes are expected for current configurations.

## Proposed Changes

### Client Components

#### [MODIFY] [product-grid.tsx](file:///d:/lunaveil/LunaVeilPOS/client/src/components/storefront/sections/product-grid.tsx)
- Update `ProductGridSectionProps` content interface to include `layout?: 'grid' | 'carousel' | 'featured'`.
- Implement `CarouselLayout` sub-component:
    - Horizontal scrolling container with snap physics.
    - Adjusted card styling for carousel items.
- Implement `FeaturedLayout` sub-component:
    - Full-width card design (4:5 aspect ratio).
    - Overlay text and "Shop Now" button.
- Update main `ProductGridSection` to render the appropriate layout based on the `layout` prop.

### Server / Database

#### [MODIFY] [seed_storefront.ts](file:///d:/lunaveil/LunaVeilPOS/server/seed_storefront.ts)
- Update the seed data to create a storefront configuration that matches the mockup:
    1.  **Top**: "Immersive Story" - A `product_grid` section with `layout: 'featured'` and `limit: 1`.
    2.  **Middle**: "New Arrivals" - A `product_grid` section with `layout: 'carousel'` and `limit: 6`.
    3.  **Bottom**: "Skincare Essentials" - A `product_grid` section with `layout: 'grid'` (default).

## Verification Plan

### Manual Verification
1.  Run `npm run seed:storefront` to populate the database with the new layout configuration.
2.  Start the server (`npm run dev:sqlite`).
3.  Open the application in a mobile viewport (using browser dev tools or a mobile device).
4.  Verify:
    -   **Top Section**: Displays a large, full-width product card.
    -   **Middle Section**: Displays a horizontal scrolling list of products.
    -   **Bottom Section**: Displays the standard 2-column product grid.
    -   **Interactions**: "Add to Cart" works in all layouts. Animations (fly-to-cart) function correctly.
