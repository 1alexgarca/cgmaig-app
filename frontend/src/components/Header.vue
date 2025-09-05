<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const isUserPanelOpen = ref(false);
const userPanelButton = ref(null);

const toggleUserPanel = () => {
  isUserPanelOpen.value = !isUserPanelOpen.value;
};

const handleClickOutside = (event) => {
  if (userPanelButton.value && !userPanelButton.value.contains(event.target) && !event.target.closest('.user-panel')) {
    isUserPanelOpen.value = false;
  }
};
const isMobileSidebarOpen = ref(false);

const toggleMobileSidebar = () => {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value;
};

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push({ name: 'Login' })
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <header class="header-improved d-flex justify-content-between align-items-center gobPrimary" 
  style="height: 4.5rem; padding: 0.75rem 1.5rem; z-index: 1100;">
    <!-- Dentro del <header>, reemplaza esta parte -->
    <div class="d-flex align-items-center justify-content-center">
      <!-- Botón de menú visible solo en tablets y celulares -->
      <button
        type="button"
        class="btn d-lg-none me-3"
        @click="toggleMobileSidebar"
      >
        <i class="bi bi-list fs-3 text-black"></i>
      </button>
    </div>

    <!-- Derecha: Íconos de notificación y usuario -->
    <div class="d-flex align-items-center gap-3">
      
      <div class="position-relative">
        <i 
          class="bi bi-bell fs-4 text-black cursor-pointer text-white"
          @click="toggleNotificaciones"
          style="cursor: pointer;">
        </i>
        <span 
          v-if="contadorNoLeidas"
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          style="font-size: 0.65rem;"
        >
        {{ contadorNoLeidas }}
        </span>
      </div>

      <button ref="userPanelButton" type="button" class="btn p-0" style="color: black;" @click="toggleUserPanel">
        <img
          :src="imagenUrl"
          alt="Foto de perfil"
          class="rounded-circle"
          style="width: 40px; height: 40px; object-fit: cover;"
        >
      </button>
    </div>

    <!-- Panel de usuario -->
    <div
      :class="['user-panel', { open: isUserPanelOpen }]"
      class="position-fixed end-0 rounded-5 border bg-white shadow-lg"
      style="top: 78px; width: 25rem; height: 80%; z-index: 1001;  transition: transform 0.3s ease-in-out;"
    >
    
      <div class="mb-4">
        <div class="bg-dark-subtle rounded-top-5" style="height: 10rem;">
          <div class="position-relative d-flex justify-content-center" style="padding-top: 3.5rem;">
            <img 
              :src="imagenUrl" 
              alt="Foto de perfil" 
              class="position-absolute " 
              style="width: 170px; height: 160px; object-fit: cover; border-radius: 15px;"
            >
          </div>
        </div>
      </div>
      <div class="p-3 pt-5" style="height: 100%;">
        <div class="user-info mt-3 mb-4">
          <h6 class="mt-2 mb-1 fs-4 fw-bold">{{ auth.fullName }}</h6>
          <small>{{ auth.dependencia }}</small>
        </div>
        <div class="d-flex mb-3 justify-content-between">
          <router-link to="/perfil" class="btn btn-outline-secondary" style="width: 60%;">
              <i class="bi bi-person"> Perfil</i>
          </router-link>
          <router-link
            class="btn btn-outline-secondary"
            to="/login"
            @click.prevent="logout"
          >
            <i class="bi bi-box-arrow-right"> Cerrar sesión</i>
          </router-link>
        </div>
        <div>
          <table class="table table-borderless">
            <thead>
              <tr>
                <th class="text-muted">
                  <i class="bi bi-envelope-at">
                    <small class="ps-3">Correo</small>
                  </i>
                </th>
                <th class="ps-3 text-muted">
                  <i>{{ auth.email }}</i>
                </th>
              </tr>
              <tr>
                <th class="text-muted">
                  <i class="bi bi-telephone">
                    <small class="ps-3">Teléfono</small>
                  </i>
                </th>
                <th class="ps-3 text-muted">
                  <i>{{ auth.telefono }}</i>
                </th>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>

    <!-- Menú lateral móvil -->
    <transition name="slide">
      <aside
        v-if="isMobileSidebarOpen"
        class="position-fixed top-0 start-0 vh-100 bg-body shadow-lg"
        style="width: 16rem; z-index: 1050;"
      >
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <span class="fw-bold">Menú</span>
          <button class="btn btn-sm" @click="toggleMobileSidebar">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="p-3">
          <div v-for="route in mainRoutes" :key="route.name" class="mb-2">
            <router-link
              :to="route.path"
              class="d-flex align-items-center text-decoration-none text-dark py-2"
              @click="toggleMobileSidebar"
            >
              <i class="bi" :class="route.meta?.icon" style="width: 1.5rem;"></i>
              <span class="ms-3">{{ route.name }}</span>
            </router-link>
          </div>

          <hr />

          <router-link
            to="/settings"
            class="d-flex align-items-center text-decoration-none text-dark py-2"
            @click="toggleMobileSidebar"
          >
            <i class="bi bi-gear" style="width: 1.5rem;"></i>
            <span class="ms-3">Settings</span>
          </router-link>
        </div>
      </aside>
    </transition>

    <!-- Panel de notificaciones -->
    <div 
      v-if="mostrarNotificaciones"
      class="notifications-panel position-absolute top-100 end-0 mt-2 shadow-lg"
    >
      <div class="notifications-header">
        <div class="notifications-title text-black">
          <i class="bi bi-bell me-2"></i>
          Notificaciones
        </div>
        <div class="notifications-tabs">
          <ul class="nav nav-underline border-bottom" id="pills-tab" role="tablist">
            <li class="nav-item">
              <a class="nav-link" :class="{ active: pestañaActiva === 'no-leidas' }" @click="pestañaActiva = 'no-leidas'">
                <small class="text-body-tertiary">
                  <i class="bi bi-envelope"></i>
                  No leidos
                </small>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: pestañaActiva === 'leidas' }" @click="pestañaActiva = 'leidas'">
                <small class="text-body-tertiary">
                  <i class="bi bi-envelope-open"></i>
                  Leidas
                </small>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" :class="{ active: pestañaActiva === 'pospuestas' }" @click="pestañaActiva = 'pospuestas'">
                <small class=" text-body-tertiary">
                  <i class="bi bi-clock"></i>
                  Pospuestos
                </small>
              </a>
            </li>
          </ul>

        </div>
      </div>

      <div class="notifications-content">   
        <!-- Estado vacío para no leídas -->
        <div v-if="pestañaActiva === 'no-leidas' && notificacionesNoLeidas.length === 0" class="empty-state">
          <i class="bi bi-bell-slash empty-icon"></i>
          <p class="empty-text">Sin notificaciones</p>
        </div>

        <!-- Estado vacío para leídas -->
        <div v-if="pestañaActiva === 'leidas' && notificacionesLeidas.length === 0" class="empty-state">
          <i class="bi bi-bell-slash empty-icon"></i>
          <p class="empty-text">Sin notificaciones leídas</p>
        </div>

        <!-- Estado vacío para pospuestas -->
        <div v-if="pestañaActiva === 'pospuestas' && notificacionesPospuestas.length === 0" class="empty-state">
          <i class="bi bi-bell-slash empty-icon"></i>
          <p class="empty-text">Sin notificaciones pospuestas</p>
        </div>

        <!-- NO LEÍDAS -->
        <div v-if="pestañaActiva === 'no-leidas'">
          <div 
            class="notification-item"
            v-for="notificacion in notificacionesNoLeidas"
            :key="notificacion.id_push"
          >
            <!-- Ícono -->
            <div 
              class="notification-icon"
              :class="[
                notificacion.tipo === 'vencimiento'
                  ? 'bg-warning-subtle text-warning'
                  : notificacion.tipo === 'ajuste'
                  ? 'bg-info-subtle text-info'
                  : badgeBgClass(notificacion.prioridad)
              ]"
            >
              <i 
                class="bi"
                :class="[
                  notificacion.tipo === 'vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)]"
              >
              </i>
            </div>

            <!-- Contenido de la notificación -->
            <div class="notification-content">
              <div class="notification-message">
                <span class="sender-name">{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span> 
                {{ notificacion.mensaje }}
                <span class="activity-name">{{ notificacion.actividad }}</span>
              </div>

              <div class="notification-footer">
                <span class="notification-time">{{ notificacion.tiempo }}</span>

                <div class="notification-actions" v-if="notificacion.tipo === 'asignacion' && notificacion.respuesta === 'pendiente'">
                  <div class="tooltip-container">
                    <button class="action-btn-small success rounded-3" @click="responderNotificacion(notificacion.id_push, 'aceptada')">
                      <i class="bi bi-check-circle"></i>
                    </button>
                    <span class="custom-tooltip">Aceptar</span>
                  </div>
                  <div class="tooltip-container">
                    <button class="action-btn-small danger rounded-3" @click="responderNotificacion(notificacion.id_push, 'rechazada')">
                      <i class="bi bi-x-circle"></i>
                    </button>
                    <span class="custom-tooltip">Rechazar</span>
                  </div>

                </div>

                <!-- Acciones para vencimiento -->
                <div class="notification-actions" v-if="notificacion.tipo === 'vencimiento'">
                  <div class="tooltip-container">
                    <button class="action-btn-small primary rounded-3" @click="marcarComoLeida(notificacion.id_push)">
                      <i class="bi bi-envelope-open"></i>
                    </button>
                    <span class="custom-tooltip">Marcar como leída</span>
                  </div>

                  <div class="tooltip-container">
                    <button class="action-btn-small secondary rounded-3" @click="toggleDropdown">
                      <i class="bi bi-clock"></i>
                    </button>
                    <ul v-show="mostrarOpciones" class="custom-dropdown">
                      <li class="pe-5" disabled>Posponer hasta...</li>
                      <li class="d-flex justify-content-between" @click="posponerNotificacion(30, notificacion.id_push)">
                        <span>Hoy más tarde</span> 
                        <span class="ps-3">30 mim</span>
                      </li>
                      <li class="d-flex justify-content-between" @click="posponerNotificacion(60, notificacion.id_push)">
                        <span>...</span>
                        <span>1 hora</span>
                      </li>
                      <li class="d-flex justify-content-between border-bottom" @click="posponerNotificacion(120, notificacion.id_push)">
                        <span>...</span>
                        <span>2 horas</span>
                      </li>
                      <li @click="posponerActividad(notificacion.id_push)">
                        <span><i class="bi bi-calendar-event"></i></span>
                        <span class="ps-2"><i>Elegir fecha y hora</i></span>
                      </li>
                    </ul>
                    <span class="custom-tooltip">Posponer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- LEÍDAS -->
        <div v-if="pestañaActiva === 'leidas'">
          <div 
            class="notification-item read"
            v-for="notificacion in notificacionesLeidas"
            :key="notificacion.id_push"  
          >
            <div 
              class="notification-icon"
              :class="[
                notificacion.tipo == 'vencimiento'
                  ? 'bg-warning-subtle text-warning'
                  : notificacion.tipo === 'ajuste'
                  ? 'bg-info-subtle text-info'
                  : badgeBgClass(notificacion.prioridad)
              ]"
            >
              <i 
                class="bi"
                :class="[
                  notificacion.tipo ==='vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)
                ]"
              >
              </i>
            </div>

            <div class="notification-content">
              <div class="notification-message">
                <span class="sender-name">{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                {{ notificacion.mensaje }}
                <span class="activity-name">{{ notificacion.actividad }}</span>
              </div>
              <div class="notification-footer">
                <span class="notification-time">{{ notificacion.tiempo }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- POSPUESTAS -->
        <div v-if="pestañaActiva === 'pospuestas'">
          <div 
            class="notification-item postponed"
            v-for="notificacion in notificacionesPospuestas"
            :key="notificacion.id_push"  
          >
            <div 
              class="notification-icon"
              :class="[
                notificacion.tipo == 'vencimiento'
                  ? 'bg-warning-subtle text-warning'
                  : notificacion.tipo === 'ajuste'
                  ? 'bg-info-subtle text-info'
                  : badgeBgClass(notificacion.prioridad)
              ]"
            >
              <i 
                class="bi"
                :class="[
                  notificacion.tipo ==='vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)
                ]"
              >
              </i>
            </div>

            <div class="notification-content">
              <div class="notification-message">
                <span class="sender-name">{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                {{ notificacion.mensaje }}
                <span class="activity-name">{{ notificacion.actividad }}</span>
              </div>
              <div class="notification-footer">
                <span class="notification-time">{{ notificacion.tiempo }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>


  <PosponerModal
    :notificacion-id="notificacionSeleccionada"
    :show="showModal"
    @close="showModal = false"
  />
</template>


<script>
import axios from 'axios'
import { useToast } from 'vue-toastification';
import CustomToast from './CustomToast.vue';
import { h } from 'vue'
import PosponerModal from '@/components/PospuestaModal.vue'
import defaultImage from '@/assets/perfil.webp'


const toast = useToast()
const user = JSON.parse(localStorage.getItem('user'))
const userId = user?.id  // Asegúrate que sea `id_user` si tu objeto lo tiene así

export default {
  data() {
    return {
      mostrarNotificaciones: false,
      notificacionesNoLeidas: [],
      notificacionesLeidas: [],
      notificacionesPospuestas: [],
      contadorNoLeidas: 0,
      intervaloNotificaciones: null,
      pestañaActiva: 'no-leidas',
      mostrarOpciones: false,
      showModal: false,
      notificacionSeleccionada: null,
      imagen: user.imagen || defaultImage,
      imagenUrl: ''
    }
  },
  methods: {
    toggleNotificaciones() {
      this.mostrarNotificaciones = !this.mostrarNotificaciones
    },
    async cargarNotificaciones() {
      try {
        const res = await axios.get(`http://localhost:4001/api/notificaciones/${userId}/agrupadas`)
        this.notificacionesNoLeidas = res.data.noLeidas
        this.notificacionesLeidas = res.data.leidas
        this.notificacionesPospuestas = res.data.pospuestas
        this.contadorNoLeidas = res.data.noLeidas.length
      } catch (err) {
        console.error('Error al cargar notificaciones:', err)
      }
    },
    async marcarComoLeida(id_push) {
      try {
        await axios.put(`http://localhost:4001/api/notificaciones/${id_push}/leida`)
        await this.cargarNotificaciones()
      } catch (err) {
        console.error('Error al marcar como leída:', err)
      }
    },
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleString('es-MX', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    },
    async verificarVencimientos() {
      try {
        await axios.post(`http://localhost:4001/api/notificaciones/vencimientos/${userId}`)
        await this.cargarNotificaciones()
      } catch(error) {
        console.error('Error al verificar vencimientos:', error)
      }
    },
    async responderNotificacion(id_push, accion) {
      try {
        await axios.put(`http://localhost:4001/api/notificaciones/${id_push}/responder`, {
          respuesta: accion
        })
        toast.success(
          h(CustomToast, {
            title: `Actividad ${accion === 'aceptada' ? 'aceptada' : 'rechazada'}`
          })
        )
        // this.$toast.success(`Actividad ${accion === 'aceptada' ? 'aceptada' : 'rechazada'}`)
        this.cargarNotificaciones()
      } catch (err) {
        console.error('Error al responder notificación:', err)
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'No se pudo rechazar la actividad'
          })
        )
        // this.$toast.error('No se pudo actualizar la actividad')
      }
    },
    badgeIcon(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'bi bi-exclamation-circle text-danger'
        case 'media':
          return 'bi bi-exclamation-triangle text-warning'
        case 'baja':
          return 'bi bi-arrow-down text-success'
      }
    },
    badgeBgClass(prioridad) {
      switch (prioridad?.toLowerCase()) {
        case 'alta':
          return 'bg-danger-subtle'
        case 'media':
          return 'bg-warning-subtle'
        case 'baja':
          return 'bg-success-subtle'
      }
    },
    async posponerNotificacion(minutos, id_push) {
      const fechaActual = new Date()
      const nuevaFecha = new Date(fechaActual.getTime() + minutos * 60000)
      try {
        const res = await fetch(`http://localhost:4001/api/notificaciones/${id_push}/posponer`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nuevaFecha })
        })
        if (!res.ok) throw new Error('Error al posponer')
        toast.success(
          h(CustomToast, {
            title: 'Se pospuso correctamente'
          })
        )

      } catch (err) {
        toast.error(
          h(CustomToast, {
            title: 'Error',
            message: 'No se pudo posponer la actividad'
          })
        )
      }
    },
    toggleDropdown() {
      this.mostrarOpciones = !this.mostrarOpciones
    },
    posponerActividad(id_push) {
      console.log('ID ENVIADO', id_push)
      this.showModal = true
      this.notificacionSeleccionada = id_push
    }
  },
  mounted() {
    this.cargarNotificaciones()
    this.intervaloNotificaciones = setInterval(this.cargarNotificaciones, 30000)
    this.verificarVencimientos()

    if (user && user.imagen) {
      this.imagenUrl = `http://localhost:4001${user.imagen}`
    } else {
      this.imagenUrl = defaultImage
    }

  },
  beforeUnmount() {
    clearInterval(this.intervaloNotificaciones)
  }
}
</script>



