// client/src/lib/whatsapp.ts
import type { Product, Coupon } from "@shared/schema";
import { FLORISTERIA_CONFIG } from "@shared/config";

/* ============================
 * Utilidades
 * ============================ */

/** Dígitos del WhatsApp de negocio (sin +, espacios ni guiones) */
export function getWhatsappDigits(): string {
  const digits =
    FLORISTERIA_CONFIG.contact.whatsappDigits ??
    FLORISTERIA_CONFIG.contact.phoneDisplay.replace(/\D/g, "");
  return digits;
}

/** Link a wa.me con texto opcional */
export function whatsappLink(text?: string): string {
  const num = getWhatsappDigits();
  const qs = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${num}${qs}`;
}

/** Formatea a CRC sin decimales (como vienes mostrando en la UI) */
export function formatCRC(n: number): string {
  const code = FLORISTERIA_CONFIG.currency.code || "CRC";
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

/* ============================
 * Mensaje rápido desde un producto (quick view)
 * ============================ */

/** Mensaje corto para pedir 1 producto desde el modal de producto */
export function buildQuickProductMessage(
  p: { name: string; price: string },
  qty: number
) {
  const unit = parseFloat(p.price) || 0;
  const subtotal = unit * qty;

  const lines = [
    `*NUEVO PEDIDO - ${FLORISTERIA_CONFIG.name}*`,
    ``,
    `*Producto:* ${p.name}`,
    `*Cantidad:* ${qty}`,
    `*Precio unitario:* ${formatCRC(unit)}`,
    `*Subtotal:* ${formatCRC(subtotal)}`,
    ``,
    `*Ubicación:* ${FLORISTERIA_CONFIG.location.address}, ${FLORISTERIA_CONFIG.location.city}`,
    FLORISTERIA_CONFIG.location.googleMapsShareUrl
      ? `*Mapa:* ${FLORISTERIA_CONFIG.location.googleMapsShareUrl}`
      : "",
    ``,
    `Gracias por confiar en ${FLORISTERIA_CONFIG.name}.`,
  ].filter(Boolean);

  return lines.join("\n");
}

/* ============================
 * Mensaje detallado (checkout)
 * ============================ */

interface CartItemWithProduct {
  product: Product;
  quantity: number;
  price: number; // subtotal de este ítem (qty * unit)
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

/** Mensaje completo para enviar la orden por WhatsApp (desde el checkout) */
export function generateWhatsAppMessage(
  cartItems: CartItemWithProduct[],
  orderSummary: OrderSummary,
  orderDetails?: OrderDetails
): string {
  const lines: string[] = [];

  // Encabezado / plantilla
  if (FLORISTERIA_CONFIG.whatsapp?.templates?.order) {
    // Aseguramos que no tenga saltos extra al principio
    lines.push(
      FLORISTERIA_CONFIG.whatsapp.templates.order.trim(),
      ""
    );
  } else {
    lines.push(`*NUEVO PEDIDO - ${FLORISTERIA_CONFIG.name}*`, "");
  }

  // Datos del cliente
  if (orderDetails) {
    const { firstName, lastName, phone, documentId, address, city, reference } =
      orderDetails.customerData;

    lines.push(
      `👤 *Cliente:* ${firstName} ${lastName}`,
      `📱 *Teléfono:* ${phone}`,
      `🆔 *Cédula:* ${documentId}`,
      ""
    );

    if (orderDetails.deliveryMethod === "delivery") {
      lines.push(`🚚 *Entrega:* Delivery`);
      if (address) lines.push(`📍 *Dirección:* ${address}`);
      if (city) lines.push(`🏙️ *Ciudad:* ${city}`);
      if (reference) lines.push(`📝 *Referencia:* ${reference}`);
    } else {
      lines.push(
        `🏪 *Entrega:* Recoger en floristería`,
        `📍 *Ubicación:* ${FLORISTERIA_CONFIG.location.address}`
      );
    }
    lines.push("");
  }

  // Productos
  lines.push(`🌺 *Productos:*`);
  cartItems.forEach((item, idx) => {
    const unit = parseFloat(item.product.price) || 0;
    lines.push(
      `${idx + 1}. ${item.product.name}`,
      `   Cantidad: ${item.quantity}`,
      `   Precio unit.: ${formatCRC(unit)}`,
      `   Subtotal: ${formatCRC(item.price)}`,
      ""
    );
  });

  // Resumen
  lines.push(`💰 *Resumen del Pedido:*`);
  lines.push(`   Subtotal: ${formatCRC(orderSummary.subtotal)}`);

  if (orderSummary.discount > 0) {
    const cup =
      orderDetails?.appliedCoupon?.code
        ? ` (Cupón: ${orderDetails.appliedCoupon.code})`
        : "";
    lines.push(`   Descuento: -${formatCRC(orderSummary.discount)}${cup}`);
  }

  if (orderSummary.shipping > 0) {
    lines.push(`   Envío: ${formatCRC(orderSummary.shipping)}`);
  } else if (orderDetails?.deliveryMethod === "delivery") {
    lines.push(`   Envío: GRATIS 🎉`);
  }

  lines.push(`   *TOTAL: ${formatCRC(orderSummary.total)}*`, "");

  // Comentarios
  if (orderDetails?.comments) {
    lines.push(`💬 *Comentarios:* ${orderDetails.comments}`, "");
  }

  // Info de entrega
  if (orderDetails?.deliveryMethod === "delivery") {
    lines.push(
      `🚚 *Áreas de entrega:* ${FLORISTERIA_CONFIG.services.delivery.areas.join(", ")}`,
      `🆓 *Envío gratis* en pedidos sobre ${formatCRC(
        FLORISTERIA_CONFIG.services.delivery.freeThreshold
      )}`,
      ""
    );
  }

  // Cierre
  lines.push(
    `¡Pura Vida! Gracias por confiar en ${FLORISTERIA_CONFIG.name} 🌺`,
    `📱 ${FLORISTERIA_CONFIG.contact.phoneDisplay}`,
    `📍 ${FLORISTERIA_CONFIG.location.address}`,
    FLORISTERIA_CONFIG.location.googleMapsShareUrl
      ? `🌐 ${FLORISTERIA_CONFIG.location.googleMapsShareUrl}`
      : ""
  );

  return lines.filter(Boolean).join("\n");
}

/* ============================
 * Mensaje corto del asistente
 * ============================ */

export function generateQuickWhatsAppMessage(
  productName: string,
  productPrice: string
): string {
  const greeting =
    FLORISTERIA_CONFIG.whatsapp?.templates?.greeting ??
    `¡Hola!`;

  const msg =
    `${greeting}\n\n` +
    `Estoy interesado/a en: *${productName}*\n` +
    `Precio: ${productPrice}\n\n` +
    `¿Podrían darme más información?\n\n` +
    `Gracias 🌺`;

  return msg;
}
