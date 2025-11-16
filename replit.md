# LUNAVEIL POS & E-Commerce Suite

A comprehensive Point of Sale (POS) system, inventory management, and e-commerce platform designed for LUNAVEIL cosmetics in Bangladesh.

## Overview

LUNAVEIL is a full-featured business management system that combines:
- Customer-facing e-commerce website with Bengali/English language support
- Admin dashboard for inventory and order management
- POS billing system for in-store sales
- Invoice generation and printing (A4 and thermal POS slip formats)
- Location-based delivery charge calculator (inside/outside Dhaka)
- Multi-language support throughout the entire platform

## Project Architecture

### Frontend (Client)
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn UI with Tailwind CSS
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom LUNAVEIL brand colors (purple theme)
- **Language**: Context-based i18n for Bengali/English switching

### Backend (Server)
- **Runtime**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with bcrypt password hashing
- **Session Management**: Express-session with secure cookies
- **Validation**: Zod schemas for all data models
- **File Structure**: Thin routes + storage interface pattern

### Data Models
- **Products**: Multi-language (Bengali/English) with images, pricing, stock
- **Orders**: Customer info, delivery location, items, status tracking
- **Invoices**: POS and website orders with invoice numbers
- **Company Settings**: Logo, delivery charges, contact info
- **Admin Users**: Authenticated users with username, hashed password, and role

## Key Features

### Customer Website
1. **Hero Section**: Full-width hero with lifestyle imagery
2. **Product Grid**: Responsive grid with search functionality
3. **Shopping Cart**: Side sheet with quantity controls
4. **Checkout**: Multi-step form with COD payment
5. **Language Toggle**: EN/BN switcher in header
6. **Dark Mode**: System-wide theme toggle

### Admin Dashboard
1. **Authentication**: Secure login with session management and protected routes
2. **Dashboard**: Stats cards, recent orders, low stock alerts
3. **Product Management**: CRUD operations with Bengali/English descriptions and image upload
4. **Order Management**: View, confirm, reject orders from website and POS
5. **POS Billing**: In-store checkout with customer details, cart, delivery charges, and order creation
6. **Invoice History**: Search, filter, and reprint invoices
7. **User Management**: Create and delete admin users (requires authentication)
8. **Settings**: Company info, logo upload, delivery charge configuration

### Product Image Upload
- **URL-based**: Paste image URLs for products
- **Multi-image Support**: Add multiple images per product
- **Live Preview**: See images in grid layout before saving
- **Edit & Remove**: Hover to remove unwanted images
- **Controlled State**: Fully integrated with React Hook Form validation
- **Bilingual**: Works seamlessly in Bengali and English

### POS Billing System
- **Customer Details**: Input fields for name, phone, address, and delivery location
- **Link to Orders**: Button to load customer information from previous orders
  - Opens dialog with searchable list of all orders
  - Search by customer name, phone, or address
  - Click any order to auto-fill customer details
  - Helps process repeat customers quickly
- **Delivery Location**: Dropdown to select Inside/Outside Dhaka with automatic charge updates
- **Product Selection**: Click-to-add from product grid with real-time stock display
- **Cart Management**: Quantity controls, remove items, live total calculations
- **Print Invoice**: Generates POS invoice (auto-reduces stock, opens print dialog)
- **Auto-reset**: Clears cart and form after successful submission

### Invoice Printing
- **A4 Format**: Full-page invoice with company logo
- **Thermal POS**: 80mm receipt format for POS machines
- **Auto-print**: Opens print dialog automatically
- **Customizable**: Footer text and company details from settings

### Authentication & Security
- **Login System**: Username/password authentication with session persistence
- **Password Hashing**: Bcrypt with 10 rounds for secure password storage
- **Protected Routes**: All admin routes require authentication
- **Session Management**: Secure HTTP-only cookies with express-session
- **Default Admin**: Initial admin user (username: admin, password: admin123)
- **User Management**: Create and delete admin users from admin panel
- **Logout**: Clears session and invalidates cached queries

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js + bcrypt
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Routing**: Wouter
- **Icons**: Lucide React

