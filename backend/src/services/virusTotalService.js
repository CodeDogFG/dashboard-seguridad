/**
 * @file virusTotalService.js
 * @description Servicio para integración con la API de VirusTotal.
 * Proporciona métodos para analizar dominios e IPs usando VirusTotal API v3.
 */

const axios = require('axios');

class VirusTotalService {
  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY;
    this.baseUrl = 'https://www.virustotal.com/api/v3';
    this.timeout = 15000; // 15 segundos
  }

  /**
   * Obtiene el informe de un dominio desde la API de VirusTotal.
   * @param {string} domain El dominio a analizar.
   * @returns {Promise<object>} Un objeto con los datos relevantes del análisis.
   */
  async getDomainReport(domain) {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ VirusTotal API key not configured');
        return {
          service: 'VirusTotal',
          domain,
          error: 'API key not configured',
          status: 'unavailable'
        };
      }

      console.log(`🔍 VirusTotal: Analyzing domain ${domain}`);

      const response = await axios.get(`${this.baseUrl}/domains/${domain}`, {
        headers: {
          'x-apikey': this.apiKey
        },
        timeout: this.timeout
      });

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;

      return {
        service: 'VirusTotal',
        domain,
        status: 'success',
        reputation: attributes.reputation || 0,
        last_analysis_stats: {
          harmless: stats.harmless || 0,
          malicious: stats.malicious || 0,
          suspicious: stats.suspicious || 0,
          undetected: stats.undetected || 0,
          timeout: stats.timeout || 0
        },
        total_votes: attributes.total_votes,
        categories: attributes.categories || {},
        registrar: attributes.registrar,
        creation_date: attributes.creation_date ? new Date(attributes.creation_date * 1000).toISOString() : null,
        last_modification_date: attributes.last_modification_date ? new Date(attributes.last_modification_date * 1000).toISOString() : null,
        whois_date: attributes.whois_date ? new Date(attributes.whois_date * 1000).toISOString() : null,
        risk_score: this.calculateRiskScore(stats),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ VirusTotal API error for domain:', error.message);
      
      if (error.response?.status === 429) {
        return {
          service: 'VirusTotal',
          domain,
          error: 'Rate limit exceeded',
          status: 'rate_limited',
          message: 'Please try again later'
        };
      }

      if (error.response?.status === 404) {
        return {
          service: 'VirusTotal',
          domain,
          error: 'Domain not found',
          status: 'not_found',
          message: 'Domain not found in VirusTotal database'
        };
      }

      return {
        service: 'VirusTotal',
        domain,
        error: 'Service temporarily unavailable',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Analiza una IP usando VirusTotal
   * @param {string} ip - La IP a analizar
   * @returns {Promise<Object>} Resultado del análisis
   */
  async getIpReport(ip) {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ VirusTotal API key not configured');
        return {
          service: 'VirusTotal',
          ip,
          error: 'API key not configured',
          status: 'unavailable'
        };
      }

      console.log(`🔍 VirusTotal: Analyzing IP ${ip}`);

      const response = await axios.get(`${this.baseUrl}/ip_addresses/${ip}`, {
        headers: {
          'x-apikey': this.apiKey
        },
        timeout: this.timeout
      });

      const attributes = response.data.data.attributes;
      const stats = attributes.last_analysis_stats;

      return {
        service: 'VirusTotal',
        ip,
        status: 'success',
        reputation: attributes.reputation || 0,
        last_analysis_stats: {
          harmless: stats.harmless || 0,
          malicious: stats.malicious || 0,
          suspicious: stats.suspicious || 0,
          undetected: stats.undetected || 0,
          timeout: stats.timeout || 0
        },
        country: attributes.country,
        as_owner: attributes.as_owner,
        asn: attributes.asn,
        network: attributes.network,
        regional_internet_registry: attributes.regional_internet_registry,
        risk_score: this.calculateRiskScore(stats),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ VirusTotal API error for IP:', error.message);
      
      if (error.response?.status === 429) {
        return {
          service: 'VirusTotal',
          ip,
          error: 'Rate limit exceeded',
          status: 'rate_limited',
          message: 'Please try again later'
        };
      }

      if (error.response?.status === 404) {
        return {
          service: 'VirusTotal',
          ip,
          error: 'IP not found',
          status: 'not_found',
          message: 'IP not found in VirusTotal database'
        };
      }

      return {
        service: 'VirusTotal',
        ip,
        error: 'Service temporarily unavailable',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Calcula el score de riesgo basado en las estadísticas de análisis
   * @param {Object} stats - Estadísticas de análisis
   * @returns {string} Nivel de riesgo
   */
  calculateRiskScore(stats) {
    if (!stats) return 'unknown';
    
    const total = (stats.harmless || 0) + (stats.malicious || 0) + (stats.suspicious || 0) + (stats.undetected || 0);
    
    if (total === 0) return 'unknown';
    
    const maliciousRatio = (stats.malicious || 0) / total;
    const suspiciousRatio = (stats.suspicious || 0) / total;
    const combinedRatio = maliciousRatio + (suspiciousRatio * 0.5);
    
    if (combinedRatio === 0) return 'clean';
    if (combinedRatio < 0.1) return 'low_risk';
    if (combinedRatio < 0.3) return 'medium_risk';
    if (combinedRatio < 0.6) return 'high_risk';
    return 'malicious';
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
module.exports = new VirusTotalService();