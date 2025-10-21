// backend/src/server.js (CORREGIDO)

require('dotenv').config();

const express = require('express');
const cors = require('cors');

// --- CAMBIO CLAVE: Importamos desde el nuevo módulo de config ---
const { connectRedis } = require('./config/redisClient');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// --- Configuración de Middleware (en el orden correcto) ---
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// --- Montaje de Rutas de la API ---
app.use('/api', apiRoutes);

// --- Función de arranque del servidor ---
const startServer = async () => {
  // Conectamos a Redis ANTES de que el servidor empiece a escuchar
  await connectRedis();
  
  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en el puerto ${PORT}`);
    console.log(`Aceptando peticiones desde el origen: ${corsOptions.origin}`);
  });
};

// --- Ejecutamos el arranque ---
startServer();