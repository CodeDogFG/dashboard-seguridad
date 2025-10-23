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

```markdown
## Frontend notes for AI coding agents (Vue 3 + TypeScript)

Short summary
- Entry: `src/main.ts`. Main UI: `src/App.vue` and `src/components/SecurityDashboard.vue`.
- Charts & analysis live in `SecurityDashboard.vue` (Chart.js via `vue-chartjs`). Frontend posts to backend at :5000.

Patterns to preserve
- Use `<script setup lang="ts">`, scoped styles, and PascalCase component names.
- Reuse helpers in `SecurityDashboard.vue` (getRiskLabel/getRiskColor).
- Chart updates currently mutate `chartData` in-place; register Chart.js components where needed (`ChartJS.register(...)`).
- Centralize API URLs via `import.meta.env.VITE_API_BASE_URL` instead of inline strings.

Developer commands
- npm run dev  # start Vite dev server (:5173)
- npm run build  # runs `vue-tsc -b && vite build`
- npm run preview

Integration & tests
- API call pattern: `axios.post(`${API_BASE_URL}/api/analyze`, { type, value })` — frontend expects at least `riskScore` and optional `recommendations`.
- No tests present: when adding tests, mock `axios` and Redis, and focus on pure helpers.

Files to inspect when changing behavior
- `src/components/SecurityDashboard.vue` — charts, risk helpers, polling logic
- `src/components/DashboardChart.vue` and `InputForm.vue` — intentionally minimal/placeholders
- `vite.config.ts` and `package.json` — note Vite pinning (do not upgrade silently)

Ask before large changes: confirm backend response schema and whether placeholder components should be implemented now.
```
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
