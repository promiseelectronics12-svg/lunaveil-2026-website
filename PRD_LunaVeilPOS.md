# LunaVeilPOS - Product Requirements Document (PRD)

**Version:** 1.0  
**Date:** January 8, 2026  
**Author:** Senior Architect Review  
**Project:** LunaVeil Point of Sale & E-Commerce Platform

---

## 1. Executive Summary

LunaVeilPOS is a comprehensive, full-stack e-commerce and Point of Sale (POS) platform designed for the Bangladesh cosmetics market. The system combines a modern customer-facing storefront with a powerful admin panel, enabling businesses to manage both online and in-store sales from a single unified platform.

### Key Highlights
- **Dual-Mode Operation:** Online e-commerce storefront + In-store POS billing
- **Bilingual Support:** English and Bengali (বাংলা) throughout the entire application
- **Flexible Database:** Supports both PostgreSQL (production) and SQLite (development/small deployments)
- **Modern Tech Stack:** React + TypeScript frontend, Express.js backend, Drizzle ORM
- **Dynamic Storefront:** Visual page builder for customizable storefront sections

---

## 2. System Architecture

### 2.1 Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, TanStack Query |
| **UI Framework** | Tailwind CSS, Radix UI, shadcn/ui components |
| **Routing** | Wouter (lightweight client-side routing) |
| **Backend** | Node.js, Express.js, TypeScript |
| **Database** | PostgreSQL (primary) / SQLite (alternative) |
| **ORM** | Drizzle ORM with Zod validation |
| **Authentication** | Passport.js (Local Strategy + Google OAuth 2.0) |
| **Session Management** | express-session with MemoryStore |
| **Animations** | Framer Motion |
| **PDF Generation** | jsPDF with jspdf-autotable |
| **Excel Export** | SheetJS (xlsx) |

### 2.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Storefront  │  │  Admin Panel │  │  Context Providers   │   │
│  │  (Public)    │  │  (Protected) │  │  - Language          │   │
│  │              │  │              │  │  - Cart              │   │
│  │  - Home      │  │  - Dashboard │  │  - Query Client      │   │
│  │  - Products  │  │  - Products  │  │                      │   │
│  │  - Checkout  │  │  - Orders    │  └──────────────────────┘   │
│  │  - Login     │  │  - POS       │                             │
│  │              │  │  - Invoices  │                             │
│  │              │  │  - Settings  │                             │
│  │              │  │  - Users     │                             │
│  │              │  │  - Builder   │                             │
│  └──────────────┘  └──────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                         REST API
                              │
