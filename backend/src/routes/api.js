// backend/src/routes/api.js (CORREGIDO)

const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

// --- CAMBIO CLAVE: Importamos redisClient desde su propio módulo ---
const { redisClient } = require('../config/redisClient');

/**
 * @route   POST /api/analyze
 * @desc    Analiza una entidad (dominio, email o IP) buscando métricas de seguridad.
 */
router.post('/analyze', async (req, res) => {
  //... (El resto del código de esta ruta permanece exactamente igual)
  console.log("Cuerpo de la petición recibido:", req.body);
  const { type, value } = req.body;

  if (!type ||!value ||!['domain', 'email', 'ip'].includes(type)) {
    return res.status(400).json({ 
      success: false,
      message: 'Parámetros de entrada inválidos. Se requiere "type" (domain, email, ip) y "value".',
      received: req.body
    });
  }

  const cacheKey = `security-scan:${type}:${value}`;
  const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS, 10) || 3600;

  try {
    const cachedResult = await redisClient.get(cacheKey);

    if (cachedResult) {
      console.log(`[Cache Hit] para la clave: ${cacheKey}`);
      return res.json({
        query: value,
        type: type,
        cached: true,
        data: JSON.parse(cachedResult)
      });
    }

    console.log(`[Cache Miss] para la clave: ${cacheKey}. Obteniendo datos frescos...`);
    
    const freshData = await securityController.analyze(type, value);

    await redisClient.set(cacheKey, JSON.stringify(freshData), {
      EX: CACHE_TTL
    });
    console.log(`Cache poblado para la clave: ${cacheKey} con TTL de ${CACHE_TTL} segundos.`);

    return res.json({
      query: value,
      type: type,
      cached: false,
      data: freshData
    });

  } catch (error) {
    console.error(`Error procesando la petición para ${type} ${value}:`, error);
    
    if (error.isAxiosError) {
        const status = error.response? error.response.status : 500;
        const message = error.response? error.response.data : 'Error en la comunicación con el servicio externo.';
        return res.status(status).json({ error: 'Error en servicio externo', details: message });
    }
    
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;