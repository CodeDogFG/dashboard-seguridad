<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  Title, 
  Tooltip, 
  Legend,
  BarElement
} from 'chart.js'
import { Bar } from 'vue-chartjs'
import axios from 'axios'

// Registrar componentes de Chart.js necesarios para gráfico de barras
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  BarElement
)

// Tipos TypeScript
interface AnalysisResult {
  type: string
  value: string
  timestamp: string
  riskScore: number
  details: {
    entity: string
    type: string
    timestamp: string
    services: {
      virusTotal?: any
      abuseIP?: any
      shodan?: any
    }
    summary: {
      risk_score: number
      risk_level: string
      threats_detected: number
    }
    extracted_domain?: string
  }
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
    console.log('🔍 Enviando petición a:', `${API_BASE_URL}/api/analyze`)
    console.log('📤 Datos enviados:', { type: formData.type, value: formData.value.trim() })
    
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, {
      type: formData.type,
      value: formData.value.trim()
    })

    console.log('📡 Respuesta completa del backend:', response)
    console.log('📊 Datos de respuesta:', response.data)
    console.log('🎯 Summary:', response.data.data?.summary)
    console.log('💯 Risk Score recibido:', response.data.data?.summary?.risk_score)

    const result: AnalysisResult = {
      type: formData.type,
      value: formData.value.trim(),
      timestamp: new Date().toISOString(),
      riskScore: response.data.data?.summary?.risk_score || 0,
      details: response.data.data || response.data,
      recommendations: response.data.data?.recommendations || []
    }

    analysisResults.value.unshift(result)
    successMessage.value = `Análisis completado para ${formData.type}: ${formData.value}`
    
    // Limpiar formulario
    formData.value = ''
  } catch (err: any) {
    console.error('❌ Error completo al analizar:', err)
    console.error('❌ Error response:', err.response)
    console.error('❌ Error message:', err.message)
    console.error('❌ Error config:', err.config)
    
    if (err.response?.status === 400) {
      error.value = err.response.data.message || 'Datos de entrada inválidos'
    } else if (err.response?.status === 500) {
      error.value = 'Error interno del servidor. Por favor, inténtalo de nuevo.'
    } else if (err.code === 'ECONNREFUSED') {
      error.value = 'No se puede conectar al servidor backend. ¿Está ejecutándose en el puerto 5000?'
    } else {
      error.value = err.response?.data?.error || 'Error al conectar con el servidor'
    }
  } finally {
    isLoading.value = false
  }
}

// Datos para gráfico de categorías de reportes
const chartData = ref({
  categoryReports: {
    labels: [] as string[],
    datasets: [{
      label: 'Cantidad de Reportes',
      data: [] as number[],
      backgroundColor: [
        '#EF4444', // Rojo - Alta severidad
        '#F59E0B', // Amarillo - Media severidad  
        '#10B981', // Verde - Baja severidad
        '#8B5CF6', // Morado
        '#06B6D4', // Cyan
        '#F97316', // Naranja
        '#EC4899', // Rosa
        '#84CC16', // Lima
        '#6366F1', // Índigo
        '#14B8A6', // Teal
        '#F59E0B', // Ámbar
        '#EF4444'  // Rojo alternativo
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  }
})

// Opciones específicas para gráfico de categorías
const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false // No mostrar leyenda para gráfico de barras
    },
    title: {
      display: true,
      text: 'Categorías de Amenazas con Reportes',
      font: {
        size: 16,
        weight: 'bold' as const
      }
    },
    tooltip: {
      callbacks: {
        title: (tooltipItems: any[]) => {
          return `${tooltipItems[0].label}`
        },
        label: (context: any) => {
          return `Reportes: ${context.parsed.y}`
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        callback: function(value: any) {
          return Number.isInteger(value) ? value : null
        }
      },
      title: {
        display: true,
        text: 'Cantidad de Reportes'
      }
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45
      },
      title: {
        display: true,
        text: 'Categorías de Amenazas'
      }
    }
  }
}

