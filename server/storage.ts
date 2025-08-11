import { 
  type Category, type Product, type CartItem, type Coupon, type Order, type Review, type AdminUser,
  type InsertCategory, type InsertProduct, type InsertCartItem, type InsertCoupon, type InsertOrder, type InsertReview, type InsertAdminUser, type LoginData
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // Admin Authentication
  createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, 'passwordHash'>>;
  authenticateAdmin(credentials: LoginData): Promise<Omit<AdminUser, 'passwordHash'> | null>;
  getAdminById(id: string): Promise<Omit<AdminUser, 'passwordHash'> | null>;
  updateAdminLastLogin(id: string): Promise<void>;

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

export class MemStorage implements IStorage {
  private adminUsers: Map<string, AdminUser> = new Map();
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private coupons: Map<string, Coupon> = new Map();
  private orders: Map<string, Order> = new Map();
  private reviews: Map<string, Review> = new Map();

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    // Initialize default admin user
    const defaultAdmin: InsertAdminUser = {
      username: "admin",
      email: "Fannyaleman0312@gmail.com",
      passwordHash: await bcrypt.hash("FloBribri2024!", 10),
      role: "super_admin",
      isActive: true
    };

    const adminId = randomUUID();
    const admin: AdminUser = {
      ...defaultAdmin,
      id: adminId,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.adminUsers.set(adminId, admin);

    // Initialize categories
    const categoriesData: InsertCategory[] = [
      { name: "Rosas", icon: "fas fa-rose", color: "from-pink-100 to-pink-200", productCount: 12 },
      { name: "Ramos", icon: "fas fa-leaf", color: "from-green-100 to-green-200", productCount: 18 },
      { name: "Arreglos", icon: "fas fa-seedling", color: "from-yellow-100 to-orange-200", productCount: 15 },
      { name: "Ocasiones", icon: "fas fa-gift", color: "from-purple-100 to-pink-200", productCount: 24 }
    ];

    categoriesData.forEach(category => {
      const id = randomUUID();
      const newCategory: Category = { 
        ...category, 
        id,
        productCount: category.productCount ?? 0
      };
      this.categories.set(id, newCategory);
    });

    // Initialize products
    const categoryIds = Array.from(this.categories.keys());
    const productsData: Omit<InsertProduct, 'categoryId'>[] = [
      {
        name: "Ramo de Rosas Rojas Premium",
        price: "15000",
        description: "Hermoso ramo de 12 rosas rojas premium, perfectamente seleccionadas y envueltas con papel elegante. Ideal para expresar amor y pasión en ocasiones especiales.",
        image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "5.0",
        reviewCount: 24,
        inStock: true,
      },
      {
        name: "Ramo Mixto Primaveral",
        price: "12000",
        description: "Encantador ramo con rosas, lirios y aliento de bebé en colores frescos de primavera.",
        image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "4.0",
        reviewCount: 18,
        inStock: true,
      },
      {
        name: "Arreglo de Lirios Blancos",
        price: "18000",
        description: "Elegante arreglo de lirios blancos en jarrón de cristal, perfecto para ocasiones formales.",
        image: "https://images.unsplash.com/photo-1487700160041-babef9c3cb55?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "5.0",
        reviewCount: 31,
        inStock: true,
      },
      {
        name: "Ramo de Girasoles Alegres",
        price: "14000",
        description: "Vibrante ramo de girasoles frescos envuelto en papel kraft, perfecto para alegrar cualquier día.",
        image: "https://images.unsplash.com/photo-1574684891174-df6b02ab38d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "4.0",
        reviewCount: 15,
        inStock: true,
      },
      {
        name: "Bouquet de Rosas Rosadas",
        price: "13000",
        description: "Delicado bouquet de rosas rosadas con eucalipto, envuelto en seda blanca.",
        image: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "4.5",
        reviewCount: 22,
        inStock: true,
      },
      {
        name: "Arreglo Tropical Exótico",
        price: "22000",
        description: "Impresionante arreglo con flores tropicales exóticas en colores vibrantes.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600",
        rating: "5.0",
        reviewCount: 8,
        inStock: true,
      }
    ];

    productsData.forEach((product, index) => {
      const id = randomUUID();
      const categoryId = categoryIds[index % categoryIds.length];
      const newProduct: Product = { 
        ...product, 
        id, 
        categoryId,
        rating: product.rating ?? null,
        reviewCount: product.reviewCount ?? null,
        inStock: product.inStock ?? null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.products.set(id, newProduct);
    });

    // Initialize sample coupons
    const couponsData: InsertCoupon[] = [
      { code: "BRIBRI10", discount: "10.00", isActive: true },
      { code: "PRIMAVERA15", discount: "15.00", isActive: true },
      { code: "AMOR20", discount: "20.00", isActive: true }
    ];

    couponsData.forEach(coupon => {
      const id = randomUUID();
      const newCoupon: Coupon = { 
        ...coupon, 
        id, 
        expiresAt: null,
        isActive: coupon.isActive ?? null,
        createdAt: new Date()
      };
      this.coupons.set(id, newCoupon);
    });
  }

  // Admin Authentication
  async createAdminUser(user: InsertAdminUser): Promise<Omit<AdminUser, 'passwordHash'>> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(user.passwordHash, 10);
    
    const newUser: AdminUser = {
      ...user,
      id,
      passwordHash: hashedPassword,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.adminUsers.set(id, newUser);
    
    const { passwordHash, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async authenticateAdmin(credentials: LoginData): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    const user = Array.from(this.adminUsers.values()).find(
      u => u.username === credentials.username && u.isActive
    );

    if (!user) return null;

    const isValidPassword = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValidPassword) return null;

    // Update last login
    user.lastLogin = new Date();
    this.adminUsers.set(user.id, user);

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getAdminById(id: string): Promise<Omit<AdminUser, 'passwordHash'> | null> {
    const user = this.adminUsers.get(id);
    if (!user || !user.isActive) return null;
    
    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateAdminLastLogin(id: string): Promise<void> {
    const user = this.adminUsers.get(id);
    if (user) {
      user.lastLogin = new Date();
      this.adminUsers.set(id, user);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { 
      ...category, 
      id,
      productCount: category.productCount ?? null
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existing = this.categories.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...category };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.categoryId === categoryId);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product, 
      id,
      categoryId: product.categoryId ?? null,
      rating: product.rating ?? null,
      reviewCount: product.reviewCount ?? null,
      inStock: product.inStock ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.set(id, newProduct);
    
    // Update category product count
    if (product.categoryId) {
      const category = this.categories.get(product.categoryId);
      if (category) {
        category.productCount = (category.productCount || 0) + 1;
        this.categories.set(product.categoryId, category);
      }
    }
    
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;

    const updated = { 
      ...existing, 
      ...product,
      updatedAt: new Date()
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;

    const deleted = this.products.delete(id);
    
    // Update category product count
    if (deleted && product.categoryId) {
      const category = this.categories.get(product.categoryId);
      if (category && category.productCount && category.productCount > 0) {
        category.productCount -= 1;
        this.categories.set(product.categoryId, category);
      }
    }
    
    return deleted;
  }

  // Cart
  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => {
      const product = this.products.get(item.productId!);
      return { ...item, product: product! };
    }).filter(item => item.product);
  }

  async addToCart(item: InsertCartItem): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      cartItem => cartItem.productId === item.productId && cartItem.sessionId === item.sessionId
    );

    if (existingItem) {
      existingItem.quantity = (existingItem.quantity ?? 0) + (item.quantity ?? 0);
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const newItem: CartItem = { 
      ...item, 
      id,
      productId: item.productId ?? null,
      quantity: item.quantity ?? 0
    };
    this.cartItems.set(id, newItem);
    return newItem;
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(id, item);
      return item;
    }
    return undefined;
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const items = Array.from(this.cartItems.entries()).filter(([_, item]) => item.sessionId === sessionId);
    items.forEach(([id]) => this.cartItems.delete(id));
  }

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    return Array.from(this.coupons.values());
  }

  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    return Array.from(this.coupons.values()).find(coupon => coupon.code === code && coupon.isActive);
  }

  async createCoupon(coupon: InsertCoupon): Promise<Coupon> {
    const id = randomUUID();
    const newCoupon: Coupon = { 
      ...coupon, 
      id, 
      expiresAt: null,
      isActive: coupon.isActive ?? null,
      createdAt: new Date()
    };
    this.coupons.set(id, newCoupon);
    return newCoupon;
  }

  async updateCoupon(id: string, coupon: Partial<InsertCoupon>): Promise<Coupon | undefined> {
    const existing = this.coupons.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...coupon };
    this.coupons.set(id, updated);
    return updated;
  }

  async deleteCoupon(id: string): Promise<boolean> {
    return this.coupons.delete(id);
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const newOrder: Order = { 
      ...order, 
      id, 
      createdAt: new Date(),
      status: order.status ?? "pending",
      discount: order.discount ?? null,
      comments: order.comments ?? null,
      customerEmail: order.customerEmail ?? null,
      deliveryAddress: order.deliveryAddress ?? null,
      deliveryCity: order.deliveryCity ?? null,
      deliveryReference: order.deliveryReference ?? null,
      shippingCost: order.shippingCost ?? null
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    order.status = status;
    this.orders.set(id, order);
    return order;
  }

  // Reviews
  async getProductReviews(productId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(review => review.productId === productId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { 
      ...review, 
      id, 
      createdAt: new Date(),
      productId: review.productId ?? null,
      comment: review.comment ?? null
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const productId = review.productId;
    if (productId) {
      const product = this.products.get(productId);
      if (product) {
        const reviews = await this.getProductReviews(productId);
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        product.rating = avgRating.toFixed(1);
        product.reviewCount = reviews.length;
        this.products.set(product.id, product);
      }
    }
    
    return newReview;
  }
}

export const storage = new MemStorage();