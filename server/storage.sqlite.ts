console.log("[Storage] Loading storage.sqlite.ts");
// SQLite-specific storage implementation
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
    Collection,
    InsertCollection,
    Banner,
    InsertBanner,
    StorefrontSection,
    InsertStorefrontSection,
    Promotion,
    InsertPromotion,
} from "@shared/schema.sqlite";
import {
    products,
    orders,
    orderItems,
    invoices,
    invoiceItems,
    companySettings,
    adminUsers,
    collections,
    productCollections,
    banners,
    storefrontSections,
    promotions,
} from "@shared/schema.sqlite";
import { db } from "./db.sqlite";
import { eq, desc, sql, like } from "drizzle-orm";
import bcrypt from "bcrypt";

import type { IStorage } from "./interface";

export class DatabaseStorage implements IStorage {
    // Products
    async getProducts(isHot?: boolean): Promise<Product[]> {
        if (isHot !== undefined) {
            return await db.select().from(products).where(eq(products.isHot, isHot)).orderBy(desc(products.createdAt));
        }
        return await db.select().from(products).orderBy(desc(products.createdAt));
    }

    async getProduct(id: string): Promise<Product | undefined> {
        const [product] = await db.select().from(products).where(eq(products.id, id));
        return product || undefined;
    }

    async createProduct(product: InsertProduct): Promise<Product> {
        const [newProduct] = await db.insert(products).values(product as any).returning();
        return newProduct;
    }

    async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
        const productData: any = { ...product, updatedAt: new Date() };
        const [updated] = await db
            .update(products)
            .set(productData)
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

