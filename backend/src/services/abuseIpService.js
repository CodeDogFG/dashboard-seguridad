/**
 * @file abuseIpService.js
 * @description Servicio para integración con la API de AbuseIPDB.
 */

const axios = require('axios');

class AbuseIPService {
  constructor() {
    this.apiKey = process.env.AbuseIP_API_KEY;
    this.baseUrl = 'https://api.abuseipdb.com/api/v2';
    this.timeout = 10000;
    
    // Mapeo de categorías de AbuseIPDB
    this.categoryMap = {
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


  }

  async getIpReport(ipAddress) {
    try {
      if (!this.apiKey) {
        return {
          service: 'AbuseIPDB',
          ip: ipAddress,
          error: 'API key not configured',
          status: 'unavailable'
        };
      }

      const response = await axios.get(`${this.baseUrl}/check`, {
        params: {
          ipAddress: ipAddress,
          maxAgeInDays: 90,
          verbose: true
        },
        headers: {
          'Key': this.apiKey,
          'Accept': 'application/json'
        },
        timeout: this.timeout
      });

      const data = response.data.data;
      const categories = this.processCategories(data.reports);
      
      return {
        service: 'AbuseIPDB',
        ip: ipAddress,
        status: 'success',
        abuseConfidencePercentage: data.abuseConfidenceScore,  // API usa abuseConfidenceScore
        totalReports: data.totalReports,
        numDistinctUsers: data.numDistinctUsers,
        lastReportedAt: data.lastReportedAt,
        countryCode: data.countryCode,
        countryName: data.countryName,
        usageType: data.usageType,
        isp: data.isp,
        isWhitelisted: data.isWhitelisted,
        categories: categories,  // ✨ Nuevas categorías procesadas
        mostCommonCategory: categories.length > 0 ? categories[0].name : null,
        riskLevel: this.calculateRiskLevel(data.abuseConfidenceScore),  // Corregido
        riskExplanation: this.getRiskExplanation(data.abuseConfidenceScore, data.totalReports, categories),  // Incluir categorías
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        service: 'AbuseIPDB',
        ip: ipAddress,
        error: 'Service error',
        status: 'error',
        message: error.message
      };
    }
  }

  calculateRiskLevel(abuseConfidence) {
    if (abuseConfidence === undefined || abuseConfidence === null) return 'unknown';
    
    // Si tiene 0% de confianza de abuso, es limpia
    if (abuseConfidence === 0) return 'clean';
    
    // Clasificación original - menos estricta
    if (abuseConfidence > 0 && abuseConfidence < 15) return 'low_risk';     // Revertido a low_risk
    if (abuseConfidence < 35) return 'medium_risk';   // Revertido a medium_risk
    if (abuseConfidence < 65) return 'high_risk';     // Revertido a high_risk
    return 'malicious';  // 65%+ es definitivamente maliciosa
  }

  getRiskExplanation(abuseConfidence, totalReports, categories = []) {
    const categoryText = categories.length > 0 
      ? ` Categorías: ${categories.map(c => c.name).join(', ')}.`
      : '';
    
    if (abuseConfidence === 0) {
      return `IP limpia sin reportes de abuso. Confianza: ${abuseConfidence}%.`;
    }
    
    if (abuseConfidence < 15) {
      return `IP con pocos reportes de abuso (${abuseConfidence}% confianza, ${totalReports || 0} reportes).${categoryText} Riesgo bajo.`;
    }
    
    if (abuseConfidence < 35) {
      return `IP reportada como abusiva (${abuseConfidence}% confianza, ${totalReports || 0} reportes).${categoryText} Monitorear actividad.`;
    }
    
    if (abuseConfidence < 65) {
      return `IP con actividad sospechosa confirmada (${abuseConfidence}% confianza, ${totalReports || 0} reportes).${categoryText} Precaución recomendada.`;
    }
    
    return `IP confirmada como maliciosa (${abuseConfidence}% confianza, ${totalReports || 0} reportes).${categoryText} Amenaza crítica.`;
  }

  // Procesar categorías de los reportes
  processCategories(reports) {
    if (!reports || !Array.isArray(reports)) return [];
    
    const allCategories = new Set();
    reports.forEach(report => {
      if (report.categories && Array.isArray(report.categories)) {
        report.categories.forEach(catId => {
          allCategories.add(catId);
        });
      }
    });
    
    return Array.from(allCategories).map(catId => ({
      id: catId,
      name: this.categoryMap[catId] || `Unknown Category ${catId}`,
      severity: this.getCategorySeverity(catId)
    }));
  }
  
  // Determinar severidad de categoría
  getCategorySeverity(categoryId) {
    const highSeverity = [4, 15, 16, 18, 21]; // DDoS, Hacking, SQL Injection, Brute-Force, Web App Attack
    const mediumSeverity = [7, 14, 20, 22]; // Phishing, Port Scan, Exploited Host, SSH
    
    if (highSeverity.includes(categoryId)) return 'high';
    if (mediumSeverity.includes(categoryId)) return 'medium';
    return 'low';
  }
  
  isAvailable() {
    return !!this.apiKey;
  }
}

module.exports = new AbuseIPService();
