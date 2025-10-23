// Servidor temporal sin Redis para debugging
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const apiRoutes = require('./src/routes/apiDebug');

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de Middleware
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

// Montaje de Rutas de la API
app.use('/api', apiRoutes);

// Health check básico
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    services: {
      abuseIP: !!process.env.AbuseIP_API_KEY
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en el puerto ${PORT}`);
  console.log(`📡 Aceptando peticiones desde: ${corsOptions.origin}`);
  console.log(`⚠️  Modo DEBUG: Redis deshabilitado temporalmente`);
});