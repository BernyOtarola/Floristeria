import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  Eye,
  Star,
  Filter,
  Download,
  Upload,
  Image as ImageIcon,
  Save,
  X,
} from "lucide-react";
import AdminLayout from "@/components/admin-layout";
import { FLORISTERIA_CONFIG } from "@shared/config";
import type { Product, Category } from "@shared/schema";

interface ProductFormData {
  name: string;
  price: string;
  description: string;
  image: string;
  categoryId: string;
  inStock: boolean;
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    price: "",
    description: "",
    image: "",
    categoryId: "",
    inStock: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  // Create product mutation
  const createProductMutation = useMutation({
    mutationFn: async (productData: ProductFormData) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Error creando producto");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "✅ Producto creado",
        description: "El producto ha sido agregado exitosamente al catálogo.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "No se pudo crear el producto. Verifica los datos.",
        variant: "destructive",
      });
    },
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: { id: string } & ProductFormData) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error("Error actualizando producto");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      resetForm();
      toast({
        title: "✅ Producto actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "No se pudo actualizar el producto.",
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error eliminando producto");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "✅ Producto eliminado",
        description: "El producto ha sido eliminado del catálogo.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Error",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: FLORISTERIA_CONFIG.currency.code,
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      categoryId: "",
      inStock: true,
    });
    setImagePreview("");
  };

  const handleInputChange = (field: keyof ProductFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Update image preview
    if (field === "image" && typeof value === "string") {
      setImagePreview(value);
    }
  };

  const handleCreateProduct = () => {
    if (!formData.name || !formData.price || !formData.categoryId) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Completa nombre, precio y categoría como mínimo.",
        variant: "destructive",
      });
      return;
    }

    createProductMutation.mutate(formData);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      image: product.image,
      categoryId: product.categoryId || "",
      inStock: product.inStock ?? true,
    });
    setImagePreview(product.image);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;

    updateProductMutation.mutate({
      id: editingProduct.id,
      ...formData,
    });
  };

  const handleDeleteProduct = (product: Product) => {
    deleteProductMutation.mutate(product.id);
  };

  // Filter products
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in-stock" && product.inStock) ||
                        (stockFilter === "out-of-stock" && !product.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Sin categoría";
    return categories?.find(cat => cat.id === categoryId)?.name || "Sin categoría";
  };

  const productStats = {
    total: products?.length || 0,
    inStock: products?.filter(p => p.inStock).length || 0,
    outOfStock: products?.filter(p => !p.inStock).length || 0,
    avgPrice: products?.length ? 
      products.reduce((sum, p) => sum + parseFloat(p.price), 0) / products.length : 0
  };

  const ProductDialog = ({ 
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Package className="w-5 h-5 mr-2" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre del Producto *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Ramo de Rosas Rojas"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-medium">
                Precio ({FLORISTERIA_CONFIG.currency.symbol}) *
              </Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="15000"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría *
            </Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center">
                      <i className={`${category.icon} mr-2`} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Image Section */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Imagen del Producto</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  URL de la imagen (recomendado: Unsplash, tamaño 600x600px)
                </p>
              </div>
              
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-32 object-cover rounded-lg border"
                    onError={() => setImagePreview("")}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => {
                      handleInputChange("image", "");
                      setImagePreview("");
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe el producto, ocasiones especiales, características..."
              rows={4}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded-lg">
            <Switch
              id="inStock"
              checked={formData.inStock}
              onCheckedChange={(checked) => handleInputChange("inStock", checked)}
            />
            <Label htmlFor="inStock" className="text-sm font-medium">
              Producto disponible en inventario
            </Label>
          </div>
          
          {/* Preview Card */}
          {formData.name && formData.price && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium mb-2">Vista Previa:</h4>
              <div className="bg-white rounded-lg shadow-sm p-4 max-w-xs">
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded mb-2" />
                )}
                <h3 className="font-semibold line-clamp-2">{formData.name}</h3>
                <p className="text-primary font-bold text-lg">{formatPrice(formData.price || "0")}</p>
                <Badge variant={formData.inStock ? "default" : "destructive"} className="mt-1">
                  {formData.inStock ? "Disponible" : "Agotado"}
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={onSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Producto
              </>
            )}
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
              🌺 Gestión de Productos
            </h1>
            <p className="text-gray-600 mt-2">
              Administra el catálogo de flores de {FLORISTERIA_CONFIG.name}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">{productStats.total}</p>
                </div>
                <Package className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Stock</p>
                  <p className="text-2xl font-bold text-green-600">{productStats.inStock}</p>
                </div>
                <Eye className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agotados</p>
                  <p className="text-2xl font-bold text-red-600">{productStats.outOfStock}</p>
                </div>
                <Package className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold">{formatPrice(productStats.avgPrice)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <i className={`${category.icon} mr-2`} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los productos</SelectItem>
                  <SelectItem value="in-stock">Solo en stock</SelectItem>
                  <SelectItem value="out-of-stock">Solo agotados</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setStockFilter("all");
              }}>
                <Filter className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Catálogo de Productos ({filteredProducts.length})
            </CardTitle>
            <CardDescription>
              Gestiona todos los productos de tu catálogo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron productos</p>
                <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Primer Producto
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-flower.jpg';
                            }}
                          />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(product.categoryId)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.inStock ? "default" : "destructive"}>
                          {product.inStock ? "Disponible" : "Agotado"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          {product.rating || "0.0"} ({product.reviewCount || 0})
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Estás a punto de eliminar "{product.name}". 
                                  Esta acción no se puede deshacer.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProduct(product)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Product Dialog */}
        <ProductDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Crear Nuevo Producto"
          description="Agrega un nuevo producto al catálogo de la floristería."
          onSave={handleCreateProduct}
          isLoading={createProductMutation.isPending}
        />

        {/* Edit Product Dialog */}
        <ProductDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar Producto"
          description="Modifica la información del producto."
          onSave={handleUpdateProduct}
          isLoading={updateProductMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}