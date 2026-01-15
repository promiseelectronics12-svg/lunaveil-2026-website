console.log("[Schema] Loading schema.sqlite.ts");
import { sql } from "drizzle-orm";
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Helper function for UUID generation (will be used at insert time)
// SQLite doesn't have gen_random_uuid(), so we'll generate UUIDs in JavaScript

// Company Settings
export const companySettings = sqliteTable("company_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  companyName: text("company_name").notNull().default("LUNAVEIL"),
  companyPhone: text("company_phone").notNull().default("+880 1234-567890"),
  companyEmail: text("company_email"),
  companyAddress: text("company_address").notNull().default("Dhaka, Bangladesh"),
  logoUrl: text("logo_url"),
  invoiceFooterText: text("invoice_footer_text").default("Thank you for shopping with LUNAVEIL"),
  deliveryChargeInsideDhaka: text("delivery_charge_inside_dhaka").notNull().default("60"),
  deliveryChargeOutsideDhaka: text("delivery_charge_outside_dhaka").notNull().default("120"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

// Products
export const products = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  price: text("price").notNull(), // Store as text for precision, parse as needed
  discountedPrice: text("discounted_price"),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  images: text("images", { mode: "json" }).$type<string[]>().notNull().default([]),
  isHot: integer("is_hot", { mode: "boolean" }).default(false),
  hotPrice: text("hot_price"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  deliveryLocation: text("delivery_location").notNull(), // "inside_dhaka" or "outside_dhaka"
  deliveryCharge: text("delivery_charge").notNull(),
  subtotal: text("subtotal").notNull(),
  total: text("total").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, rejected, delivered
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items
export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text("order_id").notNull(),
  productId: text("product_id").notNull(),
  productNameEn: text("product_name_en").notNull(),
  productNameBn: text("product_name_bn").notNull(),
  quantity: integer("quantity").notNull(),
  regularPrice: text("regular_price").notNull(), // Original price before discount
  price: text("price").notNull(), // Effective price paid (discounted if applicable)
  subtotal: text("subtotal").notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Invoices (for POS and website orders)
export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: text("order_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  date: integer("date", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  deliveryCharge: text("delivery_charge").notNull().default("0"),
  discount: text("discount").notNull().default("0"),
  subtotal: text("subtotal").notNull(),
  total: text("total").notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  status: text("status").notNull().default("paid"), // paid, pending, cancelled
  notes: text("notes"),
  isPOS: integer("is_pos", { mode: "boolean" }).notNull().default(false),
  isReturned: integer("is_returned", { mode: "boolean" }).notNull().default(false),
  returnedAt: integer("returned_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice Items
export const invoiceItems = sqliteTable("invoice_items", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  invoiceId: text("invoice_id").notNull(),
  productId: text("product_id"),
  productNameEn: text("product_name_en").notNull(),
  productNameBn: text("product_name_bn").notNull(),
  quantity: integer("quantity").notNull(),
  regularPrice: text("regular_price").notNull(), // Original price before discount
  price: text("price").notNull(), // Effective price paid (discounted if applicable)
  subtotal: text("subtotal").notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Admin Users
export const adminUsers = sqliteTable("admin_users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  password: text("password"), // hashed password (nullable for Google OAuth users)
  googleEmail: text("google_email").unique(), // Google account email for OAuth login
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Collections
export const collections = sqliteTable("collections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: text("parent_id"), // For hierarchy
  type: text("type").default("category"), // 'category' or 'promo'
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// Storefront Sections
export const storefrontSections = sqliteTable("storefront_sections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(), // 'hero', 'product_grid', 'banner', 'marquee', etc.
  order: integer("order").notNull().default(0),
  content: text("content", { mode: "json" }).notNull(), // Flexible JSON for section data
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertStorefrontSectionSchema = createInsertSchema(storefrontSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStorefrontSection = z.infer<typeof insertStorefrontSectionSchema>;
export type StorefrontSection = typeof storefrontSections.$inferSelect;

// Product Collections (Junction)
export const productCollections = sqliteTable("product_collections", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").notNull(),
  collectionId: text("collection_id").notNull(),
});

export const insertProductCollectionSchema = createInsertSchema(productCollections).omit({
  id: true,
});

export type InsertProductCollection = z.infer<typeof insertProductCollectionSchema>;
export type ProductCollection = typeof productCollections.$inferSelect;

// Banners (Storefront)
export const banners = sqliteTable("banners", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  link: text("link"),
  position: text("position").notNull(), // 'bento-1', 'bento-2', 'bento-3', 'bento-4'
  order: integer("order").default(0),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// Promotions
export const promotions = sqliteTable("promotions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(), // e.g., "Free Delivery > 2000"
  description: text("description"), // Display text for banner/checkout
  type: text("type").notNull(), // 'free_delivery', 'percentage_discount', 'fixed_discount'
  value: text("value").default("0"), // Percentage amount or fixed amount
  minOrderValue: text("min_order_value").default("0"),
  maxDiscount: text("max_discount"), // Cap for percentage discounts
  startDate: integer("start_date", { mode: "timestamp" }),
  endDate: integer("end_date", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;
