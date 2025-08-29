<template>
  <div class="userview-content">
    <!-- Título -->
    <div class="d-flex justify-content-between">
      <div class="card-body d-flex justify-content-between">
        <h4 class="fs-4 fw-bolder">Actividades</h4>


        <button type="button" class="btn btn-outline-primary" @click="showModal = true">
          <i class="bi bi-plus-circle-dotted"></i>
          Nueva Actividad
        </button>
      </div>
    </div>
    
    <div style="margin-left: 1rem;" class="text-end">
      <small class="fw-semibold">
        <span class="badge text-bg-primary bg-gradient">{{ hoyHoras }} hrs</span> 
        registradas hoy
      </small>
    </div>

    <!-- Contenido según la vista -->
    <div class="row g-2 m-4 justify-content-between  w-100">
      <div v-if="currentView === 'board'" class="row row-cols-md-3 g-2 d-flex justify-content-between">
        
        <!-- ASIGNACIONES -->
        <div 
          class="bg-dark-subtle rounded-5 border-light-subtle"
          style="max-width: 32%; height: 450px;" 
        >
          <div class="d-flex flex-column" style="padding: .5rem; height: 100%;">
            
            <!-- Encabezado -->
            <div class="d-flex mb-3 align-items-center justify-content-between" style="padding-top: 1rem; padding-right: .5rem;">
              <h5 class="card-title mb-0 me-2">
                <span class="text-warning">•</span> Asignaciones
              </h5>
              <span class="badge bg-secondary">{{ asignaciones.length }}</span>
            </div>

            <!-- Contenedor con scroll -->
            <div 
              class="overflow-auto" 
              style="flex: 1 1 auto; min-height: 0; max-height: 100%; padding-right: 4px;"
            >
              <div 
                v-for="(actividad, index) in asignaciones" 
                :key="actividad.id" 
                class="mb-2 bg-white border rounded-4 small p-2 shadow-sm"
                style="min-width: 0; cursor: pointer;"
              >
                <div @click="abrirOffcanvas(actividad)" class="p-2">
                  <div class="d-flex justify-content-center fw-bold rounded-2 mb-1" style="font-size: 0.75rem; color: #8a0bd2; background-color: rgba(91, 6, 114, 0.2);">
                    No iniciado
                  </div>
                  <p class="fw-bold text-truncate mb-1">{{ actividad.actividad }}</p>
                  <p class="text-muted descripcion-recortada small mb-1">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock-history"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <div 
                      class="text-center mt-1 rounded fw-bold mx-auto" 
                      :class="[badgeBgClass(actividad.prioridad), badgeTextClass(actividad.prioridad)]"
                      style="width: 70px; font-size: 0.75rem;"
                    >
                      {{ actividad.prioridad }}
                    </div>
                    <small class="text-muted"><i class="bi bi-flag"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- En progreso -->
        <div 
          class="card bg-dark-subtle rounded-5 border-light-subtle" 
          style="max-width: 32%; height: 450px;">

          <div class="d-flex flex-column" style="height: 100%; padding: .5rem;">
            
            <!-- Encabezado -->
            <div class="d-flex mb-3 align-items-center justify-content-between" style="padding-top: 1rem; padding-right: .5rem;">
              <h5 class="card-title mb-0 me-2">
                <span class="text-primary">•</span> En progreso
              </h5>
              <span class="badge bg-secondary">{{ enProgreso.length }}</span>
            </div>
            
            <!-- Contenedor con scroll -->
            <div 
              class="overflow-auto" 
              style="flex: 1 1 auto; min-height: 0; max-height: 100%; padding-right: 4px;"
            >
              <div 
                v-for="(actividad, index) in enProgreso" 
                :key="actividad.id" 
                class="mb-2 bg-white border rounded-4 small p-2 shadow-sm"
                style="min-width: 0; cursor: pointer;"
              >
                <div @click="abrirOffcanvas(actividad)" class="p-2">
                  <div class="d-flex justify-content-center bg-warning-subtle text-warning fw-bold rounded-2 mb-1" style="font-size: 0.75rem;">
                    En progreso
                  </div>
                  <p class="fw-bold text-truncate mb-1">{{ actividad.actividad }}</p>
                  <p class="text-muted descripcion-recortada small mb-1">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock-history"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <div 
                      class="text-center mt-1 rounded fw-bold mx-auto" 
                      :class="[badgeBgClass(actividad.prioridad), badgeTextClass(actividad.prioridad)]"
                      style="width: 70px; font-size: 0.75rem;"
                    >
                      {{ actividad.prioridad }}
                    </div>
                    <small class="text-muted"><i class="bi bi-flag"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>  
        </div>
        <!-- Completadas -->
        <div 
          class="bg-dark-subtle rounded-5 border-light-subtle"
          style="max-width: 32%; height: 450px;" 
        >
          <div class="d-flex flex-column" style="padding: .5rem; height: 100%;">
            
            <!-- Encabezado -->
            <div class="d-flex mb-3 align-items-center justify-content-between" style="padding-top: 1rem; padding-right: .5rem;">
              <h5 class="card-title mb-0 me-2">
                <span style="color: #FF0080;">•</span> Completadas
              </h5>
              <span class="badge bg-secondary">{{ completadas.length }}</span>
            </div>

            <!-- Contenedor con scroll -->
            <div 
              class="overflow-auto" 
              style="flex: 1 1 auto; min-height: 0; max-height: 100%; padding-right: 4px;"
            >
              <div 
                v-for="(actividad) in completadas" 
                :key="actividad.id" 
                class="mb-2 bg-white border rounded-4 small p-2 shadow-sm"
                style="min-width: 0; cursor: pointer;"
              >
                <div @click="datosCompletos(actividad)" class="p-2">
                  <div class="d-flex justify-content-center bg-success-subtle text-success fw-semibold rounded-2 mb-1" style="font-size: 0.75rem;">
                    Completo
                  </div>
                  <p class="fw-bold text-truncate mb-1">{{ actividad.actividad }}</p>
                  <p class="text-muted descripcion-recortada small mb-1">{{ actividad.descripcion }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted"><i class="bi bi-clock-history"></i> {{ actividad.horas_trabajadas }} hrs</small>
                    <div 
                      class="text-center mt-1 rounded fw-bold mx-auto" 
                      :class="[badgeBgClass(actividad.prioridad), badgeTextClass(actividad.prioridad)]"
                      style="width: 70px; font-size: 0.75rem;"
                    >
                      {{ actividad.prioridad }}
                    </div>
                    <small class="text-muted"><i class="bi bi-flag"></i> {{ formatearFecha(actividad.fecha_limite) }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Este div debe estar SIEMPRE renderizado -->
  <div class="offcanvas offcanvas-end rounded-3 p-3 pt-0" id="offcanvasScrolling" aria-labelledby="offcanvasScrollingLabel" style="z-index: 1100; width: 800px; margin: 1rem;">
    <div class="offcanvas-header border-bottom">
      <h5 class="fw-bold">Detalles de la actividad</h5>
      <!-- <h5 class="offcanvas-title" id="offcanvasScrollingLabel">{{ actividadSeleccionada?.actividad }}</h5> -->
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
    </div>
    <div class="offcanvas-body">
      <div class="d-flex">
        <div class="border-end border-bottom p-2" style="width: 60%; height: 50%;">
          <small>ACTIVIDAD</small>
          <h3 class="fw-bold">{{ actividadSeleccionada?.actividad }}</h3>
          <small>{{ formatearFecha(actividadSeleccionada?.fecha_creacion) }}</small>

          <div class="mt-4">
            <small>PROYECTO</small>
            <p class="fs-5 fw-bold">{{ actividadSeleccionada?.proyecto }}</p>
          </div>

          <div class="p-1 mt-4">
            <h6 class="fw-bold">Descripción de la actividad</h6>
            <p>{{ actividadSeleccionada?.descripcion }}</p>
          </div>
          
        </div>
        <div class="p-2 border-bottom" style="width: 40%;">
          <h5 class="fw-bold">Detalles adicionales</h5>

          <div class="row p-2">
            <small class="mt-3">ESTADO</small>
            <div class="d-flex">
              <span 
                 class="badge fw-semi-bold d-inline-flex align-items-center"
                 :class="{
                   'bg-success-subtle text-success': actividadSeleccionada?.avance === 100,
                   'bg-warning-subtle text-warning': actividadSeleccionada?.avance > 0 && actividadSeleccionada?.avance < 100
                 }"
                 :style="actividadSeleccionada?.avance === 0 ? 'color: #8a0bd2; background-color: rgba(91, 6, 114, 0.2);' : ''"
               >
                 <span class="fw-bold" v-if="actividadSeleccionada?.avance === 0">• No iniciado</span>
                 <span class="fw-bold" v-if="actividadSeleccionada?.avance < 100">• En progreso</span>
                 <span class="fw-bold" v-else>• Completado</span>
               </span>

                <span 
                  class="badge ms-3"
                  :class="{
                    'bg-danger-subtle': actividadSeleccionada?.prioridad === 'alta',
                    'bg-success-subtle': actividadSeleccionada?.prioridad === 'baja',
                    'bg-warning-subtle': actividadSeleccionada?.prioridad === 'media',
                    'text-danger': actividadSeleccionada?.prioridad === 'alta',
                    'text-success': actividadSeleccionada?.prioridad === 'baja',
                    'text-warning': actividadSeleccionada?.prioridad === 'media',
                  }"  
                >{{ actividadSeleccionada?.prioridad }}</span>
            </div>
            <small class="mt-3">FECHA LIMITE</small>
            <div class="fw-bold">{{ formatearFecha(actividadSeleccionada?.fecha_creacion) }}</div> 

            <small class="mt-3">FECHA CREACIÓN</small>
            <div class="fw-bold">{{ formatearFecha(actividadSeleccionada?.fecha_limite) }}</div>
          </div>
        </div>
      </div>
      
      <div class="mb-3">
        <ul class="nav nav-underline">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: vistaActual === 'formulario' }" @click="vistaActual = 'formulario'">Actualizar</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: vistaActual === 'estado' }" @click="vistaActual = 'estado'">Estado</a>
          </li>
        </ul>
      </div>
      <div v-if="vistaActual === 'formulario'">

        <form @submit.prevent="guardarAvance">
            <div class="inputs-row">
              <!-- Avance Actividad -->
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

              <!-- Horas Trabajadas -->
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

          <!-- Botón -->
          <div class="d-flex justify-content-end mt-4">
            <button 
              type="submit" 
              class="rounded-4 btn btn-outline-primary guardar-expandible d-flex align-items-center"
            >
              <i class="bi bi-floppy fs-6"></i>
              <span class="guardar-text">Guardar</span>
            </button>
          </div>        
        </form>
      </div>
    </div>
      <div v-if="vistaActual === 'estado'">
        <table class="table">
          <thead class="table-light">
            <tr>
              <th scope="col" class="fw-bold">Actividad</th>
              <th scope="col" class="fw-bold">Avance</th>
              <th scope="col" class="fw-bold">Horas</th>
              <th scope="col" class="fw-bold">Actualización</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(registro, index) in actualizacion" :key="index">
              <td>{{ registro.actividad }}</td>
              <td>{{ registro.avance }}%</td>
              <td>{{ registro.horas_trabajadas }} hrs</td>
              <td>{{ fechaUpdate(registro.fecha_actualizacion) }}</td>
            </tr>
            <tr v-if="actualizacion.length === 0">
              <td colspan="4" class="text-center">No hay registro</td>
            </tr>
          </tbody>
        </table>
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
import { h } from 'vue'
import CompletadoModal from '@/components/CompletadoModal.vue'
import CircularProgress from '@/components/CircularProgress.vue'

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
      }
    }
  },
  methods: {
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
        this.asignaciones = res.data.asignaciones
        this.enProgreso = res.data.enProgreso
        this.completadas = res.data.completadas
      } catch (err) {
        console.error('Error al cargar actividades:', err)
      }
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
    badgeBgClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'bg-danger-subtle'
        case 'media':
          return 'bg-warning-subtle'
        case 'baja':
          return 'bg-success-subtle'
        default:
          return 'bg-secondary'
      }
    },
    badgeTextClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'text-danger'
        case 'media':
          return 'text-warning'
        case 'baja':
          return 'text-success'
        default:
          return 'text-dark'
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
  },

  mounted() {
    this.cargarActividades()
    document.addEventListener('click', this.handleClickOutside)

    const modalEl = this.$refs.modalHorasExtra
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl)
    }

    this.cargarHorasHoy()
    this.intervaloHoras = setInterval(() => {
      this.cargarHorasHoy()
    }, 4000)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)

    clearInterval(this.intervaloHoras)
  },
  created(){
    this.cargarActividades()
  },

}
</script>



