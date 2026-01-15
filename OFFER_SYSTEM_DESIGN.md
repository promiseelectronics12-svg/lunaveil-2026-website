# Offer and Discount System Design

## Overview
This document outlines the design for a dynamic offer and discount system for LunaVeilPOS. The goal is to allow administrators to create offers (e.g., "Free delivery on orders over 2000 Taka") that can be linked to banners and automatically applied during checkout.

## 1. Database Schema Changes

We will introduce a new table `promotions` to store offer configurations.

```typescript
// shared/schema.ts

export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // e.g., "Free Delivery > 2000"
  description: text("description"), // Display text for banner/checkout
  type: text("type").notNull(), // 'free_delivery', 'percentage_discount', 'fixed_discount'
  value: decimal("value", { precision: 10, scale: 2 }).default("0"), // Percentage amount or fixed amount
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }).default("0"),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }), // Cap for percentage discounts
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;
```

We may also want to link banners to promotions, but for now, the banner can simply display the text of the active promotion.

## 2. Backend API

### Endpoints
- `GET /api/promotions/active`: Returns a list of currently active promotions (within date range and `isActive` = true).
- `POST /api/promotions`: Create a new promotion (Admin only).
- `PUT /api/promotions/:id`: Update a promotion (Admin only).
- `DELETE /api/promotions/:id`: Delete/Archive a promotion (Admin only).

## 3. Frontend Logic

### Cart Context Updates (`client/src/lib/cart-context.tsx`)
The `CartContext` needs to be enhanced to handle promotions.

1.  **State**:
    - `activePromotions`: List of fetched promotions.
    - `selectedPromotionId`: ID of the currently applied promotion (if manual selection is desired).

2.  **Calculations**:
    - `subtotal`: Existing calculation.
    - `applicablePromotions`: Filter `activePromotions` where `subtotal >= minOrderValue`.
    - `bestPromotion`: Logic to auto-select the promotion giving the highest value if multiple apply.
    - `discountAmount`:
        - If `type === 'percentage_discount'`: `subtotal * (value / 100)` (capped by `maxDiscount`).
        - If `type === 'fixed_discount'`: `value`.
        - If `type === 'free_delivery'`: `0` (but affects delivery charge).
    - `deliveryCharge`:
        - Standard logic (Inside/Outside Dhaka).
        - If `bestPromotion.type === 'free_delivery'`, set to `0`.
    - `total`: `subtotal` + `deliveryCharge` - `discountAmount`.

### Checkout Page (`client/src/pages/checkout.tsx`)
- Replace local `subtotal`, `deliveryCharge`, `total` calculations with values from `CartContext`.
- Add a UI section "Offers & Discounts":
    - List applicable offers.
    - Show a progress bar for "Add X more to get Free Delivery" if close to `minOrderValue`.
- Display the discount clearly in the Order Summary.

### Banner Integration
- The `BannerSection` component can fetch the "featured" promotion or simply display the description of the best active promotion.
- Example: "Free Delivery on orders over ৳2000!"

## 4. Implementation Steps

1.  **Schema**: Add `promotions` table to `shared/schema.ts` and run migration/push.
2.  **API**: Implement CRUD routes in `server/routes.ts`.
3.  **Admin UI**: Create a page to manage promotions (`client/src/pages/admin/promotions.tsx`).
4.  **Context**: Update `CartContext` to fetch promotions and perform calculations.
5.  **Checkout UI**: Update `Checkout` page to use new context values and display discounts.
6.  **Banner**: Update banner to reflect active offers.

## 5. Example Scenarios

**Scenario A: Free Delivery**
- **Offer**: Free Delivery on orders > 2000.
- **Cart**: 2500.
- **Result**: Delivery Charge = 0. Total = 2500.

**Scenario B: Percentage Discount**
- **Offer**: 10% Off on orders > 5000.
- **Cart**: 6000.
- **Result**: Discount = 600. Total = 5400 + Delivery.

**Scenario C: Stacked/Conflict**
- If we allow only one promotion per order, the system should pick the one with the highest monetary value (saved amount).
