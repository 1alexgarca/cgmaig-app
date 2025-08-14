<template>
  <form @submit.prevent="handleSubmit">
    <h2 class="fs-3 mb-4">Registrar nueva actividad</h2>


     <div class="row justify-content-between">
        <div class="mb-3 ">
          <label class="form-label">Proyecto</label>
          <select v-model="form.project" :class="['form-select', errors.project && 'is-invalid']">
            <option value="" disabled selected>-- Seleccione el proyecto --</option>
            <option v-for="project in projects" :key="project.id_project" :value="project.id_project">
              {{ project.name_project }}
            </option>
          </select>
          <div v-if="errors.project" class="invalid-feedback">{{ errors.project }}</div>
        </div>

        <!-- <div class="mb-3 col-6">
          <label class="form-label">Finalización</label>
          <input type="date" class="form-control" v-model="form.limited">
        </div> -->
    </div>



    <div class="mb-3">
      <label class="form-label">Actividad</label>
      <textarea v-model="form.activity" class="form-control" :class="{ 'is-invalid': errors.activity }" rows="2"></textarea>
      <div class="invalid-feedback" v-if="errors.activity">{{ errors.activity }}</div>
    </div>

    

    <div class="mb-3">
      <label class="form-label">Prioridad</label>
      <div class="d-flex justify-content-between align-items-center gap-2" :class="{ 'is-invalid': errors.priority }">
        <div class="priority-option" :class="{ 'priority-high': form.priority === 'Alta' }" @click="form.priority = 'Alta'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityHigh" value="Alta" class="d-none">
          <label for="priorityHigh">Alta</label>
        </div>
        
        <div class="priority-option" :class="{ 'priority-medium': form.priority === 'Media' }" @click="form.priority = 'Media'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityMedium" value="Media" class="d-none">
          <label for="priorityMedium">Media</label>
        </div>
        
        <div class="priority-option" :class="{ 'priority-low': form.priority === 'Baja' }" @click="form.priority = 'Baja'">
          <input v-model="form.priority" type="radio" name="priority" id="priorityLow" value="Baja" class="d-none">
          <label for="priorityLow">Baja</label>
        </div>
      </div>
      <div class="invalid-feedback d-block" v-if="errors.priority">{{ errors.priority }}</div>
    </div>
    
    <div class="mb-3">
      <label class="form-label">Descripción</label>
      <textarea v-model="form.description" class="form-control" rows="3" :class="{ 'is-invalid': errors.description }"></textarea>
      <div class="invalid-feedback" v-if="errors.description">{{ errors.description }}</div>
    </div>
   
    <div class="d-flex">
      <div class="mb-3" style="width: 70%;">
        <label for="customRange4" class="form-label">Avance de la actividad</label>
        <input 
          class="form-range"
          type="range"
          id="customRange4"
          ref="rangeInput"
          v-model="rangeValue"
          min="0"
          max="100"
        />
        <span ref="rangeOutput">{{ rangeValue }} %</span>
      </div>
      <div class="mb-3" style="width: 30%; margin-left: 1rem;">
        <label for="" class="form-label">Horas Trabajadas</label>
        <input type="number"
        v-model="form.horas"
        class="form-control">
      </div>
    </div>


    
    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Cancelar
      </button>
      <button type="submit" class="btn btn-primary">
        Guardar
      </button>
    </div>
  </form>


  <!-- Modal de confirmación si se exceden las 8 horas -->
<div class="modal fade bg-dark bg-opacity-75" id="horasModal" ref="horasModal" style="z-index: 1100;">
  <div class="modal-dialog modal-dialog-centered" style="width: 30rem;">
    <div class="modal-content rounded-5" style="background: rgba(238, 251, 80, 2);">
      <div class="modal-header text-center row row-columns  border-0">
        <h1 class="bi bi-exclamation-triangle-fill"></h1>
        <h5 class="title fw-bold">Advertencia de Horas</h5>
      </div>
      <div class="modal-body text-center">
        <p class="fw-medium">El total de horas trabajadas hoy superará las 8 horas. ¿Deseas continuar?</p>
      </div>
      <hr style="margin-left: 1rem; margin-right: 1rem;" class="text-black">
      <div class="modal-footer d-flex justify-content-center border-0">
        <button type="button" class="btn btn-dark" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-warning" @click="confirmarGuardarActividad">Sí, guardar</button>
      </div>
    </div>
  </div>
</div>

</template>

<script>

import axios from 'axios'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import CustomToast from './CustomToast.vue'
import * as bootstrap from 'bootstrap'

const user = JSON.parse(localStorage.getItem('user'))
const usuario_creador = user?.id
// console.log('Usuario creador:', usuario_creador)
const rangeInput = document.getElementById('customRange4');
const rangeOutput = document.getElementById('rangeValue');

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
        horas: '',
        rangeValue: ''
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
    // Cargar proyectos al iniciar el componente
    await this.loadProjects();
  },
  mounted() {
    // aquí puedes acceder a los refs si necesitas manipulación directa
    const input = this.$refs.rangeInput
    const output = this.$refs.rangeOutput

    if (input && output) {
      output.textContent = input.value
      input.addEventListener('input', function () {
        output.textContent = this.value
      })
    }
    // Instanciar el modal
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
      this.errors = {} // resetear errores
      if (!this.form.project) {
        this.errors.project = 'Selecciona un proyecto'
      }
      if (!this.form.activity) {
        this.errors.activity = 'Este campo es obligatorio'
      }
      if (!this.form.priority) {
        this.errors.priority = 'Esto es obligatorio'
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
        // Consultar horas actuales del usuario
        const userId = usuario_creador
        const res = await fetch(`http://localhost:4001/api/usuarios/${userId}/horas-hoy`)
        const data = await res.json()
        this.horasHoy = data.total_horas || 0

        const totalHoras = parseFloat(this.horasHoy) + parseFloat(this.form.horas || 0)

        if (totalHoras > 8) {
          // Supera 8 horas, guardar los datos pendientes y abrir modal
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
        limited: ''
      };
    },
  }
}
</script>

<style scoped>
/* input[type="date"] {
  border: 1px solid #ced4da;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background-color: #f8f9fa;
  font-size: 1rem;
}
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(0.4);
  cursor: pointer;
} */


/* Tus estilos originales se mantienen igual */
.priority-option {
  height: 2.5rem;
  width: 100%;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.priority-option label {
  cursor: pointer;
  margin-bottom: 0;
}

.priority-high {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
  color: #dc3545;
}

.priority-medium {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
  color: #ffc107;
}

.priority-low {
  background-color: rgba(25, 135, 84, 0.1);
  border-color: rgba(25, 135, 84, 0.3);
  color: #198754;
}

.priority-option:hover {
  background-color: #f8f9fa;
}
</style>