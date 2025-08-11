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
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Edit,
  Trash2,
  Tag,
  Package,
} from "lucide-react";
import AdminLayout from "@/components/admin-layout";
import type { Category } from "@shared/schema";

const iconOptions = [
  { value: "fas fa-rose", label: "Rosa", preview: "🌹" },
  { value: "fas fa-leaf", label: "Hoja", preview: "🍃" },
  { value: "fas fa-seedling", label: "Planta", preview: "🌱" },
  { value: "fas fa-gift", label: "Regalo", preview: "🎁" },
  { value: "fas fa-heart", label: "Corazón", preview: "❤️" },
  { value: "fas fa-star", label: "Estrella", preview: "⭐" },
];

const colorOptions = [
  { value: "from-pink-100 to-pink-200", label: "Rosa", color: "#fce7f3" },
  { value: "from-green-100 to-green-200", label: "Verde", color: "#dcfce7" },
  { value: "from-yellow-100 to-orange-200", label: "Naranja", color: "#fef3c7" },
  { value: "from-purple-100 to-pink-200", label: "Morado", color: "#f3e8ff" },
  { value: "from-blue-100 to-blue-200", label: "Azul", color: "#dbeafe" },
  { value: "from-red-100 to-red-200", label: "Rojo", color: "#fee2e2" },
];

interface CategoryFormData {
  name: string;
  icon: string;
  color: string;
}

export default function AdminCategories() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    icon: "",
    color: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch categories
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/admin/categories"],
  });

  // Create category mutation
  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: CategoryFormData) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Error creando categoría");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente.",
      });
    },
  });

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...categoryData }: { id: string } & CategoryFormData) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error("Error actualizando categoría");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setIsEditDialogOpen(false);
      setEditingCategory(null);
      resetForm();
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente.",
      });
    },
  });

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error eliminando categoría");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente.",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      color: "",
    });
  };

  const handleInputChange = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateCategory = () => {
    if (!formData.name || !formData.icon || !formData.color) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos.",
        variant: "destructive",
      });
      return;
    }

    createCategoryMutation.mutate(formData);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory) return;

    updateCategoryMutation.mutate({
      id: editingCategory.id,
      ...formData,
    });
  };

  const handleDeleteCategory = (category: Category) => {
    if (category.productCount && category.productCount > 0) {
      toast({
        title: "No se puede eliminar",
        description: "Esta categoría tiene productos asociados.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`¿Estás seguro de que quieres eliminar "${category.name}"?`)) {
      deleteCategoryMutation.mutate(category.id);
    }
  };

  const CategoryDialog = ({ 
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
            <Label htmlFor="name">Nombre de la Categoría</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Rosas, Ramos, Arreglos..."
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="icon">Ícono</Label>
            <Select value={formData.icon} onValueChange={(value) => handleInputChange("icon", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un ícono" />
              </SelectTrigger>
              <SelectContent>
                {iconOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.preview} {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="color">Color de Fondo</Label>
            <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un color" />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-2" 
                        style={{ backgroundColor: option.color }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Preview */}
          {formData.name && formData.icon && formData.color && (
            <div className="border rounded-lg p-4">
              <Label className="text-sm text-gray-600">Vista Previa:</Label>
              <div className={`bg-gradient-to-br ${formData.color} rounded-xl p-4 text-center mt-2`}>
                <i className={`${formData.icon} text-2xl text-primary mb-2`} />
                <h3 className="font-semibold text-gray-900">{formData.name}</h3>
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
              Gestión de Categorías
            </h1>
            <p className="text-gray-600 mt-2">
              Organiza los productos en categorías para facilitar la navegación
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Tag className="h-8 w-8 text-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categorías</p>
                  <p className="text-2xl font-bold">{categories?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Productos</p>
                  <p className="text-2xl font-bold">
                    {categories?.reduce((sum, cat) => sum + (cat.productCount || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Categorías</CardTitle>
            <CardDescription>
              Gestiona las categorías para organizar tu catálogo de productos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando categorías...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories?.map((category) => (
                  <Card key={category.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`bg-gradient-to-br ${category.color} rounded-xl p-4 text-center mb-4`}>
                        <i className={`${category.icon} text-3xl text-primary mb-2`} />
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {category.productCount || 0} productos
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {category.productCount || 0} productos
                        </Badge>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCategory(category)}
                            className="text-red-600 hover:text-red-700"
                            disabled={(category.productCount || 0) > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Category Dialog */}
        <CategoryDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="Crear Nueva Categoría"
          description="Agrega una nueva categoría para organizar tus productos."
          onSave={handleCreateCategory}
          isLoading={createCategoryMutation.isPending}
        />

        {/* Edit Category Dialog */}
        <CategoryDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="Editar Categoría"
          description="Modifica la información de la categoría."
          onSave={handleUpdateCategory}
          isLoading={updateCategoryMutation.isPending}
        />
      </div>
    </AdminLayout>
  );
}