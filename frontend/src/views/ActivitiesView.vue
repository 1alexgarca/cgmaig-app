<template>
  <div class="content-view">
    <!-- Header Section -->
    <div class="header-section mb-5">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="page-title mb-1">Gestión de Actividades</h2>
          <p class="page-subtitle">Organiza y gestiona tus tareas en un tablero Kanban</p>
        </div>
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-primary-subtle text-primary fs-6">
            <i class="bi bi-clock me-1"></i>
            {{ hoyHoras }} hrs registradas hoy
          </span>
          <button type="button" class="btn btn-primary" @click="showModal = true">
            <i class="bi bi-plus-circle me-2"></i>
            Nueva Actividad
          </button>
        </div>
      </div>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <div class="row g-4">
        <!-- ASIGNACIONES -->
        <div class="col-12 col-lg-4">
          <div class="kanban-column card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent border-0 pt-4 pb-2">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title fw-bold">
                  <span class="text-warning">•</span> Asignaciones
                </h5>
                <span class="badge bg-secondary">{{ asignaciones.length }}</span>
              </div>
            </div>
            <div class="card-body kanban-column-body">
              <div 
                v-for="actividad in asignaciones" 
                :key="actividad.id" 
                class="kanban-card card border-0 shadow-sm mb-3"
                @click="abrirOffcanvas(actividad)"
                data-status="not-started"
              >
                <div class="card-body p-3">
                  <div class="d-flex justify-content-center fw-bold rounded-2 mb-2 py-1 status-badge status-not-started">
                    No iniciado
                  </div>
                  <h6 class="card-title fw-bold text-truncate">{{ actividad.actividad }}</h6>
                  <p class="card-text text-muted descripcion-recortada small mb-2">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock me-1"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <span class="badge fw-bold" :class="badgePriorityClass(actividad.prioridad)">
                      {{ actividad.prioridad }}
                    </span>
                    <small class="text-muted"><i class="bi bi-calendar me-1"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
              <div v-if="asignaciones.length === 0" class="empty-kanban-state text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>
                <p class="text-muted mt-2">No hay asignaciones</p>
              </div>
            </div>
          </div>
        </div>

        <!-- EN PROGRESO -->
        <div class="col-12 col-lg-4">
          <div class="kanban-column card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent border-0 pt-4 pb-2">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title fw-bold">
                  <span class="text-primary">•</span> En progreso
                </h5>
                <span class="badge bg-secondary">{{ enProgreso.length }}</span>
              </div>
            </div>
            <div class="card-body kanban-column-body">
              <div 
                v-for="actividad in enProgreso" 
                :key="actividad.id" 
                class="kanban-card card border-0 shadow-sm mb-3"
                @click="abrirOffcanvas(actividad)"
                data-status="in-progress"
              >
                <div class="card-body p-3">
                  <div class="d-flex justify-content-center bg-warning-subtle text-warning fw-bold rounded-2 mb-2 py-1 status-badge status-in-progress">
                    En progreso
                  </div>
                  <h6 class="card-title fw-bold text-truncate">{{ actividad.actividad }}</h6>
                  <p class="card-text text-muted descripcion-recortada small mb-2">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock me-1"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <span class="badge fw-bold" :class="badgePriorityClass(actividad.prioridad)">
                      {{ actividad.prioridad }}
                    </span>
                    <small class="text-muted"><i class="bi bi-calendar me-1"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
              <div v-if="enProgreso.length === 0" class="empty-kanban-state text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>
                <p class="text-muted mt-2">No hay actividades en progreso</p>
              </div>
            </div>
          </div>
        </div>

        <!-- COMPLETADAS -->
        <div class="col-12 col-lg-4">
          <div class="kanban-column card border-0 shadow-sm h-100">
            <div class="card-header bg-transparent border-0 pt-4 pb-2">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title fw-bold">
                  <span style="color: #FF0080;">•</span> Completadas
                </h5>
                <div>
                  <span class="badge bg-secondary me-2">{{ completadas.length }}</span>
                  <button 
                    @click="toggleFilter"
                    class="btn btn-sm btn-outline-secondary"
                  >
                    <i class="bi bi-funnel me-1"></i> Filtrar
                  </button>
                </div>
              </div>
              <!-- Filtro -->
              <div class="card mt-3" v-if="mostrarFiltro">
                <div class="card-body">
                  <h6 class="card-title fw-bold">Filtrar por rango de fechas</h6>
                  <select v-model="selectedYear" class="form-select form-select-sm mb-2">
                    <option v-for="year in years" :key="year" :value="year">
                      {{ year }}
                    </option>
                  </select>
                  <v-date-picker
                    v-model.range="rango"
                    :masks="{ input: 'DD/MM/YYYY' }"
                    :popover="{ visibility: 'click' }"
                    color="blue"
                    is-range
                  >
                    <template #default="{ inputValue, inputEvents }">
                      <input
                        id="rango"
                        class="form-control form-control-sm"
                        style="cursor: pointer;"
                        :value="inputValue.start && inputValue.end ? `${inputValue.start} - ${inputValue.end}` : ''"
                        v-on="inputEvents"
                        readonly
                        placeholder="Selecciona un rango de fechas"
                      />
                    </template>
                  </v-date-picker>
                  <button class="btn btn-sm btn-primary mt-2 w-100" @click="filtrarPorFechas">
                    Aplicar filtro
                  </button>
                </div>
              </div>
            </div>
            <div class="card-body kanban-column-body">
              <div 
                v-for="actividad in completadas" 
                :key="actividad.id" 
                class="kanban-card card border-0 shadow-sm mb-3"
                @click="datosCompletos(actividad)"
                data-status="completed"
              >
                <div class="card-body p-3">
                  <div class="d-flex justify-content-center bg-success-subtle text-success fw-bold rounded-2 mb-2 py-1 status-badge status-completed">
                    Completado
                  </div>
                  <h6 class="card-title fw-bold text-truncate">{{ actividad.actividad }}</h6>
                  <p class="card-text text-muted descripcion-recortada small mb-2">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock me-1"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <span class="badge fw-bold" :class="badgePriorityClass(actividad.prioridad)">
                      {{ actividad.prioridad }}
                    </span>
                    <small class="text-muted"><i class="bi bi-calendar me-1"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
              <div v-if="completadas.length === 0" class="empty-kanban-state text-center py-5">
                <i class="bi bi-inbox display-4 text-muted"></i>
                <p class="text-muted mt-2">No hay actividades completadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Offcanvas de detalles -->
