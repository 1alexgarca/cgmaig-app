<template>
    <h2 class="fs-3 border-bottom" style="padding-bottom: .6rem;">{{ datos.actividad }}</h2>
    
    <span class="text-end text-body-tertiary mb-3">{{ datos.name_proyect }}</span>
    <table class="table table-borderless">
        <thead>
            <tr>
                <th class=" text-muted">
                    <i class="bi bi-person persoData"></i>
                    Asignador
                </th>
                <th>
                {{ datos.asignador }}
                </th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th class="text-muted">
                    <i class="bi bi-clock-history persoData"></i>
                    Fecha de asignación
                </th>
                <td> jul 15, 2025</td>
            </tr>
            <tr>
                <th class="text-muted">
                    <i class="bi bi-arrow-repeat persoData"></i>
                    Estado
                </th>
                <td class="d-flex align-items-center">
                  <span class="badge bg-success-subtle text-success">
                    {{ datos.estado }}
                    completado
                  </span>
                  <span
                    class="badge ms-2"
                    :class="badgeBgClass(datos.prioridad)">
                    {{ datos.prioridad }}
                  </span>
                </td>
            </tr>
            <tr>
                <th class="text-muted">
                    <i class="bi bi-stopwatch persoData"></i>
                    Horas trabajadas
                </th>
                <td>{{ datos.horas_trabajadas }} hrs</td>
            </tr>
        </tbody>
    </table>

    <div class="mb-3">
        <ul class="nav nav-underline">
          <li class="nav-item">
            <a style="cursor: pointer;" class="nav-link" :class="{ active: vistaActual === 'descripcion' }" @click="vistaActual = 'descripcion'">Descripción</a>
          </li>
          <li class="nav-item">
            <a style="cursor: pointer;" class="nav-link" :class="{ active: vistaActual === 'estado' }" @click="vistaActual = 'estado'">Estado</a>
          </li>
        </ul>
    </div>

    <div v-if="vistaActual === 'descripcion'" class="card mb-3">
        <div class="card-body">
            {{ datos.descripcion }}
        </div>
    </div>

    <table v-if="vistaActual === 'estado'" class="table">
        <thead class="table-light">
            <tr>
                <th class="fw-bold">Avance</th>
                <th class="fw-bold">Horas trabajadas</th>
                <th class="fw-bold">Actualización</th>
                
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in datos.actualizaciones" :key="index">
                <td>{{ item.avance }}</td>
                <td>{{ item.horas }}</td>
                <td>{{ formatFecha(item.fecha_actualización) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="d-flex justify-content-end gap-2">
      <button type="submit" class="btn btn-danger">
        <i class="bi bi-trash"></i>
        Eliminar
      </button>
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
.persoData {
  margin-right: .6rem;
}
</style>