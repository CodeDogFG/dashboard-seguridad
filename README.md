# 🛡️ Dashboard de Seguridad

Un panel de control moderno para análisis de métricas de seguridad que permite analizar dominios, direcciones IP y emails a través de múltiples APIs de seguridad externas.

![Dashboard de Seguridad](https://img.shields.io/badge/Status-En%20Desarrollo-yellow?style=for-the-badge)
![Vue 3](https://img.shields.io/badge/Vue.js-3.5.22-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#️-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Uso](#-uso)
- [APIs Integradas](#-apis-integradas)
- [Desarrollo](#️-desarrollo)
- [Documentación](#-documentación)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## Características

### Frontend
- **Vue 3** con Composition API y `<script setup>`
- **TypeScript** con configuración estricta
- **Vite** con bundler Rolldown para desarrollo ultrarrápido
- **Chart.js** para visualización de datos interactiva
- **Diseño responsive** con tema claro/oscuro automático
- **Interfaz intuitiva** para análisis de seguridad

### Backend
- **Node.js + Express** para API REST escalable
- **Arquitectura orientada a servicios** para integración con APIs externas
- **Redis** para caché inteligente y mejora de rendimiento
- **Rate limiting** y manejo de errores avanzado
- **Middleware de seguridad** con CORS configurado
- **Variables de entorno** protegidas

### 🔍 Análisis de Seguridad
- **Análisis de dominios**: Reputación, malware, categorías
- **Análisis de IPs**: Geolocalización, puertos abiertos, vulnerabilidades
- **Análisis de emails**: Extracción de dominio y análisis de reputación
- **Múltiples fuentes**: VirusTotal, AbuseIPDB, Shodan
- **Resultados consolidados** con scoring de riesgo

## Arquitectura

```
dashboard-seguridad/
├── 📁 frontend/          # Vue 3 + TypeScript + Vite
│   ├── 📁 src/
│   │   ├── 📁 components/    # Componentes Vue reutilizables
│   │   ├── 📁 services/      # Servicios de API y estado
│   │   ├── 📁 types/         # Definiciones de TypeScript
│   │   └── 📄 main.ts        # Punto de entrada
│   └── 📄 package.json
│
├── 📁 backend/           # Node.js + Express
│   ├── 📁 src/
│   │   ├── 📁 controllers/   # Controladores de API
│   │   ├── 📁 services/      # Integración con APIs externas
│   │   ├── 📁 middleware/    # CORS, validación, caché
│   │   └── 📄 server.js      # Servidor Express
│   └── 📄 package.json
│
├── 📁 .github/          # Configuración de GitHub
└── 📄 README.md
```

## Instalación

### Prerrequisitos

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0
- **Redis** (opcional, para caché)

### Instalación Rápida

```bash
# Clonar el repositorio
git clone https://github.com/CodeDogFG/dashboard-seguridad.git
cd dashboard-seguridad

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

## Configuración

### 1. Variables de Entorno del Backend

Crea un archivo `.env` en el directorio `backend/`:

```env
# Configuración del Servidor
PORT=5000
NODE_ENV=development

# URLs de Frontend
FRONTEND_URL=http://localhost:5173

# API Keys de Servicios de Seguridad
VIRUSTOTAL_API_KEY=tu_api_key_de_virustotal
SHODAN_API_KEY=tu_api_key_de_shodan
AbuseIP_API_KEY=tu_api_key_de_abuseipdb

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Redis (opcional)
REDIS_URL=redis://localhost:6379

# Seguridad
SESSION_SECRET=tu_session_secret_aqui
JWT_SECRET=tu_jwt_secret_aqui

# Logging
LOG_LEVEL=info
```

### 2. Obtener API Keys

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **AbuseIPDB** | [abuseipdb.com/api](https://www.abuseipdb.com/api) | Base de datos de IPs maliciosas |

### 3. Configurar Redis (Opcional)
```bash
#Instalar Docker

# Windows (con Chocolatey)
choco install redis-64

# macOS (con Homebrew)
brew install redis

# Ubuntu/Debian
sudo apt install redis-server

# Docker
docker run -d -p 6379:6379 redis:alpine
```

## Uso

### Desarrollo

```bash
# Terminal 1: Iniciar el backend
cd backend
npm run dev
# 🚀 Backend running on http://localhost:5000

# Terminal 2: Iniciar el frontend
cd frontend
npm run dev
# 🎨 Frontend running on http://localhost:5173
```

### Producción

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm run preview
```

### Probar la API

```bash
# Health Check
curl http://localhost:5000/api/health

# Analizar un dominio
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"entity": "google.com", "type": "domain"}'

# Analizar una IP
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"entity": "8.8.8.8", "type": "ip"}'
```

## 🔌 APIs Integradas


### AbuseIPDB API v2
- ✅ **Reputación de IPs**: Porcentaje de confianza de abuso
- ✅ **Reportes históricos**: Hasta 90 días
- 📊 **Rate limit**: 1000 requests/día (API gratuita)


## 🛠️ Desarrollo

### Estructura de Comandos

```bash
# Frontend
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build

# Backend
npm start        # Iniciar servidor
npm test         # Ejecutar tests (pendiente)
npm run lint     # Linting (pendiente)
```

### Tecnologías Utilizadas

#### Frontend
- **Vue 3**: Framework progresivo con Composition API
- **TypeScript**: Tipado estático para JavaScript
- **Vite**: Build tool ultrarrápido con Rolldown
- **Chart.js**: Biblioteca de gráficos interactivos
- **Axios**: Cliente HTTP para comunicación con APIs

#### Backend
- **Express 5**: Framework web minimalista para Node.js
- **Redis**: Base de datos en memoria para caché
- **Axios**: Cliente HTTP para APIs externas
- **CORS**: Middleware para cross-origin requests
- **Dotenv**: Gestión de variables de entorno

### Convenciones de Código

- **Frontend**: ES Modules, TypeScript estricto
- **Backend**: CommonJS, JSDoc para documentación
- **Estilos**: CSS nativo con custom properties
- **Commits**: Conventional Commits

## 📚 Documentación

### Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Estado del servidor y APIs |
| `GET` | `/api/config` | Configuración de API keys |
| `POST` | `/api/analyze` | Analizar entidad (domain/ip/email) |

## 🔒 Seguridad

### Protección de API Keys
- ✅ Variables de entorno protegidas con `.env`
- ✅ `.gitignore` configurado para excluir datos sensibles
- ✅ Backend como proxy seguro para APIs externas
- ✅ CORS configurado para dominios específicos

### Rate Limiting
- ✅ Límites por ventana de tiempo configurable
- ✅ Caché Redis para reducir llamadas a APIs
- ✅ Manejo inteligente de errores 429

### Validación
- ✅ Validación de entrada en frontend y backend
- ✅ Sanitización de parámetros
- ✅ Manejo seguro de errores

## 🚧 Estado del Proyecto

### ✅ Completado
- [x] Arquitectura base del monorepo
- [x] Backend con Express y integración de APIs
- [x] Controladores y servicios de seguridad
- [x] Configuración de TypeScript estricta
- [x] Sistema de variables de entorno
- [x] Documentación completa

### 🔄 En Progreso
- [ ] Frontend Vue 3 con componentes modernos
- [ ] Visualización con Chart.js
- [ ] Sistema de caché con Redis
- [ ] Tests unitarios y de integración

### 📋 Por Hacer
- [ ] Autenticación y autorización
- [ ] Dashboard en tiempo real
- [ ] Exportación de reportes
- [ ] Despliegue con Docker
- [ ] CI/CD con GitHub Actions
- [ ] Implementación de otra APIS como Shodan, VirusTotal

## 🤝 Contribuir

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### Guías de Contribución

- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades
- Actualiza la documentación cuando sea necesario
- Utiliza Conventional Commits

## Soporte

Si tienes preguntas o problemas:

- 🐛 **Issues**: [GitHub Issues](https://github.com/CodeDogFG/dashboard-seguridad/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/CodeDogFG/dashboard-seguridad/discussions)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

<div align="center">

**Desarrollado con ❤️ por [CodeDogFG](https://github.com/CodeDogFG)**. 
**Fegotech**

<img width="375" height="375" alt="logo-md" src="https://github.com/user-attachments/assets/78e8fd0e-6cdc-4fc0-9e90-7773e40c9ad1" />

[![GitHub Stars](https://img.shields.io/github/stars/CodeDogFG/dashboard-seguridad?style=social)](https://github.com/CodeDogFG/dashboard-seguridad/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/CodeDogFG/dashboard-seguridad?style=social)](https://github.com/CodeDogFG/dashboard-seguridad/network/members)

</div>