<!-- Offcanvas de detalles (parte actualizada) -->
<div class="offcanvas offcanvas-end" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel" style="width: 800px;">
  <div class="offcanvas-header border-bottom">
    <h5 class="offcanvas-title fw-bold text-primary" id="offcanvasScrollingLabel">
      <i class="bi bi-card-checklist me-2"></i>
      Detalles de la Actividad
    </h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
  </div>
  <div class="offcanvas-body">
    <!-- Header Section -->
    <div class="activity-header mb-4">
      <div class="d-flex align-items-center justify-content-between">
        <div>
          <span class="badge fw-semibold" :class="statusBadgeClass(actividadSeleccionada?.avance)">
            <span v-if="actividadSeleccionada?.avance === 0">• No iniciado</span>
            <span v-else-if="actividadSeleccionada?.avance < 100 && actividadSeleccionada?.avance > 0">• En progreso</span>
            <span v-else>• Completado</span>
          </span>
          <span class="badge ms-2 fw-semibold" :class="priorityBadgeClass(actividadSeleccionada?.prioridad)">
            {{ actividadSeleccionada?.prioridad }}
          </span>
        </div>
        <small class="text-muted">
          <i class="bi bi-calendar me-1"></i>
          {{ formatearFecha(actividadSeleccionada?.fecha_creacion) }}
        </small>
      </div>
      <h3 class="fw-bold mt-3 text-dark">{{ actividadSeleccionada?.actividad }}</h3>
    </div>

    <!-- Content Grid -->
    <div class="row g-4">
      <!-- Left Column -->
      <div class="col-md-7">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent border-0">
            <h6 class="card-title fw-bold text-dark">
              <i class="bi bi-info-circle me-2"></i>
              Información General
            </h6>
          </div>
          <div class="card-body">
            <div class="mb-4">
              <small class="text-muted fw-semibold">PROYECTO</small>
              <p class="fs-5 fw-bold text-primary mb-0">{{ actividadSeleccionada?.proyecto || 'Sin proyecto' }}</p>
            </div>
            
            <div>
              <small class="text-muted fw-semibold">DESCRIPCIÓN</small>
              <p class="text-dark mb-0">{{ actividadSeleccionada?.descripcion || 'Sin descripción' }}</p>
            </div>

            <div class="mt-4 pt-3 border-top">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted fw-semibold">FECHA CREACIÓN</small>
                  <p class="fw-semibold text-dark mb-0">{{ formatearFecha(actividadSeleccionada?.fecha_creacion) }}</p>
                </div>
                <div class="col-6">
                  <small class="text-muted fw-semibold">FECHA LÍMITE</small>
                  <p class="fw-semibold text-dark mb-0">{{ formatearFecha(actividadSeleccionada?.fecha_limite) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="col-md-5">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-transparent border-0">
            <h6 class="card-title fw-bold text-dark">
              <i class="bi bi-graph-up me-2"></i>
              Progreso y Métricas
            </h6>
          </div>
          <div class="card-body">
            <div class="text-center mb-4">
              <small class="text-muted fw-semibold">AVANCE ACTUAL</small>
              <div class="progress mt-2" style="height: 8px;">
                <div class="progress-bar" 
                     :class="progressBarClass(actividadSeleccionada?.avance)"
                     :style="`width: ${actividadSeleccionada?.avance || 0}%`">
                </div>
              </div>
              <p class="fw-bold text-dark mt-2 mb-0">{{ actividadSeleccionada?.avance || 0 }}% completado</p>
            </div>

            <div class="text-center">
              <small class="text-muted fw-semibold">HORAS REGISTRADAS</small>
              <p class="fw-bold text-primary fs-4 mb-0">{{ actividadSeleccionada?.horas_trabajadas || 0 }} hrs</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="mt-4">
      <ul class="nav nav-tabs nav-underline">
        <li class="nav-item">
          <a class="nav-link fw-semibold" :class="{ 'active': vistaActual === 'formulario' }" 
             @click="vistaActual = 'formulario'">
            <i class="bi bi-pencil-square me-2"></i>
            Actualizar Progreso
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link fw-semibold" :class="{ 'active': vistaActual === 'estado' }" 
             @click="vistaActual = 'estado'">
            <i class="bi bi-clock-history me-2"></i>
            Historial de Estado
          </a>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="tab-content mt-3">
        <!-- Update Form -->
        <div v-if="vistaActual === 'formulario'" class="tab-pane fade show active">
          <form @submit.prevent="guardarAvance" class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="card-title fw-bold text-dark mb-4">
                <i class="bi bi-arrow-up-circle me-2"></i>
                Actualizar Progreso
              </h6>
              
              <div class="row g-4">
                <div class="col-md-6">
                  <CircularProgress 
                    :value="actividadSeleccionada.avance" 
                    :max="100" 
                    :is-hours="false"
                  >
                    <div class="input-label">Avance actividad</div>
                    <input 
                      type="number" 
                      v-model.number="actividadSeleccionada.avance" 
                      min="0" 
                      max="100" 
                      class="circular-input"
                      @input="actividadSeleccionada.avance = Math.min(100, Math.max(0, actividadSeleccionada.avance))"
                    />
                    <div class="input-unit">%</div>
                  </CircularProgress>
                </div>

                <div class="col-md-6">
                  <CircularProgress 
                    :value="horas_trabajadas" 
                    :max="Math.max(8, horas_trabajadas)" 
                    :is-hours="true"
                  >
                    <div class="input-label">Horas trabajadas</div>
                    <input 
                      type="number" 
                      v-model.number="horas_trabajadas" 
                      min="0" 
                      class="circular-input hours-input"
                    />
                    <div class="input-unit">hrs</div>
                  </CircularProgress>
                </div>
              </div>

              <div class="d-flex justify-content-end mt-4">
                <button type="submit" class="btn btn-primary">
                  <i class="bi bi-floppy me-2"></i>
                  Guardar Cambios
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Status History -->
        <div v-if="vistaActual === 'estado'" class="tab-pane fade show active">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h6 class="card-title fw-bold text-dark mb-4">
                <i class="bi bi-list-check me-2"></i>
                Historial de Actualizaciones
              </h6>
              
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th scope="col" class="fw-semibold">Actividad</th>
                      <th scope="col" class="fw-semibold">Avance</th>
                      <th scope="col" class="fw-semibold">Horas</th>
                      <th scope="col" class="fw-semibold">Actualización</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(registro, index) in actualizacion" :key="index">
                      <td>{{ registro.actividad }}</td>
                      <td>
                        <span class="badge bg-primary-subtle text-primary">
                          {{ registro.avance }}%
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-info-subtle text-info">
                          {{ registro.horas_trabajadas }} hrs
                        </span>
                      </td>
                      <td>
                        <small class="text-muted">{{ fechaUpdate(registro.fecha_actualizacion) }}</small>
                      </td>
                    </tr>
                    <tr v-if="actualizacion.length === 0">
                      <td colspan="4" class="text-center py-4">
                        <i class="bi bi-inbox display-6 text-muted"></i>
                        <p class="text-muted mt-2">No hay registros de actualización</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

  <!-- Modal de confirmación para horas extra -->
  <div 
    class="modal fade" 
    tabindex="-1" 
    id="modalHorasExtra" 
    ref="modalHorasExtra" 
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content rounded-4 shadow">
        <div class="modal-header">
          <h5 class="modal-title text-warning">Confirmar horas extra</h5>
          <button type="button" class="btn-close" @click="cancelarHorasExtra"></button>
        </div>
        <div class="modal-body">
          <p>Ya has registrado <strong>{{ horasHoy }}</strong> horas hoy.</p>
          <p>¿Deseas registrar <strong>{{ horas_trabajadas }}</strong> horas adicionales como horas extra?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelarHorasExtra">Cancelar</button>
          <button class="btn btn-primary" @click="confirmarHorasExtra">Sí, continuar</button>
        </div>
      </div>
    </div>
  </div>

  <ActividadModal
    :show="showModal"
    @close="showModal = false"
    @submit="ActividadAdd"
  />
  <CompletadoModal
    :show="cModal"
    :initialData="selectedActivity"
    @close="cModal = false"
  />
</template>

<script>
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import * as bootstrap from 'bootstrap'
import ActividadModal from '@/components/ActividadModal.vue'
import { useToast } from 'vue-toastification'
import CustomToast from './CustomToast.vue'
import { h, toHandlers } from 'vue'
import CompletadoModal from '@/components/CompletadoModal.vue'
import CircularProgress from '@/components/CircularProgress.vue'
import { Dropdown } from 'bootstrap'
import isBetween from 'dayjs/plugin/isBetween'

dayjs.extend(isBetween)
dayjs.locale('es')

const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id
const toast = useToast()

export default {
  name: 'AcivitiesView',
  components: {
    ActividadModal,
    CompletadoModal,
    CircularProgress
  },
  data() {
    return {
      mostrarFiltro: false,
      internalValue: this.value,
      currentView: 'board',
      activeDropdown: null,
      actividades: [],
      asignaciones: [],
      enProgreso: [],
      completadas: [],
      d: null,
      showModal: false,
      horasHoy: 0,
      modalHorasExtra: false,
      modalInstance: null,
      pendienteGuardar: null,
      vistaActual: 'formulario',
      actualizacion: [],
      horas_trabajadas: 0,
      cModal: false,
      selectedActivity: {},
      hoyHoras: 0,
      intervaloHoras: null,
      actividadSeleccionada : {
        avance: 0
      },
      dropdownInstances: [],
      selectedYear: new Date().getFullYear(),
      rango: {
        start: dayjs().startOf('month').toDate(),
        end: dayjs().endOf('month').toDate()
      }
    }
  },
  computed: {
    years() {
      const currentYear = new Date().getFullYear()
      const range = []
      for (let i = currentYear - 5; i <= currentYear + 5; i++) {
        range.push(i)
      }
      return range
    }
  },
  methods: {
    toggleFilter() {
      this.mostrarFiltro = !this.mostrarFiltro
    },
    viewDetails(actividad) {
      this.selectedActivity = actividad
    },
    ActividadAdd(newActividad) {
      if (newActividad && newActividad.name) {
        this.actividades.push(this.newActividad)
      } else {
        this.cargarActividades()
      }
    },
    setView(view) {
      this.currentView = view
    },
    async loadUpdates() {
      try {
        const response = await axios.get(`http://localhost:4001/api/actualizaciones/${this.actividadSeleccionada.id_activities}`);
        this.actualizacion = response.data;
      } catch (error) {
        console.error('Error cargando estados:', error);
      }
    },
    toggleDropdown(index) {
      this.activeDropdown = this.activeDropdown === index ? null : index
    },
    closeDropdown() {
      this.activeDropdown = null
    },
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        this.closeDropdown()
      }
    },
    async cargarActividades() {
      const user = JSON.parse(localStorage.getItem('user'))
      try {
        const res = await axios.get(`http://localhost:4001/api/actividades/${user.id}`)
        
        const hoy = dayjs()
        const inicioSemana = hoy.startOf('week')
        const finSemana = hoy.endOf('week')
        
        this.asignaciones = res.data.asignaciones
        this.enProgreso = res.data.enProgreso

        this.completadas = res.data.completadas.filter(act => 
          dayjs(act.fecha_limite).isBetween(inicioSemana, finSemana, 'day', '[]')
        )
      } catch (err) {
        console.error('Error al cargar actividades:', err)
      }
    },
    filtrarPorFechas() {
      if (!this.rango || !this.rango.start || !this.rango.end) return

      const inicio = dayjs(this.rango.start).startOf('day')
      const fin = dayjs(this.rango.end).endOf('day')

      this.completadas = this.completadas.filter(act => 
        dayjs(act.fecha_limite).isBetween(inicio, fin, 'day', '[]')
      )
    },
    async guardarAvance() {
      const actividad = this.actividadSeleccionada

      try {
        // Consultar horas trabajadas hoy
        const resHoras = await fetch(`http://localhost:4001/api/usuarios/${userId}/horas-hoy`)
        const data = await resHoras.json()
        this.horasHoy = Number(data.total_horas) || 0
        this.horasNuevas = Number(this.horas_trabajadas) || 0

        const totalPrevisto = this.horasHoy + this.horasNuevas

        console.log('Horas hoy:', this.horasHoy, 'Horas nuevas:', this.horasNuevas, 'Total:', totalPrevisto)


        // Si se superan 8 horas, mostrar modal
        if (totalPrevisto > 8) {
          this.pendienteGuardar = {
            avance: Math.min(100, Math.max(0, actividad.avance)),
            horas: Math.min(100, Math.max(0, this.horasNuevas)),
            id: actividad.id_activities
          }

          this.modalInstance?.show()
          return
        }

        // Si no supera, guardar directamente
        await this.enviarAvance(actividad.id_activities, actividad.avance, this.horasNuevas)
      } catch (err) {
        console.error('Error al guardar avance:', err)
      }
    },
    async cargarHorasHoy() {
      try {
        const res = await fetch(`http://localhost:4001/api/usuarios/${userId}/horas-hoy`)
        const data = await res.json()
        this.hoyHoras = Number(data.total_horas) || 0
      } catch (error) {
        console.log('Error al obtener horas trabajadas hoy:', error)
      }
    },  
    cancelarHorasExtra() {
      this.pendienteGuardar = null
      this.modalInstance?.hide()
    },
    async confirmarHorasExtra() {
      if (!this.pendienteGuardar) return

      const { id, avance, horas } = this.pendienteGuardar
      await this.enviarAvance(id, avance, horas)

      this.modalInstance?.hide()
      this.pendienteGuardar = null
    },
    async enviarAvance(id, avance, horas) {
      try {
        const res = await fetch(`http://localhost:4001/api/actividades/${id}/avance`, {
          method: 'PUT',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({ avance, horas_trabajadas: horas })
        })
        if (!res.ok) {
          const errorData = await res.json()
          if (response.status === 400) {
            toast.error(
              h(CustomToast,{
                title: 'Error',
                message: 'No se puede registar el avance de la actividad'
              })
            )
          }
          throw new Error(errorData.error || 'No se pudo registrar el avance de la actividad')
        }
        // const savedTask = await response.json()
        toast.success(
          h(CustomToast, {
            title: 'Avance registrado',
          })
        )
        
        // const data = await res.json()
        // console.log('Guardado correctamente:', data)
        // this.cargarActividades()
      } catch (error) {
        toast.warning(
          h(CustomToast, {
            title: 'Error',
            message: 'Error al registrar avance'
          })
        )
        // console.error('Error al registrar avance:', error)
      }
    },
    formatearFecha(fecha) {
      const fechaFormateada = dayjs(fecha).format('MMMM DD, YYYY')
      return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
    },
    fechaUpdate(fecha) {
      const fechaUp = dayjs(fecha).format('MMMM DD, YYYY')
      return fechaUp.charAt(0).toUpperCase() + fechaUp.slice(1)
    },
    badgePriorityClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'bg-danger-subtle text-danger'
        case 'media':
          return 'bg-warning-subtle text-warning'
        case 'baja':
          return 'bg-success-subtle text-success'
        default:
          return 'bg-secondary text-white'
      }
    },
    abrirOffcanvas(actividad) {
      this.actividadSeleccionada = actividad

      this.$nextTick(() => {
        const offcanvasElement = document.getElementById('offcanvasScrolling')
        if (offcanvasElement) {
          const bsOffcanvas = new bootstrap.Offcanvas(offcanvasElement)
          bsOffcanvas.show()
        } else {
          console.error('Offcanvas no encontrado en el DOM.')
        }

        // Cargar actualizaciones después de que la actividad fue asignada
        if (this.actividadSeleccionada?.id_activities) {
          this.loadUpdates()
        } else {
          console.warn('No se encontró id_activities en actividadSeleccionada')
        }
      })
    },
    datosCompletos(actividad) {
      this.selectedActivity = {
        actividad: actividad.actividad,
        descripcion: actividad.descripcion,
        horasTrabajadas: actividad.horas_trabajadas,
        fecha_limite: actividad.fecha_limite,
        prioridad: actividad.prioridad,
        avance: actividad.avance,
        id_activities: actividad.id_activities,
      }
      console.log('Datos completos:', this.selectedActivity)
      this.cModal = true
    },
    statusBadgeClass(avance) {
      if (avance === 100) return 'bg-success-subtle text-success'
      if (avance > 0 && avance < 100) return 'bg-warning-subtle text-warning'
      return 'bg-secondary-subtle text-secondary'
    },
    priorityBadgeClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta': return 'bg-danger-subtle text-danger'
        case 'media': return 'bg-warning-subtle text-warning'
        case 'baja': return 'bg-success-subtle text-success'
        default: return 'bg-secondary-subtle text-secondary'
      }
    },
    progressBarClass(avance) {
      if (avance === 100) return 'bg-success'
      if (avance > 0 && avance < 100) return 'bg-warning'
      return 'bg-secondary'
    }
  },

  mounted() {
    this.cargarActividades()
    document.addEventListener('click', this.handleClickOutside)

    const modalEl = this.$refs.modalHorasExtra
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl)
    }

    this.$nextTick(() => {
      if (this.$refs.dropdownBtn) {
        this.dropdownInstance = Dropdown.getOrCreateInstance(this.$refs.dropdownBtn)
      }
    })

    this.cargarHorasHoy()
    this.intervaloHoras = setInterval(() => {
      this.cargarHorasHoy()
    }, 4000)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
    
    if (this.dropdownInstance) {
      this.dropdownInstance.dispose()
    }

    clearInterval(this.intervaloHoras)
  },
  created(){
    this.cargarActividades()
  },
  watch: {
    rango: {
      deep: true,
      handler(val) {
        if (Array.isArray(val)) {
          if (val[0] && !(val[0] instanceof Date)) {
            this.rango[0] = dayjs(val[0]).toDate()
          }
          if (val[1] && !(val[1] instanceof Date)) {
            this.rango[1] = dayjs(val[1]).toDate()
          }
        }
      }
    }
  }
}
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
    --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 2px 4px 6px 2px rgba(0, 0, 0, 0.05);
    --transition: all 0.3s ease;
}

