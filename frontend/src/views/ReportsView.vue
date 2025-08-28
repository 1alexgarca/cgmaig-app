<template>
  <div class="userview-content">
    <!-- Barra de navegación personalizada -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4 shadow-sm rounded" style="margin: 1.5rem;">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold" href="#">Calendario</a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ 'active': calendarOptions.initialView === 'dayGridMonth' }"
                href="#"
                @click.prevent="setView('dayGridMonth')"
              >Mes</a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ 'active': calendarOptions.initialView === 'timeGridWeek' }"
                href="#"
                @click.prevent="setView('timeGridWeek')"
              >Semana</a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                :class="{ 'active': calendarOptions.initialView === 'timeGridDay' }"
                href="#"
                @click.prevent="setView('timeGridDay')"
              >Día</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

        <!-- Tarjetas de eventos (opcional, muestra eventos destacados) -->
    <div class="row mt-4" style="margin: 1rem;">
      <div class="col-12 col-md-4 mb-3" v-for="event in highlightedEvents" :key="event.id">
        <div class="card h-100 border-primary">
          <div class="card-body">
            <h5 class="card-title text-primary">{{ event.title }}</h5>
            <p class="card-text text-muted">
              <i class="bi bi-calendar"></i> {{ formatDate(event.start) }}
            </p>
            <a href="#" class="btn btn-outline-primary btn-sm">Ver detalles</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Calendario -->
    <div class="card shadow-sm" style="margin: 1rem;">
      <div class="card-body p-0">
        <FullCalendar :options="calendarOptions" />
      </div>
    </div>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

export default {
  components: {
    FullCalendar,
  },
  data() {
    return {
      calendarOptions: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        weekends: false,
        events: [
          { id: '1', title: 'Reunión', start: '2025-07-07T10:00:00', end: '2025-07-07T11:00:00' },
          { id: '2', title: 'Evento', start: '2025-07-09', allDay: true },
          { id: '3', title: 'Tarea', start: '2025-07-10T14:00:00', end: '2025-07-10T15:30:00' },
        ],
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: '',
        },
        height: 'auto',
        contentHeight: 'auto',
        aspectRatio: 1.8,
        dayMaxEvents: true, // Limita eventos visibles
        eventClick: (info) => alert(`Evento: ${info.event.title}\nFecha: ${info.event.start}`),
      },
      highlightedEvents: [
        { id: '1', title: 'Reunión', start: '2025-07-07T10:00:00' },
        { id: '2', title: 'Evento', start: '2025-07-09' },
      ],
    };
  },
  methods: {
    setView(view) {
      this.calendarOptions.initialView = view;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    },
  },
};
</script>

<style scoped>

.navbar-nav .nav-link {
  color: #0d6efd;
  font-weight: 500;
}

.navbar-nav .nav-link.active {
  color: #0d6efd;
  border-bottom: 2.5px solid #0d6efd;
  font-weight: bold;
}

.card {
  border: none;
  border-radius: 0.75rem;
}

.card-body {
  padding: 1.5rem;
}

:deep(.fc) {
  width: 100%;
}

:deep(.fc-header-toolbar) {
  margin-bottom: 1rem;
}

:deep(.fc-button) {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  border-radius: 0.25rem;
}

:deep(.fc-button:hover) {
  background-color: #0b5ed7;
  border-color: #0a58ca;
}

:deep(.fc-daygrid-day-number) {
  font-weight: bold;
  color: #333;
}

:deep(.fc-event) {
  background-color: #0d6efd;
  border-color: #0d6efd;
  border-radius: 0.25rem;
  padding: 2px 4px;
  font-size: 0.875rem;
}

:deep(.fc-daygrid-event-dot) {
  border-color: #0d6efd;
}

@media (max-width: 768px) {
  :deep(.fc-header-toolbar) {
    flex-direction: column;
    gap: 0.5rem;
  }
  :deep(.fc-button-group) {
    width: 100%;
  }
  .navbar-collapse {
    flex-grow: 0;
  }
  .row .col-md-4 {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>