const { GoogleGenerativeAI } = require('@google/generative-ai');
const { search } = require('../search');
const logger = require('../utils/logger');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function chatWithGemini(message, context = [], onChunk) {
    try {
        // Buscar contenido relevante usando embeddings
        logger.info('Buscando contenido relevante...');
        const searchResults = await search(message, 5);
        
        if (searchResults.length === 0) {
            return "Lo siento, no tengo información específica sobre ese tema en mi base de datos.";
        }

        // Preparar el contexto con los resultados de búsqueda
        const contextPrompt = `Eres un experto en viajes a Filipinas, amigable y conversacional. Tu objetivo es compartir tu conocimiento de manera natural y personal, como si estuvieras hablando con un amigo.

IMPORTANTE - CONTEXTO DE LA CONVERSACIÓN:
${context.length > 0 ? 'Conversación anterior:\n' + context.map(msg => 
    `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.parts[0].text}`
).join('\n') : 'Esta es la primera pregunta.'}

Información adicional disponible:
${searchResults.map(r => r.text).join('\n\n')}

Instrucciones para responder:
1. Habla de manera profesional y conversacional, como si estuvieras compartiendo tu experiencia personal
2. Evita frases como "la información disponible indica" o "según los datos"
3. Si la pregunta es sobre una lista (como hoteles, resorts, etc.):
   - Comparte la información de manera natural, como si estuvieras recomendando lugares a un amigo
   - Incluye precios cuando los sepas
   - Menciona ubicaciones específicas
   - Comparte las calificaciones y opiniones
   - Organiza la información por categorías si tiene sentido

4. Formato de respuesta:
   - Usa un tono conversacional y amigable
   - Incluye precios en euros (€) de manera natural
   - Menciona ubicaciones específicas como si las conocieras
   - Destaca las características especiales que te parecen más interesantes
   - Usa saltos de línea para separar párrafos y secciones
   - Usa viñetas o números para listas
   - Deja una línea en blanco entre secciones principales

5. Si la pregunta es sobre hoteles o resorts:
   - Organiza por categorías (lujo, precio medio, etc.)
   - Comparte los precios por noche de manera natural
   - Menciona las ubicaciones como si las conocieras
   - Destaca las características que te parecen más especiales
   - Incluye las puntuaciones de otros viajeros
   - Usa saltos de línea para separar cada resort/hotel
   - Deja una línea en blanco entre categorías

6. Estructura visual:
   - Comienza con una introducción amigable
   - Usa saltos de línea para separar párrafos
   - Deja una línea en blanco entre secciones principales
   - Usa viñetas o números para listas
   - Termina con una conclusión o recomendación personal

7. Dueños
  - Si la pregunta es sobre quienes somos, hablar de claudia y jairo, que son los dueños de la empresa
8. Si la pregunta es sobre dinero o cambiar dinero, hablar sobre remitly

9. Contexto de la conversación:
   - SIEMPRE mantén la coherencia con las respuestas anteriores
   - SIEMPRE refiérete a la información mencionada anteriormente
   - SIEMPRE usa los lugares específicos mencionados antes como referencia
   - SIEMPRE profundiza en la información previamente mencionada
   - SIEMPRE mantén la lista de lugares mencionados en la conversación
   - SIEMPRE responde basándote en los lugares ya mencionados si la pregunta es de seguimiento
   - NO introduzcas nuevos lugares a menos que el usuario lo pida específicamente
   - NO cambies de tema a menos que el usuario lo pida

Pregunta del usuario: ${message}

IMPORTANTE: Si la pregunta es de seguimiento o pide más detalles sobre algo mencionado anteriormente, DEBES mantener la coherencia con la conversación anterior y referirte específicamente a los lugares o información ya mencionados.

Responde de manera natural y conversacional, como si estuvieras compartiendo tu experiencia personal con un amigo. Asegúrate de usar saltos de línea y formato visual para hacer la respuesta más legible.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Configurar el chat con el contexto histórico y los resultados de búsqueda
        const chat = model.startChat({
            history: context,
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
            },
        });

        // Enviar el mensaje con el contexto
        logger.info('Enviando mensaje a Gemini...');
        const result = await chat.sendMessageStream(contextPrompt);
        let fullResponse = '';

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            fullResponse += chunkText;
            if (onChunk) {
                onChunk(chunkText);
            }
        }

        logger.info('Respuesta recibida de Gemini');
        return fullResponse;
    } catch (error) {
        logger.error('Error en chat:', error);
        throw error;
    }
}

module.exports = { chatWithGemini }; 