/* Content View */
.content-view {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    min-height: 100vh;
    padding: 2rem;
}

/* Header Section */
.header-section {
    background: white;
    border-radius: var(--border-radius);
    padding: 2rem;
    box-shadow: var(--box-shadow);
    margin-bottom: 2rem;
}

.page-title {
    font-weight: 700;
    color: #1e293b;
    font-size: 2rem;
}

.page-subtitle {
    font-size: 1.1rem;
    margin-bottom: 0;
    color: var(--secondary-color);
}

/* Kanban Board */
.kanban-column {
    border-radius: var(--border-radius);
    transition: var(--transition);
}

.kanban-column:hover {
    box-shadow: var(--box-shadow-lg);
}

.kanban-column-body {
    overflow-y: auto;
    max-height: 600px;
    padding: 1rem;
}

.kanban-card {
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    transition: var(--transition);
}

.kanban-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--box-shadow-lg);
}

/* Agrega estos estilos al section de estilo */

/* Mejora de visibilidad para las tarjetas de actividades */
.kanban-card .card-body {
    background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
    border-left: 4px solid transparent;
    transition: all 0.3s ease;
}

.kanban-card:hover .card-body {
    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Bordes de color según el estado */
.kanban-card[data-status="not-started"] .card-body {
    border-left-color: #8a0bd2;
    background: linear-gradient(135deg, #ffffff 0%, #f9f5ff 100%);
}

.kanban-card[data-status="in-progress"] .card-body {
    border-left-color: #f59e0b;
    background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}

.kanban-card[data-status="completed"] .card-body {
    border-left-color: #10b981;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%);
}

/* Mejora de contraste para el texto */
.card-title {
    color: #1f2937 !important;
    font-weight: 600;
}

.card-text {
    color: #4b5563 !important;
    line-height: 1.4;
}

/* Mejora de los badges de estado */
.status-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.8rem;
    border-radius: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-not-started {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white !important;
}

.status-in-progress {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: white !important;
}

.status-completed {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white !important;
}

/* Mejora de los iconos */
.text-muted i {
    color: #6b7280 !important;
}

/* Sombra más suave para las tarjetas */
.kanban-card {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f3f4f6;
}

.kanban-card:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
}

/* Mejora de contraste para la información de fechas y horas */
.kanban-card small {
    color: #6b7280;
    font-weight: 500;
}

.kanban-card small i {
    color: #4b5563;
}

/* Efecto de elevación al hacer hover */
.kanban-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Status Badges */
.status-badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
}

