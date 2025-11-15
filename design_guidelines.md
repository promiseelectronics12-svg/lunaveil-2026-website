# LUNAVEIL Design Guidelines

## Design Approach: Reference-Based (Cosmetics E-Commerce)

Drawing inspiration from premium cosmetics e-commerce platforms (Glossier, Sephora, Fenty Beauty) combined with clean admin interfaces (Shopify Admin, Stripe Dashboard).

**Core Principles:**
- Elegant simplicity with breathing room
- Trust-building through visual polish
- Dual-personality: luxurious customer-facing, efficient admin backend

---

## Typography System

**Customer Website:**
- Headings: Playfair Display or Cormorant (serif, elegant)
- Body: Inter or DM Sans (400, 500, 600)
- Bengali: Hind Siliguri or Noto Sans Bengali (excellent readability)
- Hero headline: text-5xl to text-7xl
- Section headings: text-3xl to text-4xl
- Body text: text-base to text-lg
- Product prices: text-2xl, medium weight

**Admin Dashboard:**
- System font: Inter (400, 500, 600, 700)
- Bengali: Noto Sans Bengali
- Dashboard headings: text-2xl to text-3xl
- Labels: text-sm, medium weight
- Data tables: text-sm to text-base

---

## Layout & Spacing

**Spacing Scale:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24, 32 for consistency

**Customer Website:**
- Container: max-w-7xl with px-4 to px-8
- Section spacing: py-16 to py-24
- Card padding: p-6 to p-8
- Grid gaps: gap-6 to gap-8

**Admin Dashboard:**
- Sidebar: fixed w-64 with navigation
- Main content: ml-64 with max-w-full
- Card spacing: p-4 to p-6
- Table padding: compact with p-3 to p-4

---

## Component Architecture

### Customer Website Components

**Hero Section:**
- Full-width hero with large product imagery (cosmetics in lifestyle context)
- Height: min-h-[600px] to min-h-[700px]
- Overlay gradient for text readability
- CTA button with backdrop-blur-md background
- Language toggle (EN | BN) in top-right corner

**Navigation:**
- Sticky header with logo left, links center, cart/language right
- Height: h-20
- Subtle shadow on scroll
- Mobile: hamburger menu with slide-in drawer

**Product Grid:**
- 4 columns on desktop (grid-cols-4), 2 on tablet, 1 on mobile
- Card design: Image top, title, price, quick add button
- Hover: subtle scale transform (hover:scale-105)
- Product images: aspect-square with object-cover

**Product Detail Page:**
- 2-column layout: image gallery left (60%), details right (40%)
- Image gallery: large main image + thumbnail strip below
- Sticky add-to-cart section while scrolling
- Tabs for description in both languages

**Checkout Form:**
- Single column, max-w-2xl centered
- Progressive disclosure: contact → address → delivery options
- Location selector: radio buttons for Dhaka Inside/Outside
- Auto-calculated delivery charge display
- Order summary sticky on desktop (right sidebar)

**Footer:**
- 4-column layout: About, Quick Links, Contact, Payment/Delivery info
- Copyright: "© LUNAVEIL – All Rights Reserved"
- Social media icons row
- Payment method badges (bKash, Nagad, COD)

### Admin Dashboard Components

**Sidebar Navigation:**
- Dark background with icon + label pattern
- Active state: background accent with border-left indicator
- Sections: Dashboard, Products, Orders, POS, Invoices, Settings
- Logo at top with company name below

**Dashboard Cards:**
- Grid of stat cards: 4 columns on desktop
- Each card: large number (text-4xl), label below, icon top-right
- Shadow: shadow-sm with hover:shadow-md
- Metrics: Orders Today, Total Sales, Low Stock, Pending Orders

**Data Tables:**
- Striped rows (alternate background)
- Sortable column headers with arrow indicators
- Action buttons: icon buttons in last column
- Pagination at bottom
- Search/filter bar above table

**POS Interface:**
- Split screen: product selection left (60%), cart right (40%)
- Product search bar prominent at top
- Grid of product cards with quick-add
- Cart section sticky with running total
- Large "Print Invoice" button at bottom

**Product Management:**
- Form layout: 2-column for efficiency
- Image upload: drag-drop zone with preview grid
- Tabbed sections: Bengali Details, English Details, Pricing, Stock
- Actions: Save, Save & Add Another, Cancel

**Settings Page (Logo Upload):**
- Card-based sections
- Logo upload: large drop zone with current logo preview
- Form fields: single column, clearly labeled
- Preview section showing logo placement examples

---

## Invoice Designs

**A4 Invoice:**
- Logo centered at top (max-height: 80px)
- Company name below logo
- Two-column layout: customer details left, invoice info right
- Product table: bordered with alternating row colors
- Totals section: right-aligned with emphasis on final total
- Footer text: centered, small italic

**POS Slip (Thermal):**
- Width: 80mm constraint
- Logo: centered, smaller (max-height: 40px)
- Single column layout
- Condensed typography
- Dashed dividers between sections
- Total in larger, bold text

---

## Images & Visual Assets

**Hero Section:**
- Large lifestyle image of cosmetics application/products
- Elegant, clean aesthetic with soft lighting
- Model showing product use or flat-lay product arrangement

**Product Images:**
- White or subtle gradient backgrounds
- Consistent lighting and angles
- Multiple views: front, detail, packaging

**Category Banners:**
- Full-width images for each product category
- Cosmetics relevant: skincare, makeup, haircare sections

**Icons:**
- Use Heroicons for admin dashboard (outline style)
- Font Awesome for customer website (light/regular weights)

---

## Responsive Breakpoints

- Mobile: < 640px (1 column layouts)
- Tablet: 640px - 1024px (2 column layouts)
- Desktop: > 1024px (full multi-column)

**Mobile Priorities:**
- Bottom navigation bar for main actions
- Collapsible filters
- Simplified product cards
- Single-column checkout
- Sticky mobile header with hamburger menu

---

## Bengali/English Toggle

- Pill-style toggle in top-right: "EN | BN"
- Active language: bold with subtle background
- Instant switch without page reload
- Affects all text, buttons, navigation, form labels

**Bengali Typography Considerations:**
- Slightly larger base font size (16px vs 14px)
- Increased line-height (1.8 vs 1.6) for readability
- Adequate letter-spacing for complex characters