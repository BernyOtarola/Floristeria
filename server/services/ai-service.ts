import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

interface ChatMessage {
  message: string;
  context?: {
    isQuickQuestion?: boolean;
  };
}

export async function processAIMessage(message: ChatMessage): Promise<string> {
  try {
    const systemPrompt = `Eres un asistente virtual especializado en FloraVista, una floristería premium colombiana.

INFORMACIÓN DE LA EMPRESA:
- Nombre: FloraVista
- Ubicación: Calle 123 #45-67, Centro Comercial Plaza, Medellín, Colombia
- Teléfono: +57 300 123 4567
- Email: info@floravista.com
- Horarios: Lunes-Sábado 8:00 AM - 7:00 PM, Domingo 9:00 AM - 5:00 PM

PRODUCTOS:
- 4 categorías principales: Rosas, Ramos, Arreglos, Ocasiones Especiales
- Precios en pesos colombianos (COP)
- Flores frescas de alta calidad
- Arreglos personalizados

SERVICIOS:
- Delivery por $8.000 COP
- Recogida gratuita en tienda
- WhatsApp: +57 300 123 4567
- Pedidos por WhatsApp disponibles

PERSONALIDAD:
- Amable y profesional
- Conocedor de flores y arreglos
- Enfocado en ayudar al cliente
- Respuestas en español colombiano
- Conciso pero informativo

Responde siempre como si fueras parte del equipo de FloraVista, con conocimiento profundo sobre flores y un enfoque en brindar excelente servicio al cliente.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message.message }
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "Lo siento, no pude procesar tu mensaje. ¿Puedes intentar de nuevo?";
  } catch (error) {
    console.error("Error processing AI message:", error);
    return "Lo siento, estoy experimentando dificultades técnicas en este momento. Por favor, contacta directamente a nuestro equipo al +57 300 123 4567 para asistencia inmediata.";
  }
}