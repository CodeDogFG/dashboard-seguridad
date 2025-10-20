/**// backend/src/services/abuseIpService.js

 * @file abuseIpService.js

 * @description Servicio para integración con la API de AbuseIPDB.const axios = require('axios');

 * Proporciona métodos para verificar la reputación de direcciones IP.

 */const ABUSEIPDB_API_URL = 'https://api.abuseipdb.com/api/v2/check';

const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY;

const axios = require('axios');

/**

class AbuseIPService { * Obtiene el informe de una dirección IP desde la API de AbuseIPDB.

  constructor() { * @param {string} ipAddress La dirección IP a analizar.

    this.apiKey = process.env.AbuseIP_API_KEY; * @returns {Promise<object>} Un objeto con los datos de reputación de la IP.

    this.baseUrl = 'https://api.abuseipdb.com/api/v2'; */

    this.timeout = 10000; // 10 segundosasync function getIpReport(ipAddress) {

  }  if (!ABUSEIPDB_API_KEY) {

    throw new Error('La clave de API de AbuseIPDB no está configurada.');

  /**  }

   * Obtiene el informe de una dirección IP desde la API de AbuseIPDB.

   * @param {string} ipAddress La dirección IP a analizar.  try {

   * @returns {Promise<object>} Un objeto con los datos de reputación de la IP.    const response = await axios.get(ABUSEIPDB_API_URL, {

   */      params: {

  async getIpReport(ipAddress) {        ipAddress: ipAddress,

    try {        maxAgeInDays: 90, // Antigüedad máxima de los reportes

      if (!this.apiKey) {        verbose: true

        console.warn('⚠️ AbuseIPDB API key not configured');      },

        return {      headers: {

          service: 'AbuseIPDB',        'Key': ABUSEIPDB_API_KEY,

          ip: ipAddress,        'Accept': 'application/json'

          error: 'API key not configured',      }

          status: 'unavailable'    });

        };

      }    return response.data.data;

  } catch (error) {

      console.log(`🔍 AbuseIPDB: Analyzing IP ${ipAddress}`);    console.error('Error al contactar la API de AbuseIPDB:', error.response?.data |



      const response = await axios.get(`${this.baseUrl}/check`, {| error.message);

        params: {    throw new Error('No se pudo obtener el informe de AbuseIPDB.');

          ipAddress: ipAddress,  }

          maxAgeInDays: 90, // Antigüedad máxima de los reportes}

          verbose: true

        },module.exports = { getIpReport };
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });

      const data = response.data.data;

      return {
        service: 'AbuseIPDB',
        ip: ipAddress,
        status: 'success',
        ipAddress: data.ipAddress,
        isPublic: data.isPublic,
        ipVersion: data.ipVersion,
        isWhitelisted: data.isWhitelisted,
        abuseConfidencePercentage: data.abuseConfidencePercentage,
        countryCode: data.countryCode,
        countryName: data.countryName,
        usageType: data.usageType,
        isp: data.isp,
        domain: data.domain,
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        reports: data.reports ? data.reports.slice(0, 5) : [], // Limitar a 5 reportes más recientes
        riskLevel: this.calculateRiskLevel(data.abuseConfidencePercentage),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ AbuseIPDB API error:', error.message);
      
      if (error.response?.status === 429) {
        return {
          service: 'AbuseIPDB',
          ip: ipAddress,
          error: 'Rate limit exceeded',
          status: 'rate_limited',
          message: 'Daily API limit reached. Please try again tomorrow.'
        };
      }

      if (error.response?.status === 422) {
        return {
          service: 'AbuseIPDB',
          ip: ipAddress,
          error: 'Invalid IP address',
          status: 'invalid_input',
          message: 'The provided IP address is not valid'
        };
      }

      return {
        service: 'AbuseIPDB',
        ip: ipAddress,
        error: 'Service temporarily unavailable',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Calcula el nivel de riesgo basado en el porcentaje de confianza de abuso
   * @param {number} abuseConfidence - Porcentaje de confianza de abuso (0-100)
   * @returns {string} Nivel de riesgo
   */
  calculateRiskLevel(abuseConfidence) {
    if (abuseConfidence === undefined || abuseConfidence === null) return 'unknown';
    
    if (abuseConfidence === 0) return 'clean';
    if (abuseConfidence < 25) return 'low_risk';
    if (abuseConfidence < 50) return 'medium_risk';
    if (abuseConfidence < 75) return 'high_risk';
    return 'critical';
  }

  /**
   * Verifica si el servicio está disponible
   * @returns {boolean} True si el API key está configurado
   */
  isAvailable() {
    return !!this.apiKey;
  }
}

// Exportar instancia singleton
module.exports = new AbuseIPService();