import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  AlertCircle,
} from "lucide-react";
import AdminLayout from "@/components/admin-layout";
import { FLORISTERIA_CONFIG } from "@shared/config";
import type { Product, Order, Category } from "@shared/schema";

// --------- Utils de fecha seguras ---------
function safeDate(input?: string | number | Date | null): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateCR(
  input?: string | number | Date | null,
  withTime: boolean = false
): string {
  const d = safeDate(input);
  if (!d) return "—";
  return withTime
    ? d.toLocaleDateString("es-CR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : d.toLocaleDateString("es-CR");
}

export default function AdminDashboard() {
  // Fetch data for dashboard (con queryFn)
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const res = await fetch("/api/admin/products", { credentials: "include" });
      if (!res.ok) throw new Error("Error obteniendo productos");
      return res.json();
    },
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Error obteniendo pedidos");
      return res.json();
    },
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories", { credentials: "include" });
      if (!res.ok) throw new Error("Error obteniendo categorías");
      return res.json();
    },
  });

  // Calculate stats
  const totalProducts = products?.length || 0;
  const totalOrders = orders?.length || 0;
  const totalCategories = categories?.length || 0;
  const productsInStock = products?.filter((p) => (p as any).inStock).length || 0;
  const productsOutOfStock = totalProducts - productsInStock;

  // Recent orders (last 7 days)
  const recentOrders =
    orders?.filter((order) => {
      const orderDate = safeDate((order as any).createdAt);
      if (!orderDate) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return orderDate >= weekAgo;
    }) || [];

  // Calculate revenue
  const totalRevenue =
    orders?.reduce((sum, order) => {
      const t = (order as any).total;
      const num = typeof t === "number" ? t : parseFloat(String(t));
      return sum + (Number.isNaN(num) ? 0 : num);
    }, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: FLORISTERIA_CONFIG.currency.code,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isDev = import.meta.env.MODE === "development";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Bienvenido al panel de administración de {FLORISTERIA_CONFIG.name}
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <div className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleString("es-CR")}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Productos
                  </p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {productsInStock} en stock, {productsOutOfStock} agotados
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Pedidos
                  </p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {recentOrders.length} esta semana
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Ingresos Totales
                  </p>
                  <p className="text-2xl font-bold">
                    {formatPrice(totalRevenue)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Todos los pedidos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Categorías
                  </p>
                  <p className="text-2xl font-bold">{totalCategories}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Catálogo organizado
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Pedidos Recientes
              </CardTitle>
              <CardDescription>
                Últimos {recentOrders.length} pedidos de esta semana
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No hay pedidos recientes</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{(order as any).customerName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDateCR((order as any).createdAt, true)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatPrice(
                            typeof (order as any).total === "number"
                              ? (order as any).total
                              : parseFloat(String((order as any).total))
                          )}
                        </p>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            (order as any).status === "completed"
                              ? "bg-green-100 text-green-800"
                              : (order as any).status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {(order as any).status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>Información general del negocio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="font-medium">Sistema Operativo</span>
                </div>
                <span className="text-green-600 text-sm">✓ En línea</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="font-medium">Base de Datos</span>
                </div>
                <span className="text-blue-600 text-sm">✓ Conectada</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="font-medium">Asistente IA</span>
                </div>
                <span className="text-yellow-600 text-sm">
                  {isDev ? "⚠️ Demo" : "✓ Activo"}
                </span>
              </div>

              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Información de Contacto</h4>
                <p className="text-sm text-gray-600">
                  📱 {FLORISTERIA_CONFIG.contact.whatsapp}
                </p>
                <p className="text-sm text-gray-600">
                  📧 {FLORISTERIA_CONFIG.contact.email}
                </p>
                <p className="text-sm text-gray-600">
                  📍 {FLORISTERIA_CONFIG.location.address}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Popular Products */}
        {products && products.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Productos Más Valorados
              </CardTitle>
              <CardDescription>
                Top productos por calificación de clientes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => (p as any).rating && parseFloat(String((p as any).rating)) > 4.0)
                  .sort(
                    (a, b) =>
                      parseFloat(String((b as any).rating || "0")) -
                      parseFloat(String((a as any).rating || "0"))
                  )
                  .slice(0, 6)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={(product as any).image}
                        alt={(product as any).name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{(product as any).name}</p>
                        <div className="flex items-center mt-1">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm">{(product as any).rating}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({(product as any).reviewCount})
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">
                          {formatPrice(
                            typeof (product as any).price === "number"
                              ? (product as any).price
                              : parseFloat(String((product as any).price))
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
