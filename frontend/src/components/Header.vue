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

    <!-- Centro: Barra de búsqueda -->
    <div class="d-flex align-items-center flex-grow-1 mx-5">
      <div class="w-100">
        <div class="input-group position-relative">
          <i class="bi bi-search text-muted search-icon"></i>
          <input
            type="search"
            class="form-control rounded-pill"
            placeholder="Search project"
            aria-label="Search project"
            style="
              padding-left: 2.75rem; 
              color: rgb(105 28 32);"
          >
        </div>
      </div>
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
      class="card position-absolute top-100 end-0 mt-2  shadow-lg rounded-4"
      style="width: 400px; z-index: 1000; margin: 1rem; border-color: rgb(105, 28, 32);">
      <div class="card-header d-flex justify-content-between rounded-4" style="background: rgb(105, 28, 32);">
        <div class="fw-bold d-flex align-items-center text-white">
          Notificaciones
        </div>
        <div>
          <ul
            class="nav nav-pills gobTertiary rounded-5 small"
            id="pills-tab"
            role="tablist"
            style=" height: 40px; padding-left: 5px; padding-right: 5px;"
          >
            <li class="nav-item d-flex align-items-center container-tooltip" role="presentation" style="height: 40px;">
              <button
                class="nav-link rounded-5 py-1 px-2 small"
                id="pills-home-tab"
                data-bs-toggle="pill"
                active-class="gobPrimary"
                data-bs-target="#pills-home"
                type="button"
                role="tab"
                aria-controls="pills-home"
                aria-selected="true"
                style="font-size: 0.85rem;"
                :class="{ active: pestañaActiva === 'no-leidas' }"
                @click="pestañaActiva = 'no-leidas'"
              >
                <i class="bi bi-envelope"></i>
              </button>
               <span class="tooltip-custom">No leídos</span>
            </li>

            <li class="nav-item d-flex align-items-center container-tooltip" role="presentation" style="height: 40px;">
              <button
                class="nav-link rounded-5 py-1 px-2 small"
                id="pills-profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
                style="font-size: 0.85rem;"
                :class="pestañaActiva === 'leidas'"
                @click="pestañaActiva = 'leidas'"
              >
                <i class="bi bi-envelope-open"></i>
              </button>
              <span class="tooltip-custom">Leídos</span>
            </li>
            
            <li class="nav-item d-flex align-items-center container-tooltip" role="presentation" style="height: 40px;">
              <button
                class="nav-link rounded-5 py-1 px-2 small"
                id="pills-profile-tab"
                data-bs-toggle="pill"
                data-bs-target="#pills-profile"
                type="button"
                role="tab"
                aria-controls="pills-profile"
                aria-selected="false"
                style="font-size: 0.85rem;"
                :class="pestañaActiva === 'pospuestas'"
                @click="pestañaActiva = 'pospuestas'"
              >
                <i class="bi bi-clock"></i>
              </button>
              <span class="tooltip-custom">Pospuestos</span>
            </li>
          </ul>
        </div>
      </div>

      <div>   
        <div v-if="pestañaActiva === 'no-leidas' && notificacionesNoLeidas.length === 0" class="text-center row g-0">
          <i class="fs-1 bi bi-bell-slash"></i>
          <small class="fs-5 text-muted fw-semibold">Sin notificaciones</small>
        </div>

        <div v-if="pestañaActiva === 'leidas' && notificacionesLeidas.length === 0" class="text-center row g-0">
          <i class="fs-1 bi bi-bell-slash"></i>
          <small class="fs-5 text-muted fw-semibold">Sin notificaciones leídas</small>
        </div>

        <div v-if="pestañaActiva === 'pospuestas' && notificacionesPospuestas.length === 0" class="text-center row g-0">
          <i class="fs-1 bi bi-bell-slash"></i>
          <small class="fs-5 text-muted fw-semibold">Sin notificaciones pospuestas</small>
        </div>

        <!-- NO LEÍDAS -->
        <div v-if="pestañaActiva === 'no-leidas'">

          <div 
            class="d-flex align-items-start gap-3 p-2 pb-0 border-bottom notificacion-hover rounded-bottom-4"
            v-for="notificacion in notificacionesNoLeidas"
            :key="notificacion.id_push"  
          >
            <!-- Ícono -->
            <div 
                class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
                style="width: 50px; height: 50px; margin-bottom: 5px;"
                :class="[
                  notificacion.tipo === 'vencimiento'
                    ? 'bg-warning-subtle text-warning'
                    : notificacion.tipo === 'ajuste'
                    ? 'bg-info-subtle text-info'
                    : badgeBgClass(notificacion.prioridad)
                ]"
            >
              <i 
                class="bi fs-4"
                :class="[
                  notificacion.tipo === 'vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)]"  >
              </i>
            </div>

            <!-- Contenido de la notificación -->
            <div class="flex-grow-1 notificacion-hover">
              <div class="d-flex flex-column">
                <small>
                  <span class="fw-bold">{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span> 
                  {{ notificacion.mensaje }}
                  <span class="fw-bold text-dark">{{ notificacion.actividad }}</span>
                </small>

                <small class="text-muted d-flex justify-content-between pb-1">
                  <small>{{ notificacion.tiempo }}</small>

                  <small class="iconos-vencimiento" v-if="notificacion.tipo === 'asignacion' && notificacion.respuesta === 'pendiente'">
                    <div class="tooltip-container">
                      <button class="btn btn-success rounded-circle" @click="responderNotificacion(notificacion.id_push, 'aceptada')">
                          <i class="bi bi-check-circle"></i>
                      </button>
                      <span class="custom-tooltip">Aceptar</span>
                    </div>

                    <div class="tooltip-container">
                      <button class="btn btn-danger rounded-circle" @click="responderNotificacion(notificacion.id_push, 'rechazada')">
                        <i class="bi bi-x-circle"></i>
                      </button>
                      <span class="custom-tooltip">Rechazar</span>    
                    </div>
                  </small>
                  <!-- Inconos para vencimiento -->
                  <small class="pt-0 pe-2 iconos-vencimiento" v-if="notificacion.tipo === 'vencimiento'">
                    <div class="tooltip-container">
                      <button class="btn btn-dark rounded-5" @click="marcarComoLeida(notificacion.id_push)">
                        <i class="bi bi-envelope-open"></i>
                      </button>
                      <span class="custom-tooltip">Marcar como leída</span>
                    </div>

                    <div class="tooltip-container">
                      <button class="btn btn-dark rounded-5" @click="toggleDropdown">
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
                  </small>
                </small>
              </div>
          </div>
        </div>
        </div>

        <!-- LEÍDAS -->
        <div v-if="pestañaActiva === 'leidas'">
         <div 
            class="d-flex align-items-start gap-3 p-2 pb-0 border-bottom"
            v-for="notificacion in notificacionesLeidas"
            :key="notificacion.id_push"  
          >
            <!-- Ícono -->
            <div 
              class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style="width: 50px; height: 50px; padding: .8rem; margin-bottom: 5px;"
              :class="[
                notificacion.tipo == 'vencimiento'
                  ? 'bg-warning-subtle text-warning'
                  : notificacion.tipo === 'ajuste'
                  ? 'bg-info-subtle text-info'
                  : badgeBgClass(notificacion.prioridad)
              ]"
              >
              <i 
                class="bi fs-4"
                :class="[
                  notificacion.tipo ==='vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)
                ]"  >
              </i>
            </div>

            <!-- Contenido de la notificación -->
            <div class="flex-grow-1">
              <div class="d-flex flex-column">
                <small>
                  <span>{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                  {{ notificacion.mensaje }}
                  <span class="text-dark">{{ notificacion.actividad }}</span>
                </small>
                <small class="text-muted d-flex justify-content-between">
                  <small>{{ notificacion.tiempo }}</small>
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- POSPUESTAS -->
        <div v-if="pestañaActiva === 'pospuestas'">
         <div 
            class="d-flex align-items-start gap-3 p-2 pb-0 border-bottom"
            v-for="notificacion in notificacionesPospuestas"
            :key="notificacion.id_push"  
          >
            <!-- Ícono -->
            <div 
              class="rounded-circle d-flex justify-content-center align-items-center flex-shrink-0"
              style="width: 50px; height: 50px; padding: .8rem; margin-bottom: 5px;"
              :class="[
                notificacion.tipo == 'vencimiento'
                  ? 'bg-warning-subtle text-warning'
                  : notificacion.tipo === 'ajuste'
                  ? 'bg-info-subtle text-info'
                  : badgeBgClass(notificacion.prioridad)
              ]"
              >
              <i 
                class="bi fs-4"
                :class="[
                  notificacion.tipo ==='vencimiento'
                    ? 'bi-hourglass-split'
                    : notificacion.tipo === 'ajuste'
                    ? 'bi-pencil-square'
                    : badgeIcon(notificacion.prioridad)
                ]"  >
              </i>
            </div>

            <!-- Contenido de la notificación -->
            <div class="flex-grow-1">
              <div class="d-flex flex-column">
                <small>
                  <span>{{ notificacion.nombre_creador }} {{ notificacion.paterno_creador }}</span>
                  {{ notificacion.mensaje }}
                  <span class="text-dark">{{ notificacion.actividad }}</span>
                </small>
                <small class="text-muted d-flex justify-content-between">
                  <small>{{ notificacion.tiempo }}</small>
                </small>
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
.nav-link  {
  color: #691c20
}
.nav-link.active {
  background-color: #691c20;
}

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

</style>

