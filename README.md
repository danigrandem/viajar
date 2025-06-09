# Viajar por Filipinas - Asistente Virtual

Un asistente virtual especializado en viajes a Filipinas, que combina búsqueda semántica con chat interactivo.

## Características

- Búsqueda semántica de contenido sobre Filipinas
- Chat interactivo con Gemini AI
- Sistema de caché para respuestas rápidas
- Interfaz de usuario moderna y responsive
- Rate limiting para proteger la API
- Sistema de logging para monitoreo

## Requisitos

- Node.js 14+
- API Key de Google AI

## Instalación

1. Clonar el repositorio
2. Instalar dependencias: `npm install`
3. Crear archivo `.env` con las variables necesarias:
   ```
   PORT=3000
   GOOGLE_AI_API_KEY=tu_api_key
   NODE_ENV=development
   CACHE_ENABLED=true
   ```
4. Iniciar el servidor: `npm start`

## Desarrollo

- `npm run dev`: Iniciar servidor en modo desarrollo con hot-reload
- `npm test`: Ejecutar tests
- `npm start`: Iniciar servidor en modo producción

## Estructura del Proyecto

```
.
├── api/            # Endpoints de la API
│   └── chat.js     # Lógica del chat
├── public/         # Archivos estáticos
│   ├── css/        # Estilos
│   ├── js/         # JavaScript del cliente
│   └── index.html  # Página principal
├── utils/          # Utilidades
│   └── logger.js   # Sistema de logging
├── config.js       # Configuración
├── server.js       # Servidor principal
└── README.md       # Documentación
```

## API Endpoints

- `POST /api/search`: Búsqueda semántica
- `POST /api/chat`: Chat interactivo
- `GET /health`: Health check
- `GET /`: Página principal

## Características Técnicas

- Caché de respuestas para mejorar el rendimiento
- Rate limiting para proteger la API
- Logging detallado para monitoreo
- Manejo de errores robusto
- Validación de variables de entorno

## Licencia

MIT 