// Función para actualizar gráfico de categorías
const updateCharts = () => {
  if (analysisResults.value.length === 0) return

  // Contar reportes por categoría de AbuseIPDB
  const categoryCount = new Map<string, number>()
  
  analysisResults.value.forEach(result => {
    // Solo procesar resultados que tengan datos de AbuseIPDB con categorías
    if (result.details?.services?.abuseIP?.categories) {
      result.details.services.abuseIP.categories.forEach((category: any) => {
        const categoryName = category.name
        categoryCount.set(categoryName, (categoryCount.get(categoryName) || 0) + 1)
      })
    }
  })

  // Convertir a arrays para Chart.js, ordenar por cantidad de reportes
  // Solo mostrar categorías que tienen reportes (> 0)
  const sortedCategories = Array.from(categoryCount.entries())
    .filter(([, count]) => count > 0) // Filtrar solo categorías con reportes
    .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor
    .slice(0, 15) // Mostrar máximo 15 categorías para mejor visualización

  if (sortedCategories.length > 0) {
    chartData.value.categoryReports = {
      labels: sortedCategories.map(([name]) => name),
      datasets: [{
        label: 'Cantidad de Reportes por Categoría',
        data: sortedCategories.map(([, count]) => count),
        backgroundColor: [
          '#EF4444', // Rojo
          '#F97316', // Naranja
          '#F59E0B', // Ámbar
          '#EAB308', // Amarillo
          '#84CC16', // Lima
          '#22C55E', // Verde
          '#10B981', // Esmeralda
          '#14B8A6', // Teal
          '#06B6D4', // Cian
          '#0EA5E9', // Azul cielo
          '#3B82F6', // Azul
          '#6366F1', // Índigo
          '#8B5CF6', // Violeta
          '#A855F7', // Púrpura
          '#EC4899'  // Rosa
        ].slice(0, sortedCategories.length),
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    }
  }
}

// Función para obtener color de riesgo
const getRiskColor = (score: number): string => {
  if (score < 30) return '#22c55e' // verde
  if (score < 70) return '#eab308' // amarillo
  return '#ef4444' // rojo
}

// Función para obtener etiqueta de riesgo
const getRiskLabel = (score: number): string => {
  if (score < 30) return 'BAJO'
  if (score < 70) return 'MEDIO'
  return 'ALTO'
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
          <span v-else>Analizar</span>
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
      <!-- Gráfico de Categorías de Reportes -->
      <div class="charts-grid">
        <div class="chart-container-single">
          <h3>📊 Categorías de Amenazas Reportadas</h3>
          <p class="chart-description">Distribución de tipos de amenazas detectadas por AbuseIPDB (solo categorías con reportes)</p>
          <div class="chart-wrapper">
            <Bar :data="chartData.categoryReports" :options="categoryChartOptions" />
          </div>
        </div>
      </div>

      <!-- Lista de resultados -->
      <div class="results-list">
        <h3>Resultados Recientes</h3>
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
            <div class="result-services" v-if="result.details?.services">
              <small>
                Servicios: 
                <span v-if="result.details.services.virusTotal" class="service-tag">VT</span>
                <span v-if="result.details.services.abuseIP" class="service-tag">AIPDB</span>
                <span v-if="result.details.services.shodan" class="service-tag">Shodan</span>
              </small>
            </div>
            <!-- Categorías de AbuseIPDB -->
            <div class="result-categories" v-if="result.details?.services?.abuseIP?.categories?.length > 0">
              <small>
                🏷️ Categorías: 
                <span 
                  v-for="category in result.details.services.abuseIP.categories.slice(0, 2)" 
                  :key="category.id"
                  class="category-tag"
                  :class="`severity-${category.severity}`"
                >
                  {{ category.name }}
                </span>
                <span v-if="result.details.services.abuseIP.categories.length > 2" class="category-more">
                  +{{ result.details.services.abuseIP.categories.length - 2 }} más
                </span>
              </small>
            </div>
            <div class="result-threats" v-if="result.details?.summary?.threats_detected > 0">
              <small :style="{ color: '#EF4444' }">
                🚨 {{ result.details.summary.threats_detected }} amenaza(s) detectada(s)
              </small>
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
  background: linear-gradient(135deg, #01039e 0%, #8B5CF6 100%);
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

/* Gráfico de categorías */
.charts-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.chart-container-single {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 900px;
}

.chart-container-single h3 {
  margin-bottom: 0.5rem;
  color: #1F2937;
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
}

.chart-description {
  color: #6B7280;
  font-size: 0.9rem;
  text-align: center;
  margin-bottom: 2rem;
  font-style: italic;
}

.chart-wrapper {
  height: 400px;
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

.result-services {
  margin-bottom: 0.5rem;
}

.service-tag {
  background: #E5E7EB;
  color: #374151;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 0.25rem;
}

.result-categories {
  margin-bottom: 0.5rem;
}

.category-tag {
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-right: 0.25rem;
  color: white;
}

.category-tag.severity-high {
  background: #EF4444; /* Rojo para alta severidad */
}

.category-tag.severity-medium {
  background: #F59E0B; /* Amarillo para severidad media */
}

.category-tag.severity-low {
  background: #6B7280; /* Gris para baja severidad */
}

.category-more {
  color: #6B7280;
  font-style: italic;
  font-size: 0.65rem;
}

.result-threats {
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
  
  .chart-container-single {
    padding: 1rem;
  }
  
  .chart-wrapper {
    height: 300px;
  }
  
  .results-grid {
    grid-template-columns: 1fr;
  }
}

/* Tema oscuro */
@media (prefers-color-scheme: dark) {
  .analysis-panel,
  .chart-container-single,
  .results-list {
    background: #1F2937;
    border-color: #374151;
  }
  
  .panel-header h2,
  .chart-container-single h3,
  .results-list h3,
  .result-value {
    color: #F9FAFB;
  }
  
  .panel-header p,
  .chart-description,
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
  
  .service-tag {
    background: #4B5563;
    color: #E5E7EB;
  }
  
  .empty-state h3 {
    color: #E5E7EB;
  }
}
</style>