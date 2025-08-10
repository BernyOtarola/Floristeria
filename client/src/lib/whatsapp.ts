import type { Product, Coupon } from "@shared/schema";

interface CartItemWithProduct {
  product: Product;
  quantity: number;
  price: number;
}

interface OrderSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

interface OrderDetails {
  deliveryMethod: "pickup" | "delivery";
  customerData: {
    firstName: string;
    lastName: string;
    phone: string;
    documentId: string;
    address?: string;
    city?: string;
    reference?: string;
  };
  comments?: string;
  appliedCoupon?: Coupon | null;
}

export function generateWhatsAppMessage(
  cartItems: CartItemWithProduct[],
  orderSummary: OrderSummary,
  orderDetails?: OrderDetails
): string {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  let message = "🌸 *NUEVO PEDIDO - FloraVista* 🌸\n\n";

  // Customer information (if provided)
  if (orderDetails) {
    message += `👤 *Cliente:* ${orderDetails.customerData.firstName} ${orderDetails.customerData.lastName}\n`;
    message += `📱 *Teléfono:* ${orderDetails.customerData.phone}\n`;
    message += `🆔 *Documento:* ${orderDetails.customerData.documentId}\n\n`;

    // Delivery information
    if (orderDetails.deliveryMethod === "delivery") {
      message += `🚚 *Entrega:* Delivery\n`;
      if (orderDetails.customerData.address) {
        message += `📍 *Dirección:* ${orderDetails.customerData.address}\n`;
      }
      if (orderDetails.customerData.city) {
        message += `🏙️ *Ciudad:* ${orderDetails.customerData.city}\n`;
      }
      if (orderDetails.customerData.reference) {
        message += `📝 *Referencia:* ${orderDetails.customerData.reference}\n`;
      }
    } else {
      message += `🏪 *Entrega:* Recoger en tienda\n`;
    }
    message += "\n";
  }

  // Products
  message += `🛒 *Productos:*\n`;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio unit.: ${formatPrice(parseFloat(item.product.price))}\n`;
    message += `   Subtotal: ${formatPrice(item.price)}\n\n`;
  });

  // Order summary
  message += `💰 *Resumen del Pedido:*\n`;
  message += `   Subtotal: ${formatPrice(orderSummary.subtotal)}\n`;
  
  if (orderSummary.discount > 0) {
    message += `   Descuento: -${formatPrice(orderSummary.discount)}`;
    if (orderDetails?.appliedCoupon) {
      message += ` (Cupón: ${orderDetails.appliedCoupon.code})`;
    }
    message += `\n`;
  }
  
  if (orderSummary.shipping > 0) {
    message += `   Envío: ${formatPrice(orderSummary.shipping)}\n`;
  }
  
  message += `   *TOTAL: ${formatPrice(orderSummary.total)}*\n\n`;

  // Comments
  if (orderDetails?.comments) {
    message += `💬 *Comentarios:* ${orderDetails.comments}\n\n`;
  }

  message += `Gracias por confiar en FloraVista 🌹\n`;
  message += `📞 +57 300 123 4567\n`;
  message += `📍 Calle 123 #45-67, Centro Comercial Plaza, Medellín`;

  return message;
}
