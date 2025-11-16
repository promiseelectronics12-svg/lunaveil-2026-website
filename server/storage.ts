import type {
  Product,
  InsertProduct,
  Order,
  InsertOrder,
  OrderItem,
  InsertOrderItem,
  Invoice,
  InsertInvoice,
  InvoiceItem,
  InsertInvoiceItem,
  CompanySettings,
  InsertCompanySettings,
  AdminUser,
  InsertAdminUser,
} from "@shared/schema";
import {
  products,
  orders,
  orderItems,
  invoices,
  invoiceItems,
  companySettings,
  adminUsers,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  reduceStock(productId: string, quantity: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined>;
  createOrderWithItems(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getNextInvoiceNumber(): Promise<string>;
  createInvoiceWithItems(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, "invoiceId">[], reduceStock: boolean): Promise<Invoice>;

  // Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;

  // Settings
  getSettings(): Promise<CompanySettings>;
  updateSettings(settings: InsertCompanySettings): Promise<CompanySettings>;

  // Admin Users
  getAdminUsers(): Promise<Omit<AdminUser, "password">[]>;
  getAdminUser(id: string): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "password">>;
  deleteAdminUser(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async reduceStock(productId: string, quantity: number): Promise<boolean> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product || product.stock < quantity) return false;

    await db
      .update(products)
      .set({ stock: product.stock - quantity, updatedAt: new Date() })
      .where(eq(products.id, productId));
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order | undefined> {
    const [updated] = await db
      .update(orders)
      .set({ ...order, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updated || undefined;
  }

  // Order Items
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const [newItem] = await db.insert(orderItems).values(item).returning();
    return newItem;
  }

  async createOrderWithItems(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values(order).returning();
      
      if (items.length > 0) {
        const orderItemsData = items.map(item => ({
          ...item,
          orderId: newOrder.id,
        }));
        await tx.insert(orderItems).values(orderItemsData);
      }
      
      return newOrder;
    });
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.createdAt));
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values(invoice).returning();
    return newInvoice;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(invoices)
      .where(sql`EXTRACT(YEAR FROM ${invoices.createdAt}) = ${year}`);
    const count = Number(result[0]?.count || 0) + 1;
    return `INV-${year}-${String(count).padStart(5, "0")}`;
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const [newItem] = await db.insert(invoiceItems).values(item).returning();
    return newItem;
  }

  async createInvoiceWithItems(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, "invoiceId">[], reduceStock: boolean = false): Promise<Invoice> {
    return await db.transaction(async (tx) => {
      const [newInvoice] = await tx.insert(invoices).values(invoice).returning();
      
      if (items.length > 0) {
        const invoiceItemsData = items.map(item => ({
          ...item,
          invoiceId: newInvoice.id,
        }));
        await tx.insert(invoiceItems).values(invoiceItemsData);
        
        // Reduce stock if requested (for POS invoices)
        if (reduceStock) {
          for (const item of items) {
            if (item.productId) {
              const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
              if (!product || product.stock < item.quantity) {
                throw new Error(`Insufficient stock for product: ${item.productNameEn}`);
              }
              
              await tx
                .update(products)
                .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
                .where(eq(products.id, item.productId));
            }
          }
        }
      }
      
      return newInvoice;
    });
  }

  // Settings
  async getSettings(): Promise<CompanySettings> {
    const [settings] = await db.select().from(companySettings);
    if (settings) return settings;

    // Create default settings if none exist
    const [newSettings] = await db
      .insert(companySettings)
      .values({
        companyName: "LUNAVEIL",
        companyPhone: "+880 1XXX-XXXXXX",
        companyAddress: "Dhaka, Bangladesh",
        invoiceFooterText: "Thank you for shopping with LUNAVEIL",
        deliveryChargeInsideDhaka: "60",
        deliveryChargeOutsideDhaka: "120",
      })
      .returning();
    return newSettings;
  }

  async updateSettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    const existing = await this.getSettings();
    const [updated] = await db
      .update(companySettings)
      .set({ ...settings, updatedAt: new Date() })
      .where(eq(companySettings.id, existing.id))
      .returning();
    return updated;
  }

  // Admin Users
  async getAdminUsers(): Promise<Omit<AdminUser, "password">[]> {
    const users = await db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
    return users.map(({ password, ...user }) => user);
  }

  async getAdminUser(id: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "password">> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const [newUser] = await db
      .insert(adminUsers)
      .values({ ...user, password: hashedPassword })
      .returning();
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async deleteAdminUser(id: string): Promise<boolean> {
    const result = await db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
