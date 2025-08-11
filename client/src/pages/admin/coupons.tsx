import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Ticket,
  Copy,
  Calendar,
  Percent
} from "lucide-react";
import AdminLayout from "@/components/admin-layout";
import { FLORISTERIA_CONFIG } from "@shared/config";
import type { Coupon } from "@shared/schema";

interface CouponFormData {
  code: string;
  discount: string;
  isActive: boolean;
}

export default function AdminCoupons() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<CouponFormData>({
    code: "",
    discount: "",
    isActive: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch coupons
  const { data: coupons, isLoading } = useQuery<Coupon[]>({
    queryKey: ["/api/admin/coupons"],
  });

  // Create coupon mutation
  const createCouponMutation = useMutation({
    mutationFn: async (couponData: CouponFormData) => {
      const response = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error("Error creando cupón");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Cupón creado",
        description: "El cupón ha sido creado exitosamente.",
      });
    },
  });

  // Update coupon mutation
  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, ...couponData }: { id: string } & CouponFormData) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(couponData),
      });
      if (!response.ok) throw new Error("Error actualizando cupón");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      setIsEditDialogOpen(false);
      setEditingCoupon(null);
      resetForm();
      toast({
        title: "Cupón actualizado",
        description: "El cupón ha sido actualizado exitosamente.",
      });
    },
  });

  // Delete coupon mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error eliminando cupón");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/coupons"] });
      toast({
        title: "Cupón eliminado",
        description: "El cupón ha sido eliminado exitosamente.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      code: "",
      discount: "",
      isActive: true,
    });
  };

  const handleInputChange = (field: keyof CouponFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCouponCode = () => {
    const codes = ['FLORES', 'BRIBRI', 'AMOR', 'PRIMAVERA', 'ESPECIAL'];
    const numbers = ['10', '15', '20', '25'];
    const randomCode = codes[Math.floor(Math.random() * codes.length)];
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    setFormData(prev => ({ ...prev, code: `${randomCode}${randomNumber}` }));
  };

  const handleCreateCoupon = () => {
    if (!formData.code || !formData.discount) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    const discount = parseFloat(formData.discount);
    if (discount <= 0 || discount > 100) {
      toast({
        title: "Descuento inválido",
        description: "El descuento debe ser entre 1% y 100%.",
        variant: "destructive",
      });
      return;
    }

    createCouponMutation.mutate(formData);
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      isActive: coupon.isActive ?? true,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCoupon = () => {
    if (!editingCoupon) return;

    updateCouponMutation.mutate({
      id: editingCoupon.id,
      ...formData,
    });
  };

  const handleDeleteCoupon = (coupon: Coupon) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el cupón "${coupon.code}"?`)) {
      deleteCouponMutation.mutate(coupon.id);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado",
      description: `El código "${code}" ha sido copiado al portapapeles.`,
    });
  };

  const filteredCoupons = coupons?.filter(coupon =>
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeCoupons = coupons?.filter(c => c.isActive).length || 0;
  const totalDiscount = coupons?.reduce((sum, c) => sum + parseFloat(c.discount), 0) || 0;

  const CouponDialog = ({ 
    isOpen, 
    onOpenChange, 
    title, 
    description, 
    onSave, 
    isLoading 
  }: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onSave: () => void;
    isLoading: boolean;
  }) => (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="code">Código del Cupón</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
                placeholder="FLORES20"
                className="uppercase"
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCouponCode}
                className="shrink-0"
              >
                <Ticket className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="discount">Descuento (%)</Label>
            <Input
              id="discount"
              type="number"
              min="1"
              max="100"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", e.target.value)}
              placeholder="20"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
            <Label htmlFor="active">Cupón activo</Label>
          </div>

          {/* Preview */}
          {formData.code && formData.discount && (
            <div className="border rounded-lg p-4 bg-gradient-to-r from-pink-50 to-green-50">
              <Label className="text-sm text-gray-600">Vista Previa:</Label>
              <div className="mt-2 text-center">
                <div className="font-bold text-lg">{formData.code}</div>
                <div className="text-primary text-2xl font-bold">{formData.discount}% OFF</div>
                <div className="text-sm text-gray-600">
                  en tu próxima compra
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">
              Gestión de Cupones
            </h1>
            <p className="text-gray-600 mt-2">
              Administra códigos de descuento para {FLORISTERIA_CONFIG.name}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cupón
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Ticket className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cupones</p>
                  <p className="text-2xl font-bold">{coupons?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Cupones Activos</p>
                  <p className="text-2xl font-bold">{activeCoupons}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Percent className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Descuento Promedio</p>
                  <p className="text-2xl font-bold">
                    {coupons?.length ? Math.round(totalDiscount / coupons.length) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar cupones por código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Coupons Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cupones</CardTitle>
            <CardDescription>
              Gestiona todos los códigos de descuento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando cupones...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Descuento</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Creación</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold">{coupon.code}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyCouponCode(coupon.code)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Percent className="w-4 h-4 mr-1 text-green-600" />
                          <span className="font-bold text-green-600">{coupon.discount}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                          {coupon.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(coupon.createdAt).toLocaleDateString("es-CR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCoupon(coupon)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Coupon Dialog */}
        <CouponDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Crear Nuevo Cupón"
          description="Agrega un nuevo código de descuento para los clientes."
          onSave={handleCreateCoupon}
          isLoading={createCouponMutation.isPending}
        />

        {/* Edit Coupon Dialog */}
        <CouponDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar Cupón"
          description="Modifica la información del cupón."
          onSave={handleUpdateCoupon}
          isLoading={updateCouponMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}