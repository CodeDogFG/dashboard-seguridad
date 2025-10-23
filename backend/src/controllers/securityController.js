/**
 * @file securityController.js
 * @description Controlador principal para el análisis de seguridad.
 * Maneja las peticiones de análisis de IPs usando únicamente AbuseIPDB API.
 */

require('dotenv').config();

// Importar servicios
const abuseIpService = require('../services/abuseIpService');

/**
 * @desc    Analiza una dirección IP usando AbuseIPDB API
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

    // Solo aceptar análisis de IPs
    if (type.toLowerCase() !== 'ip') {
      return res.status(400).json({
        success: false,
        message: 'Only IP analysis is supported. Type must be "ip"',
        supportedTypes: ['ip']
      });
    }

    // Validar formato de entrada básico
    if (typeof entity !== 'string' || entity.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Entity must be a non-empty string'
      });
    }

    // Validar formato de IP básico
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(entity.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address format'
      });
    }

    const cleanEntity = entity.trim();
    console.log(`🔍 Analyzing IP: ${cleanEntity}`);

    // Analizar IP con AbuseIPDB usando modo verbose para obtener reportes detallados
    const options = {
      maxAgeInDays: req.body.maxAgeInDays || 90,
      verbose: req.body.verbose !== false // Por defecto true
    };
    
    const abuseIpResult = await abuseIpService.getIpReport(cleanEntity, options);
    
    if (abuseIpResult.status === 'error') {
      return res.status(500).json({
        success: false,
        message: `AbuseIPDB error: ${abuseIpResult.message}`,
        entity: cleanEntity,
        type: 'ip',
        rateLimitInfo: abuseIpResult.rateLimitInfo || null
      });
    }

    const results = {
      entity: cleanEntity,
      type: 'ip',
      timestamp: new Date().toISOString(),
      services: {
        abuseIP: abuseIpResult
      },
      summary: {
        risk_score: abuseIpResult.riskScore,
        risk_level: abuseIpResult.riskLevel,
        threats_detected: abuseIpResult.totalReports || 0,
        abuse_confidence: abuseIpResult.abuseConfidencePercentage,
        reports_analyzed: abuseIpResult.totalReportsAnalyzed || 0,
        unique_categories: abuseIpResult.categories?.length || 0,
        unique_reporters: abuseIpResult.uniqueReporters || 0
      }
    };

    // Respuesta exitosa
    res.json({
      success: true,
      entity: cleanEntity,
      type: 'ip',
      timestamp: new Date().toISOString(),
      data: results
    });

  } catch (error) {
    console.error('❌ Error analyzing IP:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during IP analysis',
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
 * @desc    Obtiene reportes detallados de una IP usando el endpoint REPORTS de AbuseIPDB
 * @route   POST /api/reports
 * @access  Public
 */
const getDetailedReports = async (req, res) => {
  try {
    const { entity, maxAgeInDays, perPage, page } = req.body;

    // Validación de entrada
    if (!entity) {
      return res.status(400).json({
        success: false,
        message: 'IP address (entity) is required',
        received: { entity }
      });
    }

    // Validar formato de IP básico
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(entity.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IP address format'
      });
    }

    const cleanEntity = entity.trim();
    console.log(`🔍 Getting detailed reports for IP: ${cleanEntity}`);

    // Opciones para la consulta
    const options = {
      maxAgeInDays: maxAgeInDays || 90,
      perPage: Math.min(perPage || 25, 100), // Máximo 100 por página
      page: page || 1
    };

    const reportsResult = await abuseIpService.getDetailedReports(cleanEntity, options);
    
    if (reportsResult.status === 'error') {
      return res.status(500).json({
        success: false,
        message: `AbuseIPDB error: ${reportsResult.message}`,
        entity: cleanEntity,
        rateLimitInfo: reportsResult.rateLimitInfo || null
      });
    }

    // Respuesta exitosa
    res.json({
      success: true,
      entity: cleanEntity,
      timestamp: new Date().toISOString(),
      data: reportsResult
    });

  } catch (error) {
    console.error('❌ Error getting detailed reports:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during detailed reports retrieval',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
};

/**
 * Orquesta el análisis de seguridad para direcciones IP usando AbuseIPDB.
 * Función auxiliar para compatibilidad con el código existente del server.js
 * @param {string} type El tipo de entidad (solo 'ip' soportado).
 * @param {string} value El valor de la IP a analizar.
 * @returns {Promise<object>} Un objeto con los resultados del análisis de AbuseIPDB.
 */
async function analyze(type, value) {
  console.log(`🔍 Analyze function called for ${type}: ${value}`);
  
  if (type.toLowerCase() !== 'ip') {
    return {
      entity: value,
      type: type,
      timestamp: new Date().toISOString(),
      error: 'Only IP analysis is supported',
      message: 'This simplified version only supports IP analysis',
      services: {},
      summary: {
        risk_score: 0,
        risk_level: 'error',
        threats_detected: 0
      }
    };
  }

  const results = {
    entity: value,
    type: 'ip',
    timestamp: new Date().toISOString(),
    services: {},
    summary: {
      risk_score: 0,
      risk_level: 'unknown',
      threats_detected: 0,
      abuse_confidence: 0
    }
  };

  try {
    // Analizar IP con AbuseIPDB
    if (abuseIpService.isAvailable()) {
      const abuseResult = await abuseIpService.getIpReport(value);
      results.services.abuseIP = abuseResult;
      
      if (abuseResult.status === 'success') {
        results.summary.risk_score = abuseResult.riskScore;
        results.summary.risk_level = abuseResult.riskLevel;
        results.summary.threats_detected = abuseResult.totalReports || 0;
        results.summary.abuse_confidence = abuseResult.abuseConfidencePercentage;
      }
    } else {
      results.services.abuseIP = {
        service: 'AbuseIPDB',
        status: 'error',
        message: 'API key not configured'
      };
    }
    
    return results;
    
  } catch (error) {
    console.error(`❌ Error in analyze function:`, error);
    return {
      entity: value,
      type: 'ip',
      timestamp: new Date().toISOString(),
      error: 'Analysis failed',
      message: error.message,
      services: {},
      summary: {
        risk_score: 0,
        risk_level: 'error',
        threats_detected: 0,
        abuse_confidence: 0
      }
    };
  }
}

module.exports = {
  analyzeEntity,
  healthCheck,
  getConfig,
  getDetailedReports,
  analyze // Mantener para compatibilidad
};