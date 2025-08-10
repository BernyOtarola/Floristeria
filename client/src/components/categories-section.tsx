import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import type { Category, Product } from "@shared/schema";

interface CategoriesSectionProps {
  onProductSelect: (product: Product) => void;
}

export default function CategoriesSection({ onProductSelect }: CategoriesSectionProps) {
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const renderStars = (rating: string, reviewCount: number) => {
    const numRating = parseFloat(rating);
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center mb-2">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < fullStars 
                  ? "fill-current" 
                  : i === fullStars && hasHalfStar 
                    ? "fill-current opacity-50" 
                    : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600 ml-1">({reviewCount})</span>
      </div>
    );
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  if (categoriesLoading || productsLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
              Cargando...
            </h2>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="catalogo" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">
            Nuestras Categorías
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora nuestra amplia selección de flores y arreglos para todas tus ocasiones especiales
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {categories?.map((category) => (
            <div key={category.id} className="group cursor-pointer category-card">
              <div className={`bg-gradient-to-br ${category.color} rounded-xl p-6 text-center hover:shadow-lg transition-all transform hover:scale-105`}>
                <i className={`${category.icon} text-4xl text-primary mb-4`} />
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{category.productCount} productos</p>
              </div>
            </div>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products?.map((product) => (
            <Card 
              key={product.id}
              className="product-card cursor-pointer overflow-hidden hover:shadow-xl transition-all transform hover:scale-105"
              onClick={() => onProductSelect(product)}
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {product.name}
                </h3>
                {renderStars(product.rating || "0", product.reviewCount || 0)}
                <p className="text-primary font-bold text-lg">
                  {formatPrice(product.price)}
                </p>
                {!product.inStock && (
                  <Badge variant="destructive" className="mt-2">
                    Agotado
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}