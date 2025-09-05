<template>
  <div
    v-if="show"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    :aria-hidden="!show"
  >
    <div class="modal-content">
      <div class="modal-header-section">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="modal-title">
            <i class="bi bi-calendar-plus me-2"></i>
            Posponer Actividad
          </h3>
          <button class="close-btn" @click="$emit('close')" autofocus>
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      </div>
      <PospuestaForm 
        :notificacion-id="notificacionId"
        @saved="handleSubmit" 
        @cancel="$emit('close')" />
    </div>
  </div>
</template>

<script>
import PospuestaForm from './PospuestaForm.vue';

export default {
  components: { PospuestaForm },
  props: {
    show: Boolean,
    notificacionId: Number
  },
  emits: ['close', 'submit'],  
  methods: {
    handleSubmit(actividadData) {
      this.$emit('submit', actividadData)
    }
  }
}
</script>

<style scoped>
/* Variables CSS definidas localmente */
.modal-overlay {
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  width: 100%;
  max-width: 800px;
  max-height: 90vh; /* Esto es crucial - limita la altura */
  overflow: hidden; /* Oculta cualquier overflow del contenedor principal */
  box-shadow: var(--box-shadow-lg);
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-header-section {
  background: linear-gradient(135deg, var(--light-bg) 0%, #f1f5f9 100%);
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  border-top-left-radius: var(--border-radius);
  border-top-right-radius: var(--border-radius);
  flex-shrink: 0; /* Evita que se encoja */
}

.modal-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
  font-size: 1.5rem;
}

.modal-subtitle {
  color: var(--secondary-color);
  margin-bottom: 0;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--secondary-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.close-btn:hover {
  background-color: var(--light-bg);
  color: var(--danger-color);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    max-height: 95vh; /* Ajuste para móviles */
  }
  
  .modal-header-section {
    padding: 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
}

@media (max-height: 600px) {
  .modal-content {
    max-height: 98vh; /* Ajuste para pantallas muy pequeñas */
  }
}
</style>