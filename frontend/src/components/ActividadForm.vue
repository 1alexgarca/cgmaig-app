<template>
  <form @submit.prevent="handleSubmit" class="modal-form">
    <div class="form-content">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="bi bi-kanban me-2"></i>
            Proyecto
          </label>
          <select v-model="form.project" :class="['form-select', errors.project && 'is-invalid']">
            <option value="" disabled selected>-- Seleccione el proyecto --</option>
            <option v-for="project in projects" :key="project.id_project" :value="project.id_project">
              {{ project.name_project }}
            </option>
          </select>
          <div v-if="errors.project" class="invalid-feedback">{{ errors.project }}</div>
        </div>

        <div class="col-md-6 mb-3">
          <label class="form-label">
            <i class="bi bi-clock me-2"></i>
            Horas Trabajadas
          </label>
          <input 
            type="number" 
            v-model="form.horas"
            class="form-control"
            min="0"
            step="0.5"
            placeholder="0.0"
          >
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-card-text me-2"></i>
          Actividad
        </label>
        <textarea 
          v-model="form.activity" 
          class="form-control" 
          :class="{ 'is-invalid': errors.activity }" 
          rows="2"
          placeholder="Describe la actividad a realizar"
        ></textarea>
        <div class="invalid-feedback" v-if="errors.activity">{{ errors.activity }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-flag me-2"></i>
          Prioridad
        </label>
        <div class="priority-container" :class="{ 'is-invalid': errors.priority }">
          <div 
            class="priority-option" 
            :class="{ 'priority-high-active': form.priority === 'Alta' }"
            @click="form.priority = 'Alta'"
          >
            <i class="bi bi-flag-fill text-danger me-2"></i>
            <span>Alta</span>
          </div>
          
          <div 
            class="priority-option" 
            :class="{ 'priority-medium-active': form.priority === 'Media' }"
            @click="form.priority = 'Media'"
          >
            <i class="bi bi-flag-fill text-warning me-2"></i>
            <span>Media</span>
          </div>
          
          <div 
            class="priority-option" 
            :class="{ 'priority-low-active': form.priority === 'Baja' }"
            @click="form.priority = 'Baja'"
          >
            <i class="bi bi-flag-fill text-success me-2"></i>
            <span>Baja</span>
          </div>
        </div>
        <div class="invalid-feedback d-block" v-if="errors.priority">{{ errors.priority }}</div>
      </div>
      
      <div class="mb-3">
        <label class="form-label">
          <i class="bi bi-text-paragraph me-2"></i>
          Descripción
        </label>
        <textarea 
          v-model="form.description" 
          class="form-control" 
          rows="3" 
          :class="{ 'is-invalid': errors.description }"
          placeholder="Proporciona detalles adicionales sobre la actividad"
        ></textarea>
        <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
      </div>
     
      <div class="mb-4">
        <label class="form-label d-flex justify-content-between">
          <span>
            <i class="bi bi-graph-up me-2"></i>
            Avance de la actividad
          </span>
          <span class="range-value">{{ rangeValue }}%</span>
        </label>
        <input 
          class="form-range custom-range"
          type="range"
          v-model="rangeValue"
          min="0"
          max="100"
        />
        <div class="range-labels d-flex justify-content-between mt-1">
          <small class="text-muted">0%</small>
          <small class="text-muted">100%</small>
        </div>
      </div>

      <div class="d-flex justify-content-end gap-2 mt-4">
        <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
          <i class="bi bi-x-circle me-2"></i>
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-circle me-2"></i>
          Guardar
        </button>
      </div>
    </div>

    <!-- Modal de confirmación si se exceden las 8 horas -->
    <div class="modal fade" id="horasModal" ref="horasModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title text-warning">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Advertencia de Horas
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body py-4">
            <p>El total de horas trabajadas hoy superará las 8 horas. ¿Deseas continuar?</p>
          </div>
          <div class="modal-footer border-0">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-warning" @click="confirmarGuardarActividad">
              <i class="bi bi-check-lg me-2"></i>
              Sí, guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'
import * as bootstrap from 'bootstrap'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id

export default {
  name: 'TaskForm',
  emits: ['saved', 'cancel'],
  components: {
    CustomToast
  },
  data() {
    return {
      form: {
        user: '',
        project: '',
        activity: '',
        description: '',
        priority: '',
        horas: ''
      },
      errors: {},
      projects: [],
      users: [],
      loading: false,
      rangeValue: 0,
      horasHoy: 0,
      modalInstance: null,
      pendienteGuardar: null
    }
  },
  async created() {
    await this.loadProjects();
  },
  mounted() {
    const modalElement = this.$refs.horasModal
    if (modalElement) {
      this.modalInstance = new bootstrap.Modal(modalElement)
    }
  },
  methods: {
    async loadProjects() {
      try {
        const response = await axios.get('http://localhost:4001/api/project');
        this.projects = response.data;
      } catch (error) {
        console.error('Error cargando proyectos:', error);
      }
    },

    validateForm() {
      this.errors = {}
      if (!this.form.project) {
        this.errors.project = 'Selecciona un proyecto'
      }
      if (!this.form.activity) {
        this.errors.activity = 'Este campo es obligatorio'
      }
      if (!this.form.priority) {
        this.errors.priority = 'Selecciona una prioridad'
      }
      if (!this.form.description) {
        this.errors.description = 'Este campo es obligatorio'
      }
      return Object.keys(this.errors).length === 0
    },

    async handleSubmit() {
      const toast = useToast()
      if (!this.validateForm()) return

      try {
        const userId = usuario_creador
        const res = await fetch(`http://localhost:4001/api/usuarios/${userId}/horas-hoy`)
        const data = await res.json()
        this.horasHoy = data.total_horas || 0

        const totalHoras = parseFloat(this.horasHoy) + parseFloat(this.form.horas || 0)

        if (totalHoras > 8) {
          this.pendienteGuardar = {
            ...this.form,
            avance: this.rangeValue
          }
          this.modalInstance.show()
          return
        }

        await this.enviarActividad()

      } catch (err) {
        toast.warning(h(CustomToast, {
          title: 'Error al verificar horas',
          message: 'Ocurrió un problema al validar las horas trabajadas hoy'
        }))
      }
    },
    
    async confirmarGuardarActividad() {
      await this.enviarActividad()
      this.modalInstance.hide()
    },

    async enviarActividad() {
      const toast = useToast()

      try {
        const taskData = {
          usuario_id: this.form.user,
          proyecto_id: this.form.project,
          actividad: this.form.activity,
          descripcion: this.form.description,
          prioridad: this.form.priority,
          usuario_creador: usuario_creador,
          avance: this.rangeValue,
          horas: this.form.horas
        }

        const response = await fetch('http://localhost:4001/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          toast.error(h(CustomToast, {
            title: 'Error',
            message: errorData.error || 'No se pudo guardar la actividad'
          }))
          return
        }

        const savedTask = await response.json()
        toast.success(h(CustomToast, {
          title: 'Actividad guardada'
        }))
        this.$emit('saved', savedTask)
        this.resetForm()

      } catch (error) {
        toast.warning(h(CustomToast, {
          title: 'Algo salió mal',
          message: 'Por favor, intenta de nuevo más tarde'
        }))
      }
    },
    
    resetForm() {
      this.form = {
        user: '',
        project: '',
        activity: '',
        description: '',
        priority: '',
        horas: ''
      }
      this.rangeValue = 0
    }
  }
}
</script>