<style scoped>
.card-title {
  font-size: 1.25rem;
}

.card-body {
  padding: 1.25rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.table-responsive {
  overflow-x: auto;
}


.list-group-item {
  border: 1px solid #dee2e6;
  margin-bottom: 0.5rem;
  padding: 1rem;
}

@media (max-width: 768px) {
  .row-cols-md-3 {
    flex-direction: column;
  }
  .card {
    max-width: 100% !important;
  }
  .list-group-item {
    flex-direction: column;
    align-items: flex-start;
  }
}

.progress-indicator {
  max-width: 300px;
  margin: auto;
}
.gauge {
  width: 100%;
  height: auto;
}
.center-input {
  width: 100%;
  height: 100%;
  font-size: 10px;
  font-weight: bold;
  text-align: center;
  border: none;
  background: transparent;
  color: white;
}
.label {
  font-size: 4px;
  fill: #ccc;
}

/* .descripcion-recortada {
  max-height: 4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; 
  -webkit-box-orient: vertical;
} */

.descripcion-recortada {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}



.guardar-expandible {
  width: 2.5rem; /* Ancho compacto inicial */
  overflow: hidden;
  transition: width 0.3s ease;
  white-space: nowrap;
  padding-left: 0.75rem;
  padding-right: 0.75rem;
}

.nav-link {
  cursor: pointer;
}

.guardar-expandible .guardar-text {
  opacity: 0;
  transition: opacity 0.2s ease 0.1s;
}

/* Al hacer hover, el botón se expande */
.guardar-expandible:hover {
  width: 8rem; /* Ajusta según el largo del texto */
}

.guardar-expandible:hover .guardar-text {
  opacity: 1;
}

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

.form-container {
    max-width: 600px;
    margin: 0 auto;
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.inputs-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin: 40px 0;
    flex-wrap: wrap;
}

@media (max-width: 768px) {
    .inputs-row {
        flex-direction: column;
        gap: 30px;
    }
}
</style>