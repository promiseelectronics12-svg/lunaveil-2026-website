import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Company Settings
export const companySettings = pgTable("company_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull().default("LUNAVEIL"),
  companyPhone: text("company_phone").notNull().default("+880 1234-567890"),
  companyEmail: text("company_email"),
  companyAddress: text("company_address").notNull().default("Dhaka, Bangladesh"),
  logoUrl: text("logo_url"),
  invoiceFooterText: text("invoice_footer_text").default("Thank you for shopping with LUNAVEIL"),
  deliveryChargeInsideDhaka: decimal("delivery_charge_inside_dhaka", { precision: 10, scale: 2 }).notNull().default("60"),
  deliveryChargeOutsideDhaka: decimal("delivery_charge_outside_dhaka", { precision: 10, scale: 2 }).notNull().default("120"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCompanySettingsSchema = createInsertSchema(companySettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertCompanySettings = z.infer<typeof insertCompanySettingsSchema>;
export type CompanySettings = typeof companySettings.$inferSelect;

// Products
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nameEn: text("name_en").notNull(),
  nameBn: text("name_bn").notNull(),
  descriptionEn: text("description_en").notNull(),
  descriptionBn: text("description_bn").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  discountedPrice: decimal("discounted_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  category: text("category").notNull(),
  images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
  isHot: boolean("is_hot").default(false),
  hotPrice: decimal("hot_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Orders
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerAddress: text("customer_address").notNull(),
  deliveryLocation: text("delivery_location").notNull(), // "inside_dhaka" or "outside_dhaka"
  deliveryCharge: decimal("delivery_charge", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, rejected, delivered
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order Items
export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  productId: varchar("product_id").notNull(),
  productNameEn: text("product_name_en").notNull(),
  productNameBn: text("product_name_bn").notNull(),
  quantity: integer("quantity").notNull(),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }).notNull(), // Original price before discount
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Effective price paid (discounted if applicable)
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Invoices (for POS and website orders)
export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  orderId: varchar("order_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  date: timestamp("date").notNull().defaultNow(),
  deliveryCharge: decimal("delivery_charge", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0"),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  status: text("status").notNull().default("paid"), // paid, pending, cancelled
  notes: text("notes"),
  isPOS: boolean("is_pos").notNull().default(false),
  isReturned: boolean("is_returned").notNull().default(false),
  returnedAt: timestamp("returned_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
});

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

// Invoice Items
export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull(),
  productId: varchar("product_id"),
  productNameEn: text("product_name_en").notNull(),
  productNameBn: text("product_name_bn").notNull(),
  quantity: integer("quantity").notNull(),
  regularPrice: decimal("regular_price", { precision: 10, scale: 2 }).notNull(), // Original price before discount
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Effective price paid (discounted if applicable)
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
});

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

// Admin Users
export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"), // hashed password (nullable for Google OAuth users)
  googleEmail: text("google_email").unique(), // Google account email for OAuth login
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

// Collections
export const collections = pgTable("collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  image: text("image"),
  parentId: varchar("parent_id"), // For hierarchy
  type: text("type").default("category"), // 'category' or 'promo'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollectionSchema = createInsertSchema(collections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertCollection = z.infer<typeof insertCollectionSchema>;
export type Collection = typeof collections.$inferSelect;

// Storefront Sections
export const storefrontSections = pgTable("storefront_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'hero', 'product_grid', 'banner', 'marquee', etc.
  order: integer("order").notNull().default(0),
  content: jsonb("content").notNull(), // Flexible JSON for section data
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertStorefrontSectionSchema = createInsertSchema(storefrontSections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertStorefrontSection = z.infer<typeof insertStorefrontSectionSchema>;
export type StorefrontSection = typeof storefrontSections.$inferSelect;

// Product Collections (Junction)
export const productCollections = pgTable("product_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull(),
  collectionId: varchar("collection_id").notNull(),
});

export const insertProductCollectionSchema = createInsertSchema(productCollections).omit({
  id: true,
});

export type InsertProductCollection = z.infer<typeof insertProductCollectionSchema>;
export type ProductCollection = typeof productCollections.$inferSelect;

// Banners (Storefront)
export const banners = pgTable("banners", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  image: text("image").notNull(),
  link: text("link"),
  position: text("position").notNull(), // 'bento-1', 'bento-2', 'bento-3', 'bento-4'
  order: integer("order").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type Banner = typeof banners.$inferSelect;

// Promotions
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