<style scoped>
.input-group {
  max-width: 100%;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
  z-index: 10;
  pointer-events: none;
}

.form-control.rounded-pill {
  padding-left: 3rem;
  font-size: 1rem;
  color: #333;
  height: 3rem;
}

.form-control.rounded-pill::placeholder {
  color: #6c757d;
}

.user-panel {
  transform: translateX(100%);
}

.user-panel.open {
  transform: translateX(0);
}

.user-panel .menu-items a:hover {
  background-color: #333333;
}

@media (max-width: 991px) {
  .user-panel {
    width: 200px;
  }
}

.header-improved {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
}

@media (min-width: 992px) {
  .header-improved {
    left: 16rem; /* Ajuste cuando el sidebar está presente */
    width: calc(100% - 16rem);
  }
}

/* Animación deslizante para el aside */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from {
  transform: translateX(-100%);
}
.slide-enter-to {
  transform: translateX(0);
}
.slide-leave-from {
  transform: translateX(0);
}
.slide-leave-to {
  transform: translateX(-100%);
}

/* Para aparecer los icons en la notificación tipo vencimiento */
.notificacion-hover {
  position: relative;
  transition: background-color 0.2s ease-in-out;
}

.notificacion-hover:hover {
  background-color: #d3d3d3;
}

/* Íconos centrados y ocultos inicialmente */
.notificacion-hover .iconos-vencimiento {
  position: absolute;
  /* top: 50%; */
  left: 80%;
  transform: translate(-50%, -50%);
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  z-index: 2;
  /* font-size: 1.5rem; */
  gap: 1rem;
  display: flex;
}