<style scoped>
/* Variables CSS definidas localmente */
.modal-form {
  --primary-color: rgb(105, 28, 32);
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
  --box-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --transition: all 0.3s ease;
}

.modal-form {
  background: white;
  border-bottom-left-radius: var(--border-radius);
  border-bottom-right-radius: var(--border-radius);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden; /* Evita scroll en el contenedor principal */
}

.form-content {
  padding: 1.5rem;
  overflow-y: auto; /* Permite scroll interno */
  flex-grow: 1;
  /* Scroll invisible pero funcional */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.form-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* Estilos para el desplazamiento táctil en dispositivos móviles */
.form-content {
  -webkit-overflow-scrolling: touch; /* Desplazamiento suave en iOS */
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.form-control, .form-select {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 0.75rem 1rem;
  transition: var(--transition);
}

.form-control:focus, .form-select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.priority-container {
  display: flex;
  gap: 0.75rem;
}

.priority-option {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.priority-option:hover {
  background-color: var(--light-bg);
}

.priority-high-active {
  background-color: var(--danger-light);
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.priority-medium-active {
  background-color: var(--warning-light);
  border-color: var(--warning-color);
  color: var(--warning-color);
}

.priority-low-active {
  background-color: var(--success-light);
  border-color: var(--success-color);
  color: var(--success-color);
}

.custom-range {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

.custom-range::-webkit-slider-thumb {
  appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.custom-range::-moz-range-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: var(--primary-color);
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  border: none;
}

.range-value {
  font-weight: 600;
  color: var(--primary-color);
}

.range-labels {
  font-size: 0.75rem;
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
  background: var(--primary-color);
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

/* Efecto visual para indicar que hay más contenido */
.form-content:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(to bottom, transparent, white);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.form-content.scrolling:after {
  opacity: 1;
}

/* Responsive */
@media (max-width: 768px) {
  .priority-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .form-content {
    padding: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

/* Pequeño ajuste para mejorar la experiencia en móviles */
@media (max-width: 576px) {
  .form-content {
    padding-bottom: 2rem; /* Espacio extra al fondo para mejor desplazamiento */
  }
}
</style>
