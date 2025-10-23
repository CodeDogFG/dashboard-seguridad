<template>
  <div class="ip-checker">
    <h2>Verificador de Reputación de IP</h2>
    <div class="input-group">
      <input 
        v-model="ipAddress" 
        type="text" 
        placeholder="Ingresa una dirección IP (ej. 1.1.1.1)"
        @keyup.enter="fetchReportData"
      />
      <button @click="fetchReportData" :disabled="isLoading">
        {{ isLoading ? 'Verificando...' : 'Verificar' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div class="chart-container" v-if="chartData && !isLoading">
      <h3>Resumen de Reportes de Abuso</h3>
      <Bar :data="formattedChartData" :options="chartOptions" />
    </div>
    
    <div v-if="isLoading" class="loading-message">
      Cargando datos...
    </div>

    <div v-if="!isLoading && chartData && chartData.labels.length === 0" class="no-data">
      No se encontraron reportes para esta IP.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';

// Importaciones de Vue-ChartJS
import { Bar } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  Title, 
  Tooltip, 
  Legend, 
  BarElement, 
  CategoryScale, 
  LinearScale 
} from 'chart.js';

// Registrar los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// --- Estado Reactivo ---

const ipAddress = ref('1.1.1.1'); // IP de ejemplo
const chartData = ref(null); // Almacenará { labels: [], data: [] }
const isLoading = ref(false);
const error = ref(null);

// URL del backend (asegúrate que coincida con tu puerto)
const API_URL = 'http://localhost:5000/api/ip-check';

// --- Métodos ---

/**
 * Llama a nuestro propio backend para obtener los datos procesados.
 */
async function fetchReportData() {
  if (!ipAddress.value) {
    error.value = 'Por favor, ingresa una dirección IP.';
    return;
  }

  isLoading.value = true;
  chartData.value = null; // Limpiar datos anteriores
  error.value = null;

  try {
    // Llamada al backend
    const response = await axios.get(`${API_URL}/${ipAddress.value}`);
    chartData.value = response.data; // Almacenamos { labels: [], data: [] }
    
  } catch (err) {
    console.error('Error al llamar al backend:', err);
    error.value = err.response?.data?.details || 'No se pudo conectar al servidor.';
    if (err.response){
      console.error('Detalles del error del servidor:', err.response.data);
    } else {
      console.error('Error de red o sin respuesta del servidor.', err.message);
    }
    
  } finally {
    isLoading.value = false;
  }
}

// --- Propiedades Computadas para el Gráfico ---

/**
 * Formatea los datos del estado para que vue-chartjs los entienda.
 */
const formattedChartData = computed(() => {
  if (!chartData.value) {
    return { labels: [], datasets: [] };
  }
  
  return {
    labels: chartData.value.labels,
    datasets: [
      {
        label: 'Conteo de Reportes por Categoría',
        backgroundColor: '#41B883', // Un color de Vue :)
        borderColor: '#41B883',
        data: chartData.value.data,
      },
    ],
  };
});

/**
 * Opciones de configuración para Chart.js
 */
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // Ocultar leyenda si solo hay 1 dataset
    },
    title: {
      display: true,
      text: `Reportes para la IP: ${ipAddress.value}`,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        // Asegurar que los ticks sean enteros
        precision: 0
      }
    }
  }
});
</script>

<style scoped>
.ip-checker {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  font-family: Arial, sans-serif;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  background-color: #fff;
}

h2, h3 {
  text-align: center;
  color: #333;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-group input {
  flex-grow: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.input-group button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #41B883; /* Verde Vue */
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.input-group button:hover {
  background-color: #349667;
}

.input-group button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.chart-container {
  position: relative;
  height: 400px; /* Altura fija para el contenedor del gráfico */
}

.error-message {
  color: #d9534f;
  background-color: #f2dede;
  border: 1px solid #ebccd1;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  text-align: center;
}

.loading-message, .no-data {
  text-align: center;
  color: #777;
  font-size: 18px;
  padding: 40px 0;
}
</style>