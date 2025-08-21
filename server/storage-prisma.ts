// server/storage-prisma.ts
import {
  type Category,
  type Product,
  type CartItem,
  type Coupon,
  type Order,
  type Review,
  type AdminUser,
  type InsertCategory,
  type InsertProduct,
  type InsertCartItem,
  type InsertCoupon,
  type InsertOrder,
  type InsertReview,
  type InsertAdminUser,
  type LoginData,
  // Asegúrate de tener estos tipos en @shared/schema
  type User,
  type InsertUser,
  type LoginDataUser,
  type Subscriber,
} from "@shared/schema";

import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";

export interface IStorage {
  // Admin Authentication
  createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "passwordHash">>;
  authenticateAdmin(credentials: LoginData): Promise<Omit<AdminUser, "passwordHash"> | null>;
  getAdminById(id: string): Promise<Omit<AdminUser, "passwordHash"> | null>;
  updateAdminLastLogin(id: string): Promise<void>;

  // Users
  createUser(user: InsertUser): Promise<Omit<User, "passwordHash">>;
  authenticateUser(credentials: LoginDataUser): Promise<Omit<User, "passwordHash"> | null>;
  getUserById(id: string): Promise<Omit<User, "passwordHash"> | null>;

  // Subscribers
  subscribeEmail(email: string): Promise<Subscriber>;

  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Products
  getProducts(): Promise<Product[]>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Cart
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<void>;

  // Coupons
  getCoupons(): Promise<Coupon[]>;
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined>;
  deleteCoupon(id: string): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  getOrderById(id: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;

  // Reviews
  getProductReviews(productId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
}

const prisma = new PrismaClient();

/** Helpers */
const toDecimal = (v: number | string | null | undefined) => {
  if (v === null || v === undefined) return undefined;
  if (typeof v === "number") return new Prisma.Decimal(v.toString());
  return new Prisma.Decimal(v);
};
const num = (v: number | string | null | undefined) =>
  v == null ? 0 : typeof v === "number" ? v : Number(v);

export class PrismaStorage implements IStorage {
  // -------------------- Admin Authentication --------------------
  async createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, "passwordHash">> {
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    const created = await prisma.adminUser.create({
      data: {
        username: user.username,
        email: user.email,
        passwordHash: hashedPassword,
        role: user.role ?? "admin",
        isActive: user.isActive ?? true,
      },
    });
    const { passwordHash, ...rest } = created as unknown as AdminUser;
    return rest;
  }

  async authenticateAdmin(credentials: LoginData): Promise<Omit<AdminUser, "passwordHash"> | null> {
    const uin = credentials.username.toLowerCase();
    // Quitar `mode` para tu cliente actual
    const user = await prisma.adminUser.findFirst({
      where: {
        isActive: true,
        OR: [{ username: uin }, { email: uin }],
      },
    });
    if (!user) return null;
    const ok = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!ok) return null;

    await prisma.adminUser.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    }).catch(() => {});

