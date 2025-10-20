/**
 * @file securityController.js
 * @description Controlador principal para el análisis de seguridad.
 * Maneja las peticiones de análisis de dominios, IPs y emails,
 * orquestando las llamadas a los diferentes servicios de APIs externas.
 */

require('dotenv').config();

// Importar servicios cuando estén implementados
// const virusTotalService = require('../services/virusTotalService');
// const abuseIpService = require('../services/abuseIpService');
// const shodanService = require('../services/shodanService');

/**
 * @desc    Analiza una entidad (dominio, email o IP) buscando métricas de seguridad
 * @route   POST /api/analyze
 * @access  Public
 */
const analyzeEntity = async (req, res) => {
  try {
    const { entity, type } = req.body;

    // Validación de entrada
    if (!entity || !type) {
      return res.status(400).json({
        success: false,
        message: 'Entity and type are required',
        received: { entity, type }
      });
    }

    // Validar formato de entrada básico
    if (typeof entity !== 'string' || entity.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Entity must be a non-empty string'
      });
    }

    const cleanEntity = entity.trim();
    const results = {};

    console.log(`🔍 Analyzing ${type}: ${cleanEntity}`);

    // Análisis según el tipo de entidad
    switch (type.toLowerCase()) {
      case 'domain':
        // Para dominios, usar VirusTotal y futuros servicios
        results.analysis = {
          entity: cleanEntity,
          type: 'domain',
          status: 'analyzed',
          message: 'Domain analysis completed',
          timestamp: new Date().toISOString()
        };
        
        // Simulación de análisis hasta implementar servicios reales
        results.mockData = {
          reputation: 'clean',
          threats_detected: 0,
          last_scan: new Date().toISOString(),
          source: 'Security Dashboard v1.0'
        };
        break;
      
      case 'ip':
        // Para IPs, usar múltiples servicios
        results.analysis = {
          entity: cleanEntity,
          type: 'ip',
          status: 'analyzed',
          message: 'IP analysis completed',
          timestamp: new Date().toISOString()
        };
        
        // Simulación de análisis
        results.mockData = {
          reputation: 'clean',
          country: 'US',
          threats_detected: 0,
          open_ports: [],
          last_scan: new Date().toISOString(),
          source: 'Security Dashboard v1.0'
        };
        break;
      
      case 'email':
        // Para emails, extraer el dominio y analizarlo
        const domain = cleanEntity.split('@')[1];
        if (domain) {
          results.analysis = {
            entity: cleanEntity,
            type: 'email',
            extracted_domain: domain,
            status: 'analyzed',
            message: `Email analysis completed for domain: ${domain}`,
            timestamp: new Date().toISOString()
          };
          
          results.mockData = {
            reputation: 'clean',
            domain_threats: 0,
            last_scan: new Date().toISOString(),
            source: `Analysis of domain extracted from ${cleanEntity}`
          };
        } else {
          return res.status(400).json({
            success: false,
            message: 'Invalid email format'
          });
        }
        break;
      
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid entity type. Supported types: domain, ip, email',
          supportedTypes: ['domain', 'ip', 'email']
        });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      entity: cleanEntity,
      type: type.toLowerCase(),
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('❌ Error analyzing entity:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during analysis',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * @desc    Health check endpoint con información del sistema
 * @route   GET /api/health
 * @access  Public
 */
const healthCheck = (req, res) => {
  const healthInfo = {
    success: true,
    message: 'Security Dashboard API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    services: {
      virusTotal: !!process.env.VIRUSTOTAL_API_KEY,
      shodan: !!process.env.SHODAN_API_KEY,
      abuseIP: !!process.env.AbuseIP_API_KEY
    },
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  };

  console.log('✅ Health check requested');
  res.json(healthInfo);
};

/**
 * @desc    Endpoint para verificar configuración de APIs
 * @route   GET /api/config
 * @access  Public
 */
const getConfig = (req, res) => {
  res.json({
    success: true,
    message: 'Configuration status',
    timestamp: new Date().toISOString(),
    apiKeys: {
      virusTotal: !!process.env.VIRUSTOTAL_API_KEY ? 'configured' : 'missing',
      shodan: !!process.env.SHODAN_API_KEY ? 'configured' : 'missing',
      abuseIP: !!process.env.AbuseIP_API_KEY ? 'configured' : 'missing'
    },
    rateLimiting: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000',
      maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS || '100'
    },
    cors: {
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
    }
  });
};

/**
 * Orquesta el análisis de seguridad para un tipo de entidad y valor dados.
 * Función auxiliar para compatibilidad con el código existente del server.js
 * @param {string} type El tipo de entidad ('domain', 'ip', 'email').
 * @param {string} value El valor de la entidad a analizar.
 * @returns {Promise<object>} Un objeto consolidado con los resultados de los diferentes servicios.
 */
async function analyze(type, value) {
  // Esta función actúa como bridge para mantener compatibilidad
  // En el futuro, se puede implementar la lógica real de orquestación aquí
  console.log(`🔍 Legacy analyze function called for ${type}: ${value}`);
  
  return {
    type,
    value,
    status: 'analyzed',
    timestamp: new Date().toISOString(),
    message: 'Analysis completed via legacy function'
  };
}

module.exports = {
  analyzeEntity,
  healthCheck,
  getConfig,
  analyze // Mantener para compatibilidad
};