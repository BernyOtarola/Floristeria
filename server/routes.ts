import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { z } from "zod";
import { storage } from "./storage";
import {
  insertCartItemSchema,
  insertOrderSchema,
  insertReviewSchema,
  insertProductSchema,
  insertCategorySchema,
  insertCouponSchema,
} from "@shared/schema";
import { processAIMessage } from "./services/ai-service";
import { sendContactEmail } from "./services/mailer";

// Admin permitido (correo exacto)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "Fannyaleman0312@gmail.com").toLowerCase();

// ---------------- Tipos de sesión ----------------
declare module "express-session" {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email?: string | null;
      username?: string | null;
      name?: string | null;
      role: "admin" | "user";
    };
  }
}

// ---------------- Middlewares de auth ----------------
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session.userId || !req.session.user) {
    return res.status(401).json({ message: "No autorizado" });
  }
  next();
};

const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.session.userId || !req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Solo administradores" });
  }
  next();
};

// ---------------- Schemas (zod) para auth ----------------
const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  name: z.string().min(1).optional(),
});

const unifiedLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ---------------- Registro de rutas ----------------
export async function registerRoutes(app: Express): Promise<Server> {
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Sessions
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "floristeria_bribri_secret_2024",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // ponlo en true detrás de HTTPS/proxy
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24h
      },
    })
  );

  // ================================
  // AUTH (UNIFICADO)
  // ================================
  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = userRegisterSchema.parse(req.body);
      const user = await storage.createUser({
        email: data.email,
        passwordHash: data.password,
        name: data.name ?? null,
      });
      // Autologin como usuario normal
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: "user",
      };
      res.status(201).json(user);
    } catch (e: any) {
      res.status(400).json({ message: e?.message ?? "Datos inválidos" });
    }
  });

  // Login único: primero intenta admin (solo si coincide ADMIN_EMAIL), si no, user
  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = unifiedLoginSchema.parse(req.body);
      const emailLC = data.email.toLowerCase();

      // 1) Intentar admin (acepta email como "username" en authenticateAdmin)
      try {
        const admin = await storage.authenticateAdmin({
          username: data.email,
          password: data.password,
        });
        if (admin && (admin.email?.toLowerCase() === ADMIN_EMAIL)) {
          req.session.userId = admin.id;
          req.session.user = {
            id: admin.id,
            email: admin.email,
            username: admin.username,
            role: "admin",
          };
          return res.json({
            id: admin.id,
            email: admin.email,
            username: admin.username,
            role: "admin",
          });
        }
      } catch {
        // ignorar y probar como usuario
      }

      // 2) Intentar usuario normal
      const user = await storage.authenticateUser({
        email: data.email,
        password: data.password,
      });
      if (!user) {
        return res.status(401).json({ message: "Credenciales inválidas" });
      }

      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        name: user.name ?? null,
        role: "user",
      };
      res.json({ ...user, role: "user" });
    } catch {
      res.status(400).json({ message: "Datos de login inválidos" });
    }
  });

  // Info de sesión (sirve para user o admin) – protegida
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const sess = req.session.user!;
      if (sess.role === "admin") {
        return res.json({ user: sess });
      }
      const me = await storage.getUserById(req.session.userId!);
      if (!me) {
        req.session.destroy(() => {});
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
      res.json({ user: { ...me, role: "user" } });
    } catch {
      res.status(500).json({ message: "Error obteniendo el usuario actual" });
    }
  });

  // Info de sesión simple (sin proteger) para el cliente
  app.get("/api/session/me", (req, res) => {
    res.json({ user: req.session.user ?? null });
  });

  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Error al cerrar sesión" });
      res.clearCookie("connect.sid");
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  // (Compat) ping de admin para panel
  app.get("/api/admin/auth/me", requireAdmin, async (_req, res) => {
    res.json({ ok: true, role: "admin" });
  });

  // ================================
  // SUSCRIPCIONES / NOTIFICACIONES
  // ================================
  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const email = z.string().email().parse(req.body?.email);
      const sub = await storage.subscribeEmail(email);
      res.json({ ok: true, subscriberId: sub.id });
    } catch (e: any) {
      res.status(400).json({ message: e?.message ?? "Email inválido" });
    }
  });

  // ================================
  // CONTACTO (envío de email)
  // ================================
  app.post("/api/contact", async (req, res) => {
    try {
      const data = z
        .object({
          name: z.string().min(1, "Nombre requerido"),
          email: z.string().email("Email inválido"),
          message: z.string().min(5, "Mensaje muy corto"),
        })
        .parse(req.body);

      await sendContactEmail(data);
      res.json({ ok: true });
    } catch (e: any) {
      const msg = e?.message || "No se pudo enviar el mensaje";
      res.status(400).json({ message: msg });
    }
  });

  // ================================
  // ADMIN ROUTES (Protegidas con requireAdmin)
  // ================================
  // Categories
  app.get("/api/admin/categories", requireAdmin, async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.put("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, validatedData);
      if (!category) return res.status(404).json({ message: "Category not found" });
      res.json(category);
    } catch {
      res.status(400).json({ message: "Invalid category data" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) return res.status(404).json({ message: "Category not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting category" });
    }
  });

  // Products
  app.get("/api/admin/products", requireAdmin, async (_req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, validatedData);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) return res.status(404).json({ message: "Product not found" });
    } catch {
      return res.status(500).json({ message: "Error deleting product" });
    }
    res.status(204).send();
  });

  // Coupons
  app.get("/api/admin/coupons", requireAdmin, async (_req, res) => {
    try {
      const coupons = await storage.getCoupons();
      res.json(coupons);
    } catch {
      res.status(500).json({ message: "Error fetching coupons" });
    }
  });

  app.post("/api/admin/coupons", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });

  app.put("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.partial().parse(req.body);
      const coupon = await storage.updateCoupon(req.params.id, validatedData);
      if (!coupon) return res.status(404).json({ message: "Coupon not found" });
      res.json(coupon);
    } catch {
      res.status(400).json({ message: "Invalid coupon data" });
    }
  });

  app.delete("/api/admin/coupons/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCoupon(req.params.id);
      if (!success) return res.status(404).json({ message: "Coupon not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error deleting coupon" });
    }
  });

  // Orders
  app.get("/api/admin/orders", requireAdmin, async (_req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch {
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.put("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body ?? {};
      if (!status || typeof status !== "string") {
        return res.status(400).json({ message: "Estado requerido" });
      }
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch {
      res.status(500).json({ message: "Error updating order status" });
    }
  });

  // ================================
  // PUBLIC ROUTES
  // ================================
  // Categories
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch {
      res.status(500).json({ message: "Error fetching categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId } = req.query;
      const products = categoryId
        ? await storage.getProductsByCategory(categoryId as string)
        : await storage.getProducts();
      res.json(products);
    } catch {
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProductById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Cart
  app.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.params.sessionId);
      res.json(cartItems);
    } catch {
      res.status(500).json({ message: "Error fetching cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse(req.body);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch {
      res.status(400).json({ message: "Invalid cart item data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body ?? {};
      if (typeof quantity !== "number") return res.status(400).json({ message: "Cantidad inválida" });
      const cartItem = await storage.updateCartItem(req.params.id, quantity);
      if (!cartItem) return res.status(404).json({ message: "Cart item not found" });
      res.json(cartItem);
    } catch {
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const success = await storage.removeFromCart(req.params.id);
      if (!success) return res.status(404).json({ message: "Cart item not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error removing cart item" });
    }
  });

  app.delete("/api/cart/session/:sessionId", async (req, res) => {
    try {
      await storage.clearCart(req.params.sessionId);
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Coupons
  app.get("/api/coupons/:code", async (req, res) => {
    try {
      const coupon = await storage.getCouponByCode(req.params.code);
      if (!coupon) return res.status(404).json({ message: "Coupon not found or expired" });
      res.json(coupon);
    } catch {
      res.status(500).json({ message: "Error validating coupon" });
    }
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrderById(req.params.id);
      if (!order) return res.status(404).json({ message: "Order not found" });
      res.json(order);
    } catch {
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.id);
      res.json(reviews);
    } catch {
      res.status(500).json({ message: "Error fetching reviews" });
    }
  });

  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.status(201).json(review);
    } catch {
      res.status(400).json({ message: "Invalid review data" });
    }
  });

  // AI Assistant
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body ?? {};
      if (!message) return res.status(400).json({ message: "Message is required" });
      const response = await processAIMessage({ message, context });
      res.json({ response });
    } catch (error) {
      console.error("AI Assistant error:", error);
      res.status(500).json({
        message: "Error processing AI request",
        response:
          "Lo siento, estoy experimentando dificultades técnicas en este momento. ¿Puedo ayudarte de otra manera?",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
