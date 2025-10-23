# Copilot Instructions for Dashboard Seguridad

## Project Architecture

This is a **security metrics dashboard** project for analyzing domains, emails, and IPs through external security APIs. The monorepo structure separates `frontend/` and `backend/` directories with different tech stacks.

### Frontend Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict configuration (`erasableSyntaxOnly` for performance)
- **Vite** with rolldown bundler (`rolldown-vite@7.1.14`)
- **Chart.js + vue-chartjs** for data visualization (Line, Doughnut, Bar charts)
- **CSS** with native CSS variables and automatic light/dark theme support
- **Status**: Main components implemented but need real API integration
```markdown
# Copilot Instructions — Simplified IP Security Dashboard

This monorepo is a **simplified security dashboard** for analyzing IP addresses using **AbuseIPDB API only**. Frontend (Vue 3 + TypeScript + Vite) and backend (Node.js + Express, CommonJS) with Redis caching.

Key files (quick jump):
- backend/src/server.js — starts server and connects Redis
- backend/src/routes/api.js — `/api/analyze` endpoint and cache middleware
- backend/src/controllers/securityController.js — orchestrates IP analysis
- backend/src/services/abuseIpService.js — AbuseIPDB integration (IP analysis only)
- backend/src/config/redisClient.js — Redis client/connection
- frontend/src/components/SecurityDashboard.vue — unified UI with IP analysis, charts, and detailed statistics
- frontend/src/main.ts — app entry

Essential patterns and constraints:
- **IP-only analysis**: Only `type: 'ip'` is supported. Domain and email analysis removed.
- Backend uses cache-aside with Redis (default TTL ~3600s). Redis must be available before starting.
- Backend is CommonJS; frontend is ES modules. Keep module styles separate when editing.
- Frontend components use `<script setup lang="ts">` and strict TypeScript. Reuse `getRiskLabel` / `getRiskColor` from `SecurityDashboard.vue` for consistent UI.
- Chart.js components are registered in `SecurityDashboard.vue`; mutate `chartData` in-place (existing pattern).
- Vite is pinned via an overrides entry (rolldown-vite). Don't upgrade Vite without checking compatibility.
- **API key**: `AbuseIP_API_KEY` uses an underscore (important for `.env` and tests).

Developer workflows (fast references):
- Start backend (PowerShell):
  cd backend; npm run dev  # or: node src/server.js (server connects to Redis)
- Run backend test script (PowerShell):
  ./test-api.ps1
- Start frontend:
  cd frontend; npm run dev  # Vite on :5173
- Build frontend:
  cd frontend; npm run build  # runs vue-tsc -b && vite build

API / integration examples:
- Frontend → backend call (observed):
  await axios.post(`${API_BASE_URL}/api/analyze`, { type: 'ip', entity: '192.168.1.1' })
- Backend validates IP format and only accepts `type: 'ip'`
- Response structure: `{ success: true, data: { services: { abuseIP: {...} }, summary: { risk_score, risk_level, threats_detected, abuse_confidence } } }`
- Backend cache-aside pattern:
  const cached = await redisClient.get(key); if (cached) return JSON.parse(cached); const fresh = await analyze('ip', value); await redisClient.set(key, JSON.stringify(fresh), { EX: CACHE_TTL });

Tests and safety notes:
- There are no test frameworks currently. If you add tests, mock `axios` and Redis for unit tests. Focus on pure helpers (risk label/color, chart update logic).
- Preserve UI conventions: scoped styles, PascalCase components, and `<script setup>` usage.
- IP validation: Frontend and backend both validate IP format using regex.

When you need more context, jump to the files listed above. Frontend expects `riskScore`, `abuse_confidence`, and optional `categories` from AbuseIPDB response.

— End
```