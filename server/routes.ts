import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "./auth";
import bcrypt from "bcrypt";
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

// Normalize Google email to prevent alias-based attacks
function normalizeGoogleEmail(email: string): string {
  const lowercased = email.toLowerCase().trim();
  
  // For Gmail addresses, remove dots and plus aliases
  if (lowercased.endsWith("@gmail.com") || lowercased.endsWith("@googlemail.com")) {
    const [localPart, domain] = lowercased.split("@");
    // Remove dots from local part and anything after +
    const normalized = localPart.replace(/\./g, "").split("+")[0];
    return `${normalized}@gmail.com`;
  }
  
  return lowercased;
}

// Authentication middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: Express.User, info: { message?: string }) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed" });
        }
        res.json({ user, message: "Login successful" });
      });
    })(req, res, next);
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

  // Google OAuth routes
  app.get("/api/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", (err: Error, user: Express.User, info: { message?: string }) => {
      if (err) {
        console.error("Google OAuth error:", err);
        return res.redirect("/login?error=oauth_server_error");
      }
      if (!user) {
        // Distinguish between authorization failure and other issues
        const errorType = info?.message?.includes("not authorized") 
          ? "google_not_authorized" 
          : "oauth_failed";
        return res.redirect(`/login?error=${errorType}`);
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          return res.redirect("/login?error=session_failed");
        }
        res.redirect("/admin");
      });
    })(req, res, next);
  });

  // Link Google account to existing admin user (requires authentication and password confirmation)
  app.post("/api/admin/link-google", requireAuth, async (req, res) => {
    try {
      const { googleEmail, password } = req.body;
      
      if (!googleEmail || typeof googleEmail !== "string") {
        return res.status(400).json({ error: "Google email is required" });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({ error: "Password confirmation is required" });
      }

      // Verify password before allowing account linking
      if (!req.user?.id) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const currentUser = await storage.getAdminUser(req.user.id);
      if (!currentUser || !currentUser.password) {
        return res.status(400).json({ error: "Cannot link Google account to OAuth-only users" });
      }

      const isValidPassword = await bcrypt.compare(password, currentUser.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Normalize email (lowercase, remove Gmail aliases)
      const normalizedEmail = normalizeGoogleEmail(googleEmail);

      // Check if normalized email is already linked to another user
      const existingUser = await storage.getAdminUserByGoogleEmail(normalizedEmail);
      if (existingUser && existingUser.id !== req.user.id) {
        return res.status(400).json({ error: "This Google account is already linked to another user" });
      }

      // Update current user's Google email
      const updated = await storage.linkGoogleEmail(req.user.id, normalizedEmail);
      if (updated) {
        // Regenerate session after linking to prevent fixation
        req.session.regenerate((err) => {
          if (err) {
            console.error("Session regeneration error:", err);
          }
          req.logIn(updated, (err) => {
            if (err) {
              return res.status(500).json({ error: "Session update failed" });
            }
            return res.json({ message: "Google account linked successfully", user: updated });
          });
        });
      } else {
        res.status(500).json({ error: "Failed to link Google account" });
      }
    } catch (error) {
      console.error("Link Google error:", error);
      res.status(500).json({ error: "Failed to link Google account" });
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
      // Convert empty string to undefined for optional decimal fields
      const body = {
        ...req.body,
        discountedPrice: req.body.discountedPrice === "" ? undefined : req.body.discountedPrice,
      };
      
      // Validate that discounted price is less than or equal to regular price
      if (body.discountedPrice !== undefined && body.discountedPrice !== null) {
        const regularPrice = parseFloat(body.price);
        const discountedPrice = parseFloat(body.discountedPrice);
        if (discountedPrice > regularPrice) {
          return res.status(400).json({ 
            error: "Discounted price cannot be greater than regular price" 
          });
        }
      }
      
      const data = insertProductSchema.parse(body);
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
      // Convert empty string to undefined for optional decimal fields
      const body = {
        ...req.body,
        discountedPrice: req.body.discountedPrice === "" ? undefined : req.body.discountedPrice,
      };
      
      // Validate that discounted price is less than or equal to regular price
      if (body.discountedPrice !== undefined && body.discountedPrice !== null) {
        // Fetch existing product to get current price if not provided in request
        const existingProduct = await storage.getProduct(req.params.id);
        if (!existingProduct) {
          return res.status(404).json({ error: "Product not found" });
        }
        
        // Use the price from the request if provided, otherwise use the existing price
        const regularPrice = body.price !== undefined 
          ? parseFloat(body.price) 
          : parseFloat(existingProduct.price.toString());
        const discountedPrice = parseFloat(body.discountedPrice);
        
        if (discountedPrice > regularPrice) {
          return res.status(400).json({ 
            error: "Discounted price cannot be greater than regular price" 
          });
        }
      }
      
      const data = insertProductSchema.partial().parse(body);
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

      // If order is being created as "confirmed", reduce stock immediately
      const reduceStock = validatedOrder.status === "confirmed";
      const order = await storage.createOrderWithItems(validatedOrder, validatedItems, reduceStock);

      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error && error.message.includes("Insufficient stock")) {
        return res.status(400).json({ error: error.message });
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
