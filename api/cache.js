const NodeCache = require('node-cache');

const cache = new NodeCache({
    stdTTL: 600, // 10 minutos
    checkperiod: 120 // 2 minutos
});

function getCacheKey(query) {
    return `query:${query}`;
}

async function getCachedResponse(query) {
    const key = getCacheKey(query);
    return cache.get(key);
}

async function setCachedResponse(query, response) {
    const key = getCacheKey(query);
    cache.set(key, response);
}

module.exports = {
    getCachedResponse,
    setCachedResponse
}; 