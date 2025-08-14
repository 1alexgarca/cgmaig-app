<template>
  <form @submit.prevent="handleSubmit">
    <h5 class="mb-3">Elegir fecha y hora</h5>

    <div class="d-flex">
      <div class="me-4">
        <Calendar 
          is-inline
          :attributes="calendarAttributes"
          :model-value="selectedDate"
          @dayclick="onCalendarDayClick"
        />
      </div>
      <div class="w-100">
        <input
          type="text"
          style="height: 60px; font-size: 20px;"
          class="form-control mb-4 text-center"
          v-model="formattedDate"
          @blur="updateDateFromFormatted"
        />
        <input
          type="time"
          style="height: 60px; font-size: 20px;"
          class="form-control text-center"
          v-model="selectedTime"
        />
      </div>
    </div>

    <div class="d-flex justify-content-end mt-3">
      <button type="button" class="btn btn-secondary btn-sm" @click="$emit('cancel')">Cancelar</button>
      <button type="" class="btn btn-primary btn-sm ms-4" @click="guardarPospone">Guardar</button>
    </div>
  </form>
</template>

<script>
import { Calendar } from 'v-calendar'
import dayjs from 'dayjs'
import 'dayjs/locale/es'


dayjs.locale('es')

export default {
  props: {
    notificacionId: {
      type: Number,
      required: true
    }
  },
  emits: ['saved', 'cancel'],
  components: {
    Calendar
  },
  data() {
    return {
      selectedDate: new Date(),
      selectedTime: '12:00',
      formattedDate: '',
      errorDateInput: '', // Para mostrar errores si quieres usarlo luego
      calendarAttributes: []
    }
  },
  watch: {
    selectedDate(newVal) {
      // console.log('[WATCH] selectedDate cambió:', newVal)
      this.formattedDate = this.formatearFecha(newVal)
      this.setCalendarAttribute()
    }
    
  },
  mounted() {
    this.formattedDate = this.formatearFecha(this.selectedDate)
    // console.log('[MOUNTED] Fecha inicial:', this.formattedDate)
    this.setCalendarAttribute()
  },
  methods: {
    formatearFecha(fecha) {
      try {
        const fechaFormateada = dayjs(fecha).format('DD MMM YYYY')
        return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
      } catch (error) {
        console.error('[ERROR] al formatear fecha:', error)
        return ''
      }
    },
    updateDateFromFormatted() {
      // console.log('[BLUR] Valor del input:', this.formattedDate)

      const parsed = dayjs(this.formattedDate, 'D [de] MMMM [de] YYYY', 'es', true)

      if (parsed.isValid()) {
        this.selectedDate = parsed.toDate()
        this.errorDateInput = ''
        // console.log('[OK] Fecha interpretada:', this.selectedDate)
      } else {
        // console.warn('[WARNING] Formato inválido:', this.formattedDate)
        this.errorDateInput = 'Fecha inválida. Usa el formato: 29 de julio de 2025'
      }
    },
    onCalendarDayClick(day) {
      this.selectedDate = day.date 
      this.setCalendarAttribute()
      // console.log('[CLICK CALENDARIO] Fecha seleccionada:', this.selectedDate)
    },
    setCalendarAttribute() {
      this.calendarAttributes = [
        {
          key: 'selected',
          highlight: {
            backgroundColor: '#0d6efd',
            borderRadius: '50%'
          },
          dates: this.selectedDate
        }
      ]
    },
    async posponerNotificacion(id, fecha) { 
      const res = await fetch(`http://localhost:4001/api/notificaciones/${id}/posponer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nuevaFecha: fecha.toISOString() })
      })
      const data = await res.json()
      console.log(data)
    },
    combinarFechaYHora() {
      if (!this.selectedDate || !this.selectedTime) return null
      
      const [hours, minutes] = this.selectedTime.split(':').map(Number)

      const fechaCombinada = new Date(this.selectedDate)
      fechaCombinada.setHours(hours)
      fechaCombinada.setMinutes(minutes)
      fechaCombinada.setSeconds(0)
      fechaCombinada.setMilliseconds(0)

      return fechaCombinada
    },
    async guardarPospone() {
      const fecha = this.combinarFechaYHora()
      if (!fecha) {
        alert('Por favor selecciona una fecha y hora válidas')
        return
      }
      
      await this.posponerNotificacion(this.notificacionId, fecha)
      this.$emit('saved')
    }
  }
}
</script>

