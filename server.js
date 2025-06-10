const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { search } = require('./search');
const { chatWithGemini } = require('./api/chat');
const { getCachedResponse, setCachedResponse } = require('./api/cache');
const logger = require('./utils/logger');
const config = require('./config');

// Almacenamiento en memoria para el contexto de las conversaciones
const conversationContexts = new Map();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Search API endpoint with caching
app.post('/api/search', async (req, res) => {
    try {
        const { query } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Check cache first
        if (config.cacheEnabled) {
            const cachedResponse = await getCachedResponse(query);
            if (cachedResponse) {
                return res.json(cachedResponse);
            }
        }
        
        const results = await search(query);
        
        // Cache the results
        if (config.cacheEnabled) {
            await setCachedResponse(query, results);
        }

        res.json(results);
    } catch (error) {
        logger.error('Search error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Obtener o crear el contexto de la conversación
        let context = conversationContexts.get(sessionId) || [];
        
        const response = await chatWithGemini(message, context);
        
        // Actualizar el contexto con el nuevo mensaje y respuesta
        context.push(
            { role: "user", parts: [{ text: message }] },
            { role: "model", parts: [{ text: response }] }
        );
        
        // Limitar el tamaño del contexto a los últimos 10 mensajes
        if (context.length > 20) {
            context = context.slice(-20);
        }
        
        // Guardar el contexto actualizado
        conversationContexts.set(sessionId, context);

        res.json({ response });
    } catch (error) {
        logger.error('Chat error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html'));
});

app.listen(config.port, () => {
    logger.info(`Server running at http://localhost:${config.port}`);
}); 