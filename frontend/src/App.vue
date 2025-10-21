<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SecurityDashboard from './components/SecurityDashboard.vue'
import LoadingSpinner from './components/LoadingSpinner.vue'

const isLoading = ref(true)

onMounted(() => {
  // Simular carga inicial
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <div class="logo">
          <span class="shield-icon">🛡️</span>
          <h1>Security Dashboard</h1>
        </div>
        <div class="header-subtitle">
          <p>Análisis completo de seguridad para dominios, IPs y emails</p>
        </div>
      </div>
    </header>

    <main class="main-content">
      <LoadingSpinner v-if="isLoading" />
      <SecurityDashboard v-else />
    </main>

    <footer class="app-footer">
      <p>&copy; 2025 Security Dashboard - Desarrollado con Vue 3 + TypeScript</p>
    </footer>
  </div>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #000276 0%, #8000ff 100%);
  color: white;
  padding: 2rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.shield-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.logo h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.header-subtitle p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
  font-weight: 300;
}

.main-content {
  min-height: calc(100vh - 200px);
  padding: 2rem 0;
}

.app-footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

.app-footer p {
  margin: 0;
  opacity: 0.8;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
