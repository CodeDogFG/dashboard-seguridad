/**
 * @file securityController.js
 * @description Controlador principal para el análisis de seguridad.
 * Maneja las peticiones de análisis de dominios, IPs y emails,
 * orquestando las llamadas a los diferentes servicios de APIs externas.
 */

require('dotenv').config();

// Importar servicios reales
const virusTotalService = require('../services/virusTotalService');
const abuseIpService = require('../services/abuseIpService');
const shodanService = require('../services/shodanService');

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
  console.log(`🔍 Real analyze function called for ${type}: ${value}`);
  
  const results = {
    entity: value,
    type: type,
    timestamp: new Date().toISOString(),
    services: {},
    summary: {
      risk_score: 0,
      risk_level: 'unknown',
      threats_detected: 0
    }
  };

  try {
    switch (type.toLowerCase()) {
      case 'domain':
        // Analizar dominio con VirusTotal
        if (virusTotalService.isAvailable()) {
          results.services.virusTotal = await virusTotalService.getDomainReport(value);
          if (results.services.virusTotal.status === 'success') {
            results.summary.risk_score = Math.max(results.summary.risk_score, convertRiskScore(results.services.virusTotal.risk_score));
          }
        }
        break;
        
      case 'ip':
        // Analizar IP con múltiples servicios
        const promises = [];
        
        if (virusTotalService.isAvailable()) {
          promises.push(virusTotalService.getIpReport(value).then(result => ({ service: 'virusTotal', data: result })));
        }
        
        if (abuseIpService.isAvailable()) {
          promises.push(abuseIpService.getIpReport(value).then(result => ({ service: 'abuseIP', data: result })));
        }
        
        // Shodan siempre disponible (fallback a InternetDB)
        promises.push(shodanService.getHostInfo(value).then(result => ({ service: 'shodan', data: result })));
        
        const ipResults = await Promise.allSettled(promises);
        
        ipResults.forEach(result => {
          if (result.status === 'fulfilled') {
            const { service, data } = result.value;
            results.services[service] = data;
            
            if (data.status === 'success') {
              const riskScore = convertRiskScore(data.risk_score || data.riskLevel);
              results.summary.risk_score = Math.max(results.summary.risk_score, riskScore);
            }
          }
        });
        break;
        
      case 'email':
        // Extraer dominio del email y analizarlo
        const domain = value.split('@')[1];
        if (domain && virusTotalService.isAvailable()) {
          results.services.virusTotal = await virusTotalService.getDomainReport(domain);
          results.extracted_domain = domain;
          
          if (results.services.virusTotal.status === 'success') {
            results.summary.risk_score = Math.max(results.summary.risk_score, convertRiskScore(results.services.virusTotal.risk_score));
          }
        }
        break;
    }
    
    // Calcular nivel de riesgo final
    results.summary.risk_level = calculateRiskLevel(results.summary.risk_score);
    results.summary.threats_detected = countThreats(results.services);
    
    return results;
    
  } catch (error) {
    console.error(`❌ Error in analyze function:`, error);
    return {
      entity: value,
      type: type,
      timestamp: new Date().toISOString(),
      error: 'Analysis failed',
      message: error.message,
      services: {},
      summary: {
        risk_score: 0,
        risk_level: 'error',
        threats_detected: 0
      }
    };
  }
}

/**
 * Convierte diferentes formatos de risk_score a un número de 0-100
 */
function convertRiskScore(riskScore) {
  if (typeof riskScore === 'number') return Math.min(100, Math.max(0, riskScore));
  
  const riskMap = {
    'clean': 0,
    'low_risk': 15,        // Reducido de 25
    'medium_risk': 40,     // Reducido de 50 
    'high_risk': 70,       // Reducido de 75
    'critical': 85,        // Reducido de 90
    'malicious': 95        // Nuevo nivel
  };
  
  return riskMap[riskScore] || 0;
}

/**
 * Calcula el nivel de riesgo basado en la puntuación
 */
function calculateRiskLevel(score) {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
}

/**
 * Cuenta las amenazas detectadas en todos los servicios
 */
function countThreats(services) {
  let threats = 0;
  
  Object.values(services).forEach(service => {
    if (service.status === 'success') {
      // VirusTotal threats
      if (service.last_analysis_stats) {
        threats += service.last_analysis_stats.malicious || 0;
        threats += service.last_analysis_stats.suspicious || 0;
      }
      
      // AbuseIPDB threats - Más estricto: cualquier reporte es una amenaza
      if (service.abuseConfidencePercentage !== undefined) {
        if (service.abuseConfidencePercentage > 0) {
          threats += 1; // Cualquier porcentaje > 0 cuenta como amenaza
        }
        // Amenazas adicionales basadas en nivel
        if (service.abuseConfidencePercentage > 15) threats += 1;
        if (service.abuseConfidencePercentage > 35) threats += 1;
        if (service.abuseConfidencePercentage > 65) threats += 2;
      }
      
      // Shodan vulnerabilities
      if (service.vulns && service.vulns.length > 0) {
        threats += service.vulns.length;
      }
    }
  });
  
  return threats;
}

module.exports = {
  analyzeEntity,
  healthCheck,
  getConfig,
  analyze // Mantener para compatibilidad
};