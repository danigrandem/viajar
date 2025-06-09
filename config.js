require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    googleAiApiKey: process.env.GOOGLE_AI_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development',
    cacheEnabled: process.env.CACHE_ENABLED === 'true',
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutos
        max: 100 // límite de 100 peticiones por ventana
    }
};

// Validación de variables de entorno requeridas
const requiredEnvVars = ['GOOGLE_AI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

module.exports = config; 