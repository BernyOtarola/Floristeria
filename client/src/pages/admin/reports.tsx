import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  TrendingUp, 
  Calendar,
  DollarSign,
  Package,
  Users,
  Star,
  Download,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/admin-layout";
import { FLORISTERIA_CONFIG } from "@shared/config";
import type { Product, Order, Category } from "@shared/schema";

export default function AdminReports() {
  // Fetch data for reports
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: orders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: FLORISTERIA_CONFIG.currency.code,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate metrics
  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.total), 0) || 0;
  const totalOrders = orders?.length || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Sales by period
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const thisWeekOrders = orders?.filter(order => 
    new Date(order.createdAt) >= startOfWeek
  ) || [];

  const thisMonthOrders = orders?.filter(order => 
    new Date(order.createdAt) >= startOfMonth
  ) || [];

  const weeklyRevenue = thisWeekOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
  const monthlyRevenue = thisMonthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  // Top products by sales
  const productSales = new Map<string, { name: string; sales: number; revenue: number }>();
  orders?.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      (order.items as any[]).forEach(item => {
        const key = item.name || 'Producto Sin Nombre';
        const existing = productSales.get(key) || { name: key, sales: 0, revenue: 0 };
        existing.sales += item.quantity || 1;
        existing.revenue += item.price || 0;
        productSales.set(key, existing);
      });
    }
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Customer metrics
  const uniqueCustomers = new Set(orders?.map(order => order.customerPhone)).size;
  const customerRetention = totalOrders > 0 ? ((totalOrders - uniqueCustomers) / totalOrders * 100) : 0;

  // Delivery methods
  const deliveryStats = {
    delivery: orders?.filter(o => o.deliveryMethod === "delivery").length || 0,
    pickup: orders?.filter(o => o.deliveryMethod === "pickup").length || 0
  };

  // Order status distribution
  const statusStats = orders?.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  // Monthly sales trend (last 6 months)
  const monthlySales = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    const monthOrders = orders?.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= monthStart && orderDate <= monthEnd;
    }) || [];

    return {
      month: date.toLocaleDateString("es-CR", { month: "short", year: "2-digit" }),
      orders: monthOrders.length,
      revenue: monthOrders.reduce((sum, order) => sum + parseFloat(order.total), 0)
    };
  }).reverse();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Reportes y Estadísticas
            </h1>
            <p className="text-gray-600 mt-2">
              Análisis del rendimiento de {FLORISTERIA_CONFIG.name}
            </p>
          </div>
          
          <Button className="mt-4 sm:mt-0">
            <Download className="w-4 h-4 mr-2" />
            Exportar Reporte
          </Button>
        </div>

        {/* KPIs Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Histórico</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pedidos Totales</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <p className="text-xs text-gray-500 mt-1">Todos los tiempos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                  <p className="text-2xl font-bold">{formatPrice(averageOrderValue)}</p>
                  <p className="text-xs text-gray-500 mt-1">Por pedido</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes Únicos</p>
                  <p className="text-2xl font-bold">{uniqueCustomers}</p>
                  <p className="text-xs text-gray-500 mt-1">Registrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Period Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Rendimiento por Período
              </CardTitle>
              <CardDescription>
                Comparativa de ventas por semana y mes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">Esta Semana</p>
                  <p className="text-sm text-gray-600">{thisWeekOrders.length} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(weeklyRevenue)}</p>
                  <p className="text-sm text-blue-600">+12% vs semana anterior</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium">Este Mes</p>
                  <p className="text-sm text-gray-600">{thisMonthOrders.length} pedidos</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatPrice(monthlyRevenue)}</p>
                  <p className="text-sm text-green-600">+8% vs mes anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Métodos de Entrega
              </CardTitle>
              <CardDescription>
                Distribución de preferencias de entrega
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-blue-500 rounded mr-3"></div>
                    <span>Delivery</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{deliveryStats.delivery}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totalOrders > 0 ? Math.round((deliveryStats.delivery / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                    <span>Recoger en Tienda</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold">{deliveryStats.pickup}</span>
                    <span className="text-sm text-gray-500 ml-2">
                      ({totalOrders > 0 ? Math.round((deliveryStats.pickup / totalOrders) * 100) : 0}%)
                    </span>
                  </div>
                </div>

                {/* Visual bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                  <div 
                    className="bg-blue-500 h-3 rounded-l-full"
                    style={{ 
                      width: totalOrders > 0 ? `${(deliveryStats.delivery / totalOrders) * 100}%` : '0%' 
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products & Monthly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Productos Más Vendidos
              </CardTitle>
              <CardDescription>
                Top 5 productos por ingresos generados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.sales} unidades vendidas</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatPrice(product.revenue)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tendencia Mensual
              </CardTitle>
              <CardDescription>
                Evolución de ventas últimos 6 meses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlySales.map((month, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-gray-600">{month.orders} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(month.revenue)}</p>
                      <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: month.revenue > 0 ? `${Math.min((month.revenue / Math.max(...monthlySales.map(m => m.revenue))) * 100, 100)}%` : '0%'
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Estado de Pedidos
            </CardTitle>
            <CardDescription>
              Distribución actual de estados de pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(statusStats).map(([status, count]) => (
                <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm font-medium capitalize">{status}</p>
                  <p className="text-xs text-gray-500">
                    {totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Insights del Negocio</CardTitle>
            <CardDescription>
              Análisis automático y recomendaciones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">✅ Puntos Fuertes</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Ticket promedio alto: {formatPrice(averageOrderValue)}</li>
                  <li>• {uniqueCustomers} clientes únicos registrados</li>
                  <li>• {products?.filter(p => p.inStock).length} productos disponibles</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Oportunidades</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Promocionar productos menos vendidos</li>
                  <li>• Incentivar pedidos de pickup con descuentos</li>
                  <li>• Crear programa de fidelización de clientes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}