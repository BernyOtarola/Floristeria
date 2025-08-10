// Script para probar la conexión con OpenAI
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function testOpenAI() {
  console.log('🤖 Probando conexión con OpenAI...\n');
  
  try {
    // Verificar que la API key esté configurada
    if (!process.env.OPENAI_API_KEY) {
      console.log('❌ Error: OPENAI_API_KEY no está configurada en .env');
      return;
    }
    
    console.log('✅ API Key encontrada');
    console.log(`🔑 Key: ${process.env.OPENAI_API_KEY.substring(0, 20)}...`);
    
    // Inicializar cliente OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log('\n🚀 Enviando mensaje de prueba...');
    
    // Enviar mensaje de prueba
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un asistente de FloraVista, una floristería premium. Responde brevemente."
        },
        {
          role: "user", 
          content: "Hola, ¿puedes confirmar que estás funcionando?"
        }
      ],
      max_tokens: 100,
      temperature: 0.7,
    });
    
    console.log('✅ ¡Conexión exitosa con OpenAI!');
    console.log('\n📝 Respuesta del asistente:');
    console.log('-----------------------------------');
    console.log(response.choices[0].message.content);
    console.log('-----------------------------------\n');
    
    console.log('🎉 El asistente IA está listo para usar en FloraVista!');
    
  } catch (error) {
    console.error('❌ Error conectando con OpenAI:');
    
    if (error.code === 'invalid_api_key') {
      console.error('🔑 La API key no es válida. Verifica que esté correcta.');
    } else if (error.code === 'insufficient_quota') {
      console.error('💳 No tienes suficiente crédito en tu cuenta de OpenAI.');
    } else if (error.code === 'rate_limit_exceeded') {
      console.error('⏰ Has excedido el límite de requests. Espera un momento.');
    } else {
      console.error('🌐 Error de conexión:', error.message);
    }
  }
}

// Ejecutar prueba
testOpenAI();