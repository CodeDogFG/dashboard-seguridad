// Rutas API temporales sin Redis
const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 */
router.get('/health', securityController.healthCheck);

/**
 * @route   GET /api/config
 * @desc    Configuration status endpoint
 */
router.get('/config', securityController.getConfig);

/**
 * @route   POST /api/reports
 * @desc    Obtiene reportes detallados de una IP usando el endpoint REPORTS de AbuseIPDB
 */
router.post('/reports', securityController.getDetailedReports);

/**
 * @route   POST /api/analyze
 * @desc    Analiza una IP sin cache Redis (debug mode)
 */
router.post('/analyze', async (req, res) => {
  console.log("Cuerpo de la petición recibido:", req.body);
  
  const { type, entity, value } = req.body;
  const targetValue = entity || value;

  if (!type || !targetValue) {
    return res.status(400).json({ 
      success: false,
      message: 'Parámetros de entrada inválidos. Se requiere "type" y "entity" (o "value").',
      received: req.body
    });
  }

  // Solo acepta IPs en modo debug
  if (type !== 'ip') {
    return res.status(400).json({ 
      success: false,
      message: 'En modo debug solo se admite análisis de IPs',
      received: req.body
    });
  }

  try {
    console.log(`[Debug Mode] Analizando ${type}: ${targetValue}`);
    
    const freshData = await securityController.analyze(type, targetValue);

    return res.json({
      success: true,
      query: targetValue,
      type: type,
      cached: false,
      data: freshData
    });

  } catch (error) {
    console.error(`Error procesando la petición para ${type} ${targetValue}:`, error);
    
    if (error.isAxiosError) {
        const status = error.response ? error.response.status : 500;
        const message = error.response ? error.response.data : 'Error en la comunicación con el servicio externo.';
        return res.status(status).json({ 
          success: false,
          error: 'Error en servicio externo', 
          details: message 
        });
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor.' 
    });
  }
});

module.exports = router;