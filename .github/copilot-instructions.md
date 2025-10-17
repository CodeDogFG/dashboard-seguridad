# Copilot Instructions for Dashboard Seguridad

## Project Architecture

This is a **security dashboard** project with a Vue 3 + TypeScript frontend and planned backend integration. The project is structured as a monorepo with separate `frontend/` and `backend/` directories.

### Frontend Stack
- **Vue 3** with Composition API (`<script setup>`)
- **TypeScript** with strict configuration
- **Vite** with rolldown bundler (`rolldown-vite@7.1.14`)
- **CSS** with native CSS variables and light/dark theme support

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

### Commands
```bash
# Development server
npm run dev

# Type-check and build
npm run build  # Runs vue-tsc -b && vite build

# Preview production build
npm run preview
```

### Build Process
The build process includes TypeScript type checking (`vue-tsc -b`) before Vite bundling, ensuring type safety in production builds.

## Project-Specific Conventions

### File Organization
- `/src/components/` - Reusable Vue components
- `/src/assets/` - Static assets bundled by Vite
- `/public/` - Static assets served directly
- Components use PascalCase naming (e.g., `HelloWorld.vue`)

### Security Context
This is a **security dashboard** application, so when implementing features:
- Consider data sensitivity and access control patterns
- Implement proper input validation and sanitization
- Follow security best practices for dashboard interfaces
- Plan for potential backend integration with security APIs

### IDE Setup
Requires Vue Language Features (Volar) extension for proper Vue 3 + TypeScript support.

## Next Steps for Development

The `backend/` directory is currently empty, indicating this project will likely need:
- Backend API integration
- Authentication/authorization systems  
- Security data visualization components
- Real-time dashboard updates

When implementing new features, maintain the existing patterns of strict TypeScript, composition API, and scoped component architecture.