    async createOrderWithItems(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[], reduceStock: boolean = false): Promise<Order> {
        return db.transaction((tx) => {
            const newOrder = tx.insert(orders).values(order).returning().get();

            if (items.length > 0) {
                const orderItemsData = items.map(item => ({
                    ...item,
                    orderId: newOrder.id,
                }));
                tx.insert(orderItems).values(orderItemsData).run();

                // Reduce stock if requested (for POS orders)
                if (reduceStock) {
                    for (const item of items) {
                        if (item.productId) {
                            const [product] = tx.select().from(products).where(eq(products.id, item.productId)).all();
                            if (!product || product.stock < item.quantity) {
                                throw new Error(`Insufficient stock for product: ${item.productNameEn}`);
                            }

                            tx
                                .update(products)
                                .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
                                .where(eq(products.id, item.productId))
                                .run();
                        }
                    }
                }
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
        // SQLite-compatible: use strftime instead of EXTRACT
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(invoices)
            .where(sql`strftime('%Y', datetime(${invoices.createdAt}, 'unixepoch')) = ${String(year)}`);
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
        return db.transaction((tx) => {
            const newInvoice = tx.insert(invoices).values(invoice).returning().get();

            if (items.length > 0) {
                const invoiceItemsData = items.map(item => ({
                    ...item,
                    invoiceId: newInvoice.id,
                }));
                tx.insert(invoiceItems).values(invoiceItemsData).run();

                // Reduce stock if requested (for POS invoices)
                if (reduceStock) {
                    for (const item of items) {
                        if (item.productId) {
                            const [product] = tx.select().from(products).where(eq(products.id, item.productId)).all();
                            if (!product || product.stock < item.quantity) {
                                throw new Error(`Insufficient stock for product: ${item.productNameEn}`);
                            }

                            tx
                                .update(products)
                                .set({ stock: product.stock - item.quantity, updatedAt: new Date() })
                                .where(eq(products.id, item.productId))
                                .run();
                        }
                    }
                }
            }

            return newInvoice;
        });
    }

    async returnInvoice(id: string): Promise<Invoice | undefined> {
        return db.transaction((tx) => {
            // Get the invoice
            const [invoice] = tx.select().from(invoices).where(eq(invoices.id, id)).all();
            if (!invoice) return undefined;

            // Check if already returned
            if (invoice.isReturned) {
                throw new Error("Invoice is already returned");
            }

            // Get the invoice items
            const items = tx.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)).all();

            // Restock the products
            for (const item of items) {
                if (item.productId) {
                    const [product] = tx.select().from(products).where(eq(products.id, item.productId)).all();
                    if (product) {
                        tx
                            .update(products)
                            .set({ stock: product.stock + item.quantity, updatedAt: new Date() })
                            .where(eq(products.id, item.productId))
                            .run();
                    }
                }
            }

            // Mark invoice as returned
            const [updatedInvoice] = tx
                .update(invoices)
                .set({ isReturned: true, returnedAt: new Date() })
                .where(eq(invoices.id, id))
                .returning()
                .all();

            return updatedInvoice;
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

    async getAdminUserByGoogleEmail(googleEmail: string): Promise<AdminUser | undefined> {
        const [user] = await db.select().from(adminUsers).where(eq(adminUsers.googleEmail, googleEmail));
        return user || undefined;
    }

    async createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "password">> {
        // Hash password if provided, otherwise use null for OAuth users
        const hashedPassword = user.password ? await bcrypt.hash(user.password, 10) : null;
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

    async linkGoogleEmail(userId: string, googleEmail: string): Promise<Omit<AdminUser, "password"> | undefined> {
        const [updated] = await db
            .update(adminUsers)
            .set({ googleEmail, updatedAt: new Date() })
            .where(eq(adminUsers.id, userId))
            .returning();

        if (!updated) return undefined;

        const { password, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }

    // Collections
    async getCollections(): Promise<Collection[]> {
        return await db.select().from(collections).orderBy(desc(collections.createdAt));
    }

    async getCollection(id: string): Promise<Collection | undefined> {
        const [collection] = await db.select().from(collections).where(eq(collections.id, id));
        return collection || undefined;
    }

    async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
        const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
        return collection || undefined;
    }

    async createCollection(collection: InsertCollection): Promise<Collection> {
        const [newCollection] = await db.insert(collections).values(collection).returning();
        return newCollection;
    }

    async updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined> {
        const [updated] = await db
            .update(collections)
            .set({ ...collection, updatedAt: new Date() })
            .where(eq(collections.id, id))
            .returning();
        return updated || undefined;
    }

    async deleteCollection(id: string): Promise<boolean> {
        const result = await db.delete(collections).where(eq(collections.id, id)).returning();
        return result.length > 0;
    }

    // Banners
    async getBanners(): Promise<Banner[]> {
        return await db.select().from(banners).orderBy(desc(banners.createdAt));
    }

    async getBanner(id: string): Promise<Banner | undefined> {
        const [banner] = await db.select().from(banners).where(eq(banners.id, id));
        return banner || undefined;
    }

    async createBanner(banner: InsertBanner): Promise<Banner> {
        const [newBanner] = await db.insert(banners).values(banner).returning();
        return newBanner;
    }

    async updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined> {
        const [updated] = await db
            .update(banners)
            .set({ ...banner, updatedAt: new Date() })
            .where(eq(banners.id, id))
            .returning();
        return updated || undefined;
    }

    async deleteBanner(id: string): Promise<boolean> {
        const result = await db.delete(banners).where(eq(banners.id, id)).returning();
        return result.length > 0;
    }

    // Storefront Sections
    async getStorefrontSections(): Promise<StorefrontSection[]> {
        return await db.select().from(storefrontSections).orderBy(storefrontSections.order);
    }

    async getStorefrontSection(id: string): Promise<StorefrontSection | undefined> {
        const [section] = await db.select().from(storefrontSections).where(eq(storefrontSections.id, id));
        return section || undefined;
    }

    async createStorefrontSection(section: InsertStorefrontSection): Promise<StorefrontSection> {
        const [newSection] = await db.insert(storefrontSections).values(section).returning();
        return newSection;
    }

    async updateStorefrontSection(id: string, section: Partial<InsertStorefrontSection>): Promise<StorefrontSection | undefined> {
        const [updated] = await db
            .update(storefrontSections)
            .set({ ...section, updatedAt: new Date() })
            .where(eq(storefrontSections.id, id))
            .returning();
        return updated || undefined;
    }

    async deleteStorefrontSection(id: string): Promise<boolean> {
        const result = await db.delete(storefrontSections).where(eq(storefrontSections.id, id)).returning();
        return result.length > 0;
    }

    // Promotions
    async getPromotions(): Promise<Promotion[]> {
        return await db.select().from(promotions).orderBy(desc(promotions.createdAt));
    }

    async getActivePromotions(): Promise<Promotion[]> {
        const now = new Date();
        return await db.select().from(promotions).where(eq(promotions.isActive, true));
        // Note: Date filtering should ideally happen in SQL, but for simplicity/compatibility we can filter in app or enhance query
        // For now, returning all active and we can filter by date in the application layer if needed, 
        // or add complex where clauses if using raw sql or advanced drizzle operators.
        // Let's stick to simple isActive check first.
    }

    async getPromotion(id: string): Promise<Promotion | undefined> {
        const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
        return promotion || undefined;
    }

    async createPromotion(promotion: InsertPromotion): Promise<Promotion> {
        const [newPromotion] = await db.insert(promotions).values(promotion).returning();
        return newPromotion;
    }

    async updatePromotion(id: string, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined> {
        const [updated] = await db
            .update(promotions)
            .set({ ...promotion, updatedAt: new Date() })
            .where(eq(promotions.id, id))
            .returning();
        return updated || undefined;
    }

    async deletePromotion(id: string): Promise<boolean> {
        const result = await db.delete(promotions).where(eq(promotions.id, id)).returning();
        return result.length > 0;
    }
}

export const storage = new DatabaseStorage();
console.log("[Storage] storage.sqlite.ts loaded");
