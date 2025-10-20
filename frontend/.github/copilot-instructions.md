Security Dashboard — guidance for AI coding agents

This is a small Vue 3 + TypeScript SPA built with Vite.

Essential project overview
- Entry: `src/main.ts` mounts the app. Primary UI: `src/App.vue` and `src/components/SecurityDashboard.vue`.
- Charts and main analysis code are in `src/components/SecurityDashboard.vue` (uses Chart.js via `vue-chartjs`). It posts to a backend at http://localhost:5000 (look for `API_BASE_URL` in that file).
- Placeholders: `src/components/DashboardChart.vue`, `src/components/InputForm.vue`, `src/views/Home.vue` (safe to implement small components matching current style).

Developer workflows
- Dev server: `npm run dev`
- Build (includes type-check): `npm run build` (runs `vue-tsc -b` then `vite build`)
- Preview production build: `npm run preview`

Project-specific patterns and gotchas
- Components use `<script setup lang="ts">` and scoped styles — preserve that structure.
- `SecurityDashboard.vue` uses local reactive state (`ref` / `reactive`) and mutates `chartData` in-place for charts; there is a custom polling `$watch` helper (compares JSON every 100ms) instead of Vue's native watch in some places.
- API calls use axios and expect at least `riskScore` in the response, with optional `recommendations`.
- `vite` is pinned via an `overrides` entry to `rolldown-vite@7.1.14` in `package.json` — avoid upgrading Vite without checking compatibility.

Integration and change rules
- Centralize API URL usage when changing code: prefer `import.meta.env.VITE_API_BASE_URL` over inline strings.
- If you add chart code, register Chart.js components (see where `ChartJS.register(...)` is called in `SecurityDashboard.vue`).
- When writing tests, mock axios and focus on pure helpers (e.g., `getRiskLabel`, `getRiskColor`, chart update logic).

Quick examples to reuse
- Risk helpers in `SecurityDashboard.vue`: `getRiskLabel(score)` and `getRiskColor(score)` — reuse them for consistent UI.
- API example (mock in tests):

    axios.post(`${API_BASE_URL}/api/analyze`, { type: formData.type, value: formData.value.trim() })

Questions to ask before larger changes
- What exact backend schema should be supported beyond `riskScore` and `recommendations`?
- Should placeholders (`DashboardChart.vue`, `InputForm.vue`, `Home.vue`) be implemented now or kept minimal?

If you'd like, I can expand this with contributor notes (env vars, run instructions, or a migration note for the Vite pin). 
This repository is a small Vue 3 + TypeScript single-page app (Vite) called Security Dashboard.

Key points for an AI coding agent helping here:

- Project layout and entry points
  - `src/main.ts` mounts the app with `createApp(App).mount('#app')`. Work starting points: `src/App.vue` and `src/components/SecurityDashboard.vue`.
  - Charts and analysis logic live in `src/components/SecurityDashboard.vue` (uses Chart.js via `vue-chartjs`) and relies on an assumed backend at `http://localhost:5000` (`API_BASE_URL` constant).
  - Smaller UI components: `src/components/LoadingSpinner.vue`, `src/components/DashboardChart.vue` (empty), `src/components/InputForm.vue` (empty).

- Build / dev commands (from `package.json`)
  - Start dev server: `npm run dev` (Vite)
  - Build: `npm run build` (runs `vue-tsc -b && vite build`)
  - Preview build: `npm run preview`

- Language / tooling
  - Vue 3 + TypeScript. Files use `<script setup lang="ts">` style.
  - Type checking: `vue-tsc` is used in build. Keep TypeScript types minimal and narrow changes to existing patterns.

- API integration pattern
  - `SecurityDashboard.vue` calls a backend POST `/api/analyze` using `axios.post(API_BASE_URL + '/api/analyze', { type, value })`.
  - Responses are expected to contain at least `riskScore` and optional `recommendations`.
  - The frontend stores analysis results in-memory in `analysisResults` and computes charts via simple derived functions. No global store (Vuex/Pinia) is used.

This repository is a small Vue 3 + TypeScript single-page app (Vite) called Security Dashboard.

Key points for an AI coding agent helping here:

-- Project layout and entry points
  - src/main.ts mounts the application; primary work files: `src/App.vue` and `src/components/SecurityDashboard.vue`.
  - Charts and most analysis logic live in `src/components/SecurityDashboard.vue` (uses Chart.js via `vue-chartjs`) and expect a backend at http://localhost:5000 (see the `API_BASE_URL` constant).
  - Smaller UI pieces: `src/components/LoadingSpinner.vue` (UI-only), `src/components/DashboardChart.vue` (placeholder), `src/components/InputForm.vue` (placeholder), `src/views/Home.vue` (placeholder).

