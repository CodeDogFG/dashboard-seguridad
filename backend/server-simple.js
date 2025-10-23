// Servidor más simple para debugging
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Cambiar puerto para evitar conflictos

// Middleware básico
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '100kb' }));

// Log de todas las peticiones
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Body:', req.body);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check solicitado');
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Análisis simplificado
app.post('/api/analyze', (req, res) => {
  console.log('Análisis solicitado:', req.body);
  
  const { type, entity, value } = req.body;
  const targetValue = entity || value;
  
  if (!type || !targetValue) {
    console.log('Error: Parámetros inválidos');
    return res.status(400).json({
      success: false,
      message: 'Se requiere type y entity/value',
      received: req.body
    });
  }
  
  if (type !== 'ip') {
    console.log('Error: Tipo no soportado');
    return res.status(400).json({
      success: false,
      message: 'Solo se admite type: ip',
      received: req.body
    });
  }
  
  // Respuesta mock para testing
  console.log('Devolviendo respuesta mock');
  res.json({
    success: true,
    query: targetValue,
    type: type,
    cached: false,
    data: {
      entity: targetValue,
      type: type,
      timestamp: new Date().toISOString(),
      services: {
        abuseIP: {
          service: "AbuseIPDB",
          status: "success",
          data: {
            abuseConfidence: 0,
            usageType: "Content Delivery Network",
            isp: "Google LLC",
            domain: "dns.google",
            countryCode: "US"
          }
        }
      },
      summary: {
        risk_score: 5,
        risk_level: "LOW",
        threats_detected: 0,
        abuse_confidence: 0
      }
    }
  });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Servidor simple corriendo en 127.0.0.1:${PORT}`);
  console.log(`🔗 Health check: http://127.0.0.1:${PORT}/api/health`);
}).on('error', (err) => {
  console.error('❌ Error al iniciar servidor:', err);
});