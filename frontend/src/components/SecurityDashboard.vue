<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  BarElement
} from 'chart.js'
import { Line, Doughnut, Bar } from 'vue-chartjs'
import axios from 'axios'

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

// Tipos TypeScript
interface AnalysisResult {
  type: string
  value: string
  timestamp: string
  riskScore: number
  details: any
  recommendations: string[]
}

interface FormData {
  type: 'domain' | 'ip' | 'email'
  value: string
}

// Estado reactivo
const isLoading = ref(false)
const analysisResults = ref<AnalysisResult[]>([])
const formData = reactive<FormData>({
  type: 'domain',
  value: ''
})

const error = ref('')
const successMessage = ref('')

// Configuración del backend
const API_BASE_URL = 'http://localhost:5000'

// Función para analizar entidad
const analyzeEntity = async () => {
  if (!formData.value.trim()) {
    error.value = 'Por favor, ingresa un valor para analizar'
    return
  }

  isLoading.value = true
  error.value = ''
  successMessage.value = ''

  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      type: formData.type,
      value: formData.value.trim()
    })

    const result: AnalysisResult = {
      type: formData.type,
      value: formData.value.trim(),
      timestamp: new Date().toISOString(),
      riskScore: response.data.riskScore || 0,
      details: response.data,
      recommendations: response.data.recommendations || []
    }

    analysisResults.value.unshift(result)
    successMessage.value = `Análisis completado para ${formData.type}: ${formData.value}`
    
    // Limpiar formulario
    formData.value = ''
  } catch (err: any) {
    console.error('Error al analizar:', err)
    error.value = err.response?.data?.error || 'Error al conectar con el servidor'
  } finally {
    isLoading.value = false
  }
}

// Datos para gráficos
const chartData = ref({
  riskDistribution: {
    labels: ['Bajo Riesgo', 'Riesgo Medio', 'Alto Riesgo'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      borderWidth: 0
    }]
  },
  analysisHistory: {
    labels: [] as string[],
    datasets: [{
      label: 'Puntuación de Riesgo',
      data: [] as number[],
      borderColor: '#6366F1',
      backgroundColor: 'rgba(99, 102, 241, 0.1)',
      tension: 0.4
    }]
  },
  entityTypes: {
    labels: ['Dominios', 'IPs', 'Emails'],
    datasets: [{
      label: 'Análisis por Tipo',
      data: [0, 0, 0],
      backgroundColor: ['#3B82F6', '#8B5CF6', '#06B6D4']
    }]
  }
})

// Opciones de gráficos
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const
    }
  }
}

// Función para actualizar gráficos
const updateCharts = () => {
  if (analysisResults.value.length === 0) return

  // Distribución de riesgo
  const lowRisk = analysisResults.value.filter(r => r.riskScore < 30).length
  const mediumRisk = analysisResults.value.filter(r => r.riskScore >= 30 && r.riskScore < 70).length
  const highRisk = analysisResults.value.filter(r => r.riskScore >= 70).length
  
  if (chartData.value.riskDistribution.datasets[0]) {
    chartData.value.riskDistribution.datasets[0].data = [lowRisk, mediumRisk, highRisk]
  }

  // Historial de análisis (últimos 10)
  const recentResults = analysisResults.value.slice(0, 10).reverse()
  chartData.value.analysisHistory.labels = recentResults.map((_, index) => `#${index + 1}`)
  if (chartData.value.analysisHistory.datasets[0]) {
    chartData.value.analysisHistory.datasets[0].data = recentResults.map(r => r.riskScore)
  }

  // Tipos de entidades
  const domains = analysisResults.value.filter(r => r.type === 'domain').length
  const ips = analysisResults.value.filter(r => r.type === 'ip').length
  const emails = analysisResults.value.filter(r => r.type === 'email').length
  
  if (chartData.value.entityTypes.datasets[0]) {
    chartData.value.entityTypes.datasets[0].data = [domains, ips, emails]
  }
}

