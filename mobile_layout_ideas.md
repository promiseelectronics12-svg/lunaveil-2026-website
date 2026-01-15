# Mobile Product Layout Ideas

For a dedicated mobile homepage, the product image box layout is crucial for engagement. Here are three distinct concepts tailored for mobile experiences, ranging from immersive to efficient.

## 1. The "Immersive Story" (Full-Width Card)
**Best for:** Lifestyle brands, luxury items, or when you have high-quality photography.
**Concept:** Each product takes up the full width of the screen. The image is the hero, with text overlaying the bottom or sitting cleanly below.

*   **Layout:** 1 Column (Full Width)
*   **Image Aspect Ratio:** 4:5 (Portrait) or 1:1 (Square)
*   **Style:**
    *   Large, high-resolution image.
    *   Minimal text overlay (gradient at bottom).
    *   Large "Add to Cart" button that spans the width.
*   **Vibe:** Instagram Feed / TikTok style. Very engaging.

**Implementation Tip:**
```tsx
// Tailwind classes
<div className="w-full mb-8 relative rounded-3xl overflow-hidden shadow-xl">
  <div className="aspect-[4/5]">
    <img src={product.image} className="w-full h-full object-cover" />
  </div>
  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20">
    <h3 className="text-white text-xl font-bold">{product.name}</h3>
    <p className="text-white/90 font-medium mt-1">৳{product.price}</p>
    <Button className="w-full mt-4 bg-white text-black">Add to Cart</Button>
  </div>
</div>
```

## 2. The "Quick Shop" (2-Column Minimalist)
**Best for:** Stores with many products, FMCG, or when comparison is needed.
**Concept:** A clean, efficient grid that maximizes screen real estate.

*   **Layout:** 2 Columns (Grid)
*   **Image Aspect Ratio:** 3:4 (Standard Portrait)
*   **Style:**
    *   Rounded corners (medium radius).
    *   "Floating" Add button on the image (bottom-right).
    *   Price highlighted in a bold color.
    *   No borders, just whitespace between items.
*   **Vibe:** Modern App Store / Pinterest. Fast and efficient.

**Implementation Tip:**
```tsx
// Tailwind classes
<div className="grid grid-cols-2 gap-3 px-3">
  <div className="flex flex-col gap-2">
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
      <img src={product.image} className="w-full h-full object-cover" />
      <button className="absolute bottom-2 right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-lg">
        +
      </button>
    </div>
    <div>
      <h3 className="text-sm font-medium line-clamp-1">{product.name}</h3>
      <p className="font-bold text-primary">৳{product.price}</p>
    </div>
  </div>
</div>
```

## 3. The "Editorial" (Horizontal Scroll / Carousel)
**Best for:** "New Arrivals", "Best Sellers", or specific collections.
**Concept:** A horizontal strip of cards that users swipe through. Keeps the user on the homepage while exploring categories.

*   **Layout:** Horizontal Scroll (Snap)
*   **Image Aspect Ratio:** 3:4 or 16:9
*   **Style:**
    *   Cards peek from the right edge to encourage scrolling.
    *   Snap-to-center physics.
    *   Title and price below the image.
*   **Vibe:** Netflix / Streaming App. Discoverable.

**Implementation Tip:**
```tsx
// Tailwind classes
<div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 pb-4 no-scrollbar">
  {products.map(p => (
    <div className="min-w-[160px] w-[40vw] snap-center flex flex-col gap-2">
      <div className="aspect-[3/4] rounded-xl overflow-hidden">
        <img src={p.image} className="w-full h-full object-cover" />
      </div>
      <h3 className="text-sm truncate">{p.name}</h3>
    </div>
  ))}
</div>
```

## Recommendation for LunaVeil
Given your current "Beauty/Cosmetics" theme (inferred from seed data like "Midnight Recovery", "Lipstick"):

**Go with Option 1 (Immersive Story) mixed with Option 3 (Editorial).**
*   Use **Full-Width Cards** for your "Hot Deals" or "Hero" products to create a "Stop Scroll" moment.
*   Use **Horizontal Scroll** for categories like "New Arrivals" or "Best Sellers" to allow quick browsing.

This hybrid approach feels premium (like a beauty magazine) but remains functional for shopping.
