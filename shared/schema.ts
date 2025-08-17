// shared/schema.ts
import { z } from "zod";

/* ========= Admin ========= */
export const adminUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  role: z.string(), // "admin" | "super_admin" (libre, pero string no vacía)
  isActive: z.boolean().nullable(), // puede ser null en MemStorage
  lastLogin: z.date().nullable(),
  createdAt: z.date().nullable().default(null),
  updatedAt: z.date().nullable().default(null),
});
export type AdminUser = z.infer<typeof adminUserSchema>;

export const insertAdminUserSchema = adminUserSchema
  .omit({ id: true, lastLogin: true, createdAt: true, updatedAt: true })
  .extend({
    // en el backend hashéas esto antes de guardar:
    passwordHash: z.string().min(6),
    role: z.string().optional(),
    isActive: z.boolean().optional(),
  });
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Para login de admin aceptamos username O email en el campo username:
export const adminLoginSchema = z.object({
  username: z.string().min(3), // puede ser email o username
  password: z.string().min(6),
});
export type LoginData = z.infer<typeof adminLoginSchema>;

/* ========= User ========= */
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  isVerified: z.boolean().nullable(),
});
export type User = z.infer<typeof userSchema>;

export const insertUserSchema = userSchema
  .omit({ id: true, createdAt: true, updatedAt: true, isVerified: true })
  .extend({
    // backend hash
    passwordHash: z.string().min(6),
    name: z.string().nullable().optional(),
  });
export type InsertUser = z.infer<typeof insertUserSchema>;

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type LoginDataUser = z.infer<typeof userLoginSchema>;

/* ========= Subscribers ========= */
export const subscriberSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  verified: z.boolean().nullable(),
});
export type Subscriber = z.infer<typeof subscriberSchema>;

/* ========= Category ========= */
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  productCount: z.number().nullable(),
});
export type Category = z.infer<typeof categorySchema>;

export const insertCategorySchema = categorySchema.omit({ id: true }).extend({
  productCount: z.number().nullable().optional(),
});
export type InsertCategory = z.infer<typeof insertCategorySchema>;

/* ========= Product ========= */
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.string(), // manejas precios como string en MemStorage
  description: z.string(),
  image: z.string(),
  categoryId: z.string().nullable(),
  rating: z.string().nullable(), // e.g. "4.5"
  reviewCount: z.number().nullable(), // e.g. 22
  inStock: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Product = z.infer<typeof productSchema>;

export const insertProductSchema = productSchema
  .omit({ id: true, createdAt: true, updatedAt: true })
  .extend({
    categoryId: z.string().nullable().optional(),
    rating: z.string().nullable().optional(),
    reviewCount: z.number().nullable().optional(),
    inStock: z.boolean().nullable().optional(),
  });
export type InsertProduct = z.infer<typeof insertProductSchema>;

/* ========= Coupon ========= */
export const couponSchema = z.object({
  id: z.string(),
  code: z.string(),
  discount: z.string(),
  isActive: z.boolean().nullable(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
});
export type Coupon = z.infer<typeof couponSchema>;

export const insertCouponSchema = couponSchema
  .omit({ id: true, createdAt: true })
  .extend({
    isActive: z.boolean().nullable().optional(),
    expiresAt: z.date().nullable().optional(),
  });
export type InsertCoupon = z.infer<typeof insertCouponSchema>;

/* ========= Cart ========= */
export const cartItemSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  productId: z.string().nullable(),
  quantity: z.number(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const insertCartItemSchema = cartItemSchema.omit({ id: true }).extend({
  productId: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
});
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

/* ========= Order ========= */
const orderItemSchema = z.object({
  name: z.string(),
  price: z
    .number()
    .or(z.string())
    .transform((v) => Number(v)),
  quantity: z.number().int().positive().default(1),
});

export const orderSchema = z.object({
  id: z.string(),
  createdAt: z.date().or(z.string()),
  status: z.string(), // "pending" | "confirmed" | ...
  customerName: z.string(),
  customerPhone: z.string(),
  customerEmail: z.string().email().nullable(),
  customerDocumentId: z.string().nullable().optional(),

  deliveryMethod: z.enum(["delivery", "pickup"]),
  deliveryAddress: z.string().nullable(),
  deliveryCity: z.string().nullable(),
  deliveryReference: z.string().nullable(),

  items: z.array(orderItemSchema).nullable().optional(),

  subtotal: z.number().or(z.string()),
  discount: z.string().nullable(),
  shippingCost: z.string().nullable(),
  total: z.number().or(z.string()),

  comments: z.string().nullable(),
});
export type Order = z.infer<typeof orderSchema>;

export const insertOrderSchema = orderSchema
  .omit({ id: true, createdAt: true })
  .extend({
    createdAt: z.date().optional(),
  });
export type InsertOrder = z.infer<typeof insertOrderSchema>;

/* ========= Review ========= */
export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string().nullable(),
  rating: z.number().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.date(),
});
export type Review = z.infer<typeof reviewSchema>;

export const insertReviewSchema = reviewSchema
  .omit({ id: true, createdAt: true })
  .extend({
    productId: z.string().nullable().optional(),
    comment: z.string().nullable().optional(),
  });
export type InsertReview = z.infer<typeof insertReviewSchema>;