.status-not-started {
    color: #8a0bd2;
    background-color: rgba(91, 6, 114, 0.2);
}

.status-in-progress {
    background-color: var(--warning-light);
    color: var(--warning-color);
}

.status-completed {
    background-color: var(--success-light);
    color: var(--success-color);
}

/* Badge Styles */
.badge {
    font-weight: 600;
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    font-size: 0.75rem;
}

.bg-primary-subtle { background-color: var(--primary-light) !important; }
.bg-success-subtle { background-color: var(--success-light) !important; }
.bg-warning-subtle { background-color: var(--warning-light) !important; }
.bg-danger-subtle { background-color: var(--danger-light) !important; }

/* Empty States */
.empty-kanban-state {
    color: var(--secondary-color);
}

/* Descripción recortada */
.descripcion-recortada {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

.header-section,
.kanban-column {
    animation: fadeInUp 0.6s ease forwards;
}

.kanban-column:nth-child(1) { animation-delay: 0.1s; }
.kanban-column:nth-child(2) { animation-delay: 0.2s; }
.kanban-column:nth-child(3) { animation-delay: 0.3s; }

.kanban-card {
    animation: fadeInUp 0.4s ease forwards;
}

.kanban-card:nth-child(odd) { animation-delay: 0.1s; }
.kanban-card:nth-child(even) { animation-delay: 0.15s; }

/* Responsive Design */
@media (max-width: 768px) {
    .content-view {
        padding: 1rem;
    }
    
    .header-section {
        padding: 1.5rem;
        text-align: center;
    }
    
    .page-title {
        font-size: 1.5rem;
    }
    
    .kanban-column {
        margin-bottom: 1.5rem;
    }
    
    .kanban-column-body {
        max-height: 400px;
    }
}

@media (max-width: 576px) {
    .kanban-card:hover {
        transform: none;
    }
}

/* Offcanvas Styles */
/* Offcanvas improvements */
.offcanvas {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.offcanvas .card {
    background: white;
    border: 1px solid #e5e7eb;
}

.offcanvas .card-header {
    background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
    border-bottom: 1px solid #e5e7eb;
}

/* Mejora de contraste en el offcanvas */
.offcanvas .text-dark {
    color: #1f2937 !important;
}

.offcanvas .text-muted {
    color: #6b7280 !important;
}

.offcanvas .progress-bar {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Form Styles */
.circular-input {
    width: 80px;
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    border: none;
    outline: none;
    background: transparent;
    color: #495057;
}

.hours-input:focus {
    color: #28a745;
}

.input-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 5px;
    text-align: center;
    font-weight: 500;
}

.input-unit {
    font-size: 1.2rem;
    color: #6c757d;
    font-weight: bold;
    margin-top: 5px;
}

.inputs-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 40px 0;
    flex-wrap: wrap;
}

.guardar-expandible {
    width: 2.5rem;
    overflow: hidden;
    transition: width 0.3s ease;
    white-space: nowrap;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
}

.guardar-expandible .guardar-text {
    opacity: 0;
    transition: opacity 0.2s ease 0.1s;
}

.guardar-expandible:hover {
    width: 8rem;
}

.guardar-expandible:hover .guardar-text {
    opacity: 1;
}

.nav-link {
    cursor: pointer;
}
</style>