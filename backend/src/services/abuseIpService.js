/**
 * @file abuseIpService.js
 * @description Servicio para integración con AbuseIPDB API v2
 * Proporciona análisis de reputación de direcciones IP
 */

const axios = require('axios');

class AbuseIpService {
  constructor() {
    this.apiKey = process.env.AbuseIP_API_KEY;
    this.baseUrl = 'https://api.abuseipdb.com/api/v2';
    this.maxAgeInDays = 90; // Máximo lookback para reportes
  }

  /**
   * Verifica si el servicio está disponible (tiene API key)
   */
  isAvailable() {
    return !!this.apiKey;
  }

  /**
   * Obtiene el reporte de una dirección IP usando CHECK endpoint con modo verbose
   * @param {string} ip - Dirección IP a analizar
   * @param {object} options - Opciones adicionales { maxAgeInDays, verbose }
   * @returns {Promise<object>} - Resultado del análisis con reportes detallados
   */
  async getIpReport(ip, options = {}) {
    if (!this.isAvailable()) {
      return {
        service: 'AbuseIPDB',
        status: 'error',
        message: 'AbuseIPDB API key not configured',
        riskScore: 0
      };
    }

    const maxAgeInDays = options.maxAgeInDays || this.maxAgeInDays;
    const verbose = options.verbose !== false; // Por defecto true para obtener reportes detallados

    try {
      console.log(`🔍 AbuseIPDB CHECK: Analyzing IP ${ip} (maxAge: ${maxAgeInDays} days, verbose: ${verbose})`);

      const response = await axios.get(`${this.baseUrl}/check`, {
        params: {
          ipAddress: ip,
          maxAgeInDays: maxAgeInDays,
          verbose: verbose
        },
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      const data = response.data.data;
      
      // Procesar reportes individuales si están disponibles
      const reportAnalysis = data.reports ? this.analyzeDetailedReports(data.reports) : {
        categories: [],
        categoryStats: {},
        reportsByDate: {},
        totalReportsAnalyzed: 0
      };
      
      // Calcular riesgo basado en porcentaje de confianza de abuso y reportes
      const riskScore = this.calculateRiskScore(data.abuseConfidenceScore, data.totalReports);
      
      const result = {
        service: 'AbuseIPDB',
        status: 'success',
        ip: ip,
        abuseConfidencePercentage: data.abuseConfidenceScore,
        countryCode: data.countryCode,
        countryName: data.countryName || '',
        usageType: data.usageType,
        isp: data.isp,
        domain: data.domain,
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        riskScore: riskScore,
        riskLevel: this.getRiskLevel(riskScore),
        isWhitelisted: data.isWhitelisted,
        
        // Análisis detallado de reportes
        categories: reportAnalysis.categories,
        categoryStats: reportAnalysis.categoryStats,
        reportsByDate: reportAnalysis.reportsByDate,
        totalReportsAnalyzed: reportAnalysis.totalReportsAnalyzed,
        
        // Metadatos de la consulta
        queryParams: {
          maxAgeInDays: maxAgeInDays,
          verbose: verbose,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ AbuseIPDB CHECK: IP ${ip} analyzed - Risk: ${riskScore}% (${result.riskLevel}), Reports: ${data.totalReports}, Categories: ${reportAnalysis.categories.length}`);
      return result;

    } catch (error) {
      console.error(`❌ AbuseIPDB CHECK Error for IP ${ip}:`, error.message);
      
      if (error.response?.status === 429) {
        return {
          service: 'AbuseIPDB',
          status: 'error',
          message: 'Rate limit exceeded - too many requests',
          riskScore: 0,
          rateLimitInfo: {
            resetTime: error.response.headers['x-ratelimit-reset'] || null,
            remaining: error.response.headers['x-ratelimit-remaining'] || null
          }
        };
      }

      if (error.response?.status === 422) {
        return {
          service: 'AbuseIPDB',
          status: 'error',
          message: 'Invalid IP address format',
          riskScore: 0
        };
      }

      return {
        service: 'AbuseIPDB',
        status: 'error',
        message: error.message,
        riskScore: 0
      };
    }
  }

  /**
   * Obtiene reportes detallados usando el endpoint REPORTS
   * @param {string} ip - Dirección IP a analizar
   * @param {object} options - Opciones { maxAgeInDays, perPage, page }
   * @returns {Promise<object>} - Reportes detallados paginados
   */
  async getDetailedReports(ip, options = {}) {
    if (!this.isAvailable()) {
      return {
        service: 'AbuseIPDB',
        status: 'error',
        message: 'AbuseIPDB API key not configured'
      };
    }

    const maxAgeInDays = options.maxAgeInDays || this.maxAgeInDays;
    const perPage = Math.min(options.perPage || 25, 100); // Máximo 100 por página
    const page = options.page || 1;

    try {
      console.log(`🔍 AbuseIPDB REPORTS: Getting detailed reports for IP ${ip} (page: ${page}, perPage: ${perPage})`);

      const response = await axios.get(`${this.baseUrl}/reports`, {
        params: {
          ipAddress: ip,
          maxAgeInDays: maxAgeInDays,
          perPage: perPage,
          page: page
        },
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      const data = response.data.data;
      
      // Procesar todos los reportes de esta página
      const reportAnalysis = this.analyzeDetailedReports(data.results || []);
      
      const result = {
        service: 'AbuseIPDB',
        status: 'success',
        ip: ip,
        
        // Información de paginación
        pagination: {
          total: data.total || 0,
          count: data.count || 0,
          perPage: perPage,
          page: page,
          lastPage: Math.ceil((data.total || 0) / perPage)
        },
        
        // Reportes y análisis
        reports: data.results || [],
        categories: reportAnalysis.categories,
        categoryStats: reportAnalysis.categoryStats,
        reportsByDate: reportAnalysis.reportsByDate,
        totalReportsAnalyzed: reportAnalysis.totalReportsAnalyzed,
        
        // Metadatos
        queryParams: {
          maxAgeInDays: maxAgeInDays,
          perPage: perPage,
          page: page,
          timestamp: new Date().toISOString()
        }
      };

      console.log(`✅ AbuseIPDB REPORTS: Got ${data.count || 0} reports for IP ${ip} (page ${page}/${result.pagination.lastPage})`);
      return result;

    } catch (error) {
      console.error(`❌ AbuseIPDB REPORTS Error for IP ${ip}:`, error.message);
      
      if (error.response?.status === 429) {
        return {
          service: 'AbuseIPDB',
          status: 'error',
          message: 'Rate limit exceeded - too many requests',
          rateLimitInfo: {
            resetTime: error.response.headers['x-ratelimit-reset'] || null,
            remaining: error.response.headers['x-ratelimit-remaining'] || null
          }
        };
      }

      return {
        service: 'AbuseIPDB',
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Calcula el score de riesgo basado en el porcentaje de confianza de abuso y número de reportes
   * @param {number} abuseConfidence - Porcentaje de confianza de abuso (0-100)
   * @param {number} totalReports - Número total de reportes
   * @returns {number} - Score de riesgo (0-100)
   */
  calculateRiskScore(abuseConfidence, totalReports = 0) {
    if (abuseConfidence === 0 && totalReports === 0) return 0;
    
    let baseScore = abuseConfidence;
    
    // Ajustar score basado en número de reportes
    if (totalReports > 0) {
      let reportBonus = 0;
      if (totalReports >= 1 && totalReports <= 5) reportBonus = 2;
      else if (totalReports >= 6 && totalReports <= 15) reportBonus = 5;
      else if (totalReports >= 16 && totalReports <= 50) reportBonus = 8;
      else if (totalReports > 50) reportBonus = 12;
      
      baseScore = Math.min(100, baseScore + reportBonus);
    }
    
    // Aplicar multiplicadores por rango de confianza
    if (abuseConfidence <= 25) return Math.max(baseScore, Math.min(30, baseScore + 5));
    if (abuseConfidence <= 50) return Math.max(baseScore, Math.min(55, baseScore + 8));
    if (abuseConfidence <= 75) return Math.max(baseScore, Math.min(80, baseScore + 5));
    return Math.min(100, baseScore + 3);
  }

  /**
   * Determina el nivel de riesgo basado en el score
   * @param {number} score - Score de riesgo (0-100)
   * @returns {string} - Nivel de riesgo
   */
  getRiskLevel(score) {
    if (score < 25) return 'low';
    if (score < 60) return 'medium';
    return 'high';
  }

  /**
   * Analiza reportes detallados para obtener estadísticas completas
   * @param {Array} reports - Array de reportes con categorías
   * @returns {Object} - Análisis completo de los reportes
   */
  analyzeDetailedReports(reports) {
    const categoryMap = new Map();
    const reportsByDate = new Map();
    const reporterMap = new Map(); // Para contar reporteros únicos
    
    // Mapeo completo de categorías de AbuseIPDB
    const categoryNames = {
      1: 'DNS Compromise',
      2: 'DNS Poisoning', 
      3: 'Fraud Orders',
      4: 'DDoS Attack',
      5: 'FTP Brute-Force',
      6: 'Ping of Death',
      7: 'Phishing',
      8: 'Fraud VoIP',
      9: 'Open Proxy',
      10: 'Web Spam',
      11: 'Email Spam',
      12: 'Blog Spam',
      13: 'VPN IP',
      14: 'Port Scan',
      15: 'Hacking',
      16: 'SQL Injection',
      17: 'Spoofing',
      18: 'Brute-Force',
      19: 'Bad Web Bot',
      20: 'Exploited Host',
      21: 'Web App Attack',
      22: 'SSH',
      23: 'IoT Targeted'
    };

    // Procesar cada reporte
    reports.forEach(report => {
      // Procesar categorías
      if (report.categories && Array.isArray(report.categories)) {
        report.categories.forEach(categoryId => {
          const categoryName = categoryNames[categoryId] || `Category ${categoryId}`;
          const existing = categoryMap.get(categoryId) || {
            id: categoryId,
            name: categoryName,
            count: 0,
            severity: this.getCategorySeverity(categoryId),
            firstSeen: report.reportedAt,
            lastSeen: report.reportedAt,
            reporters: new Set()
          };
          
          existing.count += 1;
          existing.lastSeen = report.reportedAt;
          if (report.reporterId) {
            existing.reporters.add(report.reporterId);
          }
          
          categoryMap.set(categoryId, existing);
        });
      }
      
      // Agrupar reportes por fecha (día)
      if (report.reportedAt) {
        const reportDate = report.reportedAt.split('T')[0]; // Obtener solo la fecha (YYYY-MM-DD)
        const dateCount = reportsByDate.get(reportDate) || 0;
        reportsByDate.set(reportDate, dateCount + 1);
      }
      
      // Contar reporteros únicos
      if (report.reporterId) {
        reporterMap.set(report.reporterId, (reporterMap.get(report.reporterId) || 0) + 1);
      }
    });

    // Convertir categorías a array y agregar estadísticas de reporteros
    const categories = Array.from(categoryMap.values()).map(category => ({
      ...category,
      uniqueReporters: category.reporters.size,
      reporters: undefined // Remover el Set para serialización JSON
    })).sort((a, b) => b.count - a.count);

    // Convertir fechas a objeto ordenado
    const sortedReportsByDate = Object.fromEntries(
      Array.from(reportsByDate.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    );

    // Estadísticas por categoría agrupadas por severidad
    const categoryStats = {
      high: categories.filter(cat => cat.severity === 'high').length,
      medium: categories.filter(cat => cat.severity === 'medium').length,
      low: categories.filter(cat => cat.severity === 'low').length,
      total: categories.length,
      mostCommon: categories.slice(0, 5), // Top 5 categorías más comunes
      bySeverity: {
        high: categories.filter(cat => cat.severity === 'high'),
        medium: categories.filter(cat => cat.severity === 'medium'),
        low: categories.filter(cat => cat.severity === 'low')
      }
    };

    return {
      categories,
      categoryStats,
      reportsByDate: sortedReportsByDate,
      totalReportsAnalyzed: reports.length,
      uniqueReporters: reporterMap.size,
      reporterStats: Array.from(reporterMap.entries())
        .map(([id, count]) => ({ reporterId: id, reportCount: count }))
        .sort((a, b) => b.reportCount - a.reportCount)
        .slice(0, 10) // Top 10 reporteros más activos
    };
  }

  /**
   * Determina la severidad de una categoría
   * @param {number} categoryId - ID de la categoría
   * @returns {string} - Nivel de severidad
   */
  getCategorySeverity(categoryId) {
    const highSeverity = [4, 7, 15, 16, 18, 20, 21]; // DDoS, Phishing, Hacking, SQL Injection, Brute-Force, Exploited Host, Web App Attack
    const mediumSeverity = [1, 2, 5, 6, 14, 17, 19, 22, 23]; // DNS, FTP Brute-Force, Port Scan, etc.
    
    if (highSeverity.includes(categoryId)) return 'high';
    if (mediumSeverity.includes(categoryId)) return 'medium';
    return 'low';
  }
}

module.exports = new AbuseIpService();