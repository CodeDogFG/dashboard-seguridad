# Copilot Instructions for Dashboard Seguridad

## Project Architecture

This is a **security metrics dashboard** project for analyzing domains, emails, and IPs through external security APIs. The monorepo structure separates `frontend/` and `backend/` directories with different tech stacks.

### Frontend Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict configuration
- **Vite** with rolldown bundler (`rolldown-vite@7.1.14`)
- **CSS** with native CSS variables and light/dark theme support
- **Status**: Components are placeholder files - most `.vue` files are empty

### Backend Stack
- **Node.js** with Express.js (`^5.1.0`)  
- **CommonJS** module system (`"type": "commonjs"`)
- **Redis** for caching with cache-aside pattern
- **axios** for external API calls
- **dotenv** for environment configuration
- **CORS** enabled for cross-origin requests

## Key Development Patterns

### Vue Component Structure
All components use Vue 3 `<script setup>` syntax with TypeScript:
```vue
<script setup lang="ts">
import { ref } from 'vue'
defineProps<{ msg: string }>()
const count = ref(0)
</script>
```

### TypeScript Configuration
The project uses a composite TypeScript setup:
- `tsconfig.json` - References configuration
- `tsconfig.app.json` - App-specific config with strict linting rules
- `tsconfig.node.json` - Node.js tooling config

Key compiler options include strict mode, unused variable checking, and `erasableSyntaxOnly` for performance.

### Styling Approach
- Global styles in `src/style.css` with CSS custom properties
- Automatic light/dark theme switching via `prefers-color-scheme`
- Scoped styles in Vue SFCs
- Centered layout pattern (main #app element with max-width and auto margins)

## Development Workflow

### Frontend Commands (in `frontend/` directory)
```bash
# Development server
npm run dev

# Type-check and build
npm run build  # Runs vue-tsc -b && vite build

# Preview production build
npm run preview
```

### Backend Architecture
- **Server**: `src/server.js` - Express setup with Redis integration and single `/api/analyze` endpoint
- **Controllers**: `src/controllers/securityController.js` - Orchestrates security service calls
- **Services**: Three external API integrations:
  - `src/services/virusTotalService.js` - Domain reputation analysis
  - `src/services/abuseIpService.js` - IP abuse detection
  - `src/services/shodanService.js` - IP port scanning (uses free InternetDB API)
- **Caching**: Redis cache-aside pattern with configurable TTL (default 1 hour)

### Critical Workflow Patterns

**Backend Development:**
```bash
# Start backend (requires Redis running)
cd backend && node src/server.js

# Test API endpoint
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"type":"domain","value":"example.com"}'
```

**Frontend Development:**
```bash
cd frontend && npm run dev  # Vite dev server with HMR
npm run build              # TypeScript check + Vite build
```

**Environment Setup:**
Backend requires `.env` file with API keys:
```
VIRUSTOTAL_API_KEY=your_key_here
ABUSEIPDB_API_KEY=your_key_here
REDIS_URL=redis://localhost:6379
PORT=5000
CORS_ORIGIN=http://localhost:8080
```

## Project-Specific Conventions

### File Organization
**Frontend:**
- `frontend/src/components/` - Reusable Vue components
- `frontend/src/assets/` - Static assets bundled by Vite
- `frontend/public/` - Static assets served directly
- Components use PascalCase naming (e.g., `HelloWorld.vue`)

**Backend:**
- `backend/src/controllers/` - Request orchestration (security analysis logic)
- `backend/src/services/` - External API integrations (VirusTotal, AbuseIPDB, Shodan)
- `backend/src/server.js` - Single-endpoint design with Redis caching middleware

### Security API Integration
Active external API integrations with proper error handling:
- **VirusTotal** - Domain reputation analysis (`getDomainReport`)
- **AbuseIPDB** - IP reputation with 90-day lookback (`getIpReport`)
- **Shodan InternetDB** - Free IP port scanning (no API key required)
- **Email Analysis** - Extracts domain from email addresses for VirusTotal analysis

### Module Systems
- **Frontend**: ES Modules (`"type": "module"`)
- **Backend**: CommonJS (`"type": "commonjs"`)

### IDE Setup
Requires Vue Language Features (Volar) extension for proper Vue 3 + TypeScript support.

## Critical Integration Points

### Frontend-Backend Communication
- Frontend (ES Modules + TypeScript) communicates with backend (CommonJS + JavaScript)
- Backend acts as secure API proxy to avoid exposing external API keys
- **Implemented** Redis caching with cache-aside pattern and configurable TTL
- Single POST endpoint `/api/analyze` handles all analysis types (`domain`, `ip`, `email`)

**Cache-Aside Pattern Example:**
```javascript
// Backend caching workflow in /api/analyze
const cacheKey = `security-scan:${type}:${value}`;
const cachedResult = await redisClient.get(cacheKey);
if (cachedResult) return JSON.parse(cachedResult);

const freshData = await securityController.analyze(type, value);
await redisClient.set(cacheKey, JSON.stringify(freshData), { EX: CACHE_TTL });
```

When implementing new features, maintain separation of concerns: frontend focuses on visualization, backend handles secure API orchestration.