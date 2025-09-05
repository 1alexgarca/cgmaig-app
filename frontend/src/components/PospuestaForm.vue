<template>
  <form @submit.prevent="handleSubmit" class="modal-form">
    <div class="form-content">
      <div class="datetime-selector">
        <div class="row">
          <div class="col-md-6">
            <div class="calendar-section mb-4">
              <label class="form-label">
                <i class="bi bi-calendar3 me-2"></i>
                Seleccionar fecha
              </label>

              <Calendar 
                is-inline
                :attributes="calendarAttributes"
                :model-value="selectedDate"
                @dayclick="onCalendarDayClick"
                class="custom-calendar"
              />
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="time-section">
              <label class="form-label">
                <i class="bi bi-clock me-2"></i>
                Seleccionar hora
              </label>
              
              <div class="date-display-card card mb-4">
                <div class="card-body text-center">
                  <div class="selected-date-display">
                    <div class="date-icon">
                      <i class="bi bi-calendar-check"></i>
                    </div>
                    <div class="date-text">
                      <div class="selected-day">{{ formattedDay }}</div>
                      <div class="selected-date">{{ formattedDate }}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="time-input-container">
                <label class="time-label">Hora</label>
                <input
                  type="time"
                  class="form-control time-input"
                  v-model="selectedTime"
                  @change="validateTime"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-end gap-2 pt-3 border-top">
        <button type="button" class="btn btn-outline-secondary" @click="$emit('cancel')">
          <i class="bi bi-x-circle me-2"></i>
          Cancelar
        </button>
        <button type="button" class="btn btn-primary" @click="guardarPospone" :disabled="!isFormValid">
          <i class="bi bi-calendar-check me-2"></i>
          Confirmar Posposición
        </button>
      </div>
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
      formattedDay: '',
      errorDateInput: '',
      calendarAttributes: [],
    }
  },
  computed: {
    isFormValid() {
      return this.selectedDate && this.selectedTime
    },
    fullFormattedDateTime() {
      if (!this.selectedDate || !this.selectedTime) return ''
      
      const date = dayjs(this.selectedDate)
      const time = this.selectedTime
      
      return `${date.format('dddd, D [de] MMMM [de] YYYY')} a las ${time}`
    }
  },
  watch: {
    selectedDate(newVal) {
      this.updateFormattedDate(newVal)
      this.setCalendarAttribute()
    }
  },
  mounted() {
    this.updateFormattedDate(this.selectedDate)
    this.setCalendarAttribute()
  },
  methods: {
    updateFormattedDate(date) {
      try {
        this.formattedDate = dayjs(date).format('D [de] MMMM [de] YYYY')
        this.formattedDay = dayjs(date).format('dddd')
        this.formattedDate = this.formattedDate.charAt(0).toUpperCase() + this.formattedDate.slice(1)
        this.formattedDay = this.formattedDay.charAt(0).toUpperCase() + this.formattedDay.slice(1)
      } catch (error) {
        console.error('Error al formatear fecha:', error)
        this.formattedDate = ''
        this.formattedDay = ''
      }
    },
    validateTime() {
      if (!this.selectedTime) {
        this.selectedTime = '12:00'
      }
    },
    onCalendarDayClick(day) {
      this.selectedDate = day.date 
      this.setCalendarAttribute()
    },
    setCalendarAttribute() {
      this.calendarAttributes = [
        {
          key: 'selected',
          highlight: {
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '50%',
            height: '44px',
            width: '44px'
          },
          dates: this.selectedDate
        }
      ]
    },
    async posponerNotificacion(id, fecha) { 
      try {
        const res = await fetch(`http://localhost:4001/api/notificaciones/${id}/posponer`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nuevaFecha: fecha.toISOString() })
        })
        
        if (!res.ok) {
          throw new Error('Error al posponer la notificación')
        }
        
        const data = await res.json()
        return data
      } catch (error) {
        console.error('Error:', error)
        throw error
      }
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
      try {
        const fecha = this.combinarFechaYHora()
        if (!fecha) {
          alert('Por favor selecciona una fecha y hora válidas')
          return
        }
        
        await this.posponerNotificacion(this.notificacionId, fecha)
        this.$emit('saved')
      } catch (error) {
        alert('Error al posponer la actividad. Por favor, intenta nuevamente.')
      }
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
  --transition: all 0.3s ease;
}

/* EL PROBLEMA ESTÁ AQUÍ: El scroll debe manejarse en el contenedor principal, no en form-content */
.modal-form {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.form-content {
  flex-grow: 1;
  overflow-y: auto; /* Este es el contenedor que debe tener scroll */
  padding: 1.5rem;
  /* Ocultar scrollbar pero mantener funcionalidad */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.form-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* Asegurar que el calendero no cause overflow */
.calendar-container {
  max-height: 350px;
  overflow: hidden;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}

.calendar-container {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 1rem;
  background: white;
}

.custom-calendar {
  width: 100%;
}

:deep(.vc-day) {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.vc-day-content) {
  font-weight: 500;
}

:deep(.vc-highlight) {
  border-radius: 50% !important;
}

.date-display-card {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
}

.selected-date-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
}

.date-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.date-text {
  text-align: center;
}

.selected-day {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.selected-date {
  font-size: 0.9rem;
  color: var(--secondary-color);
}

.time-input-container {
  background: var(--light-bg);
  padding: 1.5rem;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color);
}

.time-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: block;
}

.time-input {
  font-size: 1.1rem;
  text-align: center;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.time-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.selected-datetime-summary {
  background: var(--primary-light);
  border: 1px solid var(--primary-color);
  border-radius: var(--border-radius-sm);
}

.summary-content {
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-primary:disabled {
  background: var(--secondary-color);
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--secondary-color);
}

.btn-secondary:hover {
  background: var(--light-bg);
}

/* Responsive */
@media (max-width: 768px) {
  .selected-date-display {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .date-icon {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
  
  .time-input {
    font-size: 1rem;
    padding: 0.5rem;
  }
  
  .form-content {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .datetime-selector .row {
    flex-direction: column;
  }
  
  .calendar-container {
    padding: 0.5rem;
    max-height: 300px;
  }
  
  :deep(.vc-day) {
    height: 36px;
    font-size: 0.875rem;
  }
  
  .time-input-container {
    padding: 1rem;
  }
}

/* Para dispositivos muy pequeños */
@media (max-height: 600px) {
  .calendar-container {
    max-height: 250px;
  }
  
  :deep(.vc-day) {
    height: 32px;
    font-size: 0.75rem;
  }
  
  .date-icon {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }
}
</style>