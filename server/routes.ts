import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";

import passport from "./auth";
import bcrypt from "bcrypt";
import { z } from "zod";

import { storage, schema } from "./provider";

const {
  insertProductSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertCompanySettingsSchema,
  insertAdminUserSchema,
  insertCollectionSchema,
  insertBannerSchema,

  insertStorefrontSectionSchema,
  insertPromotionSchema,
} = schema;

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
  app.get("/api/products", async (req, res) => {
    try {
      const isHot = req.query.isHot === 'true';
      const products = await storage.getProducts(isHot ? true : undefined);
      res.json(products);
    } catch (error) {
      console.error("Error in GET /api/products:", error);
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

  // Collections
  app.get("/api/collections", async (_req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.get("/api/collections/slug/:slug", async (req, res) => {
    try {
      const collection = await storage.getCollectionBySlug(req.params.slug);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.post("/api/collections", async (req, res) => {
    try {
      const data = insertCollectionSchema.parse(req.body);
      const collection = await storage.createCollection(data);
      res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create collection" });
    }
  });

  app.patch("/api/collections/:id", async (req, res) => {
    try {
      const data = insertCollectionSchema.partial().parse(req.body);
      const collection = await storage.updateCollection(req.params.id, data);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  app.delete("/api/collections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteCollection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  // Banners
  app.get("/api/banners", async (_req, res) => {
    try {
      const banners = await storage.getBanners();
      res.json(banners);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banners" });
    }
  });

  app.get("/api/banners/:id", async (req, res) => {
    try {
      const banner = await storage.getBanner(req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch banner" });
    }
  });

  app.post("/api/banners", async (req, res) => {
    try {
      const data = insertBannerSchema.parse(req.body);
      const banner = await storage.createBanner(data);
      res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create banner" });
    }
  });

  app.patch("/api/banners/:id", async (req, res) => {
    try {
      const data = insertBannerSchema.partial().parse(req.body);
      const banner = await storage.updateBanner(req.params.id, data);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update banner" });
    }
  });

  app.delete("/api/banners/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBanner(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete banner" });
    }
  });

  // Storefront Sections
  app.get("/api/storefront-sections", async (_req, res) => {
    try {
      const sections = await storage.getStorefrontSections();
      res.json(sections);
    } catch (error) {
      console.error("Error fetching storefront sections:", error);
      res.status(500).json({ error: "Failed to fetch storefront sections" });
    }
  });

  app.get("/api/storefront-sections/:id", async (req, res) => {
    try {
      const section = await storage.getStorefrontSection(req.params.id);
      if (!section) {
        return res.status(404).json({ error: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch section" });
    }
  });

  app.post("/api/storefront-sections", async (req, res) => {
    try {
      console.log('Creating storefront section with body:', JSON.stringify(req.body, null, 2));
      const data = insertStorefrontSectionSchema.parse(req.body);
      console.log('Parsed data:', JSON.stringify(data, null, 2));
      const section = await storage.createStorefrontSection(data);
      console.log('Created section:', JSON.stringify(section, null, 2));
      res.status(201).json(section);
    } catch (error) {
      console.error('Error creating storefront section:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create section" });
    }
  });

  app.patch("/api/storefront-sections/:id", async (req, res) => {
    try {
      const data = insertStorefrontSectionSchema.partial().parse(req.body);
      const section = await storage.updateStorefrontSection(req.params.id, data);
      if (!section) {
        return res.status(404).json({ error: "Section not found" });
      }
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update section" });
    }
  });

  app.delete("/api/storefront-sections/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteStorefrontSection(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Section not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete section" });
    }
  });

  // Facebook Product Feed
  app.get("/api/facebook-catalog", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      let xml = '<?xml version="1.0"?>\n';
      xml += '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n';
      xml += '<channel>\n';
      xml += '<title>LUNAVEIL Product Feed</title>\n';
      xml += `<link>${baseUrl}</link>\n`;
      xml += '<description>LUNAVEIL Product Catalog</description>\n';

      for (const product of products) {
        const imageUrl = product.images && product.images.length > 0
          ? (product.images[0].startsWith('http') ? product.images[0] : `${baseUrl}${product.images[0]}`)
          : '';

        // Calculate sale price
        let salePrice = null;
        if (product.isHot && product.hotPrice) {
          salePrice = parseFloat(product.hotPrice);
        } else if (product.discountedPrice) {
          salePrice = parseFloat(product.discountedPrice);
        }

        xml += '<item>\n';
        xml += `<g:id>${product.id}</g:id>\n`;
        xml += `<g:title><![CDATA[${product.nameEn}]]></g:title>\n`;
        xml += `<g:description><![CDATA[${product.descriptionEn}]]></g:description>\n`;
        xml += `<g:link>${baseUrl}/product/${product.id}</g:link>\n`;
        xml += `<g:image_link>${imageUrl}</g:image_link>\n`;

        // Additional images
        if (product.images && product.images.length > 1) {
          for (let i = 1; i < product.images.length; i++) {
            const addImg = product.images[i].startsWith('http') ? product.images[i] : `${baseUrl}${product.images[i]}`;
            xml += `<g:additional_image_link>${addImg}</g:additional_image_link>\n`;
          }
        }

        xml += `<g:brand>LUNAVEIL</g:brand>\n`;
        xml += `<g:condition>new</g:condition>\n`;
        xml += `<g:availability>${product.stock > 0 ? 'in stock' : 'out of stock'}</g:availability>\n`;
        xml += `<g:price>${parseFloat(product.price).toFixed(2)} BDT</g:price>\n`;

        if (salePrice) {
          xml += `<g:sale_price>${salePrice.toFixed(2)} BDT</g:sale_price>\n`;
        }

        xml += `<g:product_type><![CDATA[${product.category}]]></g:product_type>\n`;
        xml += `<g:google_product_category>1604</g:google_product_category>\n`;

        // Custom labels for ad targeting
        if (product.isHot) {
          xml += `<g:custom_label_0>Hot Deal</g:custom_label_0>\n`;
        }
        xml += `<g:custom_label_1>${product.category}</g:custom_label_1>\n`;

        xml += '</item>\n';
      }

      xml += '</channel>\n';
      xml += '</rss>';

      res.header('Content-Type', 'application/xml');
      res.send(xml);
    } catch (error) {
      console.error("Error generating Facebook catalog:", error);
      res.status(500).send("Error generating catalog");
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
      console.error("Error creating order:", error);
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
      console.error("[Invoice Create] Error:", error);
      if (error instanceof z.ZodError) {
        console.error("[Invoice Create] Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ error: error.errors });
      }
      if (error instanceof Error && error.message.includes("Insufficient stock")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to create invoice" });
    }
  });

  // Return an invoice (restock products)
  app.post("/api/invoices/:id/return", async (req, res) => {
    try {
      const invoice = await storage.returnInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof Error && error.message.includes("already returned")) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: "Failed to return invoice" });
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

  // Promotions
  app.get("/api/promotions", async (_req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.get("/api/promotions/active", async (_req, res) => {
    try {
      const promotions = await storage.getActivePromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active promotions" });
    }
  });

  app.get("/api/promotions/:id", async (req, res) => {
    try {
      const promotion = await storage.getPromotion(req.params.id);
      if (!promotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotion" });
    }
  });

  app.post("/api/promotions", async (req, res) => {
    try {
      const data = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(data);
      res.status(201).json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create promotion" });
    }
  });

  app.patch("/api/promotions/:id", async (req, res) => {
    try {
      const data = insertPromotionSchema.partial().parse(req.body);
      const promotion = await storage.updatePromotion(req.params.id, data);
      if (!promotion) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.json(promotion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update promotion" });
    }
  });

  app.delete("/api/promotions/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePromotion(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Promotion not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
