import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Coupon } from "@shared/schema";
import { FLORISTERIA_CONFIG, whatsappLink } from "@shared/config";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  onProceedToCheckout,
}: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, appliedCoupon, applyCoupon } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const { toast } = useToast();

  const currencyCode = FLORISTERIA_CONFIG.currency.code; // "CRC"
  const currencySymbol = FLORISTERIA_CONFIG.currency.symbol; // "₡"

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0),
    [cart]
  );

  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return (subtotal * Number(appliedCoupon.discount)) / 100;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => subtotal - discount, [subtotal, discount]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    try {
      const response = await fetch(`/api/coupons/${encodeURIComponent(couponCode.trim())}`);
      if (response.ok) {
        const coupon: Coupon = await response.json();
        applyCoupon(coupon);
        toast({
          title: "Cupón aplicado",
          description: `Descuento del ${coupon.discount}% aplicado exitosamente.`,
        });
        setCouponCode("");
      } else {
        toast({
          title: "Cupón inválido",
          description: "El código de cupón no es válido o ha expirado.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error al validar el cupón.",
        variant: "destructive",
      });
    }
  };

  const handleQtyDecrease = (id: string, current: number) => {
    if (current <= 1) {
      removeFromCart(id);
    } else {
      updateQuantity(id, current - 1);
    }
  };

  // Mensaje listo para WhatsApp (número tomado del config)
  const waMessage = useMemo(() => {
    const lines: string[] = [];

    lines.push("🌺 *NUEVO PEDIDO - Floristería Bribri* 🌺", "");
    if (cart.length) {
      lines.push("*Productos:*");
      cart.forEach((item, idx) => {
        const unit = Number(item.product.price);
        lines.push(
          `${idx + 1}. ${item.product.name}  Cantidad: ${item.quantity}  Precio unit.: ${currencySymbol}${unit.toLocaleString("es-CR")}`
        );
      });
      lines.push("");
    }

    lines.push(
      `*Subtotal:* ${currencySymbol}${subtotal.toLocaleString("es-CR")}`
    );
    if (discount > 0) {
      lines.push(
        `*Descuento:* -${currencySymbol}${discount.toLocaleString("es-CR")}`
      );
    }
    lines.push(`*TOTAL:* ${currencySymbol}${total.toLocaleString("es-CR")}`, "");

    lines.push(
      "¡Pura Vida! Gracias por confiar en Floristería Bribri 🌸",
      `📞 ${FLORISTERIA_CONFIG.contact.phoneDisplay}`,
      `📍 ${FLORISTERIA_CONFIG.location.address}`,
      FLORISTERIA_CONFIG.location.googleMapsShareUrl
    );

    return lines.join("\n");
  }, [cart, subtotal, discount, total, currencySymbol]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div
        className={`fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-serif font-bold">Carrito de Compras</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 mb-6 pb-6 border-b"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 line-clamp-2">
                        {item.product.name}
                      </h3>
                      <p className="text-primary font-semibold">
                        {formatPrice(Number(item.product.price))}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => handleQtyDecrease(item.id, item.quantity)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="w-8 h-8"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                {/* Coupon Section */}
                <div className="mb-6">
                  <div className="flex space-x-2">
                    <Input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Código de cupón"
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <Button
                      onClick={handleApplyCoupon}
                      className="bg-secondary hover:bg-secondary/90"
                    >
                      Aplicar
                    </Button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      Cupón "{appliedCoupon.code}" aplicado (
                      {appliedCoupon.discount}% desc.)
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <Card className="p-4 mb-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento:</span>
                        <span>-{formatPrice(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>

          {cart.length > 0 && (
            <div className="p-6 border-t space-y-2">
              <Button onClick={onProceedToCheckout} className="w-full">
                Proceder al Checkout
              </Button>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