- Build / dev commands (from package.json)
  - Start dev server: `npm run dev` (Vite)
  - Build (type-check + bundle): `npm run build` (runs `vue-tsc -b && vite build`)
  - Preview production build locally: `npm run preview`

- Language / tooling
  - Vue 3 + TypeScript. Components use `<script setup lang="ts">` SFC format.
  - Type checking is enforced at build with `vue-tsc`. Keep types small and compatible with current patterns.
  - Vite is pinned via an `overrides` entry to `rolldown-vite@7.1.14` in `package.json` — avoid upgrading Vite without checking compatibility.

- API integration pattern (concrete)
  - POST to `/api/analyze` using axios: e.g. `axios.post(`${API_BASE_URL}/api/analyze`, { type, value })`.
  - Expected response fields (observed in code): `riskScore` (number) and optional `recommendations` (string[]). The frontend wraps the response into an `AnalysisResult` object and stores it in `analysisResults` in memory.
  - No global store is used; components rely on local reactive state.

This repository is a small Vue 3 + TypeScript single-page app (Vite) called Security Dashboard.

Key points for an AI coding agent helping here:

- Project layout and entry points
  - src/main.ts mounts the application; primary work files: `src/App.vue` and `src/components/SecurityDashboard.vue`.
  - Charts and most analysis logic live in `src/components/SecurityDashboard.vue` (uses Chart.js via `vue-chartjs`) and expect a backend at http://localhost:5000 (see the `API_BASE_URL` constant).
  - Smaller UI pieces: `src/components/LoadingSpinner.vue` (UI-only), `src/components/DashboardChart.vue` (placeholder), `src/components/InputForm.vue` (placeholder), `src/views/Home.vue` (placeholder).

- Build / dev commands (from package.json)
  - Start dev server: `npm run dev` (Vite)
  - Build (type-check + bundle): `npm run build` (runs `vue-tsc -b && vite build`)
  - Preview production build locally: `npm run preview`

- Language / tooling
  - Vue 3 + TypeScript. Components use `<script setup lang="ts">` SFC format.
  - Type checking is enforced at build with `vue-tsc`. Keep types small and compatible with current patterns.
  - Vite is pinned via an `overrides` entry to `rolldown-vite@7.1.14` in `package.json` — avoid upgrading Vite without checking compatibility.

- API integration pattern (concrete)
  - POST to `/api/analyze` using axios: e.g. `axios.post(`${API_BASE_URL}/api/analyze`, { type, value })`.
  - Expected response fields (observed in code): `riskScore` (number) and optional `recommendations` (string[]). The frontend wraps the response into an `AnalysisResult` object and stores it in `analysisResults` in memory.
  - No global store is used; components rely on local reactive state.

- UI & state patterns to follow
  - Local reactive state via `ref` and `reactive`. Example: `const analysisResults = ref<AnalysisResult[]>([])` in `SecurityDashboard.vue`.
  - A lightweight custom watcher is implemented in `SecurityDashboard.vue` (a polling-based `$watch` that compares JSON strings every 100ms). If adding reactivity, prefer Vue's native watchers unless you intentionally match the existing pattern.
  - Charts are mutated in-place by updating `chartData` objects and are passed to `Doughnut`, `Line`, and `Bar` components from `vue-chartjs`.
  - Forms use `v-model` + `@submit.prevent` and simple validation (trim and non-empty check).

- Files that are intentionally empty/placeholders
  - `src/components/DashboardChart.vue`, `src/components/InputForm.vue`, and `src/views/Home.vue` are placeholders. You may implement small, low-risk components into these using the existing CSS/scoped style and `<script setup lang="ts">`.

- Tests and CI
  - There is no test framework. If you add tests, mock `axios` for network calls and favor unit tests for pure functions (e.g., `getRiskLabel`, `getRiskColor`, chart update logic).

- When editing the codebase
  - Preserve single-file component structure and scoped styles.
  - When changing API URL usage, centralize it (replace inline `API_BASE_URL` with `import.meta.env.VITE_API_BASE_URL` and add `.env` entries) rather than scattering strings.
  - If adding chart components, remember to register Chart.js components (see `ChartJS.register(...)` in `SecurityDashboard.vue`).

Quick examples to reuse
  - Risk label helper: `getRiskLabel(score)` and color helper `getRiskColor(score)` live in `SecurityDashboard.vue` — reuse them to keep UI consistent.
  - API call example:
    ```ts
    await axios.post(`${API_BASE_URL}/api/analyze`, { type: formData.type, value: formData.value.trim() })
    ```

Questions to ask before large changes
  - What backend API responses should be considered (full field schema)? The frontend currently expects at least `riskScore` and optional `recommendations`.
  - Should empty placeholder components be implemented now or deferred? If implemented, follow existing styling and TypeScript conventions.

If you want, I can expand this file with short contributor notes (how to run, add env variables, or a migration note for pinning Vite).
