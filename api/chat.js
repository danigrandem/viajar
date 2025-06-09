const { GoogleGenerativeAI } = require('@google/generative-ai');
const { search } = require('../search');
const logger = require('../utils/logger');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

async function chatWithGemini(message, context = []) {
    try {
        // Buscar contenido relevante usando embeddings
        logger.info('Buscando contenido relevante...');
        const searchResults = await search(message, 5);
        
        if (searchResults.length === 0) {
            return "Lo siento, no tengo información específica sobre ese tema en mi base de datos.";
        }

        // Preparar el contexto con los resultados de búsqueda
        const contextPrompt = `Eres un experto en viajes a Filipinas, amigable y conversacional. Tu objetivo es compartir tu conocimiento de manera natural y personal, como si estuvieras hablando con un amigo.

Información disponible:
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

Pregunta del usuario: ${message}

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
        const result = await chat.sendMessage(contextPrompt);
        const response = await result.response;
        
        logger.info('Respuesta recibida de Gemini');
        return response.text();
    } catch (error) {
        logger.error('Error en chat:', error);
        throw error;
    }
}

module.exports = { chatWithGemini }; 