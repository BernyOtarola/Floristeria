import type { Product, Coupon } from "@shared/schema";
import { FLORISTERIA_CONFIG } from "@shared/config";

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
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: FLORISTERIA_CONFIG.currency.code,
      minimumFractionDigits: 0,
    }).format(price);
  };

  let message = `${FLORISTERIA_CONFIG.whatsapp.templates.order}\n`;

  // Customer information (if provided)
  if (orderDetails) {
    message += `👤 *Cliente:* ${orderDetails.customerData.firstName} ${orderDetails.customerData.lastName}\n`;
    message += `📱 *Teléfono:* ${orderDetails.customerData.phone}\n`;
    message += `🆔 *Cédula:* ${orderDetails.customerData.documentId}\n\n`;

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
      message += `🏪 *Entrega:* Recoger en floristería\n`;
      message += `📍 *Ubicación:* ${FLORISTERIA_CONFIG.location.address}\n`;
    }
    message += "\n";
  }

  // Products
  message += `🌺 *Productos:*\n`;
  cartItems.forEach((item, index) => {
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio unit.: ${formatPrice(
      parseFloat(item.product.price)
    )}\n`;
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
  } else if (orderDetails?.deliveryMethod === "delivery") {
    message += `   Envío: GRATIS 🎉\n`;
  }

  message += `   *TOTAL: ${formatPrice(orderSummary.total)}*\n\n`;

  // Comments
  if (orderDetails?.comments) {
    message += `💬 *Comentarios:* ${orderDetails.comments}\n\n`;
  }

  // Delivery areas info
  if (orderDetails?.deliveryMethod === "delivery") {
    message += `🚚 *Áreas de entrega:* ${FLORISTERIA_CONFIG.services.delivery.areas.join(
      ", "
    )}\n`;
    message += `🆓 *Envío gratis* en pedidos sobre ${formatPrice(
      FLORISTERIA_CONFIG.services.delivery.freeThreshold
    )}\n\n`;
  }

  message += `¡Pura Vida! Gracias por confiar en ${FLORISTERIA_CONFIG.name} 🌺\n`;
  message += `📱 ${FLORISTERIA_CONFIG.contact.whatsapp}\n`;
  message += `📍 ${FLORISTERIA_CONFIG.location.address}\n`;
  message += `🌐 ${FLORISTERIA_CONFIG.location.googleMaps}`;

  return message;
}

// Template para mensajes rápidos del asistente
export function generateQuickWhatsAppMessage(
  productName: string,
  productPrice: string
): string {
  const message =
    `${FLORISTERIA_CONFIG.whatsapp.templates.greeting}\n\n` +
    `Estoy interesado/a en: *${productName}*\n` +
    `Precio: ${productPrice}\n\n` +
    `¿Podrían darme más información?\n\n` +
    `Gracias 🌺`;

  return message;
}
