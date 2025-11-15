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
} from "@shared/schema";
import { randomUUID } from "crypto";

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

  // Order Items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getNextInvoiceNumber(): Promise<string>;

  // Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;

  // Settings
  getSettings(): Promise<CompanySettings>;
  updateSettings(settings: InsertCompanySettings): Promise<CompanySettings>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private invoices: Map<string, Invoice>;
  private invoiceItems: Map<string, InvoiceItem>;
  private settings: CompanySettings;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();

    const settingsId = randomUUID();
    this.settings = {
      id: settingsId,
      companyName: "LUNAVEIL",
      companyPhone: "+880 1XXX-XXXXXX",
      companyAddress: "Dhaka, Bangladesh",
      logoUrl: null,
      invoiceFooterText: "Thank you for shopping with LUNAVEIL",
      deliveryChargeInsideDhaka: "60",
      deliveryChargeOutsideDhaka: "120",
      updatedAt: new Date(),
    };

    this.seedInitialData();
  }

  private seedInitialData() {
    const productImages = [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1631214524220-ca646409c617?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop",
    ];

    const sampleProducts: InsertProduct[] = [
      {
        nameEn: "Hydrating Serum",
        nameBn: "হাইড্রেটিং সিরাম",
        descriptionEn: "Intensive hydration serum with vitamin C for glowing skin",
        descriptionBn: "উজ্জ্বল ত্বকের জন্য ভিটামিন সি সহ ইনটেনসিভ হাইড্রেশন সিরাম",
        price: "1200",
        stock: 45,
        category: "Skincare",
        images: [productImages[0]],
      },
      {
        nameEn: "Moisturizing Cream",
        nameBn: "ময়েশ্চারাইজিং ক্রিম",
        descriptionEn: "Rich moisturizing cream for all skin types",
        descriptionBn: "সকল ত্বকের ধরনের জন্য সমৃদ্ধ ময়েশ্চারাইজিং ক্রিম",
        price: "950",
        stock: 60,
        category: "Skincare",
        images: [productImages[1]],
      },
      {
        nameEn: "Luxury Lipstick",
        nameBn: "লাক্সারি লিপস্টিক",
        descriptionEn: "Long-lasting matte lipstick in rich colors",
        descriptionBn: "সমৃদ্ধ রঙে দীর্ঘস্থায়ী ম্যাট লিপস্টিক",
        price: "850",
        stock: 80,
        category: "Makeup",
        images: [productImages[2]],
      },
      {
        nameEn: "Eye Shadow Palette",
        nameBn: "আই শ্যাডো প্যালেট",
        descriptionEn: "12-color professional eye shadow palette",
        descriptionBn: "১২-রঙের পেশাদার আই শ্যাডো প্যালেট",
        price: "1500",
        stock: 35,
        category: "Makeup",
        images: [productImages[3]],
      },
      {
        nameEn: "Face Mask",
        nameBn: "ফেস মাস্ক",
        descriptionEn: "Purifying clay face mask for deep cleansing",
        descriptionBn: "গভীর পরিষ্কারের জন্য পিউরিফাইং ক্লে ফেস মাস্ক",
        price: "650",
        stock: 8,
        category: "Skincare",
        images: [productImages[4]],
      },
      {
        nameEn: "Perfume Spray",
        nameBn: "পারফিউম স্প্রে",
        descriptionEn: "Elegant floral fragrance for women",
        descriptionBn: "মহিলাদের জন্য মার্জিত ফুলের সুগন্ধি",
        price: "2200",
        stock: 25,
        category: "Fragrance",
        images: [productImages[5]],
      },
    ];

    sampleProducts.forEach((product) => {
      const id = randomUUID();
      this.products.set(id, {
        ...product,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(
    id: string,
    product: Partial<InsertProduct>
  ): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated: Product = {
      ...existing,
      ...product,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async reduceStock(productId: string, quantity: number): Promise<boolean> {
    const product = this.products.get(productId);
    if (!product || product.stock < quantity) return false;

    product.stock -= quantity;
    product.updatedAt = new Date();
    this.products.set(productId, product);
    return true;
  }

  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrder(
    id: string,
    order: Partial<InsertOrder>
  ): Promise<Order | undefined> {
    const existing = this.orders.get(id);
    if (!existing) return undefined;

    const updated: Order = {
      ...existing,
      ...order,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId
    );
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const newItem: OrderItem = { ...item, id };
    this.orderItems.set(id, newItem);
    return newItem;
  }

  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).sort(
      (a, b) => b.createdAt!.getTime() - a.createdAt!.getTime()
    );
  }

  async getInvoice(id: string): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = randomUUID();
    const newInvoice: Invoice = {
      ...invoice,
      id,
      createdAt: new Date(),
    };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getNextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = this.invoices.size + 1;
    return `INV-${year}-${String(count).padStart(5, "0")}`;
  }

  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }

  async createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = randomUUID();
    const newItem: InvoiceItem = { ...item, id };
    this.invoiceItems.set(id, newItem);
    return newItem;
  }

  async getSettings(): Promise<CompanySettings> {
    return this.settings;
  }

  async updateSettings(settings: InsertCompanySettings): Promise<CompanySettings> {
    this.settings = {
      ...this.settings,
      ...settings,
      updatedAt: new Date(),
    };
    return this.settings;
  }
}

export const storage = new MemStorage();
