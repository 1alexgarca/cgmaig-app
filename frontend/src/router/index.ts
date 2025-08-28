import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
// import { useAuthStore } from '@/stores/auth'


// Extensión de tipos para metadatos de rutas
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    layout?: 'default' | 'admin' | 'auth'
    title?: string
    showSidebar?: boolean
  }
}

const routes: RouteRecordRaw[] = [

  {
    path: '/',
    redirect: 'Login',
    meta: {
      showInSidebar: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component:() => import('@/views/auth/LoginView.vue'),
    meta: {
      requiresAuth: false,
      layout: 'auth',
      showInSidebar: false
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/UserView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-speedometer2',
      showSidebar: true,
    }
  },
  {
    path: '/actividades',
    name: 'Actividades',
    component: () => import('@/views/ActivitiesView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-stopwatch'
    }
  },
  {
    path: '/Reportes',
    name: 'Reportes',
    component: () => import('@/views/ReportsView.vue'),
    meta: {
      requiresAuth: true,
      layout: 'admin',
      title: 'Panel de Administración',
      icon: 'bi-file-earmark-text'
    }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/PerfilView.vue'),
    meta: {
      requiresAuth: true,
      showSidebar: false,
      showInSidebar: false,
  }
}

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

export default router

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next({ name: 'Login' })
  }

  else if (to.name === 'Login' && token) {
    next({ name: 'Dashboard' })
  }
  else {
    next()
  }
})