## Routes

### Public Routes
- `/` - Home page with product grid
- `/checkout` - Checkout page
- `/login` - Admin login page

### Admin Routes (requires authentication)
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/pos` - POS billing system
- `/admin/invoices` - Invoice history
- `/admin/invoices/:id/print` - Print invoice
- `/admin/users` - User management
- `/admin/settings` - Company settings

## Development Status

**Current Phase**: Production Ready with Authentication ✅
- ✅ Data schema defined
- ✅ Design system configured (LUNAVEIL purple theme)
- ✅ Language context provider created
- ✅ Customer website components built
- ✅ Admin dashboard components built
- ✅ All pages created and routed
- ✅ Backend API fully implemented
- ✅ Storage interface with in-memory implementation
- ✅ All CRUD operations working
- ✅ Order detail view bug fixed (GET request body issue)
- ✅ Product image upload feature added with preview
- ✅ React Hook Form validation and state management verified
- ✅ Architect review passed - production ready

## Recent Changes

### 2025-11-16 (Latest - Link to Orders Feature)
- Added "Link to Orders" button in POS billing to load customer information from existing orders
- Created searchable orders dialog with filter by name, phone, or address
- Implemented customer data auto-fill when selecting an order
- Added loading skeleton screens for better UX
- Null-safe delivery charge handling with fallback to settings-based defaults
- Helps POS operators quickly process repeat customers
- End-to-end tested: dialog opening, order search, customer field population

### 2025-11-16 (Admin Authentication System)
- Implemented complete authentication system with Passport.js and bcrypt
- Created admin users table in PostgreSQL database
- Built login page with secure session management
- Added protected routes that redirect to login when not authenticated
- Created user management page for creating/deleting admin users
- Set up password hashing with bcrypt (10 rounds)
- Added logout functionality with proper query cache invalidation
- Implemented error handling with JSON error messages
- Created seed script for default admin user (username: admin, password: admin123)
- Added Users link to admin sidebar
- End-to-end tested: login, logout, protected routes, user management

### 2025-11-15 (Image Upload Feature)
- Added comprehensive image upload functionality to product form
- Implemented controlled image URL input with React state
- Created image preview grid with remove capability
- Fixed React Hook Form binding to use field.onChange/field.value
- Added price conversion from string to number (parseFloat)
- Ensured existing product images display when editing
- Added complete data-testid coverage for automated testing
- Fixed DELETE request bug (removed empty object parameter)
- Architect review confirmed production-ready status

### 2025-11-15 (Bug Fixes)
- Fixed critical bug in Orders page: removed empty object from GET request to prevent "Request with GET/HEAD method cannot have body" error
- Properly handle Response object from apiRequest by calling .json()
- Verified application is running correctly

### 2025-01-15 (Initial Implementation)
- Created complete data schema with all models
- Generated LUNAVEIL logo and product images
- Configured LUNAVEIL brand colors (purple theme)
- Built customer website (header, footer, hero, product grid, checkout)
- Built admin dashboard with sidebar navigation
- Created all admin pages (dashboard, products, orders, POS, invoices, settings)
- Implemented multi-language support (Bengali/English)
- Created invoice print layout for A4 and thermal formats
- Set up routing for all pages
- Implemented complete backend API with Express.js
- Created storage interface with all CRUD operations
- Added automatic stock reduction on order confirmation
- Implemented invoice number generation
- Added Zod validation on all endpoints

## User Preferences

- Brand: LUNAVEIL (premium cosmetics)
- Target Market: Bangladesh
- Languages: Bengali and English
- Payment: Cash on Delivery (COD)
- Delivery Zones: Inside Dhaka / Outside Dhaka
- Theme: Purple and elegant (luxury beauty brand aesthetic)

## Generated Assets

All cosmetics product images and LUNAVEIL logo are stored in:
- `attached_assets/generated_images/`

These images are imported using the `@assets` alias in components.
