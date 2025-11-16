import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import {
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertCompanySettingsSchema,
  insertAdminUserSchema,
} from "@shared/schema";
import { z } from "zod";

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    res.json({ user: req.user, message: "Login successful" });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Admin user management routes (protected)
  app.get("/api/admin/users", requireAuth, async (_req, res) => {
    try {
      const users = await storage.getAdminUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAuth, async (req, res) => {
    try {
      const data = insertAdminUserSchema.parse(req.body);
      const user = await storage.createAdminUser(data);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error && error.message.includes("unique")) {
        return res.status(400).json({ error: "Username already exists" });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAuth, async (req, res) => {
    try {
      // Prevent deleting yourself
      if (req.user && req.user.id === req.params.id) {
        return res.status(400).json({ error: "Cannot delete your own account" });
      }
      
      const deleted = await storage.deleteAdminUser(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Products
  app.get("/api/products", async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.patch("/api/products/:id", async (req, res) => {
    try {
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Orders
  app.get("/api/orders", async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { items, ...orderData } = req.body;

      const validatedOrder = insertOrderSchema.parse(orderData);
      const validatedItems = z.array(insertOrderItemSchema.omit({ orderId: true })).parse(items);

      const order = await storage.createOrderWithItems(validatedOrder, validatedItems);

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  app.patch("/api/orders/:id", async (req, res) => {
    try {
      const data = insertOrderSchema.partial().parse(req.body);

      if (data.status === "confirmed") {
        const order = await storage.getOrder(req.params.id);
        if (order) {
          const items = await storage.getOrderItems(order.id);
          for (const item of items) {
            const reduced = await storage.reduceStock(
              item.productId,
              item.quantity
            );
            if (!reduced) {
              return res.status(400).json({
                error: `Insufficient stock for product ${item.productNameEn}`,
              });
            }
          }
        }
      }

      const order = await storage.updateOrder(req.params.id, data);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update order" });
    }
  });

  // Invoices
  app.get("/api/invoices", async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  app.get("/api/invoices/:id/items", async (req, res) => {
    try {
      const items = await storage.getInvoiceItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch invoice items" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const { items, ...invoiceData } = req.body;

      const invoiceNumber = await storage.getNextInvoiceNumber();

      const validatedInvoice = insertInvoiceSchema.parse({
        ...invoiceData,
        invoiceNumber,
      });

      const validatedItems = z.array(insertInvoiceItemSchema.omit({ invoiceId: true })).parse(items);

      // Create invoice with items and reduce stock in a single transaction
      const invoice = await storage.createInvoiceWithItems(validatedInvoice, validatedItems, true);

      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error && error.message.includes("Insufficient stock")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Company Settings
  app.get("/api/settings", async (_req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      const data = insertCompanySettingsSchema.parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
