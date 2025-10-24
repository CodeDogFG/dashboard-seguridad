/**
 * @file virusTotalService.js
 * @description Servicio para integración con la API v3 de VirusTotal.
 */

const axios = require("axios");

class VirusTotalService {
  constructor() {
    this.apiKey = process.env.VIRUSTOTAL_API_KEY;
    this.baseUrl = "https://www.virustotal.com/api/v3";
  }

  isAvailable() {
    return !!this.apiKey && this.apiKey !== "tu_api_key_de_virustotal";
  }

  async analyzeDomain(domain) {
    if (!this.isAvailable()) {
      return {
        service: "VirusTotal",
        status: "error",
        message: "VirusTotal API key not configured",
        riskScore: 0,
      };
    }

    try {
      console.log(`🔍 VirusTotal: Analyzing domain ${domain}`);
      const response = await axios.get(`${this.baseUrl}/domains/${domain}`, {
        headers: {
          "x-apikey": this.apiKey,
        },
        timeout: 15000,
      });

      const attributes = response.data.data.attributes;
      // Aquí puedes procesar y normalizar la respuesta de VirusTotal
      return {
        service: "VirusTotal",
        status: "success",
        data: attributes,
      };
    } catch (error) {
      console.error(`❌ VirusTotal Error for domain ${domain}:`, error.message);
      return {
        service: "VirusTotal",
        status: "error",
        message: error.message,
        riskScore: 0,
      };
    }
  }
}

module.exports = new VirusTotalService();
