<template>
  <div class="userview-content">
    <div class="row row-cols-1 row-cols-md-4 g-3 m-3 justify-content-between">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-subtitle text-body-secondary">Tareas Completadas</h6>
            <div class="bg-success-light">
              <div class="">
                <span :class="['badge', getBadgeClass(porcentajeCompletadas)]">
                  <i :class="['bi', getIconClass(porcentajeCompletadas)]"> {{ porcentajeCompletadas }}%</i>
                </span>
              </div>
            </div>
          </div>
          <h3>{{ tareasCompletadas }}</h3>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-subtitle text-body-secondary">Tareas no Completadas</h6>
            <div class="bg-success-light">
              <div class="">
                <span :class="['badge', getBadgeClass(porcentajeNoCompletadas)]">
                  <i :class="['bi', getIconClass(porcentajeNoCompletadas)]"> {{ porcentajeNoCompletadas }}%</i>
                </span>
              </div>
            </div>
          </div>
          <h3>{{ tareasNoCompletadas }}</h3>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-subtitle text-body-secondary">Tareas por Vencer</h6>
          </div>
          <h3>{{ tareasPorVencer }}</h3>
        </div>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <h6 class="card-subtitle text-body-secondary">Nuevas Asignaciones</h6>
            <div class="bg-success-light">
              <div class="">
                <span class="badge bg-warning">
                  <i class="text-black6">+ {{ nuevasAsignaciones }}</i>
                </span>
              </div>
            </div>
          </div>
          <h3>{{ nuevasAsignaciones }}</h3>
        </div>
      </div>
    </div>

    <div class="row row-cols-1 row-cols-md-2 g-3 m-3 justify-content-between">
      <div class="card" style=" max-width: 34%;">
        <div class="card-body">
          <h5 class="card-title">Progreso de Tareas</h5>
          <div class="chart-container" style="position: relative; height: 250px;">
            <canvas ref="progresChart"></canvas>
          </div>
          
        </div>
      </div>
      <div class=" card" style="max-width: 65%;">
        <div class="card-body">
          <h5 class="card-title">Actividades por semana</h5>
          <div class="chart-container" style="position: relative; height: 250px;">
            <canvas  ref="lineChart"></canvas>
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
// console.log('Usuario creador:', usuario_creador)
// 
export default defineComponent({
  name: 'DashboardCharts',
  data() {
    return {
      progresChart: null,
      lineChart: null,
      tareasCompletadas: 0,
      tareasNoCompletadas: 0,
      tareasPorVencer: 0,
      nuevasAsignaciones: 0,
      hayDatosDona: false,
      hayDatosLinea: false,
      porcentajeCompletadas: 0,
      porcentajeNoCompletadas: 0,
    };
  },
  computed(){

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

        const total = this.tareasCompletadas + this.tareasNoCompletadas

        this.porcentajeCompletadas = total > 0 ? Math.round((this.tareasCompletadas / total) * 100) : 0;
        this.porcentajeNoCompletadas = total > 0 ? Math.round((this.tareasNoCompletadas / total) * 100) : 0;

        this.tareasCompletadas = data.tareasCompletadas
        this.tareasNoCompletadas = data.tareasNoCompletadas
        this.tareasPorVencer = data.tareasPorVencer
        this.nuevasAsignaciones = data.nuevasAsignaciones
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
        // console.log('Datos de la gráfica:', datos)

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
              backgroundColor: '#3b82f6',
              fill: false,
              tension: 0.4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true }
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
        // console.log('Datos de la gráfica:', data)
        
        const valores = [data.terminadas, data.en_proceso, data.pendientes]

        if (this.progresChart) this.progresChart.destroy()

        this.progresChart = new Chart(this.$refs.progresChart, {
          type: 'doughnut',
          data: {
            labels: [ 'Terminadas', 'En proceso', 'Pendientes'],
            datasets: [{ 
              data: valores,
              backgroundColor: ['#6ee7b7', '#60a5fa', '#d1d5db'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false
          }
        })
      } catch (error) {
        console.error('Error al cargar datos de la gráfica:', error)
      }
    },
    getBadgeClass(porcentaje) {
      if (porcentaje >= 70) return 'bg-success'
      if (porcentaje >= 40) return 'bg-warning text-dark'
      return 'bg-danger'
    },
    getIconClass(porcentaje) {
      if (porcentaje >= 70) return 'bi-graph-up-arrow'
      if (porcentaje >= 40) return 'bi-exclamation-triangle'
      return 'bi-graph-down-arrow'
    }
  },

});
</script>


<style scoped>

.card {
  flex: 1 1 20%; /* Cada card ocupa aproximadamente 25% del ancho en una fila de 4 */
  max-width: 24%; /* Ajuste para evitar solapamiento */
}

.graphs {
  transition: flex 0.3s ease, max-width 0.3s ease;
}

@media (max-width: 767px) {
  .card {
    max-width: 100%; /* Asegura que los cards ocupen el 100% en móvil */
  }
  .graphs {
    flex: 0 0 100% !important;
    max-width: 100% !important;
  }
}
</style>