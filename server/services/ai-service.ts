import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// Temporalmente deshabilitado - descomentar cuando tengas OpenAI configurado
// const openai = new OpenAI({ 
//   apiKey: process.env.OPENAI_API_KEY 
// });

interface ChatMessage {
  message: string;
  context?: {
    isQuickQuestion?: boolean;
  };
}

export async function processAIMessage(message: ChatMessage): Promise<string> {
  // Respuestas simuladas hasta que OpenAI esté configurado
  console.log('🤖 Procesando mensaje (modo simulado):', message.message);
  
  try {
    // Respuestas predefinidas para simular el asistente
    const quickResponses: { [key: string]: string } = {
      'hola': '¡Hola! Bienvenido a FloraVista. Soy tu asistente virtual. ¿En qué puedo ayudarte?',
      'productos': 'Tenemos 4 categorías principales: Rosas (12 productos), Ramos (18 productos), Arreglos (15 productos) y Ocasiones especiales (24 productos).',
      'horarios': 'Nuestros horarios son: Lunes a Sábado de 8:00 AM a 7:00 PM, y Domingos de 9:00 AM a 5:00 PM.',
      'ubicacion': 'Estamos ubicados en Calle 123 #45-67, Centro Comercial Plaza, Medellín, Colombia.',
      'envios': 'Ofrecemos delivery por $8.000 COP o recogida gratuita en tienda.',
      'contacto': 'Puedes contactarnos por WhatsApp al +57 300 123 4567.',
      'precios': 'Nuestros precios van desde $38.000 hasta $65.000 COP dependiendo del arreglo.',
      'cupones': 'Tenemos cupones disponibles: FLORES10 (10%), PRIMAVERA15 (15%), AMOR20 (20%).'
    };

    const userMessage = message.message.toLowerCase();
    
    // Buscar respuesta que coincida
    for (const [key, response] of Object.entries(quickResponses)) {
      if (userMessage.includes(key)) {
        return `${response} (Nota: Asistente en modo demo - OpenAI no configurado)`;
      }
    }
    
    // Respuesta por defecto
    return `Gracias por tu mensaje: "${message.message}". Soy el asistente de FloristeriaValeska en modo demo. Las funciones completas de IA estarán disponibles cuando se configure OpenAI. ¿Puedo ayudarte con información sobre productos, horarios, ubicación o envíos?`;
    
  } catch (error) {
    console.error("Error en asistente simulado:", error);
    return "Disculpa, hay un problema técnico. Por favor contacta directamente al +506 84630055.";
  }
}