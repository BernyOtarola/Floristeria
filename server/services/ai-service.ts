// server/services/ai-service.ts
import OpenAI from "openai";
import { FLORISTERIA_CONFIG } from "@shared/config";

type ProcessArgs = { message: string; context?: any };

const enabled = !!process.env.OPENAI_API_KEY;
const client = enabled ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }) : null;

function fallback(_text: string) {
  const tel = FLORISTERIA_CONFIG.contact.phoneDisplay;
  const wa = `https://wa.me/${FLORISTERIA_CONFIG.contact.whatsappDigits}`;
  const maps = FLORISTERIA_CONFIG.location.googleMapsShareUrl;
  return (
    `Puedo ayudarte con horarios, ubicación, envíos y productos.\n` +
    `WhatsApp: ${tel} (${wa}) · Ubicación: ${maps}`
  );
}

export async function processAIMessage({ message }: ProcessArgs) {
  if (!enabled || !client) {
    return `¡Hola! Soy el asistente de ${FLORISTERIA_CONFIG.name}. ${fallback(message)}`;
  }

  const system = `
Eres el asistente de ${FLORISTERIA_CONFIG.name} (floristería en ${FLORISTERIA_CONFIG.location.city}, Costa Rica).
Sé breve, cordial y útil.
Información:
- Horarios: ${FLORISTERIA_CONFIG.hours.weekdays}; ${FLORISTERIA_CONFIG.hours.weekends}; ${FLORISTERIA_CONFIG.hours.sunday}
- Dirección: ${FLORISTERIA_CONFIG.location.address} (Maps: ${FLORISTERIA_CONFIG.location.googleMapsShareUrl})
- WhatsApp: ${FLORISTERIA_CONFIG.contact.phoneDisplay}
- Envíos a: ${FLORISTERIA_CONFIG.services.delivery.areas.join(", ")}; costo CRC ${FLORISTERIA_CONFIG.services.delivery.cost}, gratis sobre CRC ${FLORISTERIA_CONFIG.services.delivery.freeThreshold}.
Cuando te pidan comprar o pedir, sugiere escribir por WhatsApp con el enlace: https://wa.me/${FLORISTERIA_CONFIG.contact.whatsappDigits}
Evita respuestas largas.
`;

  try {
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: message || "" },
      ],
      temperature: 0.3,
    });
    const text = chat.choices[0]?.message?.content?.trim();
    return text || fallback(message);
  } catch {
    return fallback(message);
  }
}