// Configuración global de Floristería Bribri
export const FLORISTERIA_CONFIG = {
  // Información básica
  name: "Floristería Bribri",
  slogan: "Flores Frescas del Corazón de Talamanca",
  description: "Especialistas en arreglos florales únicos con más de 5 años de experiencia en la región de Bribri.",
  
  // Contacto
  contact: {
    phone: "+506 84630055",
    email: "Fannyaleman0312@gmail.com",
    whatsapp: "+506 84630055",
  },
  
  // Redes sociales
  social: {
    instagram: "https://www.instagram.com/fanny_aleman03/",
    facebook: "https://www.facebook.com/ofir.otarola.7",
  },
  
  // Ubicación
  location: {
    address: "Calle hacia Bribri, alfrente de la municipalidad de Talamanca",
    city: "Bribri",
    province: "Limón",
    country: "Costa Rica",
    googleMaps: "https://maps.app.goo.gl/baMhVCZYVmkh5kcX7?g_st=iw",
    coordinates: {
      lat: 9.6319, // Aproximado para Bribri
      lng: -82.8619
    }
  },
  
  // Horarios
  hours: {
    weekdays: "Lunes - Viernes: 8:00 AM - 5:00 PM",
    weekends: "Sábados: 8:00 AM - 4:00 PM",
    sunday: "Domingos: 9:00 AM - 2:00 PM"
  },
  
  // Servicios
  services: {
    delivery: {
      enabled: true,
      cost: 2000, // En colones costarricenses
      freeThreshold: 15000, // Envío gratis sobre este monto
      areas: ["Bribri", "Sixaola", "Puerto Viejo", "Cahuita"]
    },
    pickup: {
      enabled: true,
      cost: 0
    }
  },
  
  // Configuración de administración
  admin: {
    defaultPassword: "FloBribri2024!", // Cambiar después del primer login
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 horas
  },
  
  // Configuración de moneda
  currency: {
    code: "CRC",
    symbol: "₡",
    name: "Colón Costarricense"
  },
  
  // WhatsApp templates
  whatsapp: {
    businessNumber: "+506 84630055",
    templates: {
      order: "🌺 *NUEVO PEDIDO - Floristería Bribri* 🌺\n\n",
      greeting: "¡Pura Vida! Gracias por contactar Floristería Bribri 🌸",
      location: "📍 Nos encontramos en calle hacia Bribri, al frente de la municipalidad de Talamanca"
    }
  }
};