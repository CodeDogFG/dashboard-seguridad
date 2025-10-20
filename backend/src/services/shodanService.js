/**
 * @file shodanService.js
 * @description Servicio para integración con las APIs de Shodan.
 * Utiliza tanto la API gratuita InternetDB como la API paga según disponibilidad.
 */

const axios = require('axios');

class ShodanService {
  constructor() {
    this.apiKey = process.env.SHODAN_API_KEY;
    this.baseUrl = 'https://api.shodan.io';
    this.internetDbUrl = 'https://internetdb.shodan.io';
    this.timeout = 10000; // 10 segundos
  }

  /**
   * Obtiene información de una IP desde la API InternetDB de Shodan (gratuita).
   * @param {string} ipAddress La dirección IP a analizar.
   * @returns {Promise<object>} Un objeto con los puertos, CVEs y otra información del host.
   */
  async getIpInfo(ipAddress) {
    try {
      console.log(`🔍 Shodan InternetDB: Analyzing IP ${ipAddress}`);

      const response = await axios.get(`${this.internetDbUrl}/${ipAddress}`, {
        timeout: this.timeout
      });

      const data = response.data;

      return {
        service: 'Shodan InternetDB',
        ip: ipAddress,
        status: 'success',
        hostnames: data.hostnames || [],
        ports: data.ports || [],
        cpes: data.cpes || [],
        vulns: data.vulns || [],
        tags: data.tags || [],
        region_code: data.region_code,
        country_name: data.country_name,
        country_code: data.country_code,
        city: data.city,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        risk_score: this.calculateRiskScore(data.ports, data.vulns),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Shodan InternetDB API error:', error.message);
      
      // La API de InternetDB devuelve 404 si no tiene información
      if (error.response?.status === 404) {
        return {
          service: 'Shodan InternetDB',
          ip: ipAddress,
          status: 'no_data',
          message: `No information found for IP ${ipAddress} in InternetDB`,
          ports: [],
          vulns: [],
          timestamp: new Date().toISOString()
        };
      }

      return {
        service: 'Shodan InternetDB',
        ip: ipAddress,
        error: 'Service temporarily unavailable',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Obtiene información detallada de una IP usando la API paga de Shodan
   * @param {string} ipAddress La dirección IP a analizar
   * @returns {Promise<object>} Información detallada del host
   */
  async getHostInfo(ipAddress) {
    try {
      if (!this.apiKey) {
        console.warn('⚠️ Shodan API key not configured, falling back to InternetDB');
        return await this.getIpInfo(ipAddress);
      }

      console.log(`🔍 Shodan API: Analyzing IP ${ipAddress}`);

      const response = await axios.get(`${this.baseUrl}/shodan/host/${ipAddress}`, {
        params: {
          key: this.apiKey
        },
        timeout: this.timeout
      });

      const data = response.data;

      return {
        service: 'Shodan API',
        ip: ipAddress,
        status: 'success',
        hostnames: data.hostnames || [],
        ports: data.ports || [],
        org: data.org,
        isp: data.isp,
        asn: data.asn,
        country_name: data.country_name,
        country_code: data.country_code,
        city: data.city,
        region_code: data.region_code,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        os: data.os,
        tags: data.tags || [],
        vulns: data.vulns || [],
        last_update: data.last_update,
        services: data.data ? data.data.slice(0, 10) : [], // Limitar a 10 servicios
        risk_score: this.calculateRiskScore(data.ports, data.vulns),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ Shodan API error:', error.message);
      
      if (error.response?.status === 404) {
        // Si no encontramos en la API paga, intentar con InternetDB
        console.log('IP not found in Shodan API, trying InternetDB...');
        return await this.getIpInfo(ipAddress);
      }

      if (error.response?.status === 402) {
        return {
          service: 'Shodan API',
          ip: ipAddress,
          error: 'API credits exhausted',
          status: 'quota_exceeded',
          message: 'Shodan API credits exhausted, using InternetDB fallback',
          fallback: await this.getIpInfo(ipAddress)
        };
      }

      return {
        service: 'Shodan API',
        ip: ipAddress,
        error: 'Service temporarily unavailable',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Calcula un score de riesgo basado en puertos abiertos y vulnerabilidades
   * @param {Array} ports Array de puertos abiertos
   * @param {Array} vulns Array de vulnerabilidades
   * @returns {string} Nivel de riesgo
   */
  calculateRiskScore(ports = [], vulns = []) {
    let score = 0;
    
    // Puntos por puertos comúnmente atacados
    const dangerousPorts = [22, 23, 25, 53, 80, 110, 143, 443, 993, 995, 1433, 3306, 3389, 5432, 6379];
    const openDangerousPorts = ports.filter(port => dangerousPorts.includes(port));
    score += openDangerousPorts.length * 10;
    
    // Puntos por cantidad total de puertos abiertos
    score += Math.min(ports.length, 20) * 2;
    
    // Puntos por vulnerabilidades conocidas
    score += vulns.length * 20;
    
    // Clasificar el riesgo
    if (score === 0) return 'clean';
    if (score < 20) return 'low_risk';
    if (score < 50) return 'medium_risk';
    if (score < 100) return 'high_risk';
    return 'critical';
  }

  /**
   * Verifica si el servicio está disponible
   * @returns {boolean} True si tiene API key o puede usar InternetDB
   */
  isAvailable() {
    return true; // Siempre disponible gracias a InternetDB
  }

  /**
   * Verifica si la API paga está disponible
   * @returns {boolean} True si el API key está configurado
   */
  hasPaidAccess() {
    return !!this.apiKey;
  }
}

// Exportar instancia singleton
module.exports = new ShodanService();