<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isCollapsed = ref(localStorage.getItem('sidebar-collapsed') === 'true');
const emit = defineEmits(['update:collapsed']);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
  localStorage.setItem('sidebar-collapsed', isCollapsed.value);
  emit('update:collapsed', isCollapsed.value);
};

const mainRoutes = computed(() => {
  return router.options.routes.filter(
    route =>
      route.name &&                      // 👈 Asegura que tenga nombre
      !route.meta?.group &&
      route.meta?.showSidebar !== false &&
      route.meta?.showInSidebar !== false
  );
});

const managementRoutes = computed(() => {
  return router.options.routes.filter(
    route =>
      route.name &&
      route.meta?.group === 'Management' &&
      route.meta?.showSidebar !== false &&
      route.meta?.showInSidebar !== false
  );
});


const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push({ name: 'Login' });
}
</script>

<template>
  <aside
    class="sidebar position-fixed top-0 start-0 vh-100 d-flex flex-column shadow-lg"
    :class="{ 'collapsed': isCollapsed }"
  >
    <!-- Header Section -->
    <div class="sidebar-header d-flex p-3 align-items-center">
      <button class="btn btn-sm toggle-btn" @click="toggleCollapse">
        <i class="bi fs-4 text-white" :class="isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
      </button>
      <transition name="fade" mode="out-in">
        <img 
          v-if="!isCollapsed" 
          src="@/assets/tabasco.png" 
          alt="Tabasco" 
          class="sidebar-logo img-fluid"
        >
      </transition>
    </div>

    <!-- Navigation Menu -->
    <div class="sidebar-body d-flex flex-column flex-grow-1 overflow-auto">
      <div class="sidebar-menu p-3 flex-grow-1">
        <!-- Main Routes -->
        <div v-for="route in mainRoutes" :key="route.name" class="mb-2">
          <router-link
            :to="route.path"
            class="menu-item d-flex align-items-center text-decoration-none rounded"
            active-class="active"
          >
            <i class="bi menu-icon" :class="route.meta?.icon"></i>
            <transition name="fade" mode="out-in">
              <span v-if="!isCollapsed" class="menu-text">{{ route.name }}</span>
            </transition>
          </router-link>
        </div>

        <!-- Management Routes Group -->
        <div v-if="managementRoutes.length" class="menu-group mt-4 pt-3 border-top">
          <transition name="fade" mode="out-in">
            <div v-if="!isCollapsed" class="group-title text-uppercase small fw-semibold mb-2 text-muted">
              Management
            </div>
          </transition>
          <div v-for="route in managementRoutes" :key="route.name" class="mb-2">
            <router-link
              :to="route.path"
              class="menu-item d-flex align-items-center text-decoration-none rounded"
              active-class="active"
            >
              <i class="bi menu-icon" :class="route.meta.icon"></i>
              <transition name="fade" mode="out-in">
                <span v-if="!isCollapsed" class="menu-text">{{ route.name }}</span>
              </transition>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Footer Section -->
      <div class="sidebar-footer p-3 border-top">
        <router-link
          to="/perfil"
          class="menu-item d-flex align-items-center text-decoration-none rounded mb-2"
          active-class="active"
        >
          <i class="bi bi-person-fill menu-icon"></i>
          <transition name="fade" mode="out-in">
            <span v-if="!isCollapsed" class="menu-text">Perfil</span>
          </transition>
        </router-link>

        <button
          class="menu-item d-flex align-items-center text-decoration-none rounded w-100 border-0 bg-transparent"
          @click.prevent="logout"
        >
          <i class="bi bi-box-arrow-right menu-icon"></i>
          <transition name="fade" mode="out-in">
            <span v-if="!isCollapsed" class="menu-text">Cerrar Sesión</span>
          </transition>
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
/* Variables CSS */
:root {
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

/* Sidebar Container */
.sidebar {
  width: 16rem;
  background: linear-gradient(135deg, #1e293b 0%, #374151 100%);
  transition: width 0.3s ease;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 4.5rem;
}

/* Header Section */
.sidebar-header {
  height: 4.5rem;
  background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.toggle-btn {
  color: white;
  padding: 0.5rem;
  border-radius: var(--border-radius-sm);
  transition: var(--transition);
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-logo {
  height: 3rem;
  margin-left: 1rem;
  transition: var(--transition);
}

/* Menu Items */
.menu-item {
  padding: 0.75rem 1rem;
  color: #e5e7eb;
  transition: var(--transition);
  border: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.menu-item.active {
  background: linear-gradient(135deg, var(--primary-color) 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.menu-icon {
  width: 1.5rem;
  font-size: 1.1rem;
  transition: var(--transition);
}

.menu-text {
  margin-left: 0.75rem;
  font-weight: 500;
  transition: var(--transition);
  white-space: nowrap;
  overflow: hidden;
}

/* Menu Group */
.menu-group {
  border-top-color: rgba(255, 255, 255, 0.1) !important;
}

.group-title {
  letter-spacing: 0.05em;
  color: #9ca3af !important;
}

/* Footer Section */
.sidebar-footer {
  border-top-color: rgba(255, 255, 255, 0.1) !important;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Scrollbar Styling */
.sidebar-body::-webkit-scrollbar {
  width: 4px;
}

.sidebar-body::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.sidebar-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    display: none !important;
  }
}

/* Enhanced hover effects */
.menu-item {
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.menu-item:hover::before {
  left: 100%;
}

/* Active state indicator */
.menu-item.active::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: white;
  border-radius: 2px 0 0 2px;
}

/* Collapsed state adjustments */
.sidebar.collapsed .menu-item {
  padding: 0.75rem;
  justify-content: center;
}

.sidebar.collapsed .menu-item.active::after {
  width: 2px;
  height: 40%;
}

/* Smooth transitions for all elements */
.sidebar * {
  transition: var(--transition);
}
</style>