// Función para obtener color de riesgo
const getRiskColor = (score: number): string => {
  if (score < 30) return '#10B981' // Verde
  if (score < 70) return '#F59E0B' // Amarillo
  return '#EF4444' // Rojo
}

// Función para obtener etiqueta de riesgo
const getRiskLabel = (score: number): string => {
  if (score < 30) return 'Bajo Riesgo'
  if (score < 70) return 'Riesgo Medio'
  return 'Alto Riesgo'
}

// Limpiar mensajes después de 5 segundos
const clearMessages = () => {
  setTimeout(() => {
    error.value = ''
    successMessage.value = ''
  }, 5000)
}

// Watchers para actualizar gráficos y limpiar mensajes
const watchAnalysisResults = () => {
  updateCharts()
}

// Ciclo de vida
onMounted(() => {
  console.log('SecurityDashboard montado')
})

// Observar cambios en analysisResults
const $watch = (source: any, callback: Function) => {
  // Implementación simple de watcher
  let oldValue = JSON.stringify(source.value)
  const timer = setInterval(() => {
    const newValue = JSON.stringify(source.value)
    if (oldValue !== newValue) {
      callback()
      oldValue = newValue
    }
  }, 100)
  
  return () => clearInterval(timer)
}

$watch(analysisResults, watchAnalysisResults)
$watch(error, clearMessages)
$watch(successMessage, clearMessages)
</script>

<template>
  <div class="security-dashboard">
    <!-- Panel de análisis -->
    <div class="analysis-panel">
      <div class="panel-header">
        <h2>🔍 Análisis de Seguridad</h2>
        <p>Analiza dominios, IPs y direcciones de email</p>
      </div>

      <form @submit.prevent="analyzeEntity" class="analysis-form">
        <div class="form-group">
          <label for="type">Tipo de análisis:</label>
          <select id="type" v-model="formData.type" class="form-select">
            <option value="domain">Dominio</option>
            <option value="ip">Dirección IP</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div class="form-group">
          <label for="value">{{ formData.type === 'domain' ? 'Dominio' : formData.type === 'ip' ? 'IP' : 'Email' }}:</label>
          <input 
            id="value"
            v-model="formData.value" 
            type="text" 
            class="form-input"
            :placeholder="formData.type === 'domain' ? 'example.com' : formData.type === 'ip' ? '192.168.1.1' : 'user@example.com'"
            :disabled="isLoading"
            required
          />
        </div>

        <button type="submit" class="analyze-btn" :disabled="isLoading">
          <span v-if="isLoading">🔄 Analizando...</span>
          <span v-else>🚀 Analizar</span>
        </button>
      </form>

      <!-- Mensajes -->
      <div v-if="error" class="message error-message">
        ❌ {{ error }}
      </div>
      <div v-if="successMessage" class="message success-message">
        ✅ {{ successMessage }}
      </div>
    </div>

    <!-- Resultados y gráficos -->
    <div class="results-section" v-if="analysisResults.length > 0">
      <!-- Estadísticas generales -->
      <div class="stats-grid">
        <div class="stat-card">
          <h3>{{ analysisResults.length }}</h3>
          <p>Análisis Realizados</p>
        </div>
        <div class="stat-card">
          <h3>{{ Math.round(analysisResults.reduce((acc, r) => acc + r.riskScore, 0) / analysisResults.length) }}</h3>
          <p>Riesgo Promedio</p>
        </div>
        <div class="stat-card">
          <h3>{{ analysisResults.filter(r => r.riskScore >= 70).length }}</h3>
          <p>Alertas Críticas</p>
        </div>
      </div>

      <!-- Gráficos -->
      <div class="charts-grid">
        <div class="chart-container">
          <h3>Distribución de Riesgo</h3>
          <div class="chart-wrapper">
            <Doughnut :data="chartData.riskDistribution" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-container">
          <h3>Historial de Análisis</h3>
          <div class="chart-wrapper">
            <Line :data="chartData.analysisHistory" :options="chartOptions" />
          </div>
        </div>

        <div class="chart-container">
          <h3>Tipos de Entidades</h3>
          <div class="chart-wrapper">
            <Bar :data="chartData.entityTypes" :options="chartOptions" />
          </div>
        </div>
      </div>

      <!-- Lista de resultados -->
      <div class="results-list">
        <h3>📊 Resultados Recientes</h3>
        <div class="results-grid">
          <div 
            v-for="result in analysisResults.slice(0, 6)" 
            :key="`${result.type}-${result.value}-${result.timestamp}`"
            class="result-card"
          >
            <div class="result-header">
              <span class="result-type">{{ result.type.toUpperCase() }}</span>
              <span 
                class="risk-badge" 
                :style="{ backgroundColor: getRiskColor(result.riskScore) }"
              >
                {{ result.riskScore }}
              </span>
            </div>
            <div class="result-value">{{ result.value }}</div>
            <div class="result-status" :style="{ color: getRiskColor(result.riskScore) }">
              {{ getRiskLabel(result.riskScore) }}
            </div>
            <div class="result-time">
              {{ new Date(result.timestamp).toLocaleString() }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-state">
      <div class="empty-icon">🛡️</div>
      <h3>¡Comienza tu primer análisis!</h3>
      <p>Utiliza el formulario superior para analizar dominios, IPs o direcciones de email.</p>
    </div>
  </div>
</template>

<style scoped>
.security-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  gap: 2rem;
  display: flex;
  flex-direction: column;
}

