import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Search,
  Eye,
  Truck,
  Package,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  FileText,
  DollarSign,
  Calendar
} from "lucide-react";
import AdminLayout from "@/components/admin-layout";
import { FLORISTERIA_CONFIG } from "@shared/config";
import type { Order } from "@shared/schema";

// ---------- Utils seguras ----------
function safeDate(input?: string | number | Date | null): Date | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDateCR(
  input?: string | number | Date | null,
  withTime: boolean = true
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

function toNumber(v: string | number | null | undefined): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function s(v: string | null | undefined): string {
  return v ?? "";
}

const ORDER_STATUSES = [
  { value: "pending", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmado", color: "bg-blue-100 text-blue-800" },
  { value: "preparing", label: "Preparando", color: "bg-purple-100 text-purple-800" },
  { value: "ready", label: "Listo", color: "bg-green-100 text-green-800" },
  { value: "delivered", label: "Entregado", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelado", color: "bg-red-100 text-red-800" }
];

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch orders con queryFn
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const res = await fetch("/api/admin/orders", { credentials: "include" });
      if (!res.ok) throw new Error("Error obteniendo pedidos");
      return res.json();
    },
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Error actualizando estado del pedido");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Estado actualizado",
        description: "El estado del pedido ha sido actualizado exitosamente.",
      });
    },
  });

  const formatPrice = (price: string | number | null | undefined) => {
    const numPrice = toNumber(price);
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: FLORISTERIA_CONFIG.currency.code,
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const getStatusInfo = (status: string | null | undefined) => {
    return ORDER_STATUSES.find(s => s.value === status) || ORDER_STATUSES[0];
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const filteredOrders = orders?.filter(order => {
    const matchesSearch =
      s(order.customerName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      s(order.customerPhone).includes(searchTerm) ||
      s(order.id).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || (order.status ?? "pending") === statusFilter;

    return matchesSearch && matchesStatus;
  }) || [];

  // Calculate stats
  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter(o => (o.status ?? "pending") === "pending").length || 0;
  const totalRevenue = orders?.reduce((sum, order) => sum + toNumber(order.total), 0) || 0;
  const deliveryOrders = orders?.filter(o => (o.deliveryMethod ?? "pickup") === "delivery").length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Gestión de Pedidos
            </h1>
            <p className="text-gray-600 mt-2">
              Administra todos los pedidos de {FLORISTERIA_CONFIG.name}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold">{pendingOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold">{formatPrice(totalRevenue)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entregas</p>
                  <p className="text-2xl font-bold">{deliveryOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente, teléfono o ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
            <CardDescription>
              Gestiona el estado de todos los pedidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando pedidos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Entrega</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {s(order.id).slice(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{s(order.customerName)}</p>
                            <p className="text-sm text-gray-500">{s(order.customerPhone)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateCR(order.createdAt)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {formatPrice(order.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {((order.deliveryMethod ?? "pickup") === "delivery") ? (
                              <Truck className="w-4 h-4 mr-1 text-blue-600" />
                            ) : (
                              <Package className="w-4 h-4 mr-1 text-green-600" />
                            )}
                            <span className="text-sm">
                              {(order.deliveryMethod ?? "pickup") === "delivery" ? "Delivery" : "Pickup"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={order.status ?? "pending"} // Radix no acepta null
                            onValueChange={(value) => handleStatusUpdate(s(order.id), value)}
                          >
                            <SelectTrigger className="w-32">
                              <Badge className={statusInfo.color}>
                                {statusInfo.label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Order Detail Modal */}
        <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Detalle del Pedido
              </DialogTitle>
              <DialogDescription>
                ID: {s(selectedOrder?.id)}
              </DialogDescription>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-3">👤</div>
                        <div>
                          <p className="font-medium">{s(selectedOrder.customerName)}</p>
                          <p className="text-sm text-gray-500">Cédula: {s(selectedOrder.customerDocumentId)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-3" />
                        <span>{s(selectedOrder.customerPhone)}</span>
                      </div>
                      {s(selectedOrder.customerEmail) && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-3" />
                          <span>{s(selectedOrder.customerEmail)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Información de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center">
                        {(selectedOrder.deliveryMethod ?? "pickup") === "delivery" ? (
                          <Truck className="w-4 h-4 mr-3 text-blue-600" />
                        ) : (
                          <Package className="w-4 h-4 mr-3 text-green-600" />
                        )}
                        <span className="font-medium">
                          {(selectedOrder.deliveryMethod ?? "pickup") === "delivery" ? "Delivery" : "Recoger en tienda"}
                        </span>
                      </div>
                      {(selectedOrder.deliveryMethod ?? "pickup") === "delivery" && (
                        <>
                          {s(selectedOrder.deliveryAddress) && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-3 mt-1" />
                              <div>
                                <p>{s(selectedOrder.deliveryAddress)}</p>
                                {s(selectedOrder.deliveryCity) && (
                                  <p className="text-sm text-gray-500">{s(selectedOrder.deliveryCity)}</p>
                                )}
                              </div>
                            </div>
                          )}
                          {s(selectedOrder.deliveryReference) && (
                            <div className="pl-7">
                              <p className="text-sm text-gray-600">
                                <strong>Referencia:</strong> {s(selectedOrder.deliveryReference)}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Productos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? (
                      <div className="space-y-3">
                        {(selectedOrder.items as any[]).map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{item.name || `Producto ${index + 1}`}</p>
                              <p className="text-sm text-gray-600">
                                Cantidad: {item.quantity ?? 1}
                              </p>
                            </div>
                            <p className="font-bold">
                              {formatPrice(item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No hay información detallada de productos</p>
                    )}
                  </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{formatPrice(selectedOrder.subtotal)}</span>
                      </div>
                      {toNumber(selectedOrder.discount) > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Descuento:</span>
                          <span>-{formatPrice(selectedOrder.discount)}</span>
                        </div>
                      )}
                      {toNumber(selectedOrder.shippingCost) > 0 && (
                        <div className="flex justify-between">
                          <span>Envío:</span>
                          <span>{formatPrice(selectedOrder.shippingCost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>{formatPrice(selectedOrder.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                {s(selectedOrder.comments) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Comentarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">{s(selectedOrder.comments)}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Order Date and Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Creado: {formatDateCR(selectedOrder.createdAt, true)}</span>
                      </div>
                      <Badge className={getStatusInfo(selectedOrder.status).color}>
                        {getStatusInfo(selectedOrder.status).label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