    const { passwordHash, ...rest } = user as unknown as AdminUser;
    return rest;
  }

  async getAdminById(id: string): Promise<Omit<AdminUser, "passwordHash"> | null> {
    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user || user.isActive === false) return null;
    const { passwordHash, ...rest } = user as unknown as AdminUser;
    return rest;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    await prisma.adminUser.update({
      where: { id },
      data: { lastLogin: new Date() },
    }).catch(() => {});
  }

  // -------------------- Users --------------------
  async createUser(user: InsertUser): Promise<Omit<User, "passwordHash">> {
    // Quitar `mode`
    const exists = await prisma.user.findFirst({
      where: { email: user.email },
      select: { id: true },
    });
    if (exists) throw new Error("Email ya registrado");

    const hashed = await bcrypt.hash(user.passwordHash, 10);
    const created = await prisma.user.create({
      data: {
        email: user.email,
        passwordHash: hashed,
        name: user.name ?? null,
        isVerified: null,
      },
    });

    const { passwordHash, ...rest } = created as unknown as User;
    return rest;
  }

  async authenticateUser(credentials: LoginDataUser): Promise<Omit<User, "passwordHash"> | null> {
    const user = await prisma.user.findFirst({
      where: { email: credentials.email },
    });
    if (!user) return null;
    const ok = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!ok) return null;

    const { passwordHash, ...rest } = user as unknown as User;
    return rest;
  }

  async getUserById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { passwordHash, ...rest } = user as unknown as User;
    return rest;
  }

  // -------------------- Subscribers --------------------
  async subscribeEmail(email: string): Promise<Subscriber> {
    const existing = await prisma.subscriber.findFirst({
      where: { email },
    });
    if (existing) return (existing as unknown) as Subscriber;

    const created = await prisma.subscriber.create({
      data: {
        email,
        verified: null,
      },
    });
    return (created as unknown) as Subscriber;
  }

  // -------------------- Categories --------------------
  async getCategories(): Promise<Category[]> {
    const list = await prisma.category.findMany();
    return list as unknown as Category[];
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    const c = await prisma.category.findUnique({ where: { id } });
    return (c as unknown as Category) ?? undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        icon: category.icon ?? null,
        color: category.color ?? null,
        productCount: category.productCount ?? 0,
      },
    });
    return created as unknown as Category;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: category.name ?? undefined,
        icon: category.icon ?? undefined,
        color: category.color ?? undefined,
        productCount: category.productCount ?? undefined,
      },
    }).catch(() => null);
    return (updated as unknown as Category) ?? undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    try {
      await prisma.category.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // -------------------- Products --------------------
  async getProducts(): Promise<Product[]> {
    const list = await prisma.product.findMany();
    return list as unknown as Product[];
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    const list = await prisma.product.findMany({ where: { categoryId } });
    return list as unknown as Product[];
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const p = await prisma.product.findUnique({ where: { id } });
    return (p as unknown as Product) ?? undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const created = await prisma.product.create({
      data: {
        name: product.name,
        price: toDecimal(product.price) ?? new Prisma.Decimal("0"),
        description: product.description ?? null,
        image: product.image ?? null,
        rating: product.rating ?? null,
        reviewCount: product.reviewCount ?? null,
        inStock: product.inStock ?? null,
        categoryId: product.categoryId ?? null,
      },
    });

    if (product.categoryId) {
      await prisma.category.update({
        where: { id: product.categoryId },
        data: { productCount: { increment: 1 } },
      }).catch(() => {});
    }

    return created as unknown as Product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: product.name ?? undefined,
        price: product.price != null ? toDecimal(product.price) : undefined,
        description: product.description ?? undefined,
        image: product.image ?? undefined,
        rating: product.rating ?? undefined,
        reviewCount: product.reviewCount ?? undefined,
        inStock: product.inStock ?? undefined,
        categoryId: product.categoryId ?? undefined,
      },
    }).catch(() => null);

    return (updated as unknown as Product) ?? undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const prod = await prisma.product.findUnique({ where: { id } });
      await prisma.product.delete({ where: { id } });

      if (prod?.categoryId) {
        await prisma.category.update({
          where: { id: prod.categoryId },
          data: { productCount: { decrement: 1 } },
        }).catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  // -------------------- Cart --------------------
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await prisma.cartItem.findMany({
      where: { sessionId },
      // Nota: tu modelo CartItem no tiene createdAt => no uses orderBy: { createdAt: 'desc' }
      include: { product: true },
    });

    return items.map((it: any) => ({
      id: it.id,
      sessionId: it.sessionId,
      productId: it.productId,
      quantity: it.quantity,
      product: it.product as Product,
    }));
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existing = await prisma.cartItem.findFirst({
      where: { sessionId: item.sessionId, productId: item.productId! },
    });

    if (existing) {
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: (existing.quantity ?? 0) + (item.quantity ?? 0) },
      });
      return updated as unknown as CartItem;
    }

    const created = await prisma.cartItem.create({
      data: {
        sessionId: item.sessionId,
        productId: item.productId!,
        quantity: item.quantity ?? 0,
      },
    });
    return created as unknown as CartItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const updated = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    }).catch(() => null);
    return (updated as unknown as CartItem) ?? undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    try {
      await prisma.cartItem.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async clearCart(sessionId: string): Promise<void> {
    await prisma.cartItem.deleteMany({ where: { sessionId } });
  }

  // -------------------- Coupons --------------------
  async getCoupons(): Promise<Coupon[]> {
    const list = await prisma.coupon.findMany();
    return list as unknown as Coupon[];
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const now = new Date();
    const c = await prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
    });
    return (c as unknown as Coupon) ?? undefined;
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const created = await prisma.coupon.create({
      data: {
        code: coupon.code,
        discount: toDecimal(coupon.discount) ?? new Prisma.Decimal("0"),
        isActive: coupon.isActive ?? null,
        expiresAt: coupon.expiresAt ?? null,
      },
    });
    return created as unknown as Coupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        code: coupon.code ?? undefined,
        discount: coupon.discount != null ? toDecimal(coupon.discount) : undefined,
        isActive: coupon.isActive ?? undefined,
        expiresAt: coupon.expiresAt ?? undefined,
      },
    }).catch(() => null);
    return (updated as unknown as Coupon) ?? undefined;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    try {
      await prisma.coupon.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  // -------------------- Orders --------------------
  async getOrders(): Promise<Order[]> {
    const list = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      // quitado include: { items: true }
    });
    return list as unknown as Order[];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const items = (order as any).items ?? [];
    const subtotalNum = Number(
      items.reduce((sum: number, it: any) => sum + num(it.price) * (it.quantity ?? 1), 0)
    );
    const discountNum = num(order.discount);
    const shippingNum = num(order.shippingCost);
    const totalNum = subtotalNum - discountNum + shippingNum;

    const created = await prisma.order.create({
      data: {
        customerName: (order as any).customerName ?? "Cliente",
        subtotal: new Prisma.Decimal(subtotalNum.toFixed(2)),
        total: new Prisma.Decimal(totalNum.toFixed(2)),
        status: order.status ?? "pending",

        discount: order.discount != null ? toDecimal(order.discount) : undefined,
        comments: (order as any).comments ?? null,
        customerEmail: (order as any).customerEmail ?? null,
        customerPhone: (order as any).customerPhone ?? null,
        deliveryMethod: (order as any).deliveryMethod ?? null,
        deliveryAddress: (order as any).deliveryAddress ?? null,
        deliveryCity: (order as any).deliveryCity ?? null,
        deliveryReference: (order as any).deliveryReference ?? null,
        shippingCost: order.shippingCost != null ? toDecimal(order.shippingCost) : undefined,

        // Si tu modelo tiene relación Order -> OrderItem como `items`,
        // Prisma la validará. Si no existe, quita este bloque.
        ...(items.length
          ? {
              items: {
                create: items.map((it: any) => ({
                  productId: it.productId ?? null,
                  name: it.name ?? "Producto",
                  price: new Prisma.Decimal(num(it.price).toString()),
                  quantity: it.quantity ?? 1,
                })),
              },
            }
          : {}),
      },
      // quitado include: { items: true }
    });

    return created as unknown as Order;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const ord = await prisma.order.findUnique({
      where: { id },
      // quitado include
    });
    return (ord as unknown as Order) ?? undefined;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      // quitado include
    }).catch(() => null);
    return (updated as unknown as Order) ?? undefined;
  }

  // -------------------- Reviews --------------------
  async getProductReviews(productId: string): Promise<Review[]> {
    const list = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
    });
    return list as unknown as Review[];
  }

  async createReview(review: InsertReview): Promise<Review> {
    const created = await prisma.review.create({
      data: {
        productId: review.productId!,
        rating: review.rating,
        comment: review.comment ?? null,
      },
    });

    // Recalcular rating del producto
    const [all, prod] = await Promise.all([
      prisma.review.findMany({ where: { productId: review.productId! } }),
      prisma.product.findUnique({ where: { id: review.productId! } }),
    ]);

    if (prod) {
      const avg =
        all.length > 0 ? (all.reduce((s, r: any) => s + r.rating, 0) / all.length).toFixed(1) : "0.0";
      await prisma.product.update({
        where: { id: prod.id },
        data: {
          rating: avg,
          reviewCount: all.length,
        },
      }).catch(() => {});
    }

    return created as unknown as Review;
  }
}

export const storage = new PrismaStorage();
