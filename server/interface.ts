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
} from "@shared/schema";

export interface IStorage {
    // Products
    getProducts(isHot?: boolean): Promise<Product[]>;
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
    createOrderWithItems(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[], reduceStock?: boolean): Promise<Order>;

    // Order Items
    getOrderItems(orderId: string): Promise<OrderItem[]>;
    createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

    // Invoices
    getInvoices(): Promise<Invoice[]>;
    getInvoice(id: string): Promise<Invoice | undefined>;
    createInvoice(invoice: InsertInvoice): Promise<Invoice>;
    getNextInvoiceNumber(): Promise<string>;
    createInvoiceWithItems(invoice: InsertInvoice, items: Omit<InsertInvoiceItem, "invoiceId">[], reduceStock: boolean): Promise<Invoice>;
    returnInvoice(id: string): Promise<Invoice | undefined>;

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
    getAdminUserByGoogleEmail(googleEmail: string): Promise<AdminUser | undefined>;
    createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "password">>;
    deleteAdminUser(id: string): Promise<boolean>;
    linkGoogleEmail(userId: string, googleEmail: string): Promise<Omit<AdminUser, "password"> | undefined>;

    // Collections
    getCollections(): Promise<Collection[]>;
    getCollection(id: string): Promise<Collection | undefined>;
    getCollectionBySlug(slug: string): Promise<Collection | undefined>;
    createCollection(collection: InsertCollection): Promise<Collection>;
    updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
    deleteCollection(id: string): Promise<boolean>;

    // Banners
    getBanners(): Promise<Banner[]>;
    getBanner(id: string): Promise<Banner | undefined>;
    createBanner(banner: InsertBanner): Promise<Banner>;
    updateBanner(id: string, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
    deleteBanner(id: string): Promise<boolean>;

    // Storefront Sections
    getStorefrontSections(): Promise<StorefrontSection[]>;
    getStorefrontSection(id: string): Promise<StorefrontSection | undefined>;
    createStorefrontSection(section: InsertStorefrontSection): Promise<StorefrontSection>;
    updateStorefrontSection(id: string, section: Partial<InsertStorefrontSection>): Promise<StorefrontSection | undefined>;
    deleteStorefrontSection(id: string): Promise<boolean>;

    // Promotions
    getPromotions(): Promise<Promotion[]>;
    getActivePromotions(): Promise<Promotion[]>;
    getPromotion(id: string): Promise<Promotion | undefined>;
    createPromotion(promotion: InsertPromotion): Promise<Promotion>;
    updatePromotion(id: string, promotion: Partial<InsertPromotion>): Promise<Promotion | undefined>;
    deletePromotion(id: string): Promise<boolean>;
}
