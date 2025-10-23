# 🛡️ Simplified IP Security Dashboard

Un dashboard simplificado para análisis de direcciones IP usando únicamente AbuseIPDB API.

## ✨ Características Simplificadas

- **Solo análisis de IPs**: Se eliminaron dominios y emails para enfocarse en análisis de IPs
- **AbuseIPDB API**: Única fuente de datos de seguridad para reputación de IPs
- **Vue 3 + TypeScript**: Frontend moderno con componentes reactivos
- **Node.js + Express**: Backend simple con un solo endpoint
- **Redis Caching**: Caché para optimizar llamadas a la API
- **Validación de IPs**: Validación tanto en frontend como backend

## 🚀 Inicio Rápido

### 1. Configurar Backend

```bash
cd backend
npm install

# Crear archivo .env
cp .env.example .env
# Agregar tu API key de AbuseIPDB: AbuseIP_API_KEY=tu_api_key_aqui

# Iniciar servidor
npm run dev
```

### 2. Configurar Frontend

```bash
cd frontend
npm install

# Iniciar servidor de desarrollo
npm run dev
```

### 3. Probar la API

```powershell
# Desde el directorio backend
./test-simplified-api.ps1
```

## 📋 API Endpoints

### POST /api/analyze
Analiza una dirección IP usando AbuseIPDB.

**Request:**
```json
{
  "type": "ip",
  "entity": "8.8.8.8"
}
```

**Response:**
```json
{
  "success": true,
  "entity": "8.8.8.8",
  "type": "ip",
  "data": {
    "services": {
      "abuseIP": {
        "abuseConfidencePercentage": 0,
        "countryCode": "US",
        "riskScore": 0,
        "riskLevel": "low"
      }
    },
    "summary": {
      "risk_score": 0,
      "risk_level": "low",
      "threats_detected": 0,
      "abuse_confidence": 0
    }
  }
}
```

### GET /api/health
Estado del servidor y configuración de APIs.

### GET /api/config
Configuración de API keys y límites.

## 🔧 Configuración

### Variables de Entorno (backend/.env)

```env
# AbuseIPDB API (Requerida)
AbuseIP_API_KEY=tu_api_key_aqui

# Configuración del servidor
PORT=5000
CORS_ORIGIN=http://localhost:5173

# Redis (Opcional pero recomendado)
REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=3600
```

### Obtener API Key de AbuseIPDB

1. Regístrate en [AbuseIPDB](https://www.abuseipdb.com/api)
2. Ve a tu panel de usuario
3. Genera una API key gratuita
4. Agrega la key a tu archivo `.env`

## 🎯 Características Técnicas

- **Solo análisis de IPs**: Type debe ser `"ip"`, otros tipos son rechazados
- **Validación de formato**: Regex para validar formato IPv4
- **Cache con Redis**: TTL configurable (por defecto 1 hora)
- **Manejo de errores**: Rate limiting y errores de API manejados
- **Categorías de amenazas**: Mapeo de categorías de AbuseIPDB a nombres legibles

## 🧪 Testing

```powershell
# Test completo de la API
./test-simplified-api.ps1

# Test manual
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"type":"ip","entity":"8.8.8.8"}'
```

## 📊 Frontend

- **Interfaz simplificada**: Solo campo para IP
- **Validación en tiempo real**: Formato de IP
- **Gráficos de categorías**: Visualización de tipos de amenazas
- **Historial de análisis**: Resultados recientes con detalles

## 🔒 Limitaciones

- **Solo IPv4**: No soporta IPv6 actualmente
- **Una sola fuente**: Solo AbuseIPDB (no VirusTotal ni Shodan)
- **Rate limits**: Límites de API gratuita de AbuseIPDB (1000 req/día)

## 🐛 Troubleshooting

### Backend
- **Error de conexión**: Verificar que Redis esté ejecutándose
- **API key inválida**: Verificar `AbuseIP_API_KEY` en `.env`
- **Rate limit**: Esperar antes de hacer más requests

### Frontend
- **Error de CORS**: Verificar `CORS_ORIGIN` en backend
- **Tipos TypeScript**: Usar solo `type: 'ip'`

## 📝 Cambios de la Versión Completa

### Eliminado:
- ✂️ Análisis de dominios y emails
- ✂️ Integración con VirusTotal
- ✂️ Integración con Shodan
- ✂️ Múltiples tipos de análisis

### Simplificado:
- ✅ Un solo endpoint `/api/analyze`
- ✅ Un solo servicio `abuseIpService.js`
- ✅ Frontend enfocado en IPs
- ✅ Configuración más simple

---

**Versión**: 2.0.0 (Simplificada)  
**Fecha**: Octubre 2025