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
- **Storage**: In-memory storage (MemStorage) for MVP
- **Validation**: Zod schemas for all data models
- **File Structure**: Thin routes + storage interface pattern

### Data Models
- **Products**: Multi-language (Bengali/English) with images, pricing, stock
- **Orders**: Customer info, delivery location, items, status tracking
- **Invoices**: POS and website orders with invoice numbers
- **Company Settings**: Logo, delivery charges, contact info

## Key Features

### Customer Website
1. **Hero Section**: Full-width hero with lifestyle imagery
2. **Product Grid**: Responsive grid with search functionality
3. **Shopping Cart**: Side sheet with quantity controls
4. **Checkout**: Multi-step form with COD payment
5. **Language Toggle**: EN/BN switcher in header
6. **Dark Mode**: System-wide theme toggle

### Admin Dashboard
1. **Dashboard**: Stats cards, recent orders, low stock alerts
2. **Product Management**: CRUD operations with Bengali/English descriptions and image upload
3. **Order Management**: View, confirm, reject orders from website
4. **POS Billing**: In-store checkout with cart and delivery charges
5. **Invoice History**: Search, filter, and reprint invoices
6. **Settings**: Company info, logo upload, delivery charge configuration

### Product Image Upload
- **URL-based**: Paste image URLs for products
- **Multi-image Support**: Add multiple images per product
- **Live Preview**: See images in grid layout before saving
- **Edit & Remove**: Hover to remove unwanted images
- **Controlled State**: Fully integrated with React Hook Form validation
- **Bilingual**: Works seamlessly in Bengali and English

### Invoice Printing
- **A4 Format**: Full-page invoice with company logo
- **Thermal POS**: 80mm receipt format for POS machines
- **Auto-print**: Opens print dialog automatically
- **Customizable**: Footer text and company details from settings

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: In-memory (upgradable to PostgreSQL)
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Routing**: Wouter
- **Icons**: Lucide React

## Routes

### Public Routes
- `/` - Home page with product grid
- `/checkout` - Checkout page

### Admin Routes (requires navigation via sidebar)
- `/admin` - Dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/pos` - POS billing system
- `/admin/invoices` - Invoice history
- `/admin/invoices/:id/print` - Print invoice
- `/admin/settings` - Company settings

## Development Status

**Current Phase**: MVP Complete - Production Ready ✅
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

### 2025-11-15 (Latest - Image Upload Feature)
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
