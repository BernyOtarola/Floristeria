// @shared/config.ts
// Configuración global de Floristería Bribri + utilidades comunes

/** Formateo de moneda CRC */
export const formatCRC = (value: number | string) =>
  new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 0,
  }).format(Number(value));

/** Config principal */
export const FLORISTERIA_CONFIG = {
  // Información básica
  name: "Floristería Bribri",
  slogan: "Flores Frescas del Corazón de Talamanca",
  description:
    "Especialistas en arreglos florales únicos con más de 5 años de experiencia en la región de Bribri.",

  // Contacto
  contact: {
    /** Teléfono para mostrar en la web */
    phoneDisplay: "+506 8463 0055",
    /** Número WhatsApp en formato E.164 SIN '+' ni espacios (requerido por api.whatsapp.com) */
    whatsappDigits: "50684630055",
    /** Correo de contacto/recepción de formularios */
    email: "Fannyaleman0312@gmail.com",
  },

  // Redes sociales
  social: {
    instagram: "https://www.instagram.com/fanny_aleman03/",
    facebook: "https://www.facebook.com/ofir.otarola.7",
  },

  // Ubicación
  location: {
    address:
      "Calle hacia Bribri, al frente de la municipalidad de Talamanca",
    city: "Bribri",
    province: "Limón",
    country: "Costa Rica",
    /** Enlace compartible de Google Maps (como lo usarías en un botón 'Ver en Google Maps') */
      googleMapsShareUrl: "hhttps://maps.app.goo.gl/2LPKdecCJRz3dkwE8ttps://maps.app.goo.gl/hsG8RenGDD8mqvX5A",
    /** Coordenadas aproximadas para mapas/SEO */
    coordinates: {
      lat: 9.6319,
      lng: -82.8619,
    },
  },

  // Horarios
  hours: {
    weekdays: "Lunes - Viernes: 8:00 AM - 5:00 PM",
    weekends: "Sábados: 8:00 AM - 4:00 PM",
    sunday: "Domingos: 9:00 AM - 2:00 PM",
  },

  // Servicios
  services: {
    delivery: {
      enabled: true,
      /** En colones costarricenses */
      cost: 2000,
      /** Envío gratis sobre este monto */
      freeThreshold: 15000,
      areas: ["Bribri", "Sixaola", "Puerto Viejo", "Cahuita"],
    },
    pickup: {
      enabled: true,
      cost: 0,
    },
  },

  // Config de administración (solo referencial)
  admin: {
    defaultEmail: "Fannyaleman0312@gmail.com",
    defaultPassword: "FloBribri2024!", // Cambiar después del primer login
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas
  },

  // Moneda
  currency: {
    code: "CRC",
    symbol: "₡",
    name: "Colón costarricense",
    decimals: 0,
  },

  // WhatsApp templates
  whatsapp: {
    /** Se referencia a contact.whatsappDigits para evitar duplicar */
    get businessNumberDigits() {
      return FLORISTERIA_CONFIG.contact.whatsappDigits;
    },
    templates: {
      order: "🌺 *NUEVO PEDIDO - Floristería Bribri* 🌺\n\n",
      greeting: "¡Pura Vida! Gracias por contactar Floristería Bribri 🌸",
      location:
        "📍 Nos encontramos en calle hacia Bribri, al frente de la municipalidad de Talamanca",
    },
  },
} as const;

/** Helper para construir el link de WhatsApp (con o sin mensaje prellenado) */
export const whatsappLink = (text?: string) =>
  `https://api.whatsapp.com/send?phone=${FLORISTERIA_CONFIG.contact.whatsappDigits}${
    text ? `&text=${encodeURIComponent(text)}` : ""
  }`;

/** Helper para linkear a Google Maps. Si pasas un query, hace búsqueda; si no, usa el enlace compartible. */
export const mapsLink = (query?: string) =>
  query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`
    : FLORISTERIA_CONFIG.location.googleMapsShareUrl;
