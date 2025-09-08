<template>
  <div class="content-view">
    <!-- Statistics Cards -->
    <div class="row g-4 mb-5 mt-1">
      <!-- Tareas Completadas -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-success">
                <i class="bi bi-check-circle-fill"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">Tareas Completadas</p>
                <h3 class="stats-value mb-0">{{ tareascompletadas }}</h3>
                <small :class="getTextClass(porcentajeCompletadas)">
                  <i :class="['bi', getIconClass(porcentajeCompletadas), 'me-1']"></i>
                  {{ porcentajeCompletadas }}% completado
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-success" :style="`width: ${porcentajeCompletadas}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas no Completadas -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-danger">
                <i class="bi bi-x-circle-fill"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">Tareas Pendientes</p>
                <h3 class="stats-value mb-0">{{ tareasnocompletadas }}</h3>
                <small :class="getTextClass(porcentajeNoCompletadas)">
                  <i :class="['bi', getIconClass(porcentajeNoCompletadas), 'me-1']"></i>
                  {{ porcentajeNoCompletadas }}% pendiente
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-danger" :style="`width: ${porcentajeNoCompletadas}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tareas por Vencer -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-warning">
                <i class="bi bi-clock-fill"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">Tareas por Vencer</p>
                <h3 class="stats-value mb-0">{{ tareasporvencer }}</h3>
                <small class="text-warning">
                  <i class="bi bi-exclamation-triangle me-1"></i>
                  Requieren atención
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-warning" :style="`width: ${Math.min((tareasporvencer / 10) * 100, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nuevas Asignaciones -->
      <div class="col-12 col-md-6 col-lg-3">
        <div class="stats-card card border-0 shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex align-items-center">
              <div class="stats-icon bg-info">
                <i class="bi bi-plus-circle-fill"></i>
              </div>
              <div class="ms-3 flex-grow-1">
                <p class="stats-label mb-1">Nuevas Asignaciones</p>
                <h3 class="stats-value mb-0">{{ nuevasasignaciones }}</h3>
                <small class="text-info">
                  <i class="bi bi-arrow-up me-1"></i>
                  +{{ nuevasasignaciones }} esta semana
                </small>
              </div>
            </div>
            <div class="stats-progress mt-3">
              <div class="progress-bar bg-info" :style="`width: ${Math.min((nuevasasignaciones / 5) * 100, 100)}%`"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="row g-4">
      <!-- Progreso de Tareas -->
      <div class="col-12 col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent border-0 pt-4 pb-0">
            <h5 class="card-title fw-bold">
              <i class="bi bi-pie-chart me-2"></i>
              Progreso de Tareas
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 250px;">
              <canvas ref="progresChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Actividades por semana -->
      <div class="col-12 col-lg-8">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent border-0 pt-4 pb-0">
            <h5 class="card-title fw-bold">
              <i class="bi bi-bar-chart me-2"></i>
              Actividades por semana
            </h5>
          </div>
          <div class="card-body">
            <div class="chart-container" style="position: relative; height: 250px;">
              <canvas ref="lineChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { Chart, registerables } from 'chart.js';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'
dayjs.locale('es')

Chart.register(...registerables);

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id

export default defineComponent({
  name: 'DashboardCharts',
  data() {
    return {
      progresChart: null,
      lineChart: null,
      tareascompletadas: 0,
      tareasnocompletadas: 0,
      tareasporvencer: 0,
      nuevasasignaciones: 0,
      hayDatosDona: false,
      hayDatosLinea: false,
      porcentajeCompletadas: 0,
      porcentajeNoCompletadas: 0,
    };
  },
  mounted() {
    this.cargarEstadisticas(),
    this.cargarDatosGrafica(),
    this.cargarGraficaDona()
  },
  methods: {
    async cargarEstadisticas(){
      const user = JSON.parse(localStorage.getItem('user'))
      if ('!user'.id) return

      try {
        const res = await axios.get(`http://localhost:4001/api/dashboard/estadisticas/${user.id}`)
        const data = res.data

        const total = this.tareascompletadas + this.tareasnocompletadas

        this.porcentajeCompletadas = total > 0 ? Math.round((this.tareascompletadas / total) * 100) : 0;
        this.porcentajeNoCompletadas = total > 0 ? Math.round((this.tareasnocompletadas / total) * 100) : 0;

        this.tareascompletadas = data.tareascompletadas
        this.tareasnocompletadas = data.tareasnocompletadas
        this.tareasporvencer = data.tareasporvencer
        this.nuevasasignaciones = data.nuevasasignaciones
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      }
    },
    async cargarDatosGrafica(){
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user?.id) return

      try {
        const res = await axios.get(`http://localhost:4001/api/dashboard/actividad-por-dia/${user.id}`)
        const datos = res.data

        const labels = datos.map(item => dayjs(item.fecha).format('ddd DD'))
        const valores = datos.map(item => item.total)

        // Destruir gráfico anterior si existe
        if (this.lineChart instanceof Chart) {
          this.lineChart.destroy()
        }

        this.lineChart = new Chart(this.$refs.lineChart, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Actividades completadas',
              data: valores,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
              borderWidth: 2,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#fff',
              pointBorderWidth: 2,
              pointRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { 
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        })

      } catch (error) {
        console.error('Error al cargar datos de la gráfica:', error)
      }
    },
    async cargarGraficaDona() {
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user?.id) return
      
      try {
        const res = await axios.get(`http://localhost:4001/api/dashboard/estado-tareas/${user.id}`)
        const data = res.data
        
        const valores = [data.terminadas, data.en_proceso, data.pendientes]

        if (this.progresChart) this.progresChart.destroy()

        this.progresChart = new Chart(this.$refs.progresChart, {
          type: 'doughnut',
          data: {
            labels: [ 'Terminadas', 'En proceso', 'Pendientes'],
            datasets: [{ 
              data: valores,
              backgroundColor: ['#10b981', '#3b82f6', '#6b7280'],
              borderWidth: 0,
              hoverOffset: 10
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '40%',
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              }
            }
          }
        })
      } catch (error) {
        console.error('Error al cargar datos de la gráfica:', error)
      }
    },
    getTextClass(porcentaje) {
      if (porcentaje >= 70) return 'text-success'
      if (porcentaje >= 40) return 'text-warning'
      return 'text-danger'
    },
    getIconClass(porcentaje) {
      if (porcentaje >= 70) return 'bi-graph-up-arrow'
      if (porcentaje >= 40) return 'bi-exclamation-triangle'
      return 'bi-graph-down-arrow'
    }
  }
});
</script>

