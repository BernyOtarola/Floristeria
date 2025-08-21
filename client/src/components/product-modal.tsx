import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShoppingCart, Minus, Plus, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@shared/schema";
import { FLORISTERIA_CONFIG } from "@shared/config";
import { buildQuickProductMessage, whatsappLink } from "@/lib/whatsapp";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [userRating, setUserRating] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price) || 0;
    const code = FLORISTERIA_CONFIG.currency.code || "CRC";
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const renderStars = (rating: string, reviewCount: number) => {
    const numRating = parseFloat(rating || "0");
    const fullStars = Math.floor(numRating);
    const hasHalfStar = numRating % 1 !== 0;

    return (
      <div className="flex items-center mb-4">
        <div className="flex text-yellow-400">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < fullStars
                  ? "fill-current"
                  : i === fullStars && hasHalfStar
                  ? "fill-current opacity-50"
                  : "text-gray-300"
              }`}
            />
          ))}
        </div>
        <span className="text-gray-600 ml-2">
          ({reviewCount || 0} reseñas)
        </span>
      </div>
    );
  };

  const renderRatingSelector = () => {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calificación
        </label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Star
              key={rating}
              className={`w-6 h-6 cursor-pointer transition-colors ${
                rating <= userRating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
              onClick={() => setUserRating(rating)}
            />
          ))}
        </div>
      </div>
    );
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Producto agregado",
      description: `${product.name} ha sido agregado al carrito.`,
    });
  };

  const handleWhatsAppOrder = () => {
    // Mensaje corto para este producto y cantidad
    const text = buildQuickProductMessage(
      { name: product.name, price: product.price },
      quantity
    );
    // Abre el chat al número configurado en config.ts
    window.open(whatsappLink(text), "_blank");
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-6">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>

            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                {product.name}
              </h2>

              {renderStars(product.rating || "0", product.reviewCount || 0)}

              <p className="text-3xl font-bold text-primary mb-4">
                {formatPrice(product.price)}
              </p>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={decreaseQuantity}
                      className="w-10 h-10 rounded-full"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="text-xl font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={increaseQuantity}
                      className="w-10 h-10 rounded-full"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {renderRatingSelector()}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  className="w-full"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {product.inStock ? "Agregar al Carrito" : "Agotado"}
                </Button>

                <Button
                  onClick={handleWhatsAppOrder}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  <FaWhatsapp className="w-4 h-4 mr-2" />
                  Pedir por WhatsApp
                </Button>
              </div>

              {!product.inStock && (
                <Badge variant="destructive" className="mt-4">
                  Producto Agotado
                </Badge>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}