┌─────────────────────────────────────────────────────────────────┐
│                          SERVER                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   Express    │  │   Passport   │  │   Drizzle ORM        │   │
│  │   Routes     │  │   Auth       │  │                      │   │
│  │              │  │              │  │   - PostgreSQL       │   │
│  │  /api/*      │  │  - Local     │  │   - SQLite           │   │
│  │              │  │  - Google    │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Feature Breakdown

### 3.1 Customer-Facing Storefront

#### 3.1.1 Homepage (`/`)
- **Dynamic Storefront Renderer** - Renders configurable sections in order
- **Section Types:**
  - `hero` - Full-width hero banner with CTA
  - `product_grid` - Product listings with filtering (all/collection/hot deals)
  - `banner` - Promotional banners
  - `marquee` - Scrolling announcement text
  - `shoppable_image` - Interactive image with product hotspots

#### 3.1.2 Products Page (`/products`)
- Browse all products with category filtering
- Search functionality
- Product cards with:
  - Image carousel
  - Price display (regular + discounted)
  - Hot deals badges
  - Add to cart functionality
- Product detail dialog with full description

#### 3.1.3 Collection Pages (`/collections/:slug`)
- Category-based product filtering
- Dynamic collection routing

#### 3.1.4 Checkout (`/checkout`)
- Customer information form
- Delivery location selection (Inside Dhaka / Outside Dhaka)
- Dynamic delivery charge calculation
- Order summary with item breakdown
- Cash on Delivery (COD) payment method
- Order confirmation and redirect

#### 3.1.5 Cart System
- Persistent cart (localStorage)
- Add/remove/update quantity
- Slide-out cart drawer
- Cart total calculation with discounts

### 3.2 Admin Panel (Protected Routes)

#### 3.2.1 Dashboard (`/admin`)
- **Key Metrics:**
  - Orders Today
  - Total Sales
  - Low Stock Products
  - Pending Orders
- Recent Orders list
- Low Stock Products alerts

#### 3.2.2 Products Management (`/admin/products`)
- CRUD operations for products
- Fields:
  - Name (English + Bengali)
  - Description (English + Bengali)
  - Price, Discounted Price
  - Hot Deal toggle with Hot Price
  - Stock quantity
  - Category
  - Multiple images
- Excel export functionality
- Product search

#### 3.2.3 Orders Management (`/admin/orders`)
- View all orders with status
- Order status management:
  - `pending` → `confirmed` → `delivered`
  - `pending` → `rejected`
- View order details and items
- Stock reduction on confirmation

#### 3.2.4 POS Billing (`/admin/pos`)
- Real-time product search
- Cart management
- Customer information entry
- Delivery location selection
- Invoice generation
- Print invoice functionality
- Load customer from pending orders

#### 3.2.5 Invoices (`/admin/invoices`)
- View all invoices (POS + Website)
- Invoice search
- PDF export per invoice
- Excel export for all invoices
- Print functionality

#### 3.2.6 Collections (`/admin/collections`)
- Create/edit/delete collections
- Fields: Name, Slug, Description, Image
- Hierarchical support (parent_id)
- Collection types: `category` or `promo`

#### 3.2.7 Storefront Builder (`/admin/storefront`)
- Banner management for Bento grid positions
- Storefront section management

#### 3.2.8 Visual Page Builder (`/admin/builder`)
- Drag-and-drop section reordering
- Section type selection
- Properties panel for section configuration
- Real-time preview
- Section activation/deactivation

#### 3.2.9 User Management (`/admin/users`)
- Create admin users
- Role management: `admin`, `super_admin`
- Google account linking
- Delete users (with self-protection)

#### 3.2.10 Settings (`/admin/settings`)
- Company Information:
  - Company Name
  - Phone, Email, Address
  - Logo URL
  - Invoice Footer Text
- Delivery Charges:
  - Inside Dhaka
  - Outside Dhaka

---

## 4. Data Models

### 4.1 Core Entities

| Entity | Description |
|--------|-------------|
| `products` | Product catalog with bilingual names, pricing, stock |
| `orders` | Customer orders from website |
| `orderItems` | Line items for orders |
| `invoices` | Generated invoices (POS + converted orders) |
| `invoiceItems` | Line items for invoices |
| `adminUsers` | Admin panel users with auth credentials |
| `companySettings` | Company configuration and delivery charges |
| `collections` | Product categories/groupings |
| `productCollections` | Many-to-many junction table |
| `banners` | Storefront promotional banners |
| `storefrontSections` | Dynamic homepage section configuration |

### 4.2 Database Schema Highlights

```typescript
// Products Table
products: {
  id: UUID (primary key)
  nameEn: string (required)
  nameBn: string (required)
  descriptionEn: string
  descriptionBn: string
  price: decimal
  discountedPrice: decimal (optional)
  stock: integer
  category: string
  images: string[] (JSON array)
  isHot: boolean
  hotPrice: decimal (optional)
  createdAt, updatedAt: timestamp
}

// Storefront Sections
storefrontSections: {
  id: UUID
  type: 'hero' | 'product_grid' | 'banner' | 'marquee' | 'shoppable_image'
  order: integer
  content: JSON (flexible configuration)
  isActive: boolean
  createdAt, updatedAt: timestamp
}
```

---

## 5. Authentication & Security

### 5.1 Authentication Methods
1. **Local Authentication** - Username/password with bcrypt hashing
2. **Google OAuth 2.0** - Optional SSO for admin users

### 5.2 Security Features
- Session-based authentication with secure cookies
- Password hashing (bcrypt with salt rounds)
- Google email normalization (prevents alias attacks)
- Protected admin routes with `requireAuth` middleware
- Self-deletion protection for admin users

### 5.3 Authorization
- Route-level protection via `ProtectedRoute` component
- Session validation on each request
- No public registration (admin-only user creation)

---

## 6. Internationalization (i18n)

### 6.1 Language Support
- **English (en)** - Default
- **Bengali (bn)** - Full translation

### 6.2 Implementation
- Context-based language provider
- Centralized translation dictionary
- Language persistence (localStorage)
- Bilingual product data (nameEn/nameBn, descriptionEn/descriptionBn)

### 6.3 Translation Coverage
- Navigation
- Hero section
- Product pages
- Checkout flow
- Admin panel
- Common actions (save, cancel, delete, etc.)

---

## 7. Export Capabilities

### 7.1 PDF Export
- Professional invoice PDF generation
- Company branding header
- Itemized table with pricing
- Summary section (subtotal, delivery, discount, total)
- Bilingual support

### 7.2 Excel Export
- Invoices list export
- Products catalog export
- Column headers in selected language
- Proper date/number formatting

---

## 8. Deployment Options

### 8.1 PostgreSQL Mode (Production)
```bash
npm run dev          # Development
npm run build        # Production build
npm run start        # Production server
npm run db:push      # Database sync
```

### 8.2 SQLite Mode (Development/Small Scale)
```bash
npm run dev:sqlite       # Development with SQLite
npm run db:push:sqlite   # SQLite schema sync
npm run seed:sqlite      # Seed demo data
npm run seed:storefront  # Seed storefront sections
```

---

## 9. Senior Architect Recommendations

### 9.1 Immediate Improvements (High Priority)

> [!IMPORTANT]
> **1. API Rate Limiting & Input Validation**
> - Add rate limiting middleware (e.g., `express-rate-limit`)
> - Implement request body size limits
> - Add CSRF protection for form submissions

> [!WARNING]
> **2. Session Security Upgrade**
> - Replace `MemoryStore` with `connect-redis` or `connect-pg-simple` for production
> - MemoryStore is not suitable for production and will leak memory

> [!CAUTION]
> **3. Error Handling**
> - Current error handler throws errors after responding (line 46-47 in index.ts)
> - This can cause unhandled promise rejections
> - Replace `throw err` with proper logging

```diff
// server/index.ts
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
-   throw err;
+   console.error('[Error Handler]', err);
});
```

### 9.2 Medium Priority Enhancements

**4. Database Optimization**
- Add database indexes for frequently queried columns:
  - `products.category`
  - `products.isHot`
  - `orders.status`
  - `orders.createdAt`
- Consider connection pooling configuration

**5. Image Handling**
- Implement image upload to cloud storage (Cloudinary, ImageKit, S3)
- Add image optimization/resizing
- Implement lazy loading for product images

**6. Stock Management**
- Add inventory transactions log
- Implement stock reservation during checkout
- Add low stock notifications (email/webhook)

**7. Testing Infrastructure**
- Add unit tests for storage layer
- Add integration tests for API endpoints
- Add E2E tests for critical user flows (checkout, POS)

### 9.3 Long-Term Architecture Improvements

**8. Microservices Consideration**
For scaling, consider separating:
- Storefront service (public, high traffic)
- Admin service (internal, low traffic)
- Inventory service (real-time stock)
- Notification service (emails, webhooks)

**9. Caching Layer**
- Add Redis for:
  - Session storage
  - Product catalog caching
  - Storefront sections caching
  - Query result caching

**10. Search Enhancement**
- Consider Elasticsearch or Meilisearch for:
  - Full-text product search
  - Fuzzy matching for Bengali text
  - Search analytics

**11. Reporting & Analytics**
- Add sales reports dashboard
- Implement date range filtering
- Add charts for sales trends
- Export reports to PDF/Excel

**12. Payment Integration**
- Integrate local payment gateways:
  - bKash, Nagad, Rocket (mobile banking)
  - SSL Commerz (card payments)
- Add payment status tracking

### 9.4 Code Quality Recommendations

**13. TypeScript Strict Mode**
```json
// tsconfig.json - Enable stricter checks
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**14. API Response Standardization**
Create a consistent API response format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    total?: number;
  };
}
```

**15. Environment Configuration**
- Create `.env.example` with all required variables
- Add environment validation at startup
- Document required vs optional variables

---

## 10. Missing Features to Consider

| Feature | Priority | Complexity |
|---------|----------|------------|
| Customer accounts & order history | High | Medium |
| Email notifications (order confirmation) | High | Low |
| Inventory audit trail | Medium | Medium |
| Multi-currency support | Medium | High |
| Product variants (size, color) | High | High |
| Wishlist functionality | Low | Low |
| Product reviews & ratings | Medium | Medium |
| Coupon/discount codes | High | Medium |
| Shipping tracking integration | Medium | Medium |
| Mobile app API readiness | Medium | Low |
| Admin activity logs | Medium | Low |
| Backup & restore functionality | High | Medium |

---

## 11. Compliance & Legal Considerations

### 11.1 Data Privacy
- Implement GDPR-compliant data handling if serving EU customers
- Add privacy policy page
- Implement data export/deletion for customer requests

### 11.2 Bangladesh Specific
- Ensure NID collection compliance (if required)
- VAT registration display
- Trade license information

---

## 12. Performance Benchmarks (Recommended)

| Metric | Target |
|--------|--------|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.5s |
| Time to Interactive (TTI) | < 3.5s |
| API Response Time (p95) | < 200ms |
| Database Query Time (p95) | < 50ms |

---

## 13. Conclusion

LunaVeilPOS is a well-architected, modern e-commerce platform with strong foundations:

**Strengths:**
- Clean separation of concerns
- Type-safe with TypeScript throughout
- Bilingual support from the ground up
- Flexible database options
- Comprehensive admin functionality

**Areas for Growth:**
- Production-ready session management
- Enhanced security measures
- Payment gateway integration
- Customer account system
- Testing coverage

The platform is production-ready for small to medium-scale deployments with the recommended security improvements. For larger scale operations, implementing the caching layer and considering microservices architecture would be advisable.

---

*Document prepared after comprehensive codebase analysis. All recommendations are based on industry best practices and the specific requirements of the Bangladesh e-commerce market.*