<style scoped>
/* Variables CSS */
:root {
    --primary-color: #3b82f6;
    --primary-light: #dbeafe;
    --success-color: #10b981;
    --success-light: #d1fae5;
    --warning-color: #f59e0b;
    --warning-light: #fef3c7;
    --info-color: #06b6d4;
    --info-light: #cffafe;
    --danger-color: #ef4444;
    --danger-light: #fee2e2;
    --secondary-color: #6b7280;
    --light-bg: #f8fafc;
    --border-color: #e5e7eb;
    --border-radius: 12px;
    --border-radius-sm: 8px;
    --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s ease;
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

/* Statistics Cards */
.stats-card {
    border-radius: var(--border-radius);
    transition: var(--transition);
    background: white;
    overflow: hidden;
}

.stats-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-lg);
}

.stats-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
    flex-shrink: 0;
}

.stats-icon.bg-primary { background: var(--primary-color); }
.stats-icon.bg-success { background: var(--success-color); }
.stats-icon.bg-warning { background: var(--warning-color); }
.stats-icon.bg-info { background: var(--info-color); }
.stats-icon.bg-danger { background: var(--danger-color); }

.stats-label {
    font-size: 0.875rem;
    color: var(--secondary-color);
    font-weight: 500;
    margin-bottom: 0;
}

.stats-value {
    font-size: 2rem;
    font-weight: 700;
    color: #1e293b;
}

.stats-progress {
    height: 4px;
    background-color: #e5e7eb;
    border-radius: 2px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.6s ease;
}

/* Card Styles */
.card {
    border-radius: var(--border-radius);
    transition: var(--transition);
}

.card:hover {
    box-shadow: var(--box-shadow-lg);
}

.card-header {
    padding: 1.5rem 1.5rem 0.5rem;
}

.card-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 1.1rem;
}

/* Animations */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stats-card,
.card {
    animation: fadeInUp 0.6s ease forwards;
}

.stats-card:nth-child(1) { animation-delay: 0.1s; }
.stats-card:nth-child(2) { animation-delay: 0.2s; }
.stats-card:nth-child(3) { animation-delay: 0.3s; }
.stats-card:nth-child(4) { animation-delay: 0.4s; }

/* Responsive Design */
@media (max-width: 768px) {
    .content-view {
        padding: 1rem;
    }
    
    .stats-icon {
        width: 50px;
        height: 50px;
        font-size: 1.25rem;
    }
    
    .stats-value {
        font-size: 1.5rem;
    }
    
    .card-header {
        padding: 1rem 1rem 0.5rem;
    }
}

@media (max-width: 576px) {
    .stats-card:hover {
        transform: none;
    }
    
    .card:hover {
        box-shadow: var(--box-shadow);
    }
}
</style>