/* Aparecen al hacer hover */
.notificacion-hover:hover .iconos-vencimiento {
  visibility: visible;
  opacity: 1;
}

/* Tooltips del panel de notificaciones */
.tooltip-container {
  position: relative;
  display: inline-block;
}

.custom-tooltip {
  visibility: visible;
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;

  /* posición */
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);

  /* animación */
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
  z-index: 2100;
}

.tooltip-container:hover .custom-tooltip {
  visibility: visible;
  opacity: 1;
}

.container-tooltip {
  position: relative;
  display: inline-block;
}

.tooltip-custom {
  visibility: hidden;
  background-color: #000;
  color: #fff;
  text-align: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;

    /* posición */
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);

  /* animación */
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
  z-index: 100;
}

.container-tooltip:hover .tooltip-custom {
  visibility: visible;
  opacity: 1;
}


/* Dropdown para posponer */
.posponer-dropdown {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.custom-dropdown {
  position: absolute;
  top: 110%; /* debajo del botón */
  right: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  z-index: 1000;
  width: max-content;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.custom-dropdown li {
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.custom-dropdown li:hover {
  background-color: #f1f1f1;
}

.nav-link:hover {
  background-color: transparent;
  cursor: pointer;
  color: black;
}

/* Panel de notificaciones */
.notifications-panel {
  width: 400px;
  max-height: 600px;
  border-radius: var(--border-radius);
  border: 1px solid var(--primary-color);
  background: white;
  overflow: hidden;
  z-index: 1000;
  margin-right: 1rem;
}

.notifications-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #8b2635 100%);
  color: white;
  padding: 1rem;
  align-items: center;
  /* border: solid 0.5px black; */
  padding-bottom: 0;
}

.notifications-title {
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
}

.notifications-tabs .nav-pills {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 25px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.tab-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  transition: var(--transition);
}

.tab-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-btn.active {
  background-color: white;
  color: var(--primary-color);
  font-weight: 600;
}

/* Contenido de notificaciones */
.notifications-content {
  max-height: 500px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  color: var(--secondary-color);
  margin-bottom: 1rem;
}

.empty-text {
  color: var(--secondary-color);
  font-weight: 600;
  margin: 0;
}

/* Items de notificación */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 5px 1rem 5px 1rem;
  border-bottom: 1px solid var(--border-color);
  transition: var(--transition);
  position: relative;
}

.notification-item:hover {
  background-color: #ebeded;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.read {
  opacity: 0.7;
}

.notification-item.postponed {
  border-left: 4px solid var(--warning-color);
}

.notification-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.sender-name {
  font-weight: 700;
  color: #1e293b;
}

.activity-name {
  font-weight: 600;
  color: var(--primary-color);
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-time {
  font-size: 0.75rem;
  color: var(--secondary-color);
}

/* Acciones de notificación */
.notification-actions {
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: var(--transition);
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.action-btn-small {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn-small:hover {
  transform: translateY(-2px);
  box-shadow: var(--box-shadow);
}

.action-btn-small.success {
  border-color: var(--success-color);
  color: var(--success-color);
}

.action-btn-small.success:hover {
  background-color: #5a6162;
  color: white;
}

.action-btn-small.danger {
  border-color: var(--danger-color);
  color: var(--danger-color);
}

.action-btn-small.danger:hover {
  background-color: #5a6162;
  color: white;
}

.action-btn-small.primary {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.action-btn-small.primary:hover {
  background-color: #5a6162;
  color: white;
}

.action-btn-small.secondary {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.action-btn-small.secondary:hover {
  background-color: #5a6162;
  color: white;
}

/* Dropdown para posponer */
.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--box-shadow-lg);
  min-width: 200px;
  z-index: 1000;
  padding: 0.5rem 0;
}

.dropdown-header {
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--secondary-color);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.25rem;
}

.dropdown-item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: var(--transition);
}

.dropdown-item:hover {
  background-color: var(--light-bg);
}

.dropdown-item.border-bottom {
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 0.25rem;
}

.dropdown-item .time {
  font-size: 0.75rem;
  color: var(--secondary-color);
}

/* Clases de colores para badges */
.bg-primary-subtle { background-color: var(--primary-light) !important; }
.bg-success-subtle { background-color: var(--success-light) !important; }
.bg-warning-subtle { background-color: var(--warning-light) !important; }
.bg-info-subtle { background-color: var(--info-light) !important; }
.bg-danger-subtle { background-color: var(--danger-light) !important; }

/* Animaciones */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.user-panel-modern.open {
  animation: slideInRight 0.3s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notifications-panel {
  animation: fadeInDown 0.3s ease-out;
}

@media (max-width: 768px) {
  .modern-header {
    padding: 0.75rem 1rem;
  }
  
  .user-panel-modern {
    width: 20rem;
    height: 85vh;
  }
  
  .notifications-panel {
    width: calc(100vw - 2rem);
    max-width: 400px;
  }
  
  .panel-content {
    padding: 1.5rem 1rem;
  }
  
  .action-buttons-container {
    flex-direction: column;
  }
}

@media (max-width: 576px) {
  .user-panel-modern {
    width: 100vw;
    height: 100vh;
    top: 0;
    border-radius: 0;
  }
  
  .profile-cover {
    height: 6rem;
  }
  
  .panel-profile-image {
    width: 100px;
    height: 100px;
  }
  
  .notifications-panel {
    width: calc(100vw - 1rem);
    max-height: 80vh;
  }
}

/* Scrollbar personalizada */
.notifications-content::-webkit-scrollbar,
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.notifications-content::-webkit-scrollbar-track,
.panel-content::-webkit-scrollbar-track {
  background: var(--light-bg);
}

.notifications-content::-webkit-scrollbar-thumb,
.panel-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.notifications-content::-webkit-scrollbar-thumb:hover,
.panel-content::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}


</style>

