<script setup lang="ts">
// No props needed for this component
</script>

<template>
  <div class="loading-container">
    <div class="loading-content">
      <div class="spinner">
        <div class="shield-spinner">🛡️</div>
      </div>
      <h2>Inicializando Security Dashboard</h2>
      <p>Preparando análisis de seguridad...</p>
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  color: white;
  max-width: 400px;
  padding: 2rem;
}

.spinner {
  margin-bottom: 2rem;
}

.shield-spinner {
  font-size: 4rem;
  display: inline-block;
  animation: pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-content h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.loading-content p {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 2rem;
  font-weight: 300;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
  border-radius: 2px;
  animation: loading 2s ease-in-out infinite;
}

@keyframes loading {
  0% {
    width: 0%;
  }
  50% {
    width: 60%;
  }
  100% {
    width: 100%;
  }
}
</style>