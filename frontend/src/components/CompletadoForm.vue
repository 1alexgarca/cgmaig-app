<template>
  <div class="form-content">
    <div class="activity-header p-4 border-bottom">
      <h2 class="activity-title mb-2">
        <i class="bi bi-card-checklist me-2"></i>
        {{ datos.actividad }}
      </h2>
      <div class="d-flex justify-content-between align-items-center">
        <span class="project-badge">
          <i class="bi bi-kanban me-1"></i>
          {{ datos.name_proyect }}
        </span>
        <div class="status-badges">
          <span class="badge bg-success-subtle text-success me-2">
            <i class="bi bi-check-circle me-1"></i>
            {{ datos.estado || 'Completado' }}
          </span>
          <span class="badge" :class="badgeBgClass(datos.prioridad)">
            <i class="bi bi-flag me-1"></i>
            {{ datos.prioridad }}
          </span>
        </div>
      </div>
    </div>

    <div class="p-4">
      <div class="info-grid mb-4">
        <div class="info-item">
          <div class="info-icon">
            <i class="bi bi-person"></i>
          </div>
          <div class="info-content">
            <div class="info-label">Asignador</div>
            <div class="info-value">{{ datos.asignador }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="bi bi-calendar"></i>
          </div>
          <div class="info-content">
            <div class="info-label">Fecha de asignación</div>
            <div class="info-value">{{ formatFecha(datos.fechaAsignacion) }}</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="bi bi-clock-history"></i>
          </div>
          <div class="info-content">
            <div class="info-label">Horas trabajadas</div>
            <div class="info-value">{{ datos.horas_trabajadas }} hrs</div>
          </div>
        </div>
      </div>

      <div class="navigation-tabs mb-4">
        <ul class="nav nav-tabs">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: vistaActual === 'descripcion' }" 
               @click="vistaActual = 'descripcion'">
              <i class="bi bi-text-paragraph me-2"></i>
              Descripción
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: vistaActual === 'estado' }" 
               @click="vistaActual = 'estado'">
              <i class="bi bi-clock-history me-2"></i>
              Historial de Estado
            </a>
          </li>
        </ul>
      </div>

      <div v-if="vistaActual === 'descripcion'" class="description-card card">
        <div class="card-body">
          <h5 class="card-title">
            <i class="bi bi-journal-text me-2"></i>
            Descripción de la actividad
          </h5>
          <p class="card-text">{{ datos.descripcion || 'No hay descripción disponible' }}</p>
        </div>
      </div>

      <div v-if="vistaActual === 'estado'" class="status-history">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-header-bg">
              <tr>
                <th scope="col" class="table-th">
                  <i class="bi bi-graph-up me-2"></i>
                  Avance
                </th>
                <th scope="col" class="table-th">
                  <i class="bi bi-clock me-2"></i>
                  Horas trabajadas
                </th>
                <th scope="col" class="table-th">
                  <i class="bi bi-calendar-event me-2"></i>
                  Actualización
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in datos.actualizaciones" :key="index" class="table-row">
                <td class="table-cell">
                  <div class="progress-container">
                    <div class="progress" style="height: 8px;">
                      <div class="progress-bar" 
                           :class="{
                             'bg-success': item.avance == 100,
                             'bg-primary': item.avance < 100
                           }" 
                           :style="{ width: item.avance + '%' }"></div>
                    </div>
                    <span class="progress-value">{{ item.avance }}%</span>
                  </div>
                </td>
                <td class="table-cell">
                  <span class="hours-badge">{{ item.horas }} hrs</span>
                </td>
                <td class="table-cell">
                  <div class="date-container">
                    <i class="bi bi-calendar3 text-muted me-2"></i>
                    <span class="date-text">{{ formatFecha(item.fecha_actualización) }}</span>
                  </div>
                </td>
              </tr>
              <tr v-if="!datos.actualizaciones || datos.actualizaciones.length === 0">
                <td colspan="3" class="text-center py-4 text-muted">
                  <i class="bi bi-inbox display-6 d-block mb-2"></i>
                  No hay historial de actualizaciones
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
          <i class="bi bi-x-circle me-2"></i>
          Cerrar
        </button>
        <button type="button" class="btn btn-danger" @click="handleDelete">
          <i class="bi bi-trash me-2"></i>
          Eliminar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/es'
dayjs.locale('es')

export default {
  name: 'CompletadoForm',
  emits: ['submit', 'saved', 'cancel'],
  props: {
    initialData: {
      type: Object,
      default: () => ({
        actividad: '',
        asignado: '',
        fechaAsignacion: '',
        horasTrabajadas: 0,
        descripcion: '',
        id_activities: '',
     })
    }
 },
  data() {
    return {
      vistaActual: 'descripcion', // 'descripcion' or 'estado'
      datos: {
        actividad: '',
        asignado: '',
        fechaAsignacion: '',
        horas_trabajadas: 0,
        descripcion: '',
        id_activities: '',
        asignador: '',
        actualizaciones: [],
        name_proyect: ''
  
      }
    }
  },
  mounted() {
    this.datos = { ...this.initialData }
    this.loadDatos()
  },
  methods: {
    handleSubmit() {
      this.$emit('submit')
    },
    badgeBgClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'bg-danger-subtle text-danger';
        case 'media':
          return 'bg-warning-subtle text-warning';
        case 'baja':
          return 'bg-success-subtle text-success';
        default:
          return 'bg-secondary';
      }
    },
    async loadDatos() {
      try {
        const res = await axios.get(`http://localhost:4001/api/actividades/${this.initialData.id_activities}/detalles`)
        this.datos = {
          ...this.datos,
          asignador: res.data.asignador,
          actividad: res.data.actividad,
          descripcion: res.data.descripcion,
          prioridad: res.data.prioridad,
          horas_trabajadas: res.data.totalHoras,
          actualizaciones: res.data.actualizaciones || [],
          name_proyect: res.data.proyecto
        }
      } catch (err) {
        console.error('error al cargar datos', err)
      }
    },
    formatFecha(fecha) {
       const fechaFormateada = dayjs(fecha).format('MMMM DD, YYYY')
      return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
    }


  }
}
</script>

<style scoped>
/* Variables CSS definidas localmente */
.form-content {
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
  --border-radius: 0px;
  --border-radius-sm: 0px;
  --box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --transition: all 0.3s ease;
}

.form-content {
  overflow-y: auto;
  flex-grow: 1;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.form-content::-webkit-scrollbar {
  display: none;
}

.activity-header {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.activity-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.5rem;
}

.project-badge {
  background: var(--primary-light);
  color: var(--primary-color);
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--light-bg);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.info-label {
  font-size: 0.75rem;
  color: var(--secondary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
}

.nav-tabs .nav-link {
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--secondary-color);
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  transition: var(--transition);
}

.nav-tabs .nav-link.active {
  border-bottom-color: var(--primary-color);
  color: var(--primary-color);
  background: transparent;
}

.nav-tabs .nav-link:hover {
  border-bottom-color: var(--primary-light);
  color: var(--primary-color);
}

.description-card {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.description-card .card-title {
  color: var(--primary-color);
  font-weight: 600;
  margin-bottom: 1rem;
}

.description-card .card-text {
  line-height: 1.6;
  color: #374151;
}

.table-header-bg {
  background: var(--light-bg);
  border-bottom: 2px solid var(--border-color);
}

.table-th {
  border: none;
  padding: 1rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table-cell {
  padding: 1rem;
  vertical-align: middle;
  border: none;
  border-bottom: 1px solid #f1f5f9;
}

.table-row {
  transition: var(--transition);
}

.table-row:hover {
  background-color: var(--light-bg);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progress {
  flex-grow: 1;
  border-radius: 4px;
  background: #e5e7eb;
}

.progress-value {
  font-weight: 600;
  color: var(--primary-color);
  min-width: 45px;
  text-align: right;
}

.hours-badge {
  background: var(--info-light);
  color: var(--info-color);
  padding: 0.375rem 0.75rem;
  border-radius: var(--border-radius-sm);
  font-weight: 500;
  font-size: 0.875rem;
}

.date-container {
  display: flex;
  align-items: center;
}

.date-text {
  color: #374151;
  font-size: 0.9rem;
}

.btn {
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  transition: var(--transition);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-color) 0%, #2563eb 100%);
  border: none;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--secondary-color);
}

.btn-secondary:hover {
  background: var(--light-bg);
}

.btn-danger {
  background: linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%);
  border: none;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .activity-title {
    font-size: 1.25rem;
  }
  
  .nav-tabs .nav-link {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .progress-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .progress-value {
    text-align: center;
  }
}
</style>