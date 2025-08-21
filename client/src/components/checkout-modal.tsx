import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X, Store, Truck } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/hooks/use-cart";
import { generateWhatsAppMessage } from "@/lib/whatsapp";
import { useToast } from "@/hooks/use-toast";
import { FLORISTERIA_CONFIG, whatsappLink } from "@shared/config";

interface CheckoutModalProps {
  onClose: () => void;
}

type DeliveryMethod = "pickup" | "delivery";

export default function CheckoutModal({ onClose }: CheckoutModalProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [customerData, setCustomerData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    documentId: "",
    address: "",
    city: "",
    reference: "",
  });
  const [comments, setComments] = useState("");
  const { cart, appliedCoupon, clearCart } = useCart();
  const { toast } = useToast();

  const currencyCode = FLORISTERIA_CONFIG.currency.code; // "CRC"
  const currencySymbol = FLORISTERIA_CONFIG.currency.symbol; // "₡"
  const deliveryCfg = FLORISTERIA_CONFIG.services.delivery;

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

  const shipping = useMemo(() => {
    if (deliveryMethod !== "delivery") return 0;
    if (deliveryCfg.enabled !== true) return 0;
    // Envío gratis si supera el umbral
    if (deliveryCfg.freeThreshold && subtotal >= deliveryCfg.freeThreshold) return 0;
    return deliveryCfg.cost ?? 0;
  }, [deliveryMethod, deliveryCfg, subtotal]);

  const total = useMemo(() => subtotal - discount + shipping, [subtotal, discount, shipping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    const required: (keyof typeof customerData)[] = ["firstName", "lastName", "phone", "documentId"];
    if (deliveryMethod === "delivery") {
      required.push("address", "city");
    }
    return required.every((k) => customerData[k].trim() !== "");
  };

  const handleSendWhatsAppOrder = () => {
    if (!validateForm()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const cartItems = cart.map((item) => ({
      product: item.product,
      quantity: item.quantity,
      price: Number(item.product.price) * item.quantity,
    }));

    const orderSummary = {
      subtotal,
      discount,
      shipping,
      total,
    };

    const message = generateWhatsAppMessage(cartItems, orderSummary, {
      deliveryMethod,
      customerData,
      comments,
      appliedCoupon,
    });

    // Usa el número configurado (+506 84630055) desde @shared/config
    const whatsappUrl = whatsappLink(message);
    window.open(whatsappUrl, "_blank");

    toast({
      title: "Pedido enviado",
      description: "Tu pedido ha sido enviado por WhatsApp. Te contactaremos pronto.",
    });

    clearCart();
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-serif font-bold">Finalizar Pedido</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Opciones de entrega */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Opciones de Entrega</h3>
            <RadioGroup
              value={deliveryMethod}
              onValueChange={(value) => setDeliveryMethod(value as DeliveryMethod)}
            >
              <div className="grid grid-cols-2 gap-4">
                <Label className="relative cursor-pointer">
                  <RadioGroupItem value="pickup" className="sr-only" />
                  <div
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      deliveryMethod === "pickup"
                        ? "border-primary bg-pink-50"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    <div className="text-center">
                      <Store className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-medium">Recoger en Tienda</p>
                      <p className="text-sm text-gray-600">Gratis</p>
                    </div>
                  </div>
                </Label>

                <Label className="relative cursor-pointer">
                  <RadioGroupItem value="delivery" className="sr-only" />
                  <div
                    className={`border-2 rounded-lg p-4 transition-colors ${
                      deliveryMethod === "delivery"
                        ? "border-primary bg-pink-50"
                        : "border-gray-300 hover:border-primary"
                    }`}
                  >
                    <div className="text-center">
                      <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                      <p className="font-medium">Delivery</p>
                      <p className="text-sm text-gray-600">
                        {subtotal >= (deliveryCfg.freeThreshold ?? Infinity)
                          ? "Gratis (supera el mínimo)"
                          : formatPrice(deliveryCfg.cost ?? 0)}
                      </p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Datos del cliente */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombres *
                  </Label>
                  <Input
                    type="text"
                    name="firstName"
                    value={customerData.firstName}
                    onChange={handleInputChange}
                    placeholder="Nombres"
                    required
                  />
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos *
                  </Label>
                  <Input
                    type="text"
                    name="lastName"
                    value={customerData.lastName}
                    onChange={handleInputChange}
                    placeholder="Apellidos"
                    required
                  />
                </div>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Celular / WhatsApp *
                </Label>
                <Input
                  type="tel"
                  name="phone"
                  value={customerData.phone}
                  onChange={handleInputChange}
                  placeholder="Tu número de celular"
                  required
                />
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Identificación / Cédula *
                </Label>
                <Input
                  type="text"
                  name="documentId"
                  value={customerData.documentId}
                  onChange={handleInputChange}
                  placeholder="Número de documento"
                  required
                />
              </div>

              {/* Campos para envío a domicilio */}
              {deliveryMethod === "delivery" && (
                <>
                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </Label>
                    <Input
                      type="text"
                      name="address"
                      value={customerData.address}
                      onChange={handleInputChange}
                      placeholder="Dirección completa"
                      required
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad *
                    </Label>
                    <Input
                      type="text"
                      name="city"
                      value={customerData.city}
                      onChange={handleInputChange}
                      placeholder="Ciudad"
                      required
                    />
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia
                    </Label>
                    <Textarea
                      name="reference"
                      value={customerData.reference}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Punto de referencia para facilitar la entrega"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Resumen */}
          <Card className="p-4 mb-8">
            <h3 className="text-lg font-semibold mb-4">Resumen del Pedido</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento ({appliedCoupon.discount}%):</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              {deliveryMethod === "delivery" &&
                deliveryCfg.freeThreshold &&
                subtotal < deliveryCfg.freeThreshold && (
                  <p className="text-xs text-gray-500">
                    Envío gratis sobre {currencySymbol}
                    {deliveryCfg.freeThreshold.toLocaleString("es-CR")}.
                  </p>
                )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total a Pagar:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </Card>

          {/* Comentarios */}
          <div className="mb-8">
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Comentarios al Vendedor
            </Label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              placeholder="Instrucciones especiales, dedicatoria, etc."
            />
          </div>

          {/* Enviar por WhatsApp */}
          <Button
            onClick={handleSendWhatsAppOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-lg py-4"
          >
            <FaWhatsapp className="w-5 h-5 mr-3" />
            Enviar Pedido por WhatsApp
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
