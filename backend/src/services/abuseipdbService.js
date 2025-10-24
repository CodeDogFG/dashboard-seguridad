// backend/src/services/abuseipdbService.js
const axios = require("axios");

const ABUSEIPDB_API_KEY = process.env.AbuseIP_API_KEY;
const ABUSEIPDB_API_URL = "https://api.abuseipdb.com/api/v2/check";

/**
 * Analiza una dirección IP utilizando la API de AbuseIPDB.
 * @param {string} ip La dirección IP a analizar.
 * @returns {Promise<object>} Los datos del análisis de AbuseIPDB.
 */
const analyzeIp = async (ip) => {
  if (!ABUSEIPDB_API_KEY || ABUSEIPDB_API_KEY === "tu_api_key_de_abuseipdb") {
    console.warn(
      "⚠️  La API key de AbuseIPDB no está configurada. Saltando análisis de IP."
    );
    return {
      service: "AbuseIPDB",
      error: "API key no configurada.",
      skipped: true,
    };
  }

  try {
    const response = await axios.get(ABUSEIPDB_API_URL, {
      headers: {
        Key: ABUSEIPDB_API_KEY,
        Accept: "application/json",
      },
      params: {
        ipAddress: ip,
        maxAgeInDays: "90",
        verbose: true, // para obtener más detalles
      },
    });

    // La API devuelve 200 OK incluso si hay errores en la petición (ej. IP privada)
    // Esos errores vienen en el array `errors`.
    if (response.data.errors) {
      throw new Error(response.data.errors[0].detail);
    }

    return { service: "AbuseIPDB", ...response.data.data };
  } catch (error) {
    console.error("❌ Error al contactar con AbuseIPDB:", error.message);
    // Devolvemos un objeto de error consistente para que el frontend pueda manejarlo
    return {
      service: "AbuseIPDB",
      error: `Error en la petición a AbuseIPDB: ${error.message}`,
      skipped: true,
    };
  }
};

module.exports = {
  analyzeIp,
};