/* Panel de análisis */
.analysis-panel {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.panel-header {
  margin-bottom: 2rem;
  text-align: center;
}

.panel-header h2 {
  color: #1F2937;
  margin-bottom: 0.5rem;
  font-size: 1.8rem;
  font-weight: 600;
}

.panel-header p {
  color: #6B7280;
  font-size: 1rem;
}

.analysis-form {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 1rem;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.form-select,
.form-input {
  padding: 0.75rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #6366F1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.analyze-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  white-space: nowrap;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Mensajes */
.message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 500;
}

.error-message {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.success-message {
  background: #F0FDF4;
  color: #059669;
  border: 1px solid #BBF7D0;
}

/* Sección de resultados */
.results-section {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Estadísticas */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-card h3 {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #6B7280;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Gráficos */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.chart-container {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.chart-container h3 {
  margin-bottom: 1rem;
  color: #1F2937;
  font-size: 1.2rem;
  font-weight: 600;
}

.chart-wrapper {
  height: 250px;
  position: relative;
}

/* Lista de resultados */
.results-list {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.results-list h3 {
  margin-bottom: 1.5rem;
  color: #1F2937;
  font-size: 1.4rem;
  font-weight: 600;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.result-card {
  padding: 1.5rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.result-type {
  background: #F3F4F6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.risk-badge {
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
  word-break: break-all;
}

.result-status {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.result-time {
  color: #6B7280;
  font-size: 0.8rem;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6B7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .analysis-form {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .analysis-panel,
  .stat-card,
  .chart-container,
  .results-list {
    background: #1F2937;
    border-color: #374151;
  }
  
  .panel-header h2,
  .stat-card h3,
  .chart-container h3,
  .results-list h3,
  .result-value {
    color: #F9FAFB;
  }
  
  .panel-header p,
  .stat-card p,
  .result-time {
    color: #D1D5DB;
  }
  
  .form-group label {
    color: #E5E7EB;
  }
  
  .form-select,
  .form-input {
    background: #374151;
    border-color: #4B5563;
    color: #F9FAFB;
  }
  
  .form-select:focus,
  .form-input:focus {
    border-color: #6366F1;
  }
  
  .result-card {
    background: #374151;
    border-color: #4B5563;
  }
  
  .result-type {
    background: #4B5563;
    color: #E5E7EB;
  }
  
  .empty-state h3 {
    color: #E5E7EB;
  }
}
</style>