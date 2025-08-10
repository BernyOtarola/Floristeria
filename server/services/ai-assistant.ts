import OpenAI from "openai";

class AIAssistant {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
    });
  }

  async generateResponse(message: string, context?: any): Promise<string> {
    try {
      const systemPrompt = `Eres un asistente virtual amigable y experto para FloraVista, una floristería premium especializada en flores frescas y arreglos únicos. Tu trabajo es ayudar a los clientes con información sobre productos, horarios, servicios de entrega, y recomendaciones florales.

Información de la floristería:
- Nombre: FloraVista
- Especialidad: Flores frescas y arreglos personalizados
- Experiencia: Más de 15 años en el mercado
- Horarios: Lunes - Sábado 8:00 AM - 7:00 PM, Domingo 9:00 AM - 5:00 PM
- Ubicación: Calle 123 #45-67, Centro Comercial Plaza, Medellín, Colombia
- Teléfono: +57 300 123 4567
- Email: info@floravista.com

Categorías de productos:
- Rosas (12 productos disponibles)
- Ramos (18 productos disponibles) 
- Arreglos (15 productos disponibles)
- Ocasiones especiales (24 productos disponibles)

Servicios:
- Delivery con costo de $8.000
- Recogida en tienda (gratis)
- Arreglos personalizados
- Consultoría para eventos especiales

Instrucciones:
- Sé amigable, profesional y útil
- Responde en español
- Proporciona información específica cuando sea posible
- Si no sabes algo, ofrece alternativas como contactar directamente
- Recomienda productos basándose en ocasiones o preferencias
- Mantén las respuestas concisas pero informativas
- Siempre mantén un tono cálido y acogedor`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Lo siento, no pude procesar tu consulta en este momento.";
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  generateQuickResponse(type: string): string {
    const quickResponses = {
      productos: "Tenemos 4 categorías principales: Rosas (12 productos), Ramos (18 productos), Arreglos (15 productos) y Ocasiones especiales (24 productos). ¿Hay alguna categoría específica que te interese?",
      horarios: "Nuestros horarios de atención son: Lunes a Sábado de 8:00 AM a 7:00 PM, y Domingos de 9:00 AM a 5:00 PM. ¿En qué más puedo ayudarte?",
      envios: "Ofrecemos dos opciones: Delivery por $8.000 o recogida gratuita en nuestra tienda ubicada en Calle 123 #45-67, Centro Comercial Plaza, Medellín. ¿Cuál prefieres?",
      ubicacion: "Estamos ubicados en Calle 123 #45-67, Centro Comercial Plaza, Medellín, Colombia. También puedes contactarnos al +57 300 123 4567.",
      contacto: "Puedes contactarnos por WhatsApp al +57 300 123 4567, por email a info@floravista.com, o visitarnos en Calle 123 #45-67, Centro Comercial Plaza, Medellín."
    };

    return quickResponses[type as keyof typeof quickResponses] || "¿En qué puedo ayudarte hoy?";
  }
}

export const aiAssistant = new AIAssistant();
