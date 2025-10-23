// backend/src/server.js (CORREGIDO)

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { connectRedis } = require('./config/redisClient');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuración de Middleware (en el orden correcto) ---
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

const categoryMap = {
  '9': 'DNS Compromise',
  '10': 'DNS Poisoning',
  '11': 'Fraud Orders',
  '12': 'DDoS Attack',
  '13': 'FTP Brute-Force',
  '14': 'Port Scan',
  '15': 'Hacking',
  '16': 'SQL Injection',
  '17': 'Email Spam',
  '18': 'Brute-Force',
  '19': 'Bad Web Bot',
  '20': 'Exploited Host',
  '21': 'Web App Attack',
  '22': 'SSH',
  '23': 'IoT Targeted',
};

// --- Montaje de Rutas de la API ---
app.use('/api', apiRoutes);

// Servir página de prueba
app.get('/api/ip-report/:ip', async (req, res) => {
  const { ip } = req.params;
  const apiKey = process.env.ABUSEIPDB_API_KEY;

  if (!apiKey) {
    console.error('Error: ABUSEIPDB_API_KEY no está definida en .env');
    return res.status(500).json({ error: 'Configuración del servidor incompleta.' });
  }
  
  try {
    const response = await axios.get('https://api.abuseipdb.com/api/v2/check', {
      params: {
        ipAddress: ip,
        maxAgeInDays: 90,
      },
      headers: {
        'Accept': 'application/json',
        'Key': apiKey,
      },
    });

    // Lógica de agregación
    const categoryCounts = {};
    response.data.data.reports.forEach(report => {
      report.categories.forEach(categoryId => {
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      });
    });

    // Mapeo de IDs a Nombres para el gráfico
    const labels = [];
    const data = [];
    for (const categoryId in categoryCounts) {
      const categoryName = categoryMap[categoryId] || `Categoría ${categoryId}`;
      labels.push(categoryName);
      data.push(categoryCounts[categoryId]);
    }

    res.json({ labels, data });

  } catch (error) {
    // --- MANEJO DE ERRORES MEJORADO ---
    // Esto es lo que te está pasando. Ahora podemos ver POR QUÉ.
    if (error.response) {
      // El error vino de la API de AbuseIPDB (ej. 400, 401, 429)
      console.error('Error de AbuseIPDB:', error.response.data);
      // Reenviamos el error específico al frontend
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      console.error('Error de red:', error.message);
      res.status(500).json({ error: 'No se pudo contactar a la API de AbuseIPDB.' });
    } else {
      // Otro error
      console.error('Error interno:', error.message);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Servidor de backend escuchando en http://localhost:${PORT